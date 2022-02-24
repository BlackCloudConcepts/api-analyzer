console.log('hello is it me your looking for?');

var requestcount = 0;
var panelWindow;
var panelObj;
var status = "stopped";
var urlList = [];
var urlBaseList = [];
var urlDuplicateList = {};
var slowAPIList = [];


var analyze = function(){
  urlDuplicateList = {};
  urlList.forEach(function(obj) {
      var key = JSON.stringify(obj)
      urlDuplicateList[key] = (urlDuplicateList[key] || 0) + 1
  })
  var html = htmlizeDisplay(urlDuplicateList);
  panelWindow.document.getElementById("analysis").innerHTML = html;
};

var analyzeBase = function(){
  urlDuplicateList = {};
  urlBaseList.forEach(function(obj) {
      var key = JSON.stringify(obj)
      urlDuplicateList[key] = (urlDuplicateList[key] || 0) + 1
  })
  var html = htmlizeDisplay(urlDuplicateList);
  panelWindow.document.getElementById("analysis").innerHTML = html;
};

var analyzeSlowAPI = function(){
  var html = "";
  slowAPIList.forEach(function(obj){
    html += "<div style='margin-bottom:5px;'>"+obj.request.url+"</div>";
    html += "<div style='margin-left:15px;'>Total :: "+obj.time+"</div>";
    html += "<div style='margin-left:15px;'>Blocked :: "+obj.timings.blocked+"</div>";
    html += "<div style='margin-left:15px;'>Send :: "+obj.timings.send+"</div>";
    html += "<div style='margin-left:15px;'>Receive :: "+obj.timings.receive+"</div>";
    html += "<div style='margin-left:15px;'>Wait :: "+obj.timings.wait+"</div>";
  });
  panelWindow.document.getElementById("analysis").innerHTML = html;
};

var htmlizeDisplay = function(list){
  var html = "";
  html += "<div style='margin-bottom:5px;'># :: URL</div>";
  for (var property in list) {
    if (list.hasOwnProperty(property)) {
        // do stuff
        html += "<div style='margin-bottom:5px;'>"+list[property]+" :: "+property+"</div>";
    }
  }
  return html;
};

var startNetworkListener = function(panel){
  chrome.devtools.network.onRequestFinished.addListener(
    function(request) {
      if (status == 'started'
        && request.request.method !== 'OPTIONS'
        && (request.request.url.indexOf('siren') != -1 ||
        request.request.url.indexOf('ego') != -1 ||
        request.request.url.indexOf('prism') != -1)
        ){
        var lRequest = JSON.parse(JSON.stringify(request));
        requestcount++;
        port.postMessage(lRequest);

        urlList.push(lRequest.request.url);
        urlBaseList.push(lRequest.request.url.split('?')[0]);
        if (lRequest.time > 4000){
          slowAPIList.push(lRequest);
        }
        panelWindow.document.getElementById("results").innerHTML = requestcount;
      }
    }
  );
};

var startRecording = function(){
  panelWindow.document.getElementById("message").innerHTML = 'Recording Started';
  status = "started";
};

var stopRecording = function(){
  panelWindow.document.getElementById("message").innerHTML = 'Recording Stopped';
  status = "stopped";
};

var clearOutput = function(){
  panelWindow.document.getElementById("message").innerHTML = 'Output Cleared';
  requestcount = 0;
  urlDuplicateList = {};
  urlList = [];
  urlBaseList = [];
  slowAPIList = [];
  panelWindow.document.getElementById("analysis").innerHTML = '';
  panelWindow.document.getElementById("results").innerHTML = requestcount;
};

chrome.devtools.panels.create("api-analyzer",
    "icon.png",
    "panel.html",
    function(panel) {
      panelObj = panel;
      // code invoked on panel creation
      panel.onShown.addListener(function tmp(panel_window){
        panel.onShown.removeListener(tmp);
        panelWindow = panel_window;
        // panelWindow.document.getElementById("output").innerHTML = requestcount;
        panelWindow.document.getElementById("startButton").addEventListener("click", startRecording);
        panelWindow.document.getElementById("stopButton").addEventListener("click", stopRecording);
        panelWindow.document.getElementById("clearButton").addEventListener("click", clearOutput);
        panelWindow.document.getElementById("analyzeButton").addEventListener("click", analyze);
        panelWindow.document.getElementById("analyzeBaseButton").addEventListener("click", analyzeBase);
        panelWindow.document.getElementById("analyzeSlowAPIButton").addEventListener("click", analyzeSlowAPI);
      });
      startNetworkListener(panelObj);
    }
);

//Created a port with background page for continous message communication
var port = chrome.extension.connect({
    name: "Sample Communication" //Given a Name
});
//Posting message to background page
port.postMessage("Request Tab Data");
//Hanlde response when recieved from background page
port.onMessage.addListener(function (msg) {
  console.log("Tab Data recieved is  " + msg);
});
