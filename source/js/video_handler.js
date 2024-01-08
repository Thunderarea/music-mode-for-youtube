const communication_event = new Event("video_block_count");

let continueWatchingPromptInterval = 5 * 60 * 1000, // ms
  intervalId,
  videoWithListener,
  blockVideo = getValue("mmfytb_block_video");

document.addEventListener("injection_script_communication", () => {
  initialization();
});

function initialization() {
  blockVideo = getValue("mmfytb_block_video");
  let videoPlayer = getPlayer();
  applyVideoPlayerOptions(videoPlayer);

  if (getValue("mmfytb_continue_watching_prompt")) {
    if (!intervalId)
      intervalId = setInterval(
        youtubeActivation,
        continueWatchingPromptInterval,
        videoPlayer
      );
  } else if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
initialization();

function applyVideoPlayerOptions(videoPlayer) {
  let stylesheet = document.getElementById("video_options_mmfytb_thunderarea");
  let stylesheetContent = ``;

  setPlayerBackground(videoPlayer);

  if (getSiteName() === "youtube") {
    if (getValue("mmfytb_progress_bar")) {
      stylesheetContent += `
      .ytp-chrome-bottom {
        opacity: 1 !important;
      }
      .html5-video-player.playing-mode:not(:hover) .ytp-chrome-top .ytp-cards-button {
        opacity: 0 !important;
      }
    `;
      if (!getValue("mmfytb_control_buttons")) {
        stylesheetContent += `
        .html5-video-player.playing-mode:not(:hover) .ytp-chrome-bottom .ytp-chrome-controls {
          display: none !important;
        }
        .html5-video-player.playing-mode:not(:hover) .ytp-chrome-bottom .ytp-progress-bar-container {
          bottom: -1px !important;
        }
        .html5-video-player.playing-mode:not(:hover) .caption-window {
          margin-bottom: 10px !important;
        }
        .html5-video-player.playing-mode:not(:hover) .ytp-player-content {
          bottom: 13px !important;
        }
      `;
      }
    } else {
      if (videoWithListener) {
        videoWithListener.removeEventListener("timeupdate", timeUpdate);
      }
    }
  }

  if (stylesheet == undefined) {
    stylesheet = document.createElement("style");
    stylesheet.id = "video_options_mmfytb_thunderarea";
    stylesheet.className = "mmfytbthunderarea";
    stylesheet.type = "text/css";
    document.getElementsByTagName("html")[0].appendChild(stylesheet);
  }
  stylesheet.textContent = stylesheetContent;
}

async function setPlayerBackground(videoPlayer) {
  let stylesheet = document.getElementById(
    "player_background_mmfytb_thunderarea"
  );
  let stylesheetContent = ``;

  if (blockVideo) {
    if (getValue("mmfytb_show_thumbnail")) {
      let imgurl = await getThumbnailImage(videoPlayer);
      stylesheetContent += `
      .html5-video-player,
      ytmusic-player {
        background-image: url('${imgurl}') !important;
        background-repeat: no-repeat !important;
        background-position: center !important;
        background-size: contain !important;
      }
    `;
    } else if (getValue("mmfytb_hide_logo")) {
      stylesheetContent += `
      #player .html5-video-player {
        background-image: none !important;
      }
    `;
    }
  }

  if (stylesheet == undefined) {
    stylesheet = document.createElement("style");
    stylesheet.id = "player_background_mmfytb_thunderarea";
    stylesheet.className = "mmfytbthunderarea";
    stylesheet.type = "text/css";
    document.getElementsByTagName("html")[0].appendChild(stylesheet);
  }
  stylesheet.textContent = stylesheetContent;
}

async function getThumbnailImage(videoPlayer) {
  let thumbnailUrl = "";
  if (videoPlayer) {
    try {
      thumbnailUrl =
        videoPlayer
          .getPlayerResponse()
          .videoDetails.thumbnail.thumbnails.slice(-1)[0].url +
        "?noblockingmmfytb=true";
      return thumbnailUrl;
    } catch (error) { }
  }
  let url_string = new URL(window.location.href);
  let videoId = isEmbed()
    ? window.location.pathname.replace("/embed/", "")
    : url_string.searchParams.get("v");
  if (videoId) {
    if (getSiteName() === "youtube_music") {
      thumbnailUrl = `https://i1.ytimg.com/vi/${videoId}/maxresdefault.jpg?noblockingmmfytb=true`;
    }
    else thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg?noblockingmmfytb=true`;
    return fetch(thumbnailUrl, {
      method: "HEAD",
    }).then((response) => response)
      .then((data) => {
        return thumbnailUrl;
      })
      .catch((error) => {
        thumbnailUrl = thumbnailUrl.replace("maxresdefault", "hqdefault");
        return thumbnailUrl;
      });
  }
}

// Continue watching prompt
function youtubeActivation(videoPlayer) {
  if (getValue("mmfytb_continue_watching_prompt")) {
    let player = videoPlayer ? videoPlayer : getPlayer();
    if (player) {
      try {
        player.updateLastActiveTime(); // setUserEngagement()
      } catch (error) { }
    }
  } else {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function getPlayer() {
  let player;
  let video = findVideoEl();
  if (video && video.parentNode && video.parentNode.parentNode)
    player = video.parentNode.parentNode;
  return player;
}

try {
  if (typeof HXRopen === "undefined") {
    var HXRopen = XMLHttpRequest.prototype.open;
  }
} catch (e) { }

XMLHttpRequest.prototype.open = function (method, url) {
  if (blockVideo && url.indexOf("mime=audio") !== -1) {
    musicModeForYouTube(url, url.indexOf("live=1"), true);
  }
  return HXRopen.apply(this, arguments);
};

let previousPageURL = "";
let videoElementsArray = [];

try {
  const { fetch: origFetch } = window;
  window.fetch = async (...args) => {
    if (blockVideo) {
      let url = args[0].url;
      if (url) {
        if (url.indexOf("mime=audio") !== -1) {
          musicModeForYouTube(url, url.indexOf("live=1"), true);
        } else if (
          url.indexOf("mime=video") !== -1 &&
          url.indexOf("live=1") === -1
        ) {
          return 0;
        }
      }
    }
    return await origFetch(...args);
  };
} catch (error) { }

function musicModeForYouTube(url, isLive, firstCall) {
  let video = findVideoEl();
  if (video) {
    setPlaybackRateAgain(video);
    if (getValue("mmfytb_progress_bar")) {
      video.addEventListener("timeupdate", timeUpdate);
      videoWithListener = video;
    } else video.removeEventListener("timeupdate", timeUpdate);
    if (isLive != -1) {
      if (isNotMusicUrl(video.src)) {
        video.dataset.originalurl = video.src;
        video.dataset.musicurl = 1;
        setResolutionTo144p(video);
      }
    } else {
      if (isNotMusicUrl(video.src)) {
        if (!firstCall) {
          try {
            const params = new URLSearchParams(url);
            if (
              video.parentNode.parentNode.getVideoData().cpn ==
              params.get("cpn")
            ) {
              setNewURL(video, url);
            }
          } catch (error) { }
        } else setNewURL(video, url);
      } else {
        if (firstCall) {
          setTimeout(() => {
            musicModeForYouTube(url, isLive, false);
          }, 5000);
        }
      }
    }
  }
}

function setResolutionTo144p(video) {
  if (getValue("mmfytb_live_144")) {
    try {
      let ytb_player = video.parentNode.parentNode;
      let qualityLevels = ytb_player.getAvailableQualityLevels();
      let lastLevel = qualityLevels[qualityLevels.length - 2];
      if (lastLevel) {
        ytb_player.setPlaybackQualityRange(lastLevel, lastLevel);
      }
    } catch (error) { }
  }
}

let previousVideoId = "";

function setNewURL(video, url) {
  let urlParts = url.split("?");
  if (urlParts.length >= 2) {
    let parametersToBeRemoved = ["rn", "rbuf", "range", "ump"];
    let parameters = urlParts[1].split(/[&;]/g);
    parametersToBeRemoved.forEach((k) => {
      parameters = parameters.filter(
        (p) => !p.startsWith(encodeURIComponent(k) + "=")
      );
    });
    url = urlParts[0] + "?" + parameters.join("&");
    if (video.src !== url && blockVideo) {
      if (video.parentNode && video.parentNode.parentNode) {
        let videoPlayer = video.parentNode.parentNode;
        setPlayerBackground(videoPlayer);
        let newVideoId = videoPlayer.getPlayerResponse().videoDetails.videoId;
        if (newVideoId != previousVideoId) {
          previousVideoId = newVideoId;
          document.dispatchEvent(communication_event);
        }
      }
      video.dataset.musicurl = url;
      video.dataset.originalurl = video.src;
      let paused = video.paused;
      if (!paused) video.pause();
      let curTime = 0;
      curTime = video.currentTime;
      video.src = url;

      let observerOptions = {
        attributes: true,
        attributeFilter: ["src"],
        attributeOldValue: true,
      };
      let videoSrcObserver = new MutationObserver(findChangesInSource);
      videoSrcObserver.observe(video, observerOptions);
      video.addEventListener("stalled", listenerReceiver);
      video.src = url;
      video.load();
      video.currentTime = curTime;
      video.parentNode.parentNode.playVideo();
    }
  }
}

function listenerReceiver(e) {
  reloadVideo(e.target.currentTime, true);
}

function findChangesInSource(mutations) {
  for (let mutation of mutations) {
    if (mutation.target.nodeName === "VIDEO") {
      if (!mutation.target.hasAttribute("src") || mutation.target.src === "") {
        reloadVideo(mutation.target.currentTime, true);
      }
    }
  }
}

function reloadVideo(currentTime, reSearchVideo) {
  let newVideoEl = findVideoEl();
  if (!newVideoEl) {
    if (reSearchVideo) {
      setTimeout(() => {
        reloadVideo(currentTime, false);
      }, 5000);
    }
  } else {
    if (newVideoEl.offsetTop < 0 && !isVideoPreview(newVideoEl)) {
      // It prevents this code from running in embedded videos in last.fm. It caused the video to re-open after closing it
      let originParam = (new URLSearchParams(window.location.search)).get("origin");
      if (!(isEmbed() && originParam && originParam.includes("www.last.fm"))) {
        setTimeout(() => {
          let newVideoEl = findVideoEl();
          if (newVideoEl && (!newVideoEl.hasAttribute("src") || newVideoEl.src === "")) {
            newVideoEl.parentNode.parentNode.playVideo();
          }
        }, 1000);
      }
    }
  }
}

function isVideoPreview(video) {
  try {
    return video.parentNode.parentNode.id == "inline-preview-player";
  } catch (error) {
    return false;
  }
}

function setPlaybackRateAgain(video) {
  try {
    let player = video.parentNode.parentNode;
    let rate = player.getPlaybackRate();
    player.setPlaybackRate(1);
    player.setPlaybackRate(rate);
  } catch (err) { }
}

function timeUpdate(event) {
  try {
    event.composedPath()[2].wakeUpControls();
  } catch (err) { }
}

function findVideoEl() {
  let video;
  let videoElements = document.querySelectorAll("video");
  if (videoElements && videoElements.length) {
    let videoRect = 0;
    for (var i = 0; i < videoElements.length; i++) {
      if (videoElements[i] !== undefined) {
        videoRect = videoElements[i].getBoundingClientRect();
        if (getSiteName() !== "youtube_music") {
          if (videoRect.width > 0 && videoRect.height > 0) {
            video = videoElements[i];
            break;
          }
        } else {
          video = videoElements[i];
          break;
        }
      }
    }
  }
  return video;
}

function getSiteName() {
  if (window.location.hostname.indexOf("music.youtube.com") !== -1)
    return "youtube_music";
  else if (window.location.href.indexOf("www.youtube.com") !== -1)
    return "youtube";
  else if (window.location.href.indexOf("m.youtube.com") !== -1)
    return "mobile_youtube";
  else return "false";
}

function isEmbed() {
  return (window.location.href.indexOf("www.youtube.com/embed/") !== -1 || window.location.href.indexOf("www.youtube-nocookie.com/embed/") !== -1);
}

function getValue(option) {
  return sessionStorage.getItem(option) === "true";
}

function isNotMusicUrl(url) {
  return (url.indexOf("www.youtube.com") !== -1 || url.indexOf("music.youtube.com") !== -1 || url.indexOf("m.youtube.com") !== -1 || url.indexOf("www.youtube-nocookie.com") !== -1);
}