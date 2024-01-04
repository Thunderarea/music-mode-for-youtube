document.addEventListener("video_block_count", () => {
  chrome.storage.local.get("blocked_videos_counter", result => {
    chrome.storage.local.set({
      "blocked_videos_counter": ++result.blocked_videos_counter
    });
  });
});

const communication_event = new Event('injection_script_communication');

let videoButtonState = false;
let imageButtonState = false;

let svgImageEnabled = `
<svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" class="style-scope yt-icon icon icon-imageEnabled" style="pointer-events: none; display: block; width: 100%; height: 100%;">
  <use xlink:href="#icon-imageEnabled">
    <symbol id="icon-imageEnabled" viewBox="0 0 32 32">
      <path d="M3.727 0.407c-0.113 0.003-0.226 0.043-0.319 0.124l-0.672 0.58c-0.212 0.183-0.235 0.502-0.052 0.714l25.735 29.792c0.183 0.212 0.502 0.236 0.714 0.052l0.672-0.58c0.212-0.183 0.235-0.502 0.052-0.714l-2.608-3.019c0.264-0.002 0.528-0.003 0.793-0.005 0.526-0.003 0.953-0.433 0.953-0.964v-20.72c0-0.532-0.428-0.964-0.953-0.964h-20.361l-3.559-4.12c-0.103-0.119-0.249-0.179-0.395-0.176zM3.758 4.707c-0.487 0.042-0.871 0.456-0.871 0.96v20.72c0 0.532 0.428 0.96 0.953 0.964 6.326 0.054 12.853 0.055 19.5 0.026l-7.236-8.377-1.315 1.315-4.144-4.144c-0.145-0.145-0.338-0.225-0.543-0.225s-0.398 0.080-0.542 0.225l-4.101 4.071v-12.884h0.588l-2.289-2.65zM9.973 7.356h16.515v10.575l-4.125-4.106c-0.299-0.299-0.786-0.298-1.084 0.001l-3.067 3.067-8.238-9.536zM16.825 8.523c-1.445 0-2.62 1.175-2.62 2.621s1.176 2.62 2.62 2.62 2.621-1.176 2.621-2.62c0-1.445-1.176-2.621-2.621-2.621zM23.999 14.981c-0.005 0.021-0.008 0.030-0.013 0.048 0.012-0.009 0.024-0.016 0.036-0.024l-0.023-0.023zM6.765 18.587l-0.117 0.117c0.048-0.002 0.096-0.004 0.145-0.003-0.012-0.032-0.025-0.063-0.027-0.097-0-0.006-0-0.012-0-0.018zM6.162 19.304c-0-0-0 0.002-0 0.002-0 0.003-0 0.004-0 0.006 0.004 0.018 0.021 0.061 0.045 0.097-0.025-0.070-0.040-0.102-0.044-0.106z"></path>
    </symbol>
  </use>
</svg>
`;
let svgImageEnabledEl = new DOMParser().parseFromString(svgImageEnabled, "text/html").body.firstElementChild;

let svgImageDisabled = `
<svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" class="style-scope yt-icon icon icon-imageDisabled" style="pointer-events: none; display: block; width: 100%; height: 100%;">
  <use xlink:href="#icon-imageDisabled">
    <symbol id="icon-imageDisabled" viewBox="0 0 32 32">
      <path d="M3.84 4.702c-0.526 0-0.953 0.432-0.953 0.964v20.72c0 0.532 0.428 0.96 0.953 0.964 7.812 0.067 15.928 0.054 24.202 0 0.526-0.003 0.953-0.433 0.953-0.964v-20.72c0-0.532-0.428-0.964-0.953-0.964h-24.202zM5.459 7.356h21.028v10.575l-4.125-4.106c-0.299-0.299-0.786-0.298-1.084 0.001l-6.488 6.488-4.144-4.144c-0.145-0.145-0.338-0.225-0.543-0.225s-0.398 0.080-0.542 0.225l-4.101 4.071v-12.884zM16.825 8.523c-1.445 0-2.62 1.175-2.62 2.621s1.176 2.62 2.62 2.62 2.621-1.176 2.621-2.62c0-1.445-1.176-2.621-2.621-2.621zM23.999 14.981c-0.005 0.021-0.008 0.030-0.013 0.048 0.012-0.009 0.024-0.016 0.036-0.024l-0.023-0.023zM6.765 18.587l-0.117 0.117c0.048-0.002 0.096-0.004 0.145-0.003-0.012-0.032-0.025-0.063-0.027-0.097-0-0.006-0-0.012-0-0.018zM6.162 19.304c-0-0-0 0.002-0 0.002-0 0.003-0 0.004-0 0.006 0.004 0.018 0.021 0.061 0.045 0.097-0.025-0.070-0.040-0.102-0.044-0.106z"></path>
    </symbol>
  </use>
</svg>
`;
let svgImageDisabledEl = new DOMParser().parseFromString(svgImageDisabled, "text/html").body.firstElementChild;

if (document.getElementById("video_quick_access_button_JS_mmfytb_thunderarea") == null) {
  let script = document.createElement("script");
  script.src = chrome.runtime.getURL(("../js/video_quick_access_button.js"));
  script.id = "video_quick_access_button_JS_mmfytb_thunderarea";
  script.className = "mmfytbthunderarea";
  document.documentElement.appendChild(script);
}

let videoElement = undefined;
var timerIDPlayerButton = undefined;

function addVideoButton() {
  let iterations = 0;
  let timerId = setInterval(findVideoButton, 500);

  function findVideoButton() {
    iterations++;
    if (iterations >= 120) clearInterval(timerId);
    let container = document.querySelector(".ytp-chrome-controls .ytp-right-controls");
    if (container && container.firstElementChild) {
      let existEl = document.getElementById("video_button_mmfytb_thunderarea");
      if (!existEl) {
        let el_1 = document.createElement("BUTTON");
        el_1.classList.add("ytp-button");
        el_1.id = "video_button_mmfytb_thunderarea";
        container.insertBefore(el_1, container.firstElementChild);

        el_1.addEventListener("mouseenter", setTextOnTooltip);
        el_1.addEventListener("mousemove", enableTooltip);
        el_1.addEventListener("mouseleave", hideVideoButTooltip);
        el_1.onmouseup = function () {
          clickButton(true);
        };
      }
    } else return;
    setvideoButtonState();
    clearInterval(timerId);
  }

  function setvideoButtonState() {
    let el = document.getElementById("video_button_mmfytb_thunderarea");
    if (el) el.dataset.gray = videoButtonState ? 0 : 1;
  }

  function hideVideoButTooltip() {
    let el = document.querySelector(".ytp-tooltip.ytp-bottom");
    if (el) {
      el.style.setProperty("display", "none");
      el.style.setProperty("opacity", "");
      el.style.setProperty("bottom", "");
    }
  }

  function enableTooltip(event) {
    let el = document.querySelector(".ytp-tooltip.ytp-bottom");
    if (el) {
      el.className = "ytp-tooltip ytp-bottom";
      el.style.setProperty("display", "block", "important");
      el.style.setProperty("opacity", "1", "important");
      el.style.setProperty("left", event.target.offsetLeft + "px");
      el.style.setProperty("top", "");
      el.style.setProperty("bottom", event.target.offsetHeight + 10 + "px");
    }
  }

  function setTextOnTooltip() {
    let el = document.querySelector(".ytp-tooltip.ytp-bottom");
    if (el) {
      let videoTooltip = el.querySelector(".ytp-tooltip-text");
      if (videoTooltip) {
        if (videoButtonState) videoTooltip.textContent = chrome.i18n.getMessage("VideoButtonTooltipEnabled");
        else videoTooltip.textContent = chrome.i18n.getMessage("VideoButtonTooltipDisabled");
      }
    }
  }
}

function clickButton(vid) {
  chrome.runtime.sendMessage({
    funct: 0
  }, function (response) {
    chrome.runtime.lastError;
    chrome.storage.local.get('qapages', function (values) {
      let qapages = values.qapages;
      let id = response.id;

      let qapage = qapages[id];
      let qapageExists = qapage != undefined;

      let newValues = {};
      if (vid) {
        newValues["video"] = !videoButtonState;
        if (qapageExists && (qapage.images != undefined)) newValues["images"] = qapage.images;
      } else {
        newValues["images"] = !imageButtonState;
        if (qapageExists && (qapage.video != undefined)) newValues["video"] = qapage.video;
      }

      let newRecord = {};
      newRecord["qapages"] = qapages;
      newRecord["qapages"][id] = newValues;
      chrome.storage.local.set(newRecord);

      applyOptions(1);
    });
  });
}

let topBarObserver = new MutationObserver(detectRemovalOfMMFYTButton);
let options = {
  childList: true
};

function detectRemovalOfMMFYTButton(mutations) {
  addImagesButton();
}

function addImagesButton() {
  let iterations = 0;
  let el_6;
  let timerId = setInterval(findImagesButton, 500);

  function findImagesButton() {
    iterations++;
    if (iterations >= 60) clearInterval(timerId);
    var headElement = document.querySelector("#container.ytd-masthead #end.ytd-masthead");
    if (headElement && headElement.firstElementChild) {
      let existElement = headElement.querySelector("#topbar_button_mmfytb_thunderarea");
      if (!existElement) {
        var endElement = headElement.querySelector("#buttons");
        if (!endElement) return;
        topBarObserver.observe(endElement, options);
        let el_1 = `<ytd-topbar-menu-button-renderer id="topbar_button_mmfytb_thunderarea" class="style-scope ytd-masthead style-default" is-icon-button="" has-no-text="" use-keyboard-focused="" style="width: 40px; margin-right: 8px;"></ytd-topbar-menu-button-renderer>
        </ytd-topbar-menu-button-renderer>`;
        el_1 = new DOMParser().parseFromString(el_1, "text/html").body.firstElementChild;
        headElement.insertBefore(el_1, endElement);
        let el_2 = `<a id="topbar_button_mmfytb_thunderarea" class="yt-simple-endpoint style-scope ytd-topbar-menu-button-renderer" tabindex="-1"></a>`;
        el_2 = new DOMParser().parseFromString(el_2, "text/html").body.firstElementChild;
        el_1.querySelector("div#button").appendChild(el_2);

        let el_3 = `<yt-icon-button id="button" class="style-scope ytd-topbar-menu-button-renderer style-default"></yt-icon-button>`;
        el_3 = new DOMParser().parseFromString(el_3, "text/html").body.firstElementChild;
        el_2.appendChild(el_3);
        let el_4 = el_3.querySelector("button#button");
        el_4.setAttribute("aria-label", "Hide images");

        let el_5 = `<yt-icon class="style-scope ytd-topbar-menu-button-renderer" id="icon_mmfytb_thunderarea"></yt-icon>`;
        el_5 = new DOMParser().parseFromString(el_5, "text/html").body.firstElementChild;
        el_4.appendChild(el_5);

        el_6 = `<tp-yt-paper-tooltip class="style-scope ytd-topbar-menu-button-renderer" id="tooltip_text_mmfytb_thunderarea" role="tooltip" tabindex="-1"></tp-yt-paper-tooltip>`;
        el_6 = new DOMParser().parseFromString(el_6, "text/html").body.firstElementChild;
        el_2.appendChild(el_6);
        el_2.addEventListener("mouseenter", showTooltip);
        el_2.addEventListener("mouseleave", hideTooltip);
        el_2.onmouseup = function () {
          clickButton(false);
        };
      }
      setImagesButtonState();
      clearInterval(timerId);
    }
  }

  function setImagesButtonState() {
    if (imageButtonState) {
      empty(document.getElementById("icon_mmfytb_thunderarea"));
      document.getElementById("icon_mmfytb_thunderarea").appendChild(svgImageEnabledEl);
      document.getElementById("tooltip_text_mmfytb_thunderarea").querySelector("#tooltip").dataset.gray = "0";
    } else {
      empty(document.getElementById("icon_mmfytb_thunderarea"));
      document.getElementById("icon_mmfytb_thunderarea").appendChild(svgImageDisabledEl);
      document.getElementById("tooltip_text_mmfytb_thunderarea").querySelector("#tooltip").dataset.gray = "1";
    }
  }

  function showTooltip() {
    var tooltipEl = document.getElementById("tooltip_text_mmfytb_thunderarea");
    if (tooltipEl) {
      tooltipEl = tooltipEl.querySelector("#tooltip");
      if (tooltipEl) {
        tooltipEl.classList.add("fade-in-animation");
        tooltipEl.classList.remove("hidden");
        el_6.style.top = document.querySelector("#end.ytd-masthead div#buttons").offsetHeight + document.querySelector("#end.ytd-masthead div#buttons").offsetTop + 8 + "px";
        tooltipEl.style.setProperty("display", "block", "important");
      }
    }
  }

  function hideTooltip() {
    var tooltipEl = document.getElementById("tooltip_text_mmfytb_thunderarea");
    if (tooltipEl) {
      tooltipEl = tooltipEl.querySelector("#tooltip");
      if (tooltipEl) {
        tooltipEl.classList.add("hidden");
        tooltipEl.classList.remove("fade-in-animation");
        tooltipEl.style.setProperty("display", "none", "important");
        tooltipEl.textContent = "";
      }
    }
  }
}

function addFeature(optionName, theme, mustReload, videoOptions) {
  switch (optionName) {
    case "video":
      saveToSessionStorage(videoOptions);
      insertVideoHandler("video_handler");
      document.dispatchEvent(communication_event);
      if (mustReload === 1) {
        let clonedDetail = { enabled: true };
        if (typeof cloneInto != 'undefined') clonedDetail = cloneInto({ enabled: true }, document.defaultView);
        let customEvent = new CustomEvent('vqab', { 
          detail: clonedDetail 
        });
        document.dispatchEvent(customEvent);
      }
      isMobileYouTube() ? insertStylesheet('video', "mobile", "") : insertStylesheet('video', "", "");

      videoButtonState = true;
      break;
    case "thumbnails":
      if (isYoutubeMusic()) insertStylesheet('video_thumbnails', "YTMusic", "");
      else if (isMobileYouTube()) insertStylesheet('video_thumbnails', "mobile", "");
      else insertStylesheet('video_thumbnails', "", theme);
      imageButtonState = true;
      break;
    case "avatars":
      if (isYoutubeMusic()) insertStylesheet('channel_avatars', "YTMusic", "");
      else if (isMobileYouTube()) insertStylesheet('channel_avatars', "mobile", "");
      else insertStylesheet('channel_avatars', "", "");
      break;
    case "other_images":
      if (isYoutubeMusic()) insertStylesheet('others', "YTMusic", "");
      else if (isMobileYouTube()) insertStylesheet('others', "mobile", "");
      else insertStylesheet('others', "", "");
      break;
    case "adblocker":
      isMobileYouTube() ? insertStylesheet('ads', "mobile", "") : insertStylesheet('ads', "", "");
      insertAdSkipper("adSkipper");
      break;
  }
}

function insertStylesheet(name, site, theme) {
  if (document.getElementById(name + "_mmfytb_thunderarea") == null) {
    let link = document.createElement("link");
    link.href = chrome.runtime.getURL(("../css/" + name + (site ? "_" : "") + site + theme + ".css"));
    link.id = (name + "_mmfytb_thunderarea");
    link.className = "mmfytbthunderarea";
    link.type = "text/css";
    link.rel = "stylesheet";
    document.getElementsByTagName("html")[0].appendChild(link);
  }
}

function insertVideoHandler(name) {
  if (document.getElementById(name + "JS_mmfytb_thunderarea") == null) {
    let script = document.createElement("script");
    script.src = chrome.runtime.getURL(("../js/" + name + ".js"));
    script.id = name + "JS_mmfytb_thunderarea";
    script.className = "mmfytbthunderarea";
    document.documentElement.appendChild(script);
  }
}

function saveToSessionStorage(videoOptions, allFalse) {
  sessionStorage.setItem('mmfytb_block_video', allFalse ? false : true);
  sessionStorage.setItem('mmfytb_progress_bar', allFalse ? false : videoOptions.progress_bar);
  sessionStorage.setItem('mmfytb_control_buttons', allFalse ? false : videoOptions.control_buttons);
  sessionStorage.setItem('mmfytb_live_144', allFalse ? false : videoOptions.live_144);
  sessionStorage.setItem('mmfytb_hide_logo', allFalse ? false : videoOptions.hide_logo);
  sessionStorage.setItem('mmfytb_show_thumbnail', allFalse ? false : videoOptions.show_thumbnail);
  sessionStorage.setItem('mmfytb_continue_watching_prompt', allFalse ? false : videoOptions.continue_watching_prompt);
  sessionStorage.setItem('mmfytb_video_button', allFalse ? false : videoOptions.video_button);
  sessionStorage.setItem('mmfytb_extension_id', chrome.i18n.getMessage("@@extension_id"));
}

function removeVideoOptions() {
  saveToSessionStorage([], true);
  let elem = document.getElementById("player_background_mmfytb_thunderarea");
  if (elem) elem.parentNode.removeChild(elem);
}

function insertAdSkipper(name) {
  if (document.getElementById(name + "JS_mmfytb_thunderarea") == null) {
    let script = document.createElement("script");
    script.src = chrome.runtime.getURL(("../js/" + name + ".js"));
    script.id = (name + "JS_mmfytb_thunderarea");
    script.className = "mmfytbthunderarea";
    document.documentElement.appendChild(script);
  }
}

function reloadImages() {
  let images = document.getElementsByTagName("img"),
    source,
    imagesParent,
    params = [];
  for (let j = 0; j < images.length; j++) {
    imagesParent = images[j].parentNode.parentNode;
    if (images[j].src.includes("data:image") && imagesParent.id == "thumbnail" && imagesParent.href != undefined) {
      try {
        params = imagesParent.href.split("?")[1].split("&");
        for (let part of params) {
          if (part.includes("v=")) {
            images[j].src = "https://i3.ytimg.com/vi/" + part.replace("v=", "") + "/hqdefault.jpg";
            images[j].style.visibility = "visible";
            break;
          }
        }
      } catch (error) {}
    } else {
      source = images[j].src;
      images[j].src = source;
      images[j].style.visibility = "visible";
    }
  }
}

function removeFeature(optionName, mustReload) {
  let mustReloadImages = false,
    elem;
  switch (optionName) {
    case "video":
      removeVideoOptions();
      document.dispatchEvent(communication_event);
      elem = document.getElementById("video_mmfytb_thunderarea");
      if (elem != null) elem.parentNode.removeChild(elem);
      if (mustReload === 1) {
        let clonedDetail = { enabled: false };
        if (typeof cloneInto != 'undefined') clonedDetail = cloneInto({ enabled: false }, document.defaultView);
        let customEvent = new CustomEvent('vqab', { 
          bubbles: true,
          detail: clonedDetail 
        });
        document.dispatchEvent(customEvent);
      }
      videoButtonState = false;
      break;
    case "thumbnails":
      elem = document.getElementById("video_thumbnails_mmfytb_thunderarea");
      if (elem != null) {
        elem.parentNode.removeChild(elem);
        mustReloadImages = true;
      }
      imageButtonState = false;
      break;
    case "avatars":
      elem = document.getElementById("channel_avatars_mmfytb_thunderarea");
      if (elem != null) {
        elem.parentNode.removeChild(elem);
        mustReloadImages = true;
      }
      break;
    case "other_images":
      elem = document.getElementById("others_mmfytb_thunderarea");
      if (elem != null) {
        elem.parentNode.removeChild(elem);
        mustReloadImages = true;
      }
      break;
    case "adblocker":
      elem = document.getElementById("adSkipperJS_mmfytb_thunderarea");
      if (elem != null) elem.parentNode.removeChild(elem);
      elem = document.getElementById("ads_mmfytb_thunderarea");
      if (elem != null) elem.parentNode.removeChild(elem);
      break;
  }
  if (((mustReload === 1) || (mustReload === 2)) && mustReloadImages) reloadImages();
}

function removeButtons(video, images) {
  let button;
  if (video) {
    button = document.getElementById("video_button_mmfytb_thunderarea");
    if (button) button.parentNode.removeChild(button);
  }
  if (images) {
    button = document.getElementById("topbar_button_mmfytb_thunderarea");
    if (button) button.parentNode.removeChild(button);
  }
}

function empty(node) {
  while (node.hasChildNodes()) {
    node.removeChild(node.firstChild);
  }
}

function isMobileYouTube() {
  return (window.location.href.indexOf("m.youtube.com") !== -1);
}

function isEmbed() {
  return (window.location.href.indexOf("www.youtube.com/embed/") !== -1 || window.location.href.indexOf("www.youtube-nocookie.com/embed/") !== -1);
}

function isYoutubeMusic() {
  return (window.location.hostname.indexOf("music.youtube.com") !== -1);
}

function getSiteName() {
  if (isYoutubeMusic()) return "youtube_music";
  else if (isEmbed()) return "embedded";
  else return "youtube";
}

let OPTIONS_LIST = ["video", "thumbnails", "avatars", "adblocker", "other_images"];
let SITES = {
  "youtube": [0, 1, 2, 3, 4],
  "youtube_music": [0, 1, 2, 3, 4],
  "embedded": [0, 1, 2, 3]
};

function featuresHandler(options, theme, mustReload, videoOptions) {
  for (let name in options) {
    (options[name]) ? addFeature(name, theme, mustReload, videoOptions): removeFeature(name, mustReload);
  }
}

function getOptions(values, qapage, ssvalue, siteName) {
  let options = {};
  if (qapage != undefined) qapage = formatQApage(qapage);

  if (ssvalue != undefined) {
    if (!ssvalue.enabled) {
      options = initializeOptions(siteName, qapage, true);
    } else {
      if (ssvalue.options[siteName] != undefined) {
        if (!ssvalue.options[siteName].enabled) {
          options = initializeOptions(siteName, qapage, true);
        } else {
          if (ssvalue.options[siteName].options != undefined) {
            options = initializeOptions(siteName, qapage, false, ssvalue.options[siteName].options, "");
          } else {
            options = initializeOptions(siteName, qapage, !values[siteName], values, (siteName + "_"));
          }
        }
      }
    }
  } else {
    if (!values.enabled) {
      options = initializeOptions(siteName, qapage, true);
    } else {
      options = initializeOptions(siteName, qapage, !values[siteName], values, (siteName + "_"));
    }
  }
  return options;
}

function initializeOptions(siteName, qapage, allFalse, values = undefined, prefix = undefined) {
  let options = {};
  let optionName = "";
  for (const optionNumber of SITES[siteName]) {
    optionName = OPTIONS_LIST[optionNumber];
    options[optionName] = (qapage != undefined) ? ((qapage[optionName] != undefined) ? qapage[optionName] : getOptionValue(allFalse, values, prefix, optionName)) : getOptionValue(allFalse, values, prefix, optionName);
  }
  return options;
}

function getOptionValue(allFalse, values, prefix, optionName) {
  if (allFalse) return false;
  else return values[prefix + optionName];
}

function formatQApage(qapage) {
  if (qapage.hasOwnProperty("images")) {
    qapage.thumbnails = qapage.avatars = qapage.other_images = qapage.images;
  }
  return qapage;
}

function applyOptions(mustReload) {
  if ((mustReload === 1) || isEmbed()) {
    chrome.runtime.sendMessage({
      funct: 1,
      isEmbed: isEmbed(),
      isYTMusic: isYoutubeMusic()
    }, () => chrome.runtime.lastError);
  }
  chrome.runtime.sendMessage({
    funct: 0
  }, response => {
    chrome.runtime.lastError;
    let tabId = response.id;
    let siteName = getSiteName();
    chrome.storage.local.get(null, values => {
      let options = getOptions(values, values.qapages[tabId], (values.sspages[tabId] != undefined) ? values.sspages[tabId] : values.sstabs[tabId], siteName);
      let videoOptions = {
        progress_bar: values.progress_bar,
        control_buttons: values.control_buttons,
        live_144: values.live_144,
        hide_logo: values.hide_logo,
        show_thumbnail: values.show_thumbnail,
        continue_watching_prompt: values.continue_watching_prompt,
        video_button: values.quick_access_buttons_video
      };
      featuresHandler(options, values.theme, mustReload, videoOptions);
      if (!isMobileYouTube() && (siteName == "youtube" || siteName == "embedded")) {
        (values.quick_access_buttons_images) ? addImagesButton(): removeButtons(false, true);
        (values.quick_access_buttons_video) ? addVideoButton(): removeButtons(true, false);
      }
    });
  });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  applyOptions(request.data);
});

applyOptions(0);