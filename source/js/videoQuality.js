/*
Copyright © 2026 Nikolaos Pantelidis
All rights reserved.

This file is part of Music Mode for YouTube.
Unauthorized copying, modification, or redistribution of this file is prohibited.

See the LICENSE file in the project root for full license terms.
*/

/*
* Runs only on YouTube where the video is not blocked but hidden
*/

// Make sure that the lowest quality has been set (don't check time update because it can run for the previous video)

let playerObserver = null;
let playerObserverMutationCount = 0;
const MAX_PLAYER_OBSERVER_MUTATIONS = 10;

document.addEventListener("injection_script_communication", () => {
  init();
});

init();

function init() {
  const videoPlayer = getPlayer();

  if (!videoPlayer) {
    waitForPlayer();
    return;
  }
  stopWaitingForPlayer();

  applyVideoQuality(videoPlayer);
}

async function applyVideoQuality(videoPlayer) {
  console.log("APPLY");

  const blockVideo = getBooleanValue("mmfytb_block_video");
  const lowVideoQuality = getBooleanValue("mmfytb_low_video_quality");

  if (lowVideoQuality && blockVideo) {
    await setLowestQuality(videoPlayer);
  } else {
    await resetVideoQuality(videoPlayer);
  }
}

function waitForPlayer() {
  if (playerObserver) return;

  playerObserverMutationCount = 0;

  playerObserver = new MutationObserver(() => {
    playerObserverMutationCount++;

    const videoPlayer = getPlayer();

    if (videoPlayer) {
      stopWaitingForPlayer();
      applyVideoQuality(videoPlayer);
      return;
    }

    if (playerObserverMutationCount >= MAX_PLAYER_OBSERVER_MUTATIONS) {
      stopWaitingForPlayer();
    }
  });

  playerObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

function stopWaitingForPlayer() {
  if (!playerObserver) return;
  playerObserver.disconnect();
  playerObserver = null;
  playerObserverMutationCount = 0;
}

async function setLowestQuality(ytb_player, retry = true) {
  if (!sessionStorage.getItem("mmfytb_last_quality")) {
    let quality = await getCurrentVideoQuality(ytb_player);
    console.log(quality);

    if (quality !== "tiny") {
      sessionStorage.setItem("mmfytb_last_quality", quality);
    }
  } else console.log("last quality already set: ", sessionStorage.getItem("mmfytb_last_quality"));

  const playerQualityMetadata = localStorage.getItem("yt-player-quality");
  try {
    ytb_player.setPlaybackQualityRange("tiny", "tiny");
    // Check that the quality has been set
    const video = ytb_player.querySelector("video");
    const handler = async () => {
      const currentQuality = ytb_player.getPlaybackQuality();
      console.log("current quality: ", currentQuality);
      if (currentQuality !== "tiny" && retry) await setLowestQuality(ytb_player, false);
    };
    const videoLoaded = await waitForVideoListener(video, "loadedmetadata");
    if (videoLoaded) await handler();
  } catch (error) {
    console.log("Error setting video quality:", error);
  } finally {
    // Don't override the YouTube player quality metadata with the lowest quality
    if (playerQualityMetadata) {
      localStorage.setItem("yt-player-quality", playerQualityMetadata);
    }
  }
}

async function resetVideoQuality(ytb_player) {
  const currentQuality = await getCurrentVideoQuality(ytb_player);
  console.log("current quality: ", currentQuality);

  if (currentQuality != "tiny") return;

  const lastQuality = sessionStorage.getItem("mmfytb_last_quality");
  sessionStorage.removeItem("mmfytb_last_quality");
  console.log("last quality: ", lastQuality);

  if (!lastQuality) return;

  const playerQualityMetadata = localStorage.getItem("yt-player-quality");

  try {
    if (lastQuality != "unknown") ytb_player.setPlaybackQualityRange(lastQuality, lastQuality);
  } catch (error) {
    console.error("Error resetting video quality:", error);
  } finally {
    // Don't override the YouTube player quality metadata with the lowest quality
    if (playerQualityMetadata) {
      localStorage.setItem("yt-player-quality", playerQualityMetadata);
    }
  }
}

async function getCurrentVideoQuality(ytb_player) {
  let lastQuality = ytb_player.getPlaybackQuality();
  console.log(lastQuality);

  if (lastQuality === "unknown") {
    const video = ytb_player.querySelector("video");
    const videoLoaded = await waitForVideoListener(video, "loadedmetadata");

    if (videoLoaded) {
      lastQuality = ytb_player.getPlaybackQuality();
      return lastQuality;
    }

    return "tiny";
  }

  return lastQuality;
}

function getBooleanValue(option) {
  return sessionStorage.getItem(option) === "true";
}

function getPlayer() {
  let video = findVideoEl();
  const player = video?.parentNode?.parentNode;
  if (player) return player;
  return null;
}

function findVideoEl() {
  let video;
  let videoElements = document.querySelectorAll("video");
  if (videoElements?.length) {
    let videoRect = 0;
    for (const videoElement of videoElements) {
      if (videoElement !== undefined) {
        videoRect = videoElement.getBoundingClientRect();
        if (videoRect.width > 0 && videoRect.height > 0) {
          video = videoElement;
          break;
        }
      }
    }
  }
  return video;
}

function waitForVideoListener(video, eventName, timeout = 60000) {
  return new Promise((resolve) => {
    const handler = () => {
      clearTimeout(timer);
      resolve(true);
    };

    const timer = setTimeout(() => {
      video.removeEventListener(eventName, handler);
      resolve(false);
    }, timeout);

    video.addEventListener(eventName, handler, { once: true });
  });
}
