var windowListener = {
    ignoreFrames:true,
    //DO NOT EDIT HERE
    onOpenWindow: function (aXULWindow) {
	// Wait for the window to finish loading
	let aDOMWindow = aXULWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
	aDOMWindow.addEventListener("load", function () {
	    aDOMWindow.removeEventListener("load", arguments.callee, false);
	    windowListener.loadIntoWindow(aDOMWindow, aXULWindow);
	}, false);
    },
    onCloseWindow: function (aXULWindow) {},
    onWindowTitleChange: function (aXULWindow, aNewTitle) {},
    register: function () {
	// Load into any existing windows
	let XULWindows = Services.wm.getXULWindowEnumerator(null);
	while (XULWindows.hasMoreElements()) {
	    let aXULWindow = XULWindows.getNext();
	    let aDOMWindow = aXULWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
	    windowListener.loadIntoWindow(aDOMWindow, aXULWindow);
	}
	// Listen to new windows
	Services.wm.addListener(windowListener);
    },
    unregister: function () {
	// Unload from any existing windows
	let XULWindows = Services.wm.getXULWindowEnumerator(null);
	while (XULWindows.hasMoreElements()) {
	    let aXULWindow = XULWindows.getNext();
	    let aDOMWindow = aXULWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
	    windowListener.unloadFromWindow(aDOMWindow, aXULWindow);
	}
	//Stop listening so future added windows dont get this attached
	Services.wm.removeListener(windowListener);
    },
    //END - DO NOT EDIT HERE
    loadIntoWindow: function (aDOMWindow, aXULWindow) {
	if (!aDOMWindow) {
	    return;
	}
	if (aDOMWindow.gBrowser) {
	    aDOMWindow.gBrowser.addEventListener('DOMContentLoaded', listenPageLoad, false);
	    if (aDOMWindow.gBrowser.tabContainer) {
		//has tabContainer
		//start - go through all tabs in this window we just added to
		var tabs = aDOMWindow.gBrowser.tabContainer.childNodes;
		for (var i = 0; i < tabs.length; i++) {
		    Cu.reportError('DOING tab: ' + i);
		    var tabBrowser = tabs[i].linkedBrowser;
		    var win = tabBrowser.contentWindow;
		    loadIntoContentWindowAndItsFrames(win);
		}
		//end - go through all tabs in this window we just added to
	    } else {
		//does not have tabContainer
		var win = aDOMWindow.gBrowser.contentWindow;
		loadIntoContentWindowAndItsFrames(win);
	    }
	} else {
	    //window does not have gBrowser
	}
    },
    unloadFromWindow: function (aDOMWindow, aXULWindow) {
	if (!aDOMWindow) {
	    return;
	}
	if (aDOMWindow.gBrowser) {
	    aDOMWindow.gBrowser.removeEventListener('DOMContentLoaded', listenPageLoad, false);
	    if (aDOMWindow.gBrowser.tabContainer) {
		//has tabContainer
		//start - go through all tabs in this window we just added to
		var tabs = aDOMWindow.gBrowser.tabContainer.childNodes;
		for (var i = 0; i < tabs.length; i++) {
		    Cu.reportError('DOING tab: ' + i);
		    var tabBrowser = tabs[i].linkedBrowser;
		    var win = tabBrowser.contentWindow;
		    unloadFromContentWindowAndItsFrames(win);
		}
		//end - go through all tabs in this window we just added to
	    } else {
		//does not have tabContainer
		var win = aDOMWindow.gBrowser.contentWindow;
		unloadFromContentWindowAndItsFrames(win);
	    }
	} else {
	    //window does not have gBrowser
	}
    }
};
/*end - windowlistener*/

function loadIntoContentWindowAndItsFrames(theWin) {
    var frames = theWin.frames;
    var winArr = [theWin];
    for (var j = 0; j < frames.length; j++) {
	winArr.push(frames[j].window);
    }
    Cu.reportError('# of frames in tab: ' + frames.length);
    for (var j = 0; j < winArr.length; j++) {
	if (j == 0) {
	    Cu.reportError('**checking win: ' + j + ' location = ' + winArr[j].document.location);
	} else {
	    Cu.reportError('**checking frame win: ' + j + ' location = ' + winArr[j].document.location);
	}
	var doc = winArr[j].document;
	//START - edit below here

	if (this.ignoreFrames) {
	    break;
	}
	//END - edit above here
    }
}

function unloadFromContentWindowAndItsFrames(theWin) {
    var frames = theWin.frames;
    var winArr = [theWin];
    for (var j = 0; j < frames.length; j++) {
	winArr.push(frames[j].window);
    }
    Cu.reportError('# of frames in tab: ' + frames.length);
    for (var j = 0; j < winArr.length; j++) {
	if (j == 0) {
	    Cu.reportError('**checking win: ' + j + ' location = ' + winArr[j].document.location);
	} else {
	    Cu.reportError('**checking frame win: ' + j + ' location = ' + winArr[j].document.location);
	}
	var doc = winArr[j].document;
	//START - edit below here
	if (this.ignoreFrames) {
	    break;
	}
	//END - edit above here
    }
}

/**
   Listener that observe the prefs variables

   If the module list changes (new module, module deactivated/activated), the parser list is reloaded
*/
var PrefObserver = {
    register: function() {
	// First we'll need the preference services to look for preferences.
	var prefService = Components.classes["@mozilla.org/preferences-service;1"]
	    .getService(Components.interfaces.nsIPrefService);

	// For this.branch we ask for the preferences
	this.branch = prefService.getBranch("extensions.vwof.");

	// Finally add the observer.
	this.branch.addObserver("", this, false);
    },

    unregister: function() {
	this.branch.removeObserver("", this);
    },

    observe: function(aSubject, aTopic, aData) {
	switch (aData) {
	case "modules":
	    vwof.reload_modules();
	    break;
	}
    }
}

