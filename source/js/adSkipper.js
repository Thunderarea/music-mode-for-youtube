try {
    var adSkipperIntervalID = setInterval(findVideo, 100);
    var adSkipperIterations = 0;
} catch (error) {
    adSkipperIntervalID = setInterval(findVideo, 100);
    adSkipperIterations = 0;
}

if (typeof videoPlayerObserver === 'undefined') {
    var videoPlayerObserver = new MutationObserver(findAndSkipAds);
    var options = {
        attributes: true,
        attributeFilter: ['class'],
        attributeOldValue: true
    };
}

function findAndSkipAds(mutations) {
    for (let mutation of mutations) {
        if (mutation.target.classList.contains("ad-showing") && mutation.target.classList.contains("playing-mode")) {
            mutation.target.playVideo();
            if (mutation.target.querySelector("video").currentTime < mutation.target.querySelector("video").duration) {
                mutation.target.querySelector("video").currentTime = mutation.target.querySelector("video").duration;
                mutation.target.playVideo();
            }
        }
        if (mutation.target.classList.contains("ended-mode")) {
            if (document.querySelector(".ytp-ad-skip-button") != null) {
                document.querySelector(".ytp-ad-skip-button").click();
            }
        }
    }
}

function findVideo() {
    adSkipperIterations++;
    let videoElements = document.getElementsByTagName('video');
    if (videoElements && videoElements.length) {
        let video = null,
            videoRect = 0;
        for (let i = 0; i < videoElements.length; i++) {
            videoRect = videoElements[i].getBoundingClientRect();
            if (videoElements[i].src.indexOf("music.youtube.com") == -1) {
                if (videoRect.width > 0 && videoRect.height > 0) {
                    video = videoElements[i];
                    break;
                }
            } else {
                video = videoElements[i];
                break;
            }
        }
        if (!video) video = videoElements[0];
        if (skipAdsEnabled) {
            videoPlayerObserver.observe(video.parentNode.parentNode, options);
            clearInterval(adSkipperIntervalID);
        }
    }
    if (adSkipperIterations >= 500) clearInterval(adSkipperIntervalID);
}

function skipAdsEnabled() {
    if (document.getElementById("ads_mmfytb_thunderarea")) return true;
    else return false;
}

// https://stackoverflow.com/questions/63155634/json-parse-overwrite-to-handle-passing-in-objects
(function () {
    const nativeParse = JSON.parse;
    JSON.parse = function (input) {
        let response = nativeParse(...arguments);
        if (response.playerAds) {
            delete response.playerAds;
            delete response.adPlacements;
            return response;
        } else {
            return typeof input === 'object' ?
                input :
                nativeParse(...arguments);
        }
    }
})();