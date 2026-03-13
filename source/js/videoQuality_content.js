/*
Copyright © 2026 Nikolaos Pantelidis
All rights reserved.

This file is part of Music Mode for YouTube.
Unauthorized copying, modification, or redistribution of this file is prohibited.

See the LICENSE file in the project root for full license terms.
*/

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