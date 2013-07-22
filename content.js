/* --- Created specifically for inserting text where the cursor is. --- */
// The ID of the element to insert text in
var sID = "";

// Add event listener to catch events when the mouse button is clicked
document.addEventListener
(
 "mousedown", 
 function(event)
 {
  // When the user clicks into an element to insert text, the event
  // will have that object targeted.  We can then store what object
  // was clicked into (right clicked for this situation)
  var el = event.target;
  
  // Grab the ID of that element that was clicked
  sID = el.id;
  
 },
 true
);


// Add a listener to catch the chrome.tabs.sendMessage() calls
chrome.extension.onMessage.addListener
(
 function(request, sender, sendResponse)
 {
  // Get the object that was right-clicked for this content menu command
  var objField = document.getElementById(sID);
  
  // Insert the text to the object
  insertAtCursor(objField, request);
 }
);


// Inserts sValue into the object sField
function insertAtCursor(sField, sValue) 
{
 if (sField.selectionStart || sField.selectionStart == '0') 
 {
  var nStart = sField.selectionStart;
  var nEnd = sField.selectionEnd;
  
  sField.value = sField.value.substring(0, nStart) + sValue + sField.value.substring(nEnd, sField.value.length);
  sField.selectionStart = nStart + sValue.length;
  sField.selectionEnd = nStart + sValue.length;
 } 
 else 
 {
  sField.value += sValue;
 }
}