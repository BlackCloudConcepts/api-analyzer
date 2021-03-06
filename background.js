//Handle request from devtools
chrome.extension.onConnect.addListener(function (port) {
    port.onMessage.addListener(function (message) {
        //Request a tab for sending needed information
        chrome.tabs.query({
            "status": "complete",
            "currentWindow": true
        }, function (tabs) {

            for (tab in tabs) {
                //Sending Message to content scripts
                chrome.tabs.sendMessage(tabs[tab].id, message);
            }
        });

    });
    //Posting back to Devtools
    chrome.extension.onMessage.addListener(function (message, sender) {
        port.postMessage(message);
    });
});
