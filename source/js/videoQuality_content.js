/*
* It just runs at the end of the document and injects the videoQuality script, which is used in both desktop and mobile YouTube.
*/

function injectScript(name) {
    if (document.getElementById(name + "JS_mmfytb_thunderarea") == null) {
        let script = document.createElement("script");
        script.src = chrome.runtime.getURL("../js/" + name + ".js");
        script.id = name + "JS_mmfytb_thunderarea";
        script.className = "mmfytbthunderarea";
        document.documentElement.appendChild(script);
    }
}

injectScript("videoQuality");