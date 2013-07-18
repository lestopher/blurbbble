/*not in use*/
/*Background javascript that controls the Window generation

chrome.app.runtime.onLaunched.addListener(function(launchData) {
  chrome.app.window.create('options.html', {bounds: {width: 700, height: 600}}, function(win) {
    win.contentWindow.launchData = launchData;
  });
});*/


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

"content_scripts":[{
     "matches": ["http://*.evisions.com/Teams/Support/HelpDeskRep/tabid/*/ctl/RepDetails/mid/*/id/*", 
                 "*://econnect/Teams/Support/HelpDeskRep/tabid/*/ctl/RepDetails/mid/*/id/*", 
                 "*://econnect/Teams/Support/HelpDeskRep/tabid/181/ctl/RepView/mid/725/rep_id/*"],
     "js": ["appWebSQL.js"]
  }],
*/
                 
//Code used to save contents to file. for Packed app only since filesystem cannot be called in an extension.
/* var config = {type: 'saveFile', suggestedName: chosenFileEntry.name};
 chrome.fileSystem.chooseEntry(config, function(writableEntry) 
 {
       
   
   var blob = new Blob([templateName.value +"," + templateGroup.value + "," + emailBody.value + customVarOpt[customVarSelect.selectedIndex].value], {type: 'text/plain'});
   writeFileEntry(writableEntry, blob, function(e) 
   {
     output.textContent = 'Write complete :)';
   });
 });
   */
                 
/*retrieves the file path
function displayPath(fileEntry) {
    chrome.fileSystem.getDisplayPath(fileEntry, function(path) {
      document.querySelector('#file_path').value = path;
    });
  }*/
                 
/*p{position: relative; margin-top:50px;}*/