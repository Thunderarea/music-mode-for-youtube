import { support_url, review_url } from '../config.js';

let mustUpdate = false;
let tabUrl = "";
let tabId = 0;

let SPECIFIC_OPTIONS = false;
let FULL_OPTIONS = {};
let SITE_ID = "";

let sitesIDs = ["youtube", "youtube_music", "embedded", "google_search"];

let sitesInfo = {
  "youtube": {
    "name": chrome.i18n.getMessage("youtube"),
    "options": ["video", "thumbnails", "avatars", "adblocker", "other_images"]
  },
  "youtube_music": {
    "name": chrome.i18n.getMessage("youtube_music"),
    "options": ["video", "thumbnails", "avatars", "adblocker", "other_images"]
  },
  "embedded": {
    "name": chrome.i18n.getMessage("embedded"),
    "options": ["video", "thumbnails", "avatars", "adblocker"]
  },
  "google_search": {
    "name": chrome.i18n.getMessage("google_search_full"),
    "options": []
  }
};

let optionsTemplates = {
  "video": `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-play-circle" viewBox="0 0 16 16">
      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
      <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z" />
    </svg>
  `,
  "thumbnails": `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-image" viewBox="0 0 16 16">
      <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
      <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z" />
    </svg>
  `,
  "avatars": `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person-circle" viewBox="0 0 16 16">
      <path d="M13.468 12.37C12.758 11.226 11.195 10 8 10s-4.757 1.225-5.468 2.37A6.987 6.987 0 0 0 8 15a6.987 6.987 0 0 0 5.468-2.63z" />
      <path fill-rule="evenodd" d="M8 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
      <path fill-rule="evenodd" d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z" />
    </svg>
  `,
  "adblocker": `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-shield-shaded" viewBox="0 0 16 16">
      <path fill-rule="evenodd"
        d="M8 14.933a.615.615 0 0 0 .1-.025c.076-.023.174-.061.294-.118.24-.113.547-.29.893-.533a10.726 10.726 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067v13.866zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.775 11.775 0 0 1-2.517 2.453 7.159 7.159 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7.158 7.158 0 0 1-1.048-.625 11.777 11.777 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 62.456 62.456 0 0 1 5.072.56z" />
    </svg>
  `,
  "other_images": `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-images" viewBox="0 0 16 16">
      <path d="M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
      <path
        d="M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2zM14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7A1 1 0 0 0 15 11V3a1 1 0 0 0-1-1zM2.002 4a1 1 0 0 0-1 1v8l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094l1.777 1.947V5a1 1 0 0 0-1-1h-10z" />
    </svg>
  `
};

chrome.tabs.query({
  active: true,
  currentWindow: true,
}, tabs => {
  if (tabs.length > 0) {
    tabUrl = tabs[0].url;
    tabId = tabs[0].id;
    if (tabUrl.indexOf("www.youtube.com") !== -1) SITE_ID = "youtube";
    else if (tabUrl.indexOf("music.youtube.com") !== -1) SITE_ID = "youtube_music";
    else if (tabUrl.indexOf("www.google.") !== -1) SITE_ID = "google_search";
    else if (tabUrl.indexOf("http") !== -1) SITE_ID = "embedded";
    adaptDisplay();
  }
});

function adaptDisplay() {
  chrome.storage.local.get(null, storedValues => {
    SPECIFIC_OPTIONS = storedValues.popup_specific_options;
    if (SPECIFIC_OPTIONS) document.body.classList.add("specific_options");
    enableDisableButton(storedValues.enabled);

    getFullOptions(storedValues, sitesIDs, "sstabs");
    if (storedValues.sstabs[tabId] != undefined) adaptButtonDisplay(storedValues.sstabs[tabId].enabled, "perTab");
    addSites(sitesIDs, "#tab_options", FULL_OPTIONS.sstabs);

    if (storedValues.popup_current_page) {
      if (SITE_ID != "") { 
        document.querySelector("#perPage").style.display = "block";
        getFullOptions(storedValues, [SITE_ID], "sspages");
        if (storedValues.sspages[tabId] != undefined) adaptButtonDisplay(storedValues.sspages[tabId].enabled, "perPage");
        addSites([SITE_ID] ,"#page_options", FULL_OPTIONS.sspages);
      }
    }

    addListenersToButtons();
    addBrowserSpecificLinks();
    addTranslatedBy();
    let i18nElements = document.querySelectorAll("[data-i18n]");
    let childNodes;
    i18nElements.forEach(el => {
      el.textContent = "";
      childNodes = new DOMParser().parseFromString(chrome.i18n.getMessage(el.dataset.i18n), "text/html").body.childNodes;
      childNodes.forEach(node => {
        el.append(node);
      });
    });
    let i18nElTitles = document.querySelectorAll("[data-title]");
    i18nElTitles.forEach(el => {
      el.title = chrome.i18n.getMessage(el.dataset.title);
    });
  });
}

function addTranslatedBy() {
  if (chrome.i18n.getMessage("translatedBy") != "") {
    let translateByCode = `
    <div id="translateButton">
      <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 256"><path d="M242.7 210.6l-56-112a12 12 0 0 0-21.4 0l-20.5 41a84.2 84.2 0 0 1-38.8-13.4A107.3 107.3 0 0 0 131.3 68H152a12 12 0 0 0 0-24h-52V32a12 12 0 0 0-24 0v12H24a12 12 0 0 0 0 24h83.1A83.3 83.3 0 0 1 88 110.3A83.8 83.8 0 0 1 75.6 91a12 12 0 1 0-21.8 10A103.4 103.4 0 0 0 70 126.2A83.3 83.3 0 0 1 24 140a12 12 0 0 0 0 24a107 107 0 0 0 64-21.1a108.3 108.3 0 0 0 45.4 19.4l-24.1 48.3a12 12 0 1 0 21.4 10.8l12.7-25.4h65.2l12.7 25.4a12 12 0 0 0 21.4-10.8zM155.4 172l20.6-41.2l20.6 41.2z" fill="currentColor"/></svg>
      <div data-i18n="translatedBy"></div>
    </div>
    `;
    document.getElementById("container").appendChild(new DOMParser().parseFromString(translateByCode, "text/html").body.firstElementChild);
  }
}

function addBrowserSpecificLinks() {
  document.getElementById("support_button").href = support_url;
  document.querySelector("#rate a").href = review_url;
}

function adaptButtonDisplay(enabled, parentsID) {
  let radioButton = enabled ? "on" : "off";
  document.querySelector("#" + parentsID + " ." + radioButton).checked = true;
  hideShowOptions(radioButton, parentsID);
}

function enableDisableButton(enabled) {
  let className = enabled ? "on" : "off";
  document.querySelector("[name='endis']." + className).checked = true;
}

function addSites(specificSiteIDs, containerId, storedValues) {
  let code = specificSiteIDs.map(id => {
    return getSiteHTML(sitesInfo[id], storedValues[id], id)
  }).join("");
  let childNodes = new DOMParser().parseFromString(code, "text/html").body.childNodes;
  childNodes.forEach(node => {
    document.querySelector(containerId).append(node);
  });
}

function getSiteHTML(item, storedValues, id) {
  return `
  <div class="list_item" id="${id}">
    <input type="checkbox" class="ptpCheckbox trigger_apply" ${(storedValues.enabled) ? "checked" : ""} title="${chrome.i18n.getMessage(id + "Tooltip")}">
    <div class="title">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-circle-fill" viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="8" />
      </svg>
      <span>${item.name}</span>
    </div>
    <div class="options">
      ${
        (SPECIFIC_OPTIONS) ? 
        item.options.map(option => {
          return `
            <div class="option tooltip" title="${chrome.i18n.getMessage(option + "Tooltip")}">
              <input type="checkbox" id="${option}" class="trigger_apply" ${(storedValues.options[option]) ? "checked" : ""}>
              <span class="tooltiptext">${chrome.i18n.getMessage(option)}</span>
              ${optionsTemplates[option]}
            </div>
          `;
        }).join(""): ""
      }
    </div>
  </div>`
}

function getFullOptions(storedValues, customSiteIDs, ssName) {
  let recordExists = (storedValues[ssName][tabId] != undefined) && (storedValues[ssName][tabId].options != undefined);
  let record = (recordExists) ? storedValues[ssName][tabId].options : "";

  let allSitesObject = {};

  customSiteIDs.forEach(siteId => {
    let siteObject = {};
    siteObject["enabled"] = (recordExists) ? record[siteId].enabled : storedValues[siteId];
    if (SPECIFIC_OPTIONS && sitesInfo[siteId].options.length != 0) {
      let optionsObject = {};
      sitesInfo[siteId].options.forEach(option => {
        if (recordExists && record[siteId].options != undefined) {
          optionsObject[option] = record[siteId].options[option];
        } else {
          optionsObject[option] = storedValues[siteId + "_" + option];
        }
      });
      siteObject["options"] = optionsObject;
    }
    allSitesObject[siteId] = siteObject;
  });
  FULL_OPTIONS[ssName] = allSitesObject;
}

function addListenersToButtons() {
  let rad = document.querySelectorAll(".checkbox");
  for (let i = 0; i < rad.length; i++) {
    rad[i].addEventListener('change', event => {
      let targetValue = event.target.value;
      let targetName = event.target.getAttribute("name");
      if (targetName == "tab_endis") hideShowOptions(targetValue, "perTab");
      else if (targetName == "page_endis") hideShowOptions(targetValue, "perPage");
    });
  }
  let triggerApplyElements = document.getElementsByClassName("trigger_apply");
  for (let i = 0; i < triggerApplyElements.length; i++) {
    triggerApplyElements[i].addEventListener("mouseup", () => {
      var apply = document.getElementById("apply");
      apply.style.display = "flex";
      apply.addEventListener("mouseup", applySettings);
      document.addEventListener("keypress", enterSave);
    });
  }
}

function enterSave(e) {
  if (e.key == "Enter") applySettings();
}

function hideShowOptions(targetValue, id) {
  if (targetValue == "no" || targetValue == "off") {
    document.querySelector("#" + id + " .site_options_list").classList.remove("visible_options_list");
    document.querySelector("#" + id + " .site_options_list").classList.add("hidden_options_list");
  } else {
    document.querySelector("#" + id + " .site_options_list").classList.remove("hidden_options_list");
    document.querySelector("#" + id + " .site_options_list").classList.add("visible_options_list");
  }
}

function applySettings() {
  mustUpdate = false;
  chrome.storage.local.get(null, storedValues => {
    let enabled = document.querySelector("[name='endis']:checked").value == "on";
    if (enabled != storedValues.enabled) {
      chrome.storage.local.set({
        "enabled": enabled
      });
      mustUpdate = true;
    }
    applyTabPageSettings("tab_endis", "perTab", storedValues.sstabs, "sstabs");
    applyTabPageSettings("page_endis", "perPage", storedValues.sspages, "sspages");
    if (mustUpdate) {
      let qapages = storedValues.qapages;
      if (qapages[tabId] != undefined) {
        let newRecord = {};
        newRecord.qapages = qapages;
        delete newRecord.qapages[tabId];
        chrome.storage.local.set(newRecord);
      }
    }
    update();
  });
}

/**
 * @param {string} name the name of the tab or page button. tab_endis or page_endis
 * @param {object} parentId perTab or perPage
 */
function applyTabPageSettings(name, parentId, storedValues, storageId) {
  let currentRecord = storedValues[tabId];
  let buttonValue = document.querySelector("[name='" + name + "']:checked").value;
  let siteObject;
  if (buttonValue == "on") {
    let object = {
      "enabled": true
    };
    let generalOptions = {};
    let siteOptions;
    sitesIDs.forEach(siteName => {
      let button = document.querySelector("#" + parentId + " #" + siteName + " input");
      if (button != null) {
        siteObject = {
          "enabled": button.checked
        };

        if (SPECIFIC_OPTIONS) {
          siteOptions = {};
          sitesInfo[siteName].options.forEach(option => {
            siteOptions[option] = document.querySelector("#" + parentId + " #" + siteName + " #" + option).checked;
          });
          if (Object.keys(siteOptions).length != 0) siteObject["options"] = siteOptions;
        }
        generalOptions[siteName] = siteObject;
      }
    });
    object["options"] = generalOptions;
    updateStorage(storageId, storedValues, object, currentRecord);
  } else if (buttonValue == "off") {
    siteObject = {
      "enabled": false
    };
    updateStorage(storageId, storedValues, siteObject, currentRecord);
  } else {
    if (currentRecord != undefined) {
      mustUpdate = true;
      let newRecord = {};
      newRecord[storageId] = storedValues;
      delete newRecord[storageId][tabId];
      chrome.storage.local.set(newRecord);
    }
  }
}

function updateStorage(storageId, oldValues, newValues, currentRecord) {
  if (currentRecord == undefined || !isEqual(newValues, currentRecord)) {
    mustUpdate = true;
    let newRecord = {};
    newRecord[storageId] = oldValues;
    newRecord[storageId][tabId] = newValues;
    chrome.storage.local.set(newRecord);
  }
}

function isEqual(object1, object2) {
  let equal = true;
  for (let key in object1) {
    if (object2[key] != undefined) {
      if (Object.keys(object1[key]).length != 0) equal &&= isEqual(object1[key], object2[key]);
      else equal &&= object1[key] === object2[key];
    } else return false;
  }
  return equal;
}

function update() {
  if (mustUpdate) {
    chrome.tabs.sendMessage(tabId, {
      data: 1
    }, () => chrome.runtime.lastError);
    chrome.runtime.sendMessage({
      funct: 2,
      tab_id: tabId,
      url: tabUrl
    }, () => chrome.runtime.lastError);
  }
  mustUpdate = false;
  document.getElementById("apply").style.display = "none";
  document.removeEventListener("keypress", enterSave);
}