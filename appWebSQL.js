

/*Created By: Joseph Saunderson
 * Application name: Email templates Google chrome extension
 * Description: Easy access and storage for your email blurbs by clicking on context menu for automatic pasting
 * verison: 1.0
 * 
 * 
 * 
 * */


////////////////////////////////////////////
//global variables
////////////////////////////////////////////
/*options menu variables*/
   
var chosenFileEntry  = "test.txt",
    saveButton       = document.getElementById("save-button"),
    createButton     = document.getElementById("create-button"),
    customEditButton = document.getElementById("CustomEdit"),
    customAddButton  = document.getElementById("CustomAdd"),
    displayButton    = document.getElementById("display-button"),
    templateName     = document.getElementById('TemplateName'),
    templateGroup    = document.getElementById('TemplateGroup'),
    emailBody        = document.getElementById('EmailBody'),
    customVarSelect  = document.getElementById("CustomDropdown"),
    customVarOpt     = customVarSelect.options,
  
    /* Database variables and initialization */  
    recordCount      = 0,
    db               = openDatabase('EmailTemplateDB', '1.0', 'Database for managing Email Templates', 5 * 1024 * 1024);

db.transaction(function(tx) {
   tx.executeSql('CREATE TABLE IF NOT EXISTS EmailTemplates (email_id unique, email_name, email_group, email_body)');
   getRecordCount();
});    
  
/*Context Menu variables*/
var contexts = ["page", "selection", "link", "editable", "image", "video", "audio"],
    parent             = chrome.contextMenus.create({
      'id': "emailTemplateParent",
       "title": "Email Templates",
       "contexts": ["page","selection","link","editable","image","video","audio"]
    }),    
    templateGroupArray = [],
    templateNameArray  = [],
    emailBodyClipboard = null,
    testquery          = null;
  
      
    
      
///////////////////////////////
// Database functions        //
/////////////////////////////// 

function addEmailTemplate(){
  db = openDatabase('EmailTemplateDB', '1.0', 'Database for managing Email Templates', 5 * 1024 * 1024);
  db.transaction(function(tx) {
   getRecordCount();
   tx.executeSql('INSERT INTO EmailTemplates VALUES (?, ?, ?, ?)', [recordCount+1, templateName.value, templateGroup.value, emailBody.value], function(tx) {
     output_trace(" Your email template \"" + templateName.value + "\" was added into WebSQL: EmailTemplates Successfully");

     /* Clears the textboxes and textarea after it saves to file*/
     templateName.value  = "";
     templateGroup.value = "";
     emailBody.value     = "";
   });
  });
}

function getRecordCount(){
  db = openDatabase('EmailTemplateDB', '1.0', 'Database for managing Email Templates', 5 * 1024 * 1024);

  db.transaction(function(tx) {
   tx.executeSql('SELECT * FROM EmailTemplates',[],function(tx, results){
     recordCount = results.rows.length;
   });
  });
}

function getEmailGroups(){
 //getRecordCount();
 db = openDatabase('EmailTemplateDB', '1.0', 'Database for managing Email Templates', 5 * 1024 * 1024);

 db.transaction(function(tx) {
   tx.executeSql('SELECT DISTINCT email_group FROM EmailTemplates', [], function(tx,results){
     var i;

     for (i = 0; i < results.rows.length; i++) {
       templateGroupArray[i] = results.rows.item(i).email_group;
     }
    
   });
 });
}

function getEmailNames(group){
//getRecordCount();
  db = openDatabase('EmailTemplateDB', '1.0', 'Database for managing Email Templates', 5 * 1024 * 1024);

  db.transaction(function(tx){
    tx.executeSql('SELECT email_name FROM EmailTemplates WHERE email_group = ?', [group], function(tx, results) {
      var i;
      for(i=0; i<results.rows.length;i++) {
        templateNameArray[i] = results.rows.item(i).email_name;
      }
    });
  });
}

function getEmailBody(name){
  db = openDatabase('EmailTemplateDB', '1.0', 'Database for managing Email Templates', 5 * 1024 * 1024);

  db.transaction(function(tx) {
   tx.executeSql('SELECT email_body FROM EmailTemplates WHERE email_name = ?', [name], function(tx, results) {
     emailBodyClipboard = results.rows.item(0).email_body;
   });
  });
}

function output_trace(sMsg){
  var oTrace = document.getElementById("DBDisplay");

  if (oTrace.value == "") {
    oTrace.value = sMsg;
  } else {
    oTrace.value = oTrace.value + "\n"+ sMsg;
  }
}


      
///////////////////////////////
// End of Database functions //
///////////////////////////////       
      
      
///////////////////////////////
// Write to File section   //
/////////////////////////////// 

  
/* Capture any errors thrown by the console */
function errorHandler(e) {
  console.error(e);
}

/*retrieves the file path
function displayPath(fileEntry) {
    chrome.fileSystem.getDisplayPath(fileEntry, function(path) {
      document.querySelector('#file_path').value = path;
    });
  }*/

/* Write the entry to a file on the filesystem */
function writeFileEntry(writableEntry, opt_blob, callback) {
  if (!writableEntry) {
    output.textContent = 'Nothing selected.';
    return;
  }

  writableEntry.createWriter(function(writer) {
    writer.onerror    = errorHandler;
    writer.onwriteend = callback;

    // If we have data, write it to the file. Otherwise, just use the file we
    // loaded.
    if (opt_blob) {
      writer.truncate(opt_blob.size);
      waitForIO(writer, function() {
        writer.seek(0);
        writer.write(opt_blob);
      });
    } else {
      chosenFileEntry.file(function(file) {
        writer.truncate(file.fileSize);
        waitForIO(writer, function() {
          writer.seek(0);
          writer.write(file);
        });
      });
    }
  }, errorHandler);
}

/* A listener for I/O */
function waitForIO(writer, callback) {
  // set a watchdog to avoid eventual locking:
  var start = Date.now(),
  // wait for a few seconds
      reentrant = function() {
        if ((writer.readyState === writer.WRITING) && (Date.now() - start < 4000)) {
          setTimeout(reentrant, 100);
          return;
        }

        if (writer.readyState === writer.WRITING) {
          console.error("Write operation taking too long, aborting!" +
            " (current writer readyState is " + writer.readyState + ")");
          writer.abort();
        } else {
          callback();
        }
      };

  setTimeout(reentrant, 100);
}

///////////////////////////////
//End of Write to File section//
/////////////////////////////// 

///////////////////////
//ContextMenu Section//
///////////////////////

//Function to copy text to clipboard
function copyToClipboard( text ){
  var copyDiv = document.createElement('div');

  copyDiv.contentEditable = true;
  copyDiv.innerHTML = text;
  copyDiv.unselectable = "off";

  // Put the content on the DOM
  document.body.appendChild(copyDiv);
  copyDiv.focus();

  document.execCommand('SelectAll');
  document.execCommand("Copy", false, null);
  document.body.removeChild(copyDiv);
}

function copyEmailBody() {
  copyToClipboard(emailBodyClipboard);
}

//A generic onclick callback function.
function genericOnClick(info, tab) {
  console.log("item " + info.menuItemId + " was clicked");
  console.log("info: " + JSON.stringify(info));
  console.log("tab: " + JSON.stringify(tab));
}

// Create one test item for each context type.
/*
var contexts = ["page","selection","link","editable","image","video",
                "audio"];
for (var i = 0; i < contexts.length; i++) {
  var context = contexts[i];
  var title = "Test '" + context + "' menu item";
  var id = chrome.contextMenus.create({"title": title, "contexts":[context],
                                       "onclick": genericOnClick});
  console.log("'" + context + "' item:" + id);
}*/

function createContextMenu() {
  var title      = '',
      groupId    = [],
      childTitle = '',
      nameId     = [],
      i          = 0,
      j          = 0;

  // Populates the templateGroupArray
  getEmailGroups(); 

  for (i = 0; i < templateGroupArray.length; ++i) {
    //parentArray[i] = chrome.contextMenus.create({"title": templateGroupArray[i], "parentId": parent});
    title   = templateGroupArray[i];

    getEmailNames(templateGroupArray[i]);

    groupId.push(chrome.contextMenus.create({
      "id": title + i,
      "title": title,
      "parentId": parent,
      "contexts": ["page", "selection", "link", "editable", "image", "video", "audio"]
    }));
      
    for (j = 0; j < templateNameArray.length; ++j) {
      childTitle = templateNameArray[j];

      getEmailBody(childTitle);

      chrome.contextMenus.onClicked.addListener(copyEmailBody);

      nameId.push(chrome.contextMenus.create({
        "id": childTitle + j,
        "title": childTitle,
        "parentId": groupId[i],
        "contexts": ["page", "selection", "link", "editable", "image", "video", "audio"]
      }));
    }
  }
}

//////////////////////////////
//End of ContextMenu Section//
//////////////////////////////

//////////////////////////
//Event Listener section//  
/////////////////////////

/*Event Listener to retrieve the value of the select dropdown after it's been changed*/
customVarSelect.addEventListener('change',function(e) {
  customVarOpt[customVarSelect.selectedIndex].value;
}, false);

  
/*Event listener for the Save button. Currently saves the textbox/area info into a file. extension must be specified for file eg .txt*/
saveButton.addEventListener('click', function (e) {
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
    
    
  //Code used to store the email template information into the WebSQL Database.
  addEmailTemplate();
},false);
  
displayButton.addEventListener('click', function(e) {
  getRecordCount();
  output_trace(recordCount);
}, false);
    
createButton.addEventListener('click',function(e){
  createContextMenu();
}, false);
    