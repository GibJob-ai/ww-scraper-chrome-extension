// Inject the payload.js script into the current tab after the popout has loaded
window.addEventListener('load', function (evt) {
	chrome.extension.getBackgroundPage().chrome.tabs.executeScript(null, {
		file: 'payload.js'
	});;
});

// Listen to messages from the payload.js script and write to popout.html
chrome.runtime.onMessage.addListener(function (message) {
  document.getElementById('pagetitle').innerHTML += `<br>${message}`;
});

// chrome.webRequest.onBeforeRequest.addListener(
    // function (details) {
        // var javascriptCode = loadSynchronously(details.url);
        // document.getElementById('pagetitle').innerHTML = javascriptCode;
        // // modify javascriptCode here
        // return { redirectUrl: "data:text/javascript," 
                             // + encodeURIComponent(javascriptCode) };
    // },
    // { urls: ["*://*.waterlooworks.uwaterloo.ca/myAccount/dashboard.htm.com/*.js"] },
    // ["blocking"]);
