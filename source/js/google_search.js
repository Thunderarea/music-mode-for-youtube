function applySettings() {
  chrome.runtime.sendMessage({
    funct: 0
  }, function(response) {
    chrome.runtime.lastError;
    let tabId = response.id;
    chrome.runtime.sendMessage({
      funct: 2,
      tab_id: tabId,
      url: window.location.hostname
    }, () => chrome.runtime.lastError);

    chrome.storage.local.get(null, storedValues => {
      let ssvalues = storedValues.sspages;
      if (ssvalues[tabId] != undefined) {
        if (ssvalues[tabId].enabled && ssvalues[tabId].options != undefined && ssvalues[tabId].options.google_search != undefined && ssvalues[tabId].options.google_search.enabled) {
          insertStyleSheets();
        } else removeStyleSheets();
      } else {
        ssvalues = storedValues.sstabs;
        if (ssvalues[tabId] != undefined) {
          if (ssvalues[tabId].enabled && ssvalues[tabId].options != undefined && ssvalues[tabId].options.google_search != undefined && ssvalues[tabId].options.google_search.enabled) {
            insertStyleSheets();
          } else removeStyleSheets();
        } else {
          if (storedValues.enabled && storedValues.google_search) insertStyleSheets();
          else removeStyleSheets();
        }
      }
    });
  });
}

function insertStyleSheets() {
  let name = "google_search";
  if (document.getElementById(name + "_mmfytb_thunderarea") == null) {
    let link = document.createElement("link");
    link.href = chrome.runtime.getURL(("../css/" + name + ".css"));
    link.id = (name + "_mmfytb_thunderarea");
    link.className = "mmfytbthunderarea";
    link.type = "text/css";
    link.rel = "stylesheet";
    document.getElementsByTagName("html")[0].appendChild(link);
  }
}

function removeStyleSheets() {
  let extensionLink = document.getElementById("google_search_mmfytb_thunderarea");
  if (extensionLink != null) extensionLink.parentNode.removeChild(extensionLink);
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  applySettings();
});

applySettings();
