

/*Created By: Joseph Saunderson,
 *			  Glendon Bratcher
 * Application name: Email templates Google chrome extension (Blurbble)
 * Description: Easy access and storage for your email blurbs by clicking on context menu for automatic pasting
 * version: 1.1
 * Basic context menu functionality (copies blurbs to clipboard)
 * Ability to add, edit, and delete email templates.
 * 
 * Audit Trail
 * version 1.1
 * Added Combo dropdown boxes for group and search name fields.
 * Able to select from the dropdown existing groups/email templates or type in manually if it doesn't exist.
 * Added alert messages to warn of false context menus (artifacts) created when deleting or editing entries in database.
 * All artifacts will be removed upon reload of the browser or extension.
 *
 * version 1.2
 * Added token replace in Email Body.
 * Fixed edit menu so that <pre> tags do not show up in the editting window.
 * */



////////////////////////////////////////////
//global variables
////////////////////////////////////////////
/*options menu variables*/
   
var chosenFileEntry  		= "test.txt",
	isEditActive			= 1,
	toggleButton	 		= document.getElementById("toggle-button"),
	submitButton	 		= document.getElementById("submit-button"),
	editButton		 		= document.getElementById("edit-button"),
	deleteButton	 		= document.getElementById("delete-button"),
    saveButton       		= document.getElementById("save-button"),
    customEditButton 		= document.getElementById("CustomEdit"),
    customAddButton  		= document.getElementById("CustomAdd"),
    displayButton    		= document.getElementById("display-button"),
    addEmailTemplateDiv		= document.getElementById("AddEmailTemplate"),
    editEmailTemplateDiv	= document.getElementById("EditEmailTemplate"),
    searchName	     		= document.getElementById('SearchName'),
    templateName     		= document.getElementById('TemplateName'),
    templateGroup    		= document.getElementById('TemplateGroup'),
    emailBody        		= document.getElementById('EmailBody'),
    editName     			= document.getElementById('EditName'),
	editGroup    			= document.getElementById('EditGroup'),
    editBody     			= document.getElementById('EditBody'),
    customVarSelect  		= document.getElementById("CustomDropdown");
var customVarOpt     		= customVarSelect.options,
  
    /* Database variables and initialization */  
    recordCount      = 0,
    processName	 	 =null,
    db               = openDatabase('EmailTemplateDB', '1.0', 'Database for managing Email Templates', 5 * 1024 * 1024);

/* Jquery variables */
var templateGroupSelect 		= document.getElementById("TemplateGroupSelect"),
    searchNameSelect = document.getElementById("SearchNameSelect"),
	extensionId = chrome.i18n.getMessage("@@extension_id"),
	ptest		= document.getElementById("ptest");

db.transaction(function(tx) {
   tx.executeSql('CREATE TABLE IF NOT EXISTS EmailTemplates (email_id unique, email_name unique, email_group, email_body)');
}); 

//This will hide the edit email template page which is currently controlled by the toggle button
if (isEditActive== 1)
{
    
	
	editEmailTemplateDiv.style.display	= "none";
	addEmailTemplateDiv.style.display	= "block";
	toggleButton.innerHTML = "Go to Edit Menu";
}
else if (isEditActive == 0)
{   
    
	
	editEmailTemplateDiv.style.display	= "block";
	addEmailTemplateDiv.style.display	= "none";
	toggleButton.innerHTML = "Go to Add Menu";
}
  
/*Context Menu variables*/
var contexts = ["page", "selection", "link", "editable", "image", "video", "audio"], 
	parent  = chrome.contextMenus.create({ 'id': "emailTemplateParent", "title": "Email Templates",
    "contexts": ["page","selection","link","editable","image","video","audio"] }),
    templateGroupArray = [],
    templateNameArray  = [],
    emailBodyClipboard = null,
    title      = '',
    groupId    = [],
    childTitle = '',
    nameId     = [];


/*Initial function calls for startup*/
getEmailGroups();    
getEmailGroupsOnly();
getEmailNamesOnly();    
      
///////////////////////////////
// Database functions        //
///////////////////////////////

function stripTags(htmlString) {
		htmlString = htmlString.replace(/&(lt|gt);/g, function (strMatch, p1){
			return (p1 == "pre")? "<" : ">";
		});
		var strTagStrippedText = htmlString.replace(/<\/?[^>]+(>|$)/g, "");
		return strTagStrippedText;	
}	

//modified
function addEmailTemplate(){
  getRecordCount();
  processName = "addEmailTemplate";
  db = openDatabase('EmailTemplateDB', '1.0', 'Database for managing Email Templates', 5 * 1024 * 1024);
  db.transaction(function(tx) {
  
   tx.executeSql('INSERT INTO EmailTemplates VALUES (?, ?, ?, ?)', [recordCount+templateName.value, templateName.value, templateGroup.value,"<pre>"+ emailBody.value +"</pre>"], function(tx) {
     output_trace(" Your email template \"" + templateName.value + "\" was added into WebSQL: EmailTemplates Successfully");

     /* Clears the textboxes and textarea after it saves to file*/
     templateName.value  = "";
     templateGroup.value = "";
     emailBody.value     = "";
     getEmailGroupsOnly();
     getEmailNamesOnly();
   },onError);
  },onError,onSuccessTransaction(processName));
}

function getRecordCount(){
  db = openDatabase('EmailTemplateDB', '1.0', 'Database for managing Email Templates', 5 * 1024 * 1024);

  db.readTransaction(function(tx) {
   tx.executeSql('SELECT * FROM EmailTemplates',[],function(tx, results){
     recordCount = results.rows.length;
     output_trace("The total amount of records:"+ recordCount);
   });
  });
}

function getEmailGroups(){
 
 processName = "getEmailGroups";
 db = openDatabase('EmailTemplateDB', '1.0', 'Database for managing Email Templates', 5 * 1024 * 1024);

 db.readTransaction(function(tx) {
   tx.executeSql('SELECT DISTINCT email_group FROM EmailTemplates ORDER BY email_group', [], function(tx,results){
	   var i;
	   for (i = 0; i < results.rows.length; i++) 
	   {
		   templateGroupArray[i] = results.rows.item(i).email_group;
		   title   = templateGroupArray[i];
		   groupId.push(chrome.contextMenus.create({
			      "id": title,
			      "title": title,
			      "parentId": parent,
			      "contexts": ["page", "selection", "link", "editable", "image", "video", "audio"]
			    }));
		   getEmailNames(templateGroupArray[i]);
	   } 
	   
	 },onError);
 },onError,onSuccessTransaction(processName));
}


function getEmailNames(group){

  processName = "getEmailNames";
  db = openDatabase('EmailTemplateDB', '1.0', 'Database for managing Email Templates', 5 * 1024 * 1024);

  db.readTransaction(function(tx){
  
    tx.executeSql('SELECT email_name FROM EmailTemplates WHERE email_group = ? ORDER BY email_name', [group], function(tx, results) {
      var i;
      for(i=0; i<results.rows.length;i++) {
        templateNameArray[i] = results.rows.item(i).email_name;
        childTitle = templateNameArray[i];
        
        //chrome.contextMenus.onClicked.addListener(getEmailBody);
        nameId.push(chrome.contextMenus.create({
            "id": childTitle,
            "title": childTitle,
            "parentId": group,
            "contexts": ["page", "selection", "link", "editable", "image", "video", "audio"],
            "onclick": function(info,tab){
              processName = "insertText";
              db = openDatabase('EmailTemplateDB', '1.0', 'Database for managing Email Templates', 5 * 1024 * 1024);

              db.readTransaction(function(tx) {
               tx.executeSql('SELECT email_body FROM EmailTemplates WHERE email_name = ?', [info.menuItemId], function(tx, results) {
                 emailBodyClipboard = results.rows.item(0).email_body;
                 // Strip the <pre> tags off the string
                 iText = stripTags(emailBodyClipboard);
                 // Send message to chrome with the string (for inserting text)
                 chrome.tabs.sendMessage(tab.id, iText);
                 
                 onSuccessExecuteSql(tx, results);
               },onError);
              },onError,onSuccessTransaction(processName));
            }
          }));
      }
      onSuccessExecuteSql(tx, results);
    },onError);
  },onError,onSuccessTransaction(processName));
}


/* Removed to allow inserting text from context menu

function getEmailBody(info,tab){
  processName = "getEmailBody";
  db = openDatabase('EmailTemplateDB', '1.0', 'Database for managing Email Templates', 5 * 1024 * 1024);

  db.readTransaction(function(tx) {
   tx.executeSql('SELECT email_body FROM EmailTemplates WHERE email_name = ?', [info.menuItemId], function(tx, results) {
     emailBodyClipboard = results.rows.item(0).email_body;
     copyEmailBody();
     onSuccessExecuteSql(tx, results);
   },onError);
  },onError,onSuccessTransaction(processName));
  
}

*/

function getEmailGroupsOnly(){
	 
	 processName = "getEmailGroupsOnly";
	 db = openDatabase('EmailTemplateDB', '1.0', 'Database for managing Email Templates', 5 * 1024 * 1024);

	 db.readTransaction(function(tx) {
	   tx.executeSql('SELECT DISTINCT email_group FROM EmailTemplates ORDER BY email_group', [], function(tx,results){
		   var i;
		   templateGroupSelect.options.length = results.rows.length + 1 ;
		   for (i = 0; i < results.rows.length; i++) 
		   {
			   templateGroupArray[i] = results.rows.item(i).email_group;
			   title   = templateGroupArray[i];
			   templateGroupSelect.options[i+1].text = title;
			   templateGroupSelect.options[i+1].value = title; 
		   } 
		   
		 },onError);
	 },onError,onSuccessTransaction(processName));
	}

function getEmailNamesOnly(){
	 
	 processName = "getEmailNamesOnly";
	 db = openDatabase('EmailTemplateDB', '1.0', 'Database for managing Email Templates', 5 * 1024 * 1024);

	 db.readTransaction(function(tx) {
	   tx.executeSql('SELECT DISTINCT email_name FROM EmailTemplates ORDER BY email_name', [], function(tx,results){
		   var i;
		   searchNameSelect.options.length = results.rows.length + 1 ;
		   for (i = 0; i < results.rows.length; i++) 
		   {
			   templateGroupArray[i] = results.rows.item(i).email_name;
			   title   = templateGroupArray[i];
			   searchNameSelect.options[i+1].text = title;
			   searchNameSelect.options[i+1].value = title; 
		   } 
		   
		 },onError);
	 },onError,onSuccessTransaction(processName));
	}

function output_trace(sMsg){
  var oTrace = document.getElementById("DBDisplay");

  if (oTrace.value == "") {
    oTrace.value = sMsg;
  } else {
    oTrace.value = oTrace.value + "\n"+ sMsg;
  }
}


function onSuccessExecuteSql(tx, results){
	output_trace("Execute SQL completed.");
}

function onSuccessTransaction(processName){
	output_trace("Transaction for "+processName+" completed");
}

function onError(err){
	alert(err);
}
      
///////////////////////////////
// End of Database functions //
///////////////////////////////       
      
      
///////////////////////////////
// Write to File section     //
/////////////////////////////// 

  
/* Capture any errors thrown by the console */
function errorHandler(e) {
  console.error(e);
}



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


function deleteContextMenuItem(item){
	
	chrome.contextMenus.remove(item);
		
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
	
	 //Code used to store the email template information into the WebSQL Database.
	  addEmailTemplate();
	  getEmailGroups();
   
},false);
  
/*Event listener that currently displays the record count of the database*/
displayButton.addEventListener('click', function(e) {
  getRecordCount();
}, false);
    

/*Event Listener to submit the name of the email template to be edited/deleted*/
submitButton.addEventListener('click', function(e){
	
	db = openDatabase('EmailTemplateDB', '1.0', 'Database for managing Email Templates', 5 * 1024 * 1024);
	
	db.transaction(function(tx) {
		   tx.executeSql('SELECT * FROM EmailTemplates WHERE email_name = ?', [searchName.value], function(tx, results) {
			    
			   editName.value	= results.rows.item(0).email_name;
			   editGroup.value	= results.rows.item(0).email_group;
			   editBody.value	= stripTags(results.rows.item(0).email_body);
			   
			   
		   },onError);
		  });
	
}, false);

/*Event Listener to save the edited email template information*/
editButton.addEventListener('click', function(e){
	
	db = openDatabase('EmailTemplateDB', '1.0', 'Database for managing Email Templates', 5 * 1024 * 1024);
	
	db.transaction(function(tx){
		tx.executeSql('UPDATE EmailTemplates SET email_name=?, email_group=?, email_body=? WHERE email_name = ?',[editName.value, editGroup.value, "<pre>"+editBody.value+"</pre>", searchName.value], function(tx,results){
			
			/*Deletes the context menu item*/
			deleteContextMenuItem(searchName.value);
			/* Clears the textboxes and textarea after it saves to file*/
			 editName.value  = "";
		     editGroup.value = "";
		     editBody.value  = "";
		     getEmailGroupsOnly();
		     getEmailNamesOnly();
		     getEmailGroups();
		     alert("All false context menu items will be removed once you reload the extension or restart Chrome browser");
		});
	});
	
}, false);

/*Event Listener to delete the searched email template*/
deleteButton.addEventListener('click', function(e){
	var canDelete = confirm("Are you sure you want to delete? (All false context menu items will be removed once you reload the extension or restart Chrome browser)");
	
	if(canDelete == true)
		{
			db = openDatabase('EmailTemplateDB', '1.0', 'Database for managing Email Templates', 5 * 1024 * 1024);
			
			db.transaction(function(tx){
				tx.executeSql('DELETE FROM EmailTemplates Where email_name = ? ',[searchName.value], function(tx,results){
					
					/*Deletes the context menu item*/
					deleteContextMenuItem(searchName.value);
					
					 /* Clears the textboxes and textarea after it saves to file*/
				     editName.value  = "";
				     editGroup.value = "";
				     editBody.value     = "";
				     getEmailGroupsOnly();
				     getEmailNamesOnly();
				});
			});
			
			
		}
	canDelete = false;
}, false);


/*Event Listener to toggle between Adding and Editing/Deleting Email Templates*/
toggleButton.addEventListener('click', function(e){
	
	if(isEditActive == 0)
		isEditActive = 1;
	else
		isEditActive=0;
	
	if (isEditActive== 1)
	{
	    
		
		editEmailTemplateDiv.style.display	= "none";
		addEmailTemplateDiv.style.display	= "block";
		toggleButton.innerHTML = "Go to Edit Menu";
	}
	else if (isEditActive == 0)
	{   
	    
			
		editEmailTemplateDiv.style.display	= "block";
		addEmailTemplateDiv.style.display	= "none";
		toggleButton.innerHTML = "Go to Add Menu";
	}
	
}, false);


////////////////////////////////
//End ofEvent Listener section//  
///////////////////////////////

/********
 * 
 * JQuery functions
 *******/
 
/*Manages the Combo Dropdown boxes for the groups and search name fields*/
$("#TemplateGroupSelect").change(function(){ 
	modify();
});

$("#SearchNameSelect").change(function(){ 
	modify();
});

function modify(){
	$("#TemplateGroup").val($("#TemplateGroupSelect").val());
	$("#SearchName").val($("#SearchNameSelect").val());
	output();
}

function output(){
	$("#ptest").text('value: ' + $("#TemplateGroup").val());
}

$("#TemplateGroup").on('click', function(){
	$(this).select();
}).on('blur', function(){
	output();
});

$("#SearchName").on('click', function(){
	$(this).select();
}).on('blur', function(){
	output();
});

modify();
/*end of Combo Dropdown boxes*/


