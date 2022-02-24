//Handler request from background page
chrome.extension.onMessage.addListener(function (message, sender) {
  console.log(message);

  //Send needed information to background page
  //chrome.extension.sendMessage("My URL is" + window.location.origin);
});
