

// In the following line, you should include the prefixes of implementations you want to test.
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
// DON'T use "var indexedDB = ..." if you're not in a function.
// Moreover, you may need references to some window.IDB* objects:
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange
// (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)


////////////////////////////////////////////
//global variables
////////////////////////////////////////////
/*options menu variables*/
	var chosenFileEntry = "test.txt";
	var savebutton = document.getElementById("save-button");
	var CustomEditbutton = document.getElementById("CustomEdit");
	var CustomAddbutton = document.getElementById("CustomAdd");
	var displaybutton = document.getElementById("display-button");
	var tname = document.getElementById('TemplateName');
	var tgroup = document.getElementById('TemplateGroup');
	var ebody = document.getElementById('EmailBody');
	var CustomVarselect = document.getElementById("CustomDropdown");
	var CustomVaropt = document.getElementById("CustomDropdown").options;
	

/* IndexedDB variables */
      var indexedDBName = "EmailTemplateDB";
      var db = null;
      var version = "1.0";
      var objectStoreNames = "Emailtemplate";
      var read_only = 0;
      var read_write = 1;
      var version_change = 2;
      var objectStore= null;    
      	
  	
      
    ///////////////////////////////
   // Database functions        //
   /////////////////////////////// 


      /////////////////////////////////////
      //create_openDB sample function
      /////////////////////////////////////
      function create_openDB() {
          try {
              var request = window.indexedDB.open(indexedDBName,version); 
              request.onsuccess = function (event) {
                  db = request.result;
                  output_trace("indexedDB: " + indexedDBName + " created or opened");
                  db.close();
                  
              };
              request.onerror = function (event) {
                  output_trace("indexedDB.open Error: " + event.message);
              };
              
              request.onupgradeneeded = function (event){
            	  db = request.result;
            	  if(!db.objectStoreNames.contains("emailTemplates"))
            	 {
            		   objectStore = db.createObjectStore("emailTemplates",{keyPath: "id", autoIncrement: true});
            		  objectStore.createIndex("Tname","template_name",{keypath: "id"});
            		  objectStore.createIndex("Tgroup","template_group",{keypath: "id"});
            		  objectStore.createIndex("Ebody","email_body",{keypath: "id"});
            	 }
              };
              
          }
          catch (e) {
              output_trace("Error: " + e.message);
          }
      }

   	  function output_trace(sMsg){
		var oTrace = document.getElementById("DBDisplay");
		if (oTrace.value == "")
			oTrace.value = sMsg;
		else
			oTrace.value = oTrace.value + "\n"+ sMsg;
	  }


   	  
///////////////////////////////
// End of Database functions //
///////////////////////////////    	  
   	  
   	  
///////////////////////////////
// Write to File section	 //
/////////////////////////////// 

	
/*Capture any errors thrown by the console*/
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

	    writer.onerror = errorHandler;
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
	  var start = Date.now();
	  // wait for a few seconds
	  var reentrant = function() {
	    if (writer.readyState===writer.WRITING && Date.now()-start<4000) {
	      setTimeout(reentrant, 100);
	      return;
	    }
	    if (writer.readyState===writer.WRITING) {
	      console.error("Write operation taking too long, aborting!"+
	        " (current writer readyState is "+writer.readyState+")");
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
var tgroupArray = [];
var tnameArray = [];
var parentArray = [];
var testquery = null;

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

function createContextMenu(){

		

}

//////////////////////////////
//End of ContextMenu Section//
//////////////////////////////

//////////////////////////
//Event Listener section//	
/////////////////////////

/*Event Listener to retrieve the value of the select dropdown after it's been changed*/
		CustomVarselect.addEventListener('change',function MyVarSelect(e){
			
			CustomVaropt[CustomVarselect.selectedIndex].value;
		}, false);
		
	
	/*Event listener for the Save button. Currently saves the textbox/area info into a file. extension must be specified for file eg .txt*/
	savebutton.addEventListener('click', function MySave(e) 
	{
		//Code used to save contents to file. for Packed app only since filesystem cannot be called in an extension.
		 /* var config = {type: 'saveFile', suggestedName: chosenFileEntry.name};
		  chrome.fileSystem.chooseEntry(config, function(writableEntry) 
		  {
			  	  
			  
		    var blob = new Blob([tname.value +"," + tgroup.value + "," + ebody.value + CustomVaropt[CustomVarselect.selectedIndex].value], {type: 'text/plain'});
		    writeFileEntry(writableEntry, blob, function(e) 
		    {
		      output.textContent = 'Write complete :)';
		    });
		  });
		    */
		
		/*not in use*/
		
		//Code used to store the email template information into the IndexedDB.
		var req = window.indexedDB.open(indexedDBName,version); 
        req.onsuccess = function (event) {
        	
            db = req.result;
            var trans = db.transaction(['emailTemplates'],"readwrite");
            var store = trans.objectStore('emailTemplates');
            var treq = store.add({template_name: tname.value, template_group: tgroup.value, email_body: ebody.value});
            
            	trans.oncomplete = function (event){
            	
            		output_trace(" Your email template \"" + tname.value + "\" was added into indexedDB: " + indexedDBName + " Successfully");
            		/* Clears the textboxes and textarea after it saves to file*/
            		document.getElementById('TemplateName').value = "";
            		document.getElementById('TemplateGroup').value = "";
            		document.getElementById('EmailBody').value = "";
            		
            	};
            	treq.onerror = function (event){
            		trans.abort();
            		output_trace("indexedDB.open Error: " + event.message);
            	};
            db.close();
            
        };
        req.onerror = function (event) {
            output_trace("indexedDB.open Error: " + event.message);
        };
		    
	},false);
	
	
	
	
	displaybutton.addEventListener('click', function MyDisplay(e){
		
		/*create_openDB();*/
		/*createContextMenu();*/
		var parent = chrome.contextMenus.create({"title": "Email Templates"});

		var cmreq = window.indexedDB.open(indexedDBName);
	  
		cmreq.onsuccess = function (event) {
		
			var cmdb = cmreq.result;
			var trans = cmdb.transaction(['emailTemplates'],"readonly");
			var store = trans.objectStore('emailTemplates');
			var cursorRequest = store.openCursor("3");
			cursorRequest.onsuccess = function (e) {
				testquery = cursorRequest.result.value;
			};
			cmdb.close();
		}

		cmreq.onerror = function (event){
			output_trace("indexedDB.open Error: " + event.message);
		};
		output_trace("tgroupArray:" + testquery );
		
	}, false);

