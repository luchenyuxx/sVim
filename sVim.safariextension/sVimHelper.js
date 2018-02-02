// Create helper object
var sVimHelper = {};

var animationFrame

// Determines if the element given is an input type
sVimHelper.isElementInput = function(element) {
  return (
    (element.localName === "textarea" || element.localName === "input" || element.getAttribute("contenteditable") === "true")
    && !element.disabled
    && !/button|radio|file|image|checkbox|submit/i.test(element.getAttribute("type"))
  );
};

// Determines if the element given is visible
sVimHelper.isElementVisible = function(element) {
  return (
    element.offsetParent
    && !element.disabled
    && element.getAttribute("type") !== "hidden"
    && getComputedStyle(element).visibility !== "hidden"
    && element.getAttribute("display") !== "none"
  );
}

// Determines if the element given is in the viewport
sVimHelper.isElementInView = function(element) {
  var rect = element.getClientRects()[0];
  return (
    rect.top + rect.height >= 0
    && rect.left + rect.width >= 0
    && rect.right - rect.width <= window.innerWidth
    && rect.top < window.innerHeight
  );
};

// Scroll by, smooth or not
sVimHelper.scrollBy = function(x, y) {
  // If smooth scroll is off then use regular scroll
  if (!sVimTab.settings.smoothscroll) {
    scrollBy(x, y);
    return;
  }
  window.cancelAnimationFrame(animationFrame)

  // Smooth scroll
  var i = 0;
  var delta = 0;

  // Ease function
  function easeOutExpo(t, b, c, d) {
    return c * (-Math.pow(2, -10 * t / d ) + 1 ) + b;
  }

  // Animate the scroll
  function animLoop() {
    if (y) {
      window.scrollBy(0, Math.round(easeOutExpo(i, 0, y, sVimTab.settings.scrollduration) - delta));
    } else {
      window.scrollBy(Math.round(easeOutExpo(i, 0, x, sVimTab.settings.scrollduration) - delta), 0);
    }

    if (i < sVimTab.settings.scrollduration) {
      animationFrame = window.requestAnimationFrame(animLoop);
    }

    delta = easeOutExpo(i, 0, (x || y), sVimTab.settings.scrollduration);
    i += 1;
  }

  // Start scroll
  animLoop();
};

// Checks if location @matches the pattern (https://github.com/1995eaton/chromium-vim/blob/master/content_scripts/utils.js)
sVimHelper.matchLocation = function(location, pattern) {
  // Check pattern is non-empty string
  if (typeof pattern !== "string" || !pattern.trim()) {
    return false;
  }

  var protocol = (pattern.match(/.*:\/\//) || [""])[0].slice(0, -2);
  var hostname;
  var path;
  var pathMatch;
  var hostMatch;

  // Check the pattern is a pattern
  if (/\*\*/.test(pattern)) {
    console.error("sVim - Invalid pattern: " + pattern);
    return false;
  }
  // Check protocol is in pattern
  if (!protocol.length) {
    console.error("sVim - Invalid protocol in pattern: ", pattern);
    return false;
  }
  // Check protocol mismatch
  if (protocol !== "*:" && location.protocol !== protocol) {
    return false;
  }
  // Check host mismatch
  pattern = pattern.replace(/.*:\/\//, "");
  if (location.protocol !== "file:") {
    hostname = pattern.match(/^[^\/]+\//g);
    if (!hostname) {
      console.error("sVim - Invalid host in pattern: ", pattern);
      return false;
    }
    var origHostname = hostname;
    hostname = hostname[0].slice(0, -1).replace(/([.])/g, "\\$1").replace(/\*/g, ".*");
    hostMatch = location.hostname.match(new RegExp(hostname, "i"));
    if (!hostMatch || hostMatch[0].length !== location.hostname.length) {
      return false;
    }
    pattern = "/" + pattern.slice(origHostname[0].length);
  }
  // Check path mismatch
  if (pattern.length) {
    path = pattern.replace(/([.&\\\/\(\)\[\]!?])/g, "\\$1").replace(/\*/g, ".*");
    pathMatch = location.pathname.match(new RegExp(path));
    if (!pathMatch || pathMatch[0].length !== location.pathname.length) {
      return false;
    }
  }

  return true;
};

// Take user's input, produce search query
sVimHelper.search = function(s) {
  // Evaluate user command
  var searchEngine = {
    "google": "https://www.google.com/search?q=",
    "duckduckgo": "https://duckduckgo.com/?q=",
    "baidu": "http://www.baidu.com/s?wd=",
    "bing": "https://www.bing.com/search?q=",
    "yahoo": "https://search.yahoo.com/search?p=",
    "sogou": "https://www.sogou.com/web?query="
  };
  var searchQuery = searchEngine[sVimTab.settings.searchengine] || searchEngine["google"];
  var url = searchQuery + encodeURI(s)
  return url;
};

// Used by sVimHelper.openCommandBar.
sVimHelper.argumentProcessors = {
  "searchInTab": sVimHelper.search,
  "searchInNewTab": sVimHelper.search
};

sVimHelper.commandMap = {
  "searchInTab": "openUrl",
  "searchInNewTab": "newTab"
};

sVimHelper.openCommandBar = function(command) {
  sVimTab.mode = "insert";
  var completion = document.createElement('div');
  completion.setAttribute("class", "svim-completion");
  var input = document.createElement('input');
  input.value = ":" + command + " ";
  input.setAttribute("autocomplete", "off");
  input.setAttribute("autocorrect", "off");
  input.setAttribute("autocapitalize", "off");
  input.setAttribute("spellcheck", "false");
  /* Safari reader mode support vim like navigation.
   * Here we trap keydown event to avoid the reader scroll when input j/k/d/u.
   */
  input.onkeydown = function(e){
    e.stopPropagation();
    // On Tab key pressed
    if(e.keyCode == 9) {
      e.preventDefault();
    };
  };
  sVimTab.commandDiv.innerHTML = '';
  sVimTab.commandDiv.appendChild(completion);
  sVimTab.commandDiv.appendChild(input);

  input.onkeyup = function(e){
    if (!e) e = window.event;
    var keyCode = e.keyCode || e.which;
    if (keyCode == '13'){
      // Enter pressed
      evaluate(input.value)
      close();
      return;
    }
    if (keyCode == '27'){
      // Esc pressed
      close();
      return;
    }
    // close command bar when input is empty
    if (input.value == '') {
      close();
      return;
    }
    suggest(completion, input.value);
  };

  sVimTab.commandDiv.style.display = "block";
  input.focus();

  // Evaluate user command
  function evaluate(input) {
    var re = /:(\w+)\s?(.*)$/
    var m = input.match(re);
    var command = m[1]
    ap = sVimHelper.argumentProcessors[command];
    command = sVimHelper.commandMap[command] || command
    var argument = m[2]
    argument = ap?ap(argument):argument;
    sVimTab.commands[command](argument)
  };

  function suggest(parentElement, inputValue) {
    var commandKeys = Object.keys(sVimTab.commands)
    var re = /:(\w+)?\s?(.+)?$/
    var match = inputValue.match(re)
    if(match[2]) {
      showSuggest(parentElement, {})
    } else if(match[1]){
      const result = commandKeys.filter(key => key.startsWith(match[1]) && key != match[1]);
      showSuggest(parentElement, result);
    } else {
      showSuggest(parentElement, commandKeys)
    }
  }

  function showSuggest(parentElement, suggestions) {
    parentElement.innerHTML = '';
    for(var s in suggestions) {
      var line = document.createElement('div');
      line.setAttribute("class", "svim-suggestion")
      line.innerHTML = suggestions[s]
      parentElement.appendChild(line);
    }
  };

  // close command bar
  function close() {
    sVimTab.mode = "normal";
    sVimTab.commandDiv.innerHTML = "-- NORMAL --";
    sVimTab.commandDiv.style.display = "none";
  };
}
