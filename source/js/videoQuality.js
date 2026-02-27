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

document.addEventListener("injection_script_communication", () => {
  manageVideoQuality();
});

manageVideoQuality();

function manageVideoQuality(retry = true) {
  const videoPlayer = getPlayer();

  if (!videoPlayer) {
    if (retry) {
      setTimeout(() => manageVideoQuality(false), 5000);
    }
    return;
  }

  const blockVideo = getBooleanValue("mmfytb_block_video");
  const lowVideoQuality = getBooleanValue("mmfytb_low_video_quality");

  if (lowVideoQuality && blockVideo) setLowestQuality(videoPlayer);
  else resetVideoQuality(videoPlayer);
}

function setLowestQuality(ytb_player) {
  const lastQuality = ytb_player.getPlaybackQuality();

  // if it is tiny, it means that probably was set by the extension
  if (lastQuality != "tiny") {
    sessionStorage.setItem("mmfytb_last_quality", lastQuality);
  }

  const playerQualityMetadata = localStorage.getItem("yt-player-quality");
  console.log(JSON.stringify(playerQualityMetadata));

  try {
    ytb_player.setPlaybackQualityRange("tiny", "tiny");
    // Don't override the YouTube player quality metadata with the lowest quality
    if (playerQualityMetadata) {
      localStorage.setItem("yt-player-quality", playerQualityMetadata);
    }
  } catch (error) {
    console.error("Error setting video quality:", error);
  }
}

function resetVideoQuality(ytb_player) {
  console.log("reset");

  const currentQuality = ytb_player.getPlaybackQuality();
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