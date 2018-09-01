// Create tab object
var sVimTab = {};
//setTimeout(function(){
// Settings passed in from global
sVimTab.settings = {};
// Set css
sVimTab.settings.css = `
@-webkit-keyframes fadein {
    from {
    opacity: 0;
    }
    to {
    opacity: 1;
    }
}

#sVim-command {
    -webkit-animation: fadein .2s !important;
    -webkit-appearance: none !important;
    background-color: rgba(0, 0, 0, 0.80) !important;
    background-position: none !important;
    background-repeat: none !important;
    border-radius: 0 !important;
border: 0 !important;
    box-shadow: none !important;
    box-sizing: content-box !important;
color: #FFFFFF !important;
display: none;
    font-family: "Helvetica Neue" !important;
    font-size: 13px !important;
    font-style: normal !important;
left: 0 !important;
    letter-spacing: normal !important;
    line-height: 1 !important;
margin: 0 !important;
    min-height: 0 !important;
    outline-style: none !important;
outline: 0 !important;
padding: 2px 0 0 10px !important;
position: fixed !important;
right: 0 !important;
    text-align: start !important;
    text-indent: 0px !important;
    text-shadow: none !important;
    text-transform: none !important;
    vertical-align: none !important;
width: 100% !important;
    word-spacing: normal !important;
    z-index: 2147483647 !important;
}

.sVim-hint {
    background-color: #FFFF01;
color: #000000;
    font-size: 10pt;
    font-family: monospace;
    line-height: 10pt;
padding: 0px;
opacity: 0.7;
}

.sVim-hint.sVim-hint-form {
    background-color: #3EFEFF;
}

.sVim-hint.sVim-hint-focused {
opacity: 1;
    font-weight: bold;
}

`;

// Load default settings
sVimTab.settings.preventdefaultesc     = true;
sVimTab.settings.smoothscroll          = true;
sVimTab.settings.fullpagescrollpercent = 85;
sVimTab.settings.lastactivetablimit    = 25;
sVimTab.settings.lastclosedtablimit    = 25;
sVimTab.settings.scrollduration        = 30;
sVimTab.settings.scrollstep            = 60;
sVimTab.settings.zoomstep              = 10;
sVimTab.settings.barposition           = "bottom";
sVimTab.settings.hintcharacters        = "asdfgqwertzxcvb";
sVimTab.settings.homeurl               = "topsites://";
sVimTab.settings.mapleader             = "\\";
sVimTab.settings.newtaburl             = "topsites://";
sVimTab.settings.blacklists            = [];

// Load default shortcuts (private setting)
sVimTab.settings.shortcuts = {
  // Movement
  "j"             : "scrollDown",
  "k"             : "scrollUp",
  "h"             : "scrollLeft",
  "l"             : "scrollRight",
  "d"             : "scrollPageDown",
  "e"             : "scrollPageUp",
  "u"             : "scrollPageUp",
  "shift+d"       : "scrollFullPageDown",
  "shift+e"       : "scrollFullPageUp",
  "shift+g"       : "scrollToBottom",
  "g g"           : "scrollToTop",
  "0"             : "scrollToLeft",
  "$"             : "scrollToRight",
  "g i"           : "goToInput",
  // Miscellaneous
  "r"             : "reloadTab",
  "z i"           : "zoomPageIn",
  "z o"           : "zoomPageOut",
  "z 0"           : "zoomOrig",
  "g r"           : "toggleReader",
  "g v"           : "showsVimrc",
  "g ?"           : "help",
  // Tab Navigation
  "g t"           : "nextTab",
  "shift+k"       : "nextTab",
  "g shift+t"     : "previousTab",
  "shift+j"       : "previousTab",
  "g 0"           : "firstTab",
  "g $"           : "lastTab",
  "g l"           : "lastActiveTab",
  "x"             : "quit",
  "g x shift+t"   : "closeTabLeft",
  "g x t"         : "closeTabRight",
  "g x 0"         : "closeTabsToLeft",
  "g x $"         : "closeTabsToRight",
  "g x o"         : "closeOtherTabs",
  "shift+x"       : "lastClosedTab",
  "ctrl+shift+x"  : "lastClosedTabBackground",
  "t"             : "newTab",
  "shift+h"       : "goBack",
  "shift+l"       : "goForward",
  "shift+,"       : "moveTabLeft",
  "shift+."       : "moveTabRight",
  "g u"           : "parentDirectory",
  "g shift+u"     : "topDirectory",
  "g d"           : "parentDomain",
  "g h"           : "homePage",
  // Window Navigation
  "w"             : "newWindow",
  "g w"           : "nextWindow",
  "g shift+w"     : "previousWindow",
  // Modes
  "escape"        : "normalMode",
  "ctrl+["        : "normalMode",
  "i"             : "insertMode",
  // Link Hints
  "f"             : "createHint",
  "shift+f"       : "createTabbedHint",
  "ctrl+shift+f"  : "createForegroundHint",
  // Clipboard
  "y y"            : "yankDocumentUrl"
};

// Other private settings
sVimTab.settings.paused = false;
// Indicates the tab mode
sVimTab.mode = "normal";
// Indicates if window is top
sVimTab.topWindow = window.top === window;
// Indicates the top domain
sVimTab.topDomain = !sVimTab.topWindow && window.location.ancestorOrigins ? window.location.ancestorOrigins[0].match(/:\/\/(.*)/)[1] : window.location.hostname;
// Indicates the top url
sVimTab.topUrl = !sVimTab.topWindow && document.referrer ? document.referrer : window.location.href;
// Define commands that can be run
sVimTab.commands = {
  // Scroll down
  scrollDown: function() {
    sVimHelper.scrollBy(0, sVimTab.settings.scrollstep);
  },

  // Scroll up
  scrollUp: function() {
    sVimHelper.scrollBy(0, -sVimTab.settings.scrollstep);
  },

  // Scroll left
  scrollLeft: function() {
    sVimHelper.scrollBy(-sVimTab.settings.scrollstep, 0);
  },

  // Scroll right
  scrollRight: function() {
    sVimHelper.scrollBy(sVimTab.settings.scrollstep, 0);
  },

  // Scroll half-page down
  scrollPageDown: function() {
    sVimHelper.scrollBy(0, window.innerHeight / 2);
  },

  // Scroll half-page up
  scrollPageUp: function() {
    sVimHelper.scrollBy(0, -window.innerHeight / 2);
  },

  // Scroll full-page down
  scrollFullPageDown: function() {
    sVimHelper.scrollBy(0, window.innerHeight * (sVimTab.settings.fullpagescrollpercent / 100));
  },

  // Scroll full-page up
  scrollFullPageUp: function() {
    sVimHelper.scrollBy(0, -window.innerHeight * (sVimTab.settings.fullpagescrollpercent / 100));
  },

  // Scroll to bottom of the page
  scrollToBottom: function() {
    sVimHelper.scrollBy(0, (document.body.scrollHeight - window.pageYOffset - window.innerHeight) * 1.1);
  },

  // Scroll to top of the page
  scrollToTop: function() {
    sVimHelper.scrollBy(0, -window.pageYOffset * 1.1);
  },

  // Scroll to the left of the page
  scrollToLeft: function() {
    sVimHelper.scrollBy(-window.pageXOffset - 30, 0);
  },

  // Scroll to the right of the page
  scrollToRight: function() {
    sVimHelper.scrollBy(document.body.scrollWidth - window.pageXOffset - window.innerWidth + 30, 0);
  },

  // Go to the first input box
  goToInput: function() {
    var inputs = document.querySelectorAll("input,textarea");
    var focusIndex;

    // Find and focus on the first input in view, if none then use first on the page
    for (var i = 0, l = inputs.length; i < l; i++) {
      if (sVimHelper.isElementInput(inputs[i]) && sVimHelper.isElementVisible(inputs[i])) {
        if (sVimHelper.isElementInView(inputs[i])) {
          focusIndex = i;
          break;
        }
        else if (focusIndex == null) {
          focusIndex = i;
        }
      }
    }
    inputs[focusIndex].focus();
  },

  // Reload the current tab
  reloadTab: function() {
    location.reload();
  },

  // Zoom page in
  zoomPageIn: function() {
    document.body.style.zoom = (+document.body.style.zoom ? parseFloat(document.body.style.zoom) : 1) + (sVimTab.settings.zoomstep / 100);
  },

  // Zoom page out
  zoomPageOut: function() {
    document.body.style.zoom = (+document.body.style.zoom ? parseFloat(document.body.style.zoom) : 1) - (sVimTab.settings.zoomstep / 100);
  },

  // Zoom page to original size
  zoomOrig: function() {
    document.body.style.zoom = "1";
  },

  // Open Safari reader if possible
  toggleReader: function() {
    //safari.self.tab.dispatchMessage("toggleReader");
  },

  // Close Safari reader if possible
  closeReader: function() {
    //safari.self.tab.dispatchMessage("closeReader");
  },

  // Show sVimrc page
  showsVimrc: function() {
    //safari.self.tab.dispatchMessage("showsVimrc");
  },

  // Open help page in new tab
  help: function() {
    //safari.self.tab.dispatchMessage("help");
  },

  // Navigate to the next tab
  nextTab: function() {
    //safari.self.tab.dispatchMessage("nextTab");
  },

  // Navigate to the previous tab
  previousTab: function() {
    //safari.self.tab.dispatchMessage("previousTab");
  },

  // Go to the first tab
  firstTab: function() {
    //safari.self.tab.dispatchMessage("firstTab");
  },

  // Go to the last tab
  lastTab: function() {
    //safari.self.tab.dispatchMessage("lastTab");
  },

  // Go to the last active tab that's still open
  lastActiveTab: function() {
    //safari.self.tab.dispatchMessage("lastActiveTab");
  },

  // Close the current tab
  quit: function() {
    //safari.self.tab.dispatchMessage("quit");
  },

  // Close the tab to the left of the current tab
  closeTabLeft: function() {
    //safari.self.tab.dispatchMessage("closeTabLeft");
  },

  // Close the tab to the right of the current tab
  closeTabRight: function() {
    //safari.self.tab.dispatchMessage("closeTabRight");
  },

  // Close all tabs to the left of the current tab
  closeTabsToLeft: function() {
    //safari.self.tab.dispatchMessage("closeTabsToLeft");
  },

  // Close all tabs to the right of the current tab
  closeTabsToRight: function() {
    //safari.self.tab.dispatchMessage("closeTabsToRight");
  },

  closeOtherTabs: function() {
    //safari.self.tab.dispatchMessage("closeOtherTabs");
  },

  // Open the last closed tab
  lastClosedTab: function() {
    //safari.self.tab.dispatchMessage("lastClosedTab");
  },

  // Open the last closed tab in background
  lastClosedTabBackground: function() {
    //safari.self.tab.dispatchMessage("lastClosedTabBackground");
  },

  // Open new tab
  newTab: function(url) {
    safari.extension.dispatchMessage("newTab", {"url":url});
  },

  // Open new tab in background
  newTabBackground: function(url) {
    safari.extension.dispatchMessage("newTabBackground", {"url":url});
  },

  // Go back in history
  goBack: function() {
    history.back();
  },

  // Go forward in history
  goForward: function() {
    history.forward();
  },

  // Move current tab left
  moveTabLeft: function() {
    //safari.self.tab.dispatchMessage("moveTabLeft");
  },

  // Move current tab right
  moveTabRight: function() {
    //safari.self.tab.dispatchMessage("moveTabRight");
  },

  // Navigate to parent directory
  parentDirectory: function() {
    if (/:\/\/.*?\/./.test(sVimTab.topUrl)) {
      window.top.location.assign(sVimTab.topUrl.match(/(.*)./)[1].match(/.*\//));
    }
  },

  // Navigate to top directory
  topDirectory: function() {
    if (/:\/\/.*?\/./.test(sVimTab.topUrl)) {
      window.top.location.assign("http://" + sVimTab.topDomain);
    }
  },

  // Navigate to parent domain
  parentDomain: function() {
    var host = sVimTab.topDomain.replace(/^(?:www\d*\.)?.*?\./, "");
    var domains = host.split(".").length;
    if (domains == 2) {
      window.top.location.assign("http://www." + host);
    }
    else if (domains > 2) {
      window.top.location.assign("http://" + host);
    }
  },

  // Navigate to home page
  homePage: function() {
    window.location.assign(sVimTab.settings.homeurl);
  },

  // Open new window
  newWindow: function() {
    //safari.self.tab.dispatchMessage("newWindow");
  },

  // Navigate to the next window
  nextWindow: function() {
    //safari.self.tab.dispatchMessage("nextWindow");
  },

  // Navigate to the previous window
  previousWindow: function() {
    //safari.self.tab.dispatchMessage("previousWindow");
  },

  // Enter normal mode
  normalMode: function() {
    var previousMode = sVimTab.mode
    var element = document.activeElement;
    if (element != null) {
      element.blur();
    }
    sVimTab.mode = "normal";
    sVimTab.commandDiv.innerHTML = "-- NORMAL --";
    sVimTab.commandDiv.style.display = "none";
    if(previousMode == "normal" && sVimHelper.inIframe()){
      window.top.focus();
    }
  },

  // Enter insert mode
  insertMode: function() {
    sVimTab.mode = "insert";
    sVimTab.commandDiv.innerHTML = "-- INSERT --";
    sVimTab.commandDiv.style.display = "block";
  },

  // Open link in current tab
  createHint: function() {
    sVimHint.start();
  },

  // Open link in new background tab
  createTabbedHint: function() {
    var openUrl = function(url) {
      safari.extension.dispatchMessage("newTabBackground", {"url":url});
    };
    sVimHint.start(openUrl);
  },

  // Open link in new foreground tab
  createForegroundHint: function() {
    var openUrl = function(url) {
      safari.extension.dispatchMessage("newTab", {"url":url});
    };
    sVimHint.start(openUrl);
  },

  // Copy current URL to clipboard
  yankDocumentUrl: function() {
    var text = window.location.href;
    sVimHelper.copyToClipboard(text);
  }
};

// Bind shortcuts
sVimTab.bind = function() {
  // Insert or update css
  var style = document.getElementById("sVim-style");
  if (style) {
    style.innerHTML = sVimTab.settings.css;
  }
  else {
    style = document.createElement("style");
    style.type = "text/css";
    style.id = "sVim-style";
    style.innerHTML = sVimTab.settings.css;
    document.getElementsByTagName("head")[0].appendChild(style);
  }

  // Unbind current shortcuts and propagation
  Mousetrap.reset();
  document.removeEventListener("keydown", sVimTab.stopPropagation);

  // Check blacklist and return if on the blacklist
  if (sVimTab.settings.paused || sVimTab.checkBlacklist()) {
    return;
  }

  // Stop keydown propagation
  document.addEventListener("keydown", sVimTab.stopPropagation(), true);

  // Bind shortcuts to commands
  for (var shortcut in sVimTab.settings.shortcuts) {
    var command = sVimTab.settings.shortcuts[shortcut];
    // Replace <Leader>
    shortcut = shortcut.replace(/<[lL]eader>/g, sVimTab.settings.mapleader);
    // Bind going into normal mode even in textboxes
    if (command == "normalMode") {
      Mousetrap.bindGlobal(shortcut, sVimTab.runCommand(command), "keydown");
    }
    else {
      Mousetrap.bind(shortcut, sVimTab.runCommand(command), "keydown");
    }
  }

  // Create command div
  if (!document.getElementById("sVim-command")) {
    sVimTab.commandDiv = document.createElement("div");
    sVimTab.commandDiv.id = "sVim-command";
    sVimTab.commandDiv.style[sVimTab.settings.barposition] = "0";
    document.body.appendChild(sVimTab.commandDiv);
  }

  // Default to normal mode
  sVimTab.commands["normalMode"]();
};

// Prevent propagation for all keydown events if in normal mode, non-escape key is pressed or active element is input
sVimTab.stopPropagation = function() {
  return function(e) {
    var element = document.activeElement;
    var excludeKeys = [27, 38, 40, 37, 39]
    if (sVimTab.mode == "normal" && !excludeKeys.includes(e.keyCode) && (element != null && !sVimHelper.isElementInput(element))) {
      e.stopPropagation();
    }
  };
};

// Run the command pressed, if possible in current mode
sVimTab.runCommand = function(command) {
  return function(e) {
    // Prevent default escape key (helps prevent exiting full screen mode)
    if (e.keyCode == 27) {
      if (sVimTab.settings.preventdefaultesc || sVimTab.mode != "normal") {
        e.preventDefault();
      }
      if (sVimTab.mode == "normal") {
        sVimTab.commands["closeReader"]();
      }
    }

    var element = document.activeElement;
    // Only run command if in normal mode or command is normalMode, and if active element is not insert mode of a vim editor
    if ((sVimTab.mode == "normal" || command == "normalMode") && !(element != null && element.parentNode.className.indexOf("ace_editor") != -1 && element.parentNode.className.indexOf("insert-mode") != -1)) {
      // FIXX WHEN ":" implemented
      sVimTab.commands[command]();
      return command == "normalMode";
    }
  };
};

// Check if page is on blacklist
sVimTab.checkBlacklist = function() {
  var blacklists = sVimTab.settings.blacklists;
  for (var i = 0; i < blacklists.length; i++) {
    var blacklist = blacklists[i].trim().split(/\s+/g);
    if (!blacklist.length) {
      continue;
    }
    if (sVimHelper.matchLocation(document.location, blacklist[0])) {
      return true;
    }
  }

  return false;
};

// Init sVimTab
//safari.self.tab.dispatchMessage("sendSettings");

// Catch commands from global
//safari.self.addEventListener("message", function(event) {
//  if (event.name == "settings") {
//    sVimTab.settings = event.message;
//    sVimTab.bind();
//  }
//}, false);
document.addEventListener("DOMContentLoaded", function(event) {
  // the message is dispatched to SafariExtensionHandler
  //safari.extension.dispatchMessage("Hello World!");
  sVimTab.bind();
});

