let youtubeURLpattern = /(www.youtube.com|music.youtube.com|m.youtube.com|www.youtube-nocookie.com)/;

document.addEventListener("vqab", e => {
    e.detail.enabled ? enableAudio() : enableVideo();
});

function enableAudio() {
    if (!isYoutubeMusic()) return;
    let videoElements = findVideoElements();
    for (const video of videoElements) {
        if ((video.src !== "") && youtubeURLpattern.test(video.src)) {
            let paused = video.paused;
            video.pause();
            let currentTime = 0;
            currentTime = video.currentTime;
            if (video.dataset.originalurl && (video.dataset.originalurl === video.src) && video.dataset.musicurl) {
                if (video.dataset.musicurl !== "1") {
                    changeVideoURL(video, video.dataset.musicurl, paused, currentTime);
                }
            } else {
                video.load();
                loadVideoOnError(video, currentTime, paused);
            }
        }
    }
}

function enableVideo() {
    let videoElements = findVideoElements();
    for (const video of videoElements) {
        if ((video.src !== "") && !youtubeURLpattern.test(video.src)) {
            if (video.dataset.musicurl && (video.dataset.musicurl === video.src) && video.dataset.originalurl) {
                let paused = video.paused;
                video.pause();
                let currentTime = 0;
                currentTime = video.currentTime;
                changeVideoURL(video, video.dataset.originalurl, paused, currentTime);
            }
        }
    }
}

function changeVideoURL(videoEl, newURL, paused, currentTime) {
    videoEl.src = newURL;
    videoEl.load();
    loadVideoOnError(videoEl, currentTime, paused);
    videoEl.currentTime = currentTime;

    if (!paused) {
        try {
            videoEl.parentNode.parentNode.playVideo();
        } catch (error) { }
    } else if (paused && isMobileYouTube()) {
        let videoElement = videoEl;
        let promise = videoEl.play();
        if (promise !== undefined) {
            promise.then(_ => {
                setTimeout(() => {
                    videoElement.pause();
                }, 1000);
            }).catch(error => { });
        }
    }
}

function loadVideoOnError(video, currentTime, paused) {
    setTimeout(() => {
        if (document.querySelector(".ytp-error")) {
            let errorRect = document.querySelector(".ytp-error").getBoundingClientRect();
            if (errorRect.width > 0 && errorRect.height > 0) {
                try {
                    video.parentNode.parentNode.loadVideoById(video.parentNode.parentNode.getVideoData().video_id);
                    video.currentTime = currentTime;
                    if (paused) video.pause();
                } catch (error) { }
            }
        }
    }, 1000);
}

function findVideoElements() {
    let videoElementsArray = [];
    let videoElements = document.getElementsByTagName("video");
    let videoRect;
    for (const video of videoElements) {
        videoRect = video.getBoundingClientRect();
        if (isYoutubeMusic() || (videoRect.width > 0 && videoRect.height > 0)) {
            if (video) {
                videoElementsArray.push(video);
            }
        }
    }
    return videoElementsArray;
}

function isYoutubeMusic() {
    return (window.location.hostname.indexOf("music.youtube.com") !== -1);
}

function isMobileYouTube() {
    return (window.location.href.indexOf("m.youtube.com") !== -1);
}