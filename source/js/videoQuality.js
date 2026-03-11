/*
* Runs only on YouTube where the video is not blocked but hidden

0
: 
{formatId: undefined, qualityLabel: '2160p60', quality: 'hd2160', isPlayable: true}
1
: 
{formatId: undefined, qualityLabel: '1440p60', quality: 'hd1440', isPlayable: true}
2
: 
{formatId: undefined, qualityLabel: '1080p60', quality: 'hd1080', isPlayable: true}
3
: 
{formatId: undefined, qualityLabel: '720p60', quality: 'hd720', isPlayable: true}
4
: 
{formatId: undefined, qualityLabel: '480p', quality: 'large', isPlayable: true}
5
: 
{formatId: undefined, qualityLabel: '360p', quality: 'medium', isPlayable: true}
6
: 
{formatId: undefined, qualityLabel: '240p', quality: 'small', isPlayable: true}
7
: 
{formatId: undefined, qualityLabel: '144p', quality: 'tiny', isPlayable: true}


144
240
360
480
720
1080
1440
2160
4320

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

function applyVideoQuality(videoPlayer) {
  const blockVideo = getBooleanValue("mmfytb_block_video");
  const lowVideoQuality = getBooleanValue("mmfytb_low_video_quality");

  if (lowVideoQuality && blockVideo) {
    setLowestQuality(videoPlayer);
  } else {
    resetVideoQuality(videoPlayer);
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

async function setLowestQuality(ytb_player) {
  if (!sessionStorage.getItem("mmfytb_last_quality")) {
    let quality = await getCurrentVideoQuality(ytb_player);
    console.log(quality);

    if (quality !== "tiny") {
      sessionStorage.setItem("mmfytb_last_quality", quality);
    }
  }

  const video = ytb_player.querySelector("video");
  video.addEventListener("timeupdate", () => {
    console.log("update");
  });

  const playerQualityMetadata = localStorage.getItem("yt-player-quality");
  try {
    ytb_player.setPlaybackQualityRange("tiny", "tiny");
    // Check that the quality has been set
    // Don't override the YouTube player quality metadata with the lowest quality
    if (playerQualityMetadata) {
      localStorage.setItem("yt-player-quality", playerQualityMetadata);
    }
  } catch (error) {
    console.error("Error setting video quality:", error);
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
    // Don't override the YouTube player quality metadata with the lowest quality
    if (playerQualityMetadata) {
      localStorage.setItem("yt-player-quality", playerQualityMetadata);
    }
  } catch (error) {
    console.error("Error resetting video quality:", error);
  }
}

function getCurrentVideoQuality(ytb_player) {
  return new Promise((resolve) => {
    let lastQuality = ytb_player.getPlaybackQuality();
    console.log(lastQuality);

    if (lastQuality === "unknown") {
      const video = ytb_player.querySelector("video");
      if (!video) {
        resolve(null);
        return;
      }

      const handler = () => {
        lastQuality = ytb_player.getPlaybackQuality();

        video.removeEventListener("loadedmetadata", handler);
        resolve(lastQuality);
      };

      video.addEventListener("loadedmetadata", handler);
    } else {
      resolve(lastQuality);
    }
  });
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
