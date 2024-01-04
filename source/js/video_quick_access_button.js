var timerIDPlayerButton;
let youtubeURLpattern = /(www.youtube.com|music.youtube.com|m.youtube.com|www.youtube-nocookie.com)/;

document.addEventListener("vqab", e => {
    e.detail.enabled ? enableAudio() : enableVideo();
});

function enableAudio() {
    let videoElements = findVideoElements();
    let video;
    for (let i = 0; i < videoElements.length; i++) {
        video = videoElements[i];
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
    for (let i = 0; i < videoElements.length; i++) {
        if ((videoElements[i].src !== "") && !youtubeURLpattern.test(videoElements[i].src)) {
            if (videoElements[i].dataset.musicurl && (videoElements[i].dataset.musicurl === videoElements[i].src) && videoElements[i].dataset.originalurl) {
                let paused = videoElements[i].paused;
                videoElements[i].pause();
                let currentTime = 0;
                currentTime = videoElements[i].currentTime;
                changeVideoURL(videoElements[i], videoElements[i].dataset.originalurl, paused, currentTime);
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
        } catch (error) {}
    } else if (paused && isMobileYouTube()) {
        videoElement = videoEl;
        let promise = videoEl.play();
        if (promise !== undefined) {
            promise.then(_ => {
                setTimeout(() => {
                    videoElement.pause();
                }, 1000);
            }).catch(error => {});
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
                } catch (error) {}
            }
        }
    }, 1000);
}

function findVideoElements() {
    let videoElementsArray = [];
    let videoElements = document.getElementsByTagName("video");
    for (let i = 0; i < videoElements.length; i++) {
        videoRect = videoElements[i].getBoundingClientRect();
        if (isYoutubeMusic()) {
            if (videoElements[i]) {
                videoElementsArray.push(videoElements[i]);
            }
        } else {
            if (videoRect.width > 0 && videoRect.height > 0) {
                if (videoElements[i]) {
                    videoElementsArray.push(videoElements[i]);
                }
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