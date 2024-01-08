let extensionOptions = {
  "enabled": true,

  "youtube": true,
  "youtube_video": true,
  "youtube_thumbnails": true,
  "youtube_avatars": true,
  "youtube_adblocker": true,
  "youtube_other_images": true,

  "youtube_music": true,
  "youtube_music_video": true,
  "youtube_music_thumbnails": true,
  "youtube_music_avatars": true,
  "youtube_music_adblocker": true,
  "youtube_music_other_images": true,

  "embedded": true,
  "embedded_video": true,
  "embedded_thumbnails": true,
  "embedded_avatars": true,
  "embedded_adblocker": true,

  "google_search": false,

  "theme": 2,
  "popup_current_page": false,
  "popup_specific_options": false,

  "quick_access_buttons_images": true,
  "quick_access_buttons_video": true,

  "progress_bar": false,
  "control_buttons": false,
  "live_144": false,
  "hide_logo": false,
  "show_thumbnail": false,
  "continue_watching_prompt": true,

  "blocked_videos_counter": 0
};

const blockingInfo = {
  videos: {
    rules: [{
      filter: "*://*.googlevideo.com/*mime=video*",
      type: "block"
    }, {
      filter: "*://*.googlevideo.com/*live=1*",
      type: "allow"
    }],
    first_id: 1,
    tab_ids: [0], // cannot be empty
    resource_types: [],
    options_fields: ["videoBlocker"]
  },
  images: {
    rules: [{
      filter: "*://i9.ytimg.com/*",
      type: "block"
    }, {
      filter: "*://i1.ytimg.com/*",
      type: "block"
    }, {
      filter: "*://yt3.ggpht.com/*",
      type: "block"
    }, {
      filter: "*://lh3.googleusercontent.com/*",
      type: "block"
    }, {
      filter: "*://lh4.googleusercontent.com/*",
      type: "block"
    }, {
      filter: "*://ssl.gstatic.com/*",
      type: "block"
    }, {
      filter: "noblockingmmfytb=true",
      type: "allow"
    }],
    first_id: 0,
    tab_ids: [0], // cannot be empty
    resource_types: ["image"],
    options_fields: ["imgBlocker"]
  },
  videoPreviewImage: {
    rules: [{
      filter: "*://i.ytimg.com/*",
      type: "block"
    }],
    first_id: 0,
    tab_ids: [0], // cannot be empty
    resource_types: ["image"],
    options_fields: ["videoBlocker", "imgBlocker"]
  }
};

chrome.runtime.onInstalled.addListener(details => {
  initialization(details.reason);
});

chrome.runtime.onStartup.addListener(() => {
  initialization("startup");
});

function initialization(initializationReason) {
  // delete records from previous versions
  chrome.storage.local.remove(["extension", "mmfytb_extension"]);
  chrome.storage.local.get(null, async function (storedValues) {

    let enabled = initializeExtensionOptions(storedValues);
    initializeBlockingInfo();
    chrome.storage.local.set({"blocking_info": blockingInfo});

    for (let blockingInfoName in blockingInfo) declareRules(createRules(blockingInfo, blockingInfoName));

    let [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true
    });
    if (tab) setLogoForTab(tab.id, enabled);

    chrome.management.getSelf(info => {
      chrome.storage.local.set({
        "version": info.version,
        "sstabs": {},
        "sspages": {},
        "qapages": {}
      }, () => {
        if (initializationReason === "install") {
          chrome.tabs.create({
            url: "pages/options.html"
          });
        } 
        // else if (initializationReason === "update") {
        //   chrome.tabs.create({
        //     url: "pages/about.html"
        //   });
        // }
      });
    });
  });
}

function initializeExtensionOptions(storedValues) {
  let enabled = extensionOptions.enabled;
  if (!storedValues.hasOwnProperty("version")) {
    // if the previous version was below version 5
    chrome.storage.local.set(extensionOptions);
  } else {
    enabled = storedValues.enabled;
    // add new options or change the value of options that their type was changed
    for (let key in extensionOptions) {
      if (storedValues[key] === undefined || (typeof storedValues[key] != typeof extensionOptions[key])) {
        storedValues[key] = extensionOptions[key];
      }
    }
    chrome.storage.local.set(storedValues);
    // remove old options
    for (let key in storedValues) {
      if (extensionOptions[key] === undefined) chrome.storage.local.remove(key);
    }
  }
  return enabled;
}

function initializeBlockingInfo() {
  blockingInfo.images.first_id = blockingInfo.videos.rules.length + 1;
  blockingInfo.videoPreviewImage.first_id = blockingInfo.images.first_id + blockingInfo.images.rules.length + 1;
}

chrome.tabs.onRemoved.addListener(tabId => {
  removeYouTubeTab(tabId);
  chrome.storage.local.get(null, storedValues => {
    let ssvalues = storedValues.sstabs;
    ssvalues = removeTabFromOptions(ssvalues, tabId, true);
    chrome.storage.local.set({
      'sstabs': ssvalues
    });
    ssvalues = storedValues.sspages;
    ssvalues = removeTabFromOptions(ssvalues, tabId, true);
    chrome.storage.local.set({
      'sspages': ssvalues
    });
    ssvalues = storedValues.qapages;
    ssvalues = removeTabFromOptions(ssvalues, tabId, true);
    chrome.storage.local.set({
      'qapages': ssvalues
    });
  });
});

function removeTabFromOptions(list, id, getOnlyList) {
  let found = false;
  if (list && list.hasOwnProperty(id)) {
    delete list[id];
    found = true;
  }
  if (getOnlyList) return list;
  else return {
    list: list,
    found: found
  };
}

function addYouTubeTab(tabId, isEmbed, isYTMusic) {
  let siteName = (isEmbed) ? "embedded" : ((isYTMusic ? "youtube_music" : "youtube"));
  chrome.storage.local.get(null, storedValues => {
    let tabOptions = getTabOptions(storedValues, storedValues.qapages[tabId], (storedValues.sspages[tabId] != undefined) ? storedValues.sspages[tabId] : storedValues.sstabs[tabId], siteName);
    chrome.storage.local.get(["blocking_info"], result => {
      for (blockingInfoName in result.blocking_info) rulesHandler(result.blocking_info, blockingInfoName, tabId, tabOptions);
    });
  });
}

function removeYouTubeTab(tabId) {
  let index = 0;
  chrome.storage.local.get(["blocking_info"], result => {
    for (blockingInfoName in result.blocking_info) {
      index = result.blocking_info[blockingInfoName].tab_ids.indexOf(tabId);
      if (index != -1) {
        result.blocking_info[blockingInfoName].tab_ids.splice(index, 1);
        declareRules(createRules(result.blocking_info, blockingInfoName));
      }
    }
  });
}

function getTabOptions(storedValues, qapage, ssvalue, siteName) {
  let options = {};
  if (ssvalue != undefined) {
    if (!ssvalue.enabled) {
      options = getOptionsValues(qapage, true);
    } else {
      if (ssvalue.options[siteName] != undefined) {
        if (!ssvalue.options[siteName].enabled) {
          options = getOptionsValues(qapage, true);
        } else {
          if (ssvalue.options[siteName].options != undefined) {
            options = getOptionsValues(qapage, false, ssvalue.options[siteName].options, "");
          } else {
            options = getOptionsValues(qapage, !storedValues[siteName], storedValues, (siteName + "_"));
          }
        }
      }
    }
  } else {
    if (!storedValues.enabled) {
      options = getOptionsValues(qapage, true);
    } else {
      options = getOptionsValues(qapage, !storedValues[siteName], storedValues, (siteName + "_"));
    }
  }
  return options;
}

function getOptionsValues(qapage, allFalse, storedValues = undefined, prefix = undefined) {
  let imgBlocker, adBlocker, videoBlocker = false;
  adBlocker = getOptionValue(allFalse, storedValues, prefix, "adblocker");
  videoBlocker = (qapage != undefined) ? ((qapage.video != undefined) ? qapage.video : getOptionValue(allFalse, storedValues, prefix, "video")) : getOptionValue(allFalse, storedValues, prefix, "video");

  let otherImages = getOptionValue(allFalse, storedValues, prefix, "other_images");
  let imgBlockerValue = getOptionValue(allFalse, storedValues, prefix, "thumbnails") && getOptionValue(allFalse, storedValues, prefix, "avatars");
  if (otherImages != undefined) imgBlockerValue &&= otherImages;
  imgBlocker = (qapage != undefined) ? ((qapage.images != undefined) ? qapage.images : imgBlockerValue) : imgBlockerValue;

  return {
    adBlocker: adBlocker,
    imgBlocker: imgBlocker,
    videoBlocker: videoBlocker
  };
}

function getOptionValue(allFalse, storedValues, prefix, optionName) {
  if (allFalse) return false;
  else return storedValues[prefix + optionName];
}

function rulesHandler(info, infoName, tabId, tabOptions) {
  let index = info[infoName].tab_ids.indexOf(tabId),
    tabOptionValue = true;
  info[infoName].options_fields.forEach(field => tabOptionValue &&= tabOptions[field]);
  if (index === -1) {
    if (tabOptionValue) {
      info[infoName].tab_ids.push(tabId);
      declareRules(createRules(info, infoName));
    }
  } else if (!tabOptionValue) {
    info[infoName].tab_ids.splice(index, 1);
    declareRules(createRules(info, infoName));
  }
}

function createRules(info, infoName) {
  let addRulesList = [],
  removeRuleIds = [],
    addedRule = {},
    id = info[infoName].first_id;
  info[infoName].rules.forEach(rule => {
    addedRule = {
      "id": id,
      "action": {
        "type": rule.type
      },
      "condition": {
        "urlFilter": rule.filter,
        "tabIds": info[infoName].tab_ids
      }
    };
    if (info[infoName].resource_types.length != 0) addedRule.condition.resourceTypes = info[infoName].resource_types;
    addRulesList.push(addedRule);
    removeRuleIds.push(id);
    id++;
  });

  chrome.storage.local.set({
    "blocking_info": info
  });

  return {
    "addRules": addRulesList,
    "removeRuleIds": removeRuleIds
  };
}

function declareRules(rules) {
  chrome.declarativeNetRequest.updateSessionRules(rules);
}

chrome.tabs.onUpdated.addListener(detectURLChange);

function detectURLChange(tabId, changeInfo, tab) {
  if (changeInfo.status === "loading" || (changeInfo.status && changeInfo.url)) {
    let isYTMusic;
    if (typeof changeInfo.url !== "undefined" || changeInfo.status === "complete") {
      // the url has changed
      chrome.storage.local.get('sspages', storedValues => {
        let response = removeTabFromOptions(storedValues.sspages, tabId, false);
        if (response.found) {
          chrome.storage.local.set({
            'sspages': response.list
          });
        }
        chrome.storage.local.get('qapages', val => {
          response = removeTabFromOptions(val.qapages, tabId, false);
          if (response.found) {
            chrome.storage.local.set({
              'qapages': response.list
            });
          }
          isYTMusic = (changeInfo.url.indexOf("music.youtube.com") != -1);
          if (changeInfo.url.indexOf("www.youtube.com") !== -1 || changeInfo.url.indexOf("m.youtube.com") !== -1 || isYTMusic) {
            addYouTubeTab(tabId, false, isYTMusic);
            chrome.tabs.sendMessage(tabId, {
              data: 2
            }, () => chrome.runtime.lastError);
          } else removeYouTubeTab(tabId);
        });
      });
    } else {
      // the page has been updated
      isYTMusic = (tab.url.indexOf("music.youtube.com") != -1);
      if (tab.url.indexOf("www.youtube.com") != -1 || tab.url.indexOf("m.youtube.com") != -1 || isYTMusic) {
        addYouTubeTab(tabId, false, isYTMusic);
      }
    }
  }
  setLogoForTab(tabId);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.funct) {
    case 0:
      // from content scripts (YouTube and Google) to find the tab id
      sendResponse({
        id: sender.tab.id,
        url: sender.url
      });
      return true;
    case 1:
      // from YouTube content script
      addYouTubeTab(sender.tab.id, request.isEmbed, request.isYTMusic);
      setLogoForTab(sender.tab.id);
      break;
    case 2:
      /*from Google content script and from popup*/
      setLogoForTab(request.tab_id);
      break;
    case 3:
      // from mmfytb button on mobile YouTube
      runOnCurrentTab("run_extension_tab", sender.tab.id);
      break;
  }
});

chrome.tabs.onActivated.addListener(activeInfo => setLogoForTab(activeInfo.tabId));

async function setLogoForTab(tabId, tabStatus) {
  let status = tabStatus;
  if (typeof status === "undefined") status = await getTabStatus(tabId);
  chrome.action.setIcon({
    path: {
      19: `../img/logo/${status ? "" : "disabled_"}icon19.png`,
      38: `../img/logo/${status ? "" : "disabled_"}icon38.png`
    },
    tabId: tabId
  }, () => chrome.runtime.lastError);
}

async function getTabStatus(tabID) {
  return new Promise(resolve => {
    chrome.storage.local.get(null, storedValues => {
      let ssvalues = storedValues.sspages;
      if (ssvalues) {
        let record = ssvalues[tabID];
        if (record == undefined) {
          ssvalues = storedValues.sstabs;
          if (ssvalues) {
            record = ssvalues[tabID];
            if (record == undefined) resolve(storedValues.enabled);
            else resolve(record.enabled);
          } else resolve(storedValues.enabled);
        } else resolve(record.enabled);
      } else resolve(storedValues.enabled);
    });
  });
}

chrome.commands.onCommand.addListener(command => runOnCurrentTab(command));

function runOnCurrentTab(command, currentTabId = -1) {
  if (command == "run_extension_tab") {
    if (currentTabId === -1) {
      chrome.tabs.query({
        active: true,
        currentWindow: true
      }, tabs => {
        if (tabs.length > 0) toglleStatusForTab(tabs[0].id);
      });
    } else toglleStatusForTab(currentTabId);
  }
}

async function toglleStatusForTab(tabId) {
  let tabStatus = await getTabStatus(tabId);
  chrome.storage.local.get(null, storedValues => {
    let newTabValues = {
      "enabled": !tabStatus,
      "options": {
        "youtube": {
          "enabled": storedValues.youtube
        },
        "youtube_music": {
          "enabled": storedValues.youtube_music
        },
        "embedded": {
          "enabled": storedValues.embedded
        },
        "google_search": {
          "enabled": storedValues.google_search
        }
      }
    };
    let newRecord = {};
    newRecord["sstabs"] = storedValues.sstabs;
    newRecord["sstabs"][tabId] = newTabValues;
    chrome.storage.local.set(newRecord);
    setLogoForTab(tabId);
    chrome.tabs.sendMessage(tabId, {
      data: 1
    }, () => chrome.runtime.lastError);
  });
}
