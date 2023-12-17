function addMMFYTButtonMobile() {
  let iterations = 0;
  let limit = 60;
  let timerId = setInterval(findTopbar, 500);

  function findTopbar() {
    iterations++;
    if (iterations > limit) clearInterval(timerId);
    let existElement = document.querySelector("#mmfytb_mobile_button");
    if (existElement == null || existElement == undefined) {
      let topbar = document.querySelector(".mobile-topbar-header div.mobile-topbar-header-content");
      if (topbar && topbar.firstElementChild) {
        new MutationObserver(detectRemovalOfMMFYTButton).observe(topbar, {
          subtree: true,
          childList: true
        });

        let mmfytbButton = document.createElement("div");
        mmfytbButton.id = "mmfytb_mobile_button";
        mmfytbButton.className = "icon-button topbar-menu-button-avatar-button";
        mmfytbButton.addEventListener("touchstart", e => {
          if (e.target.id && e.target.id === "mmfytb_mobile_button") {
            chrome.runtime.sendMessage({
              funct: 3
            }, () => chrome.runtime.lastError);
          }
        });
        topbar.insertBefore(mmfytbButton, topbar.lastElementChild);
        clearInterval(timerId);
      }
    }
  }
};

chrome.runtime.onMessage.addListener((request) => {
  if (request.data === 2) addMMFYTButtonMobile();
});

function detectRemovalOfMMFYTButton(mutations) {
  for (let mutation of mutations) {
    mutation.removedNodes.forEach(removedNode => {
      if (removedNode.id == "mmfytb_mobile_button") addMMFYTButtonMobile();
    });
  }
}

// https://stackoverflow.com/questions/47660653/chrome-extension-how-to-disable-page-visibility-api
for (event_name of ["visibilitychange", "webkitvisibilitychange", "blur"]) {
  window.addEventListener(event_name, function(event) {
      event.stopImmediatePropagation();
  }, true);
}

addMMFYTButtonMobile();