/*not in use*/
/*Background javascript that controls the Window generation*/

chrome.app.runtime.onLaunched.addListener(function(launchData) {
  chrome.app.window.create('options.html', {bounds: {width: 700, height: 600}}, function(win) {
    win.contentWindow.launchData = launchData;
  });
});


/* Manifest.json add in to make it an app
"app": {
    "background": {
      "scripts": ["background.js"]
    }
  },
  
  "permissions": [
    {"fileSystem": ["write"]}
  ]
}
*/