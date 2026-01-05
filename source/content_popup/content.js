(async () => {
  const { support_url, review_url } = await import(chrome.runtime.getURL("config.js"));

  function createPanel() {
    if (document.querySelector("#mmfytb_review_popup")) return;

    const host = document.createElement("div");
    host.id = "mmfytb_popup_container";

    document.documentElement.appendChild(host);

    const shadow = host.attachShadow({ mode: "open" });

    let htmlCode = `
    <div id="mmfytb_popup_container">
      <div id="mmfytb_review_popup">
        <button id="close_button">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="m12 13.4l-4.9 4.9q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7l4.9-4.9l-4.9-4.9q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.9 4.9l4.9-4.9q.275-.275.7-.275t.7.275t.275.7t-.275.7L13.4 12l4.9 4.9q.275.275.275.7t-.275.7t-.7.275t-.7-.275z"
            />
          </svg>
        </button>
        <div id="header">
          <img id="logo" src="${chrome.runtime.getURL("img/logo/full_logo.svg")}" alt="Music Mode Logo" />
        </div>
        <main>
          <div id="text">Do you like Music Mode for YouTube™?</div>
          <div id="actions_bar">
            <button class="action_button negative_action">No</button>
            <button class="action_button positive_action">Yes</button>
          </div>
        </main>

        <link type="text/css" rel="stylesheet" href="${chrome.runtime.getURL("content_popup/style.css")}" />
      </div>
    </div>
  `;
    shadow.innerHTML = htmlCode;
    shadow.querySelector("#close_button").addEventListener("click", () => {
      shadow.querySelector("#mmfytb_review_popup").remove();
      setReviewPopupThreshold(blocked_videos_counter + 2000);
    });

    const yesButton = shadow.querySelector(".positive_action");
    const noButton = shadow.querySelector(".negative_action");
    const textElement = shadow.querySelector("#text");
    const actionsBar = shadow.querySelector("#actions_bar");

    yesButton.addEventListener("click", () => {
      textElement.textContent = "A quick review really helps us out!";
      actionsBar.innerHTML = `
      <button class="action_button negative_action close_later">Maybe later</button>
      <a href="${review_url}" target="_blank"><button class="action_button positive_action rate_button">Rate Extension</button></a>
    `;

      shadow.querySelector(".negative_action").addEventListener("click", () => {
        shadow.querySelector("#mmfytb_review_popup").remove();
        setReviewPopupThreshold(blocked_videos_counter + 1000);
      });

      shadow.querySelector(".positive_action").addEventListener("click", () => {
        shadow.querySelector("#mmfytb_review_popup").remove();
        setReviewPopupThreshold(-1);
      });
    });

    noButton.addEventListener("click", () => {
      textElement.textContent = "Please let us know what you would like to improve";
      actionsBar.innerHTML = `
        <button class="action_button negative_action close_dismiss">Maybe later</button>
        <a href="${support_url}" target="_blank"><button class="action_button positive_action">Report issue</button></a>
        `;

      shadow.querySelector(".negative_action").addEventListener("click", () => {
        shadow.querySelector("#mmfytb_review_popup").remove();
        setReviewPopupThreshold(blocked_videos_counter + 7000);
      });

      shadow.querySelector(".positive_action").addEventListener("click", () => {
        shadow.querySelector("#mmfytb_review_popup").remove();
        setReviewPopupThreshold(blocked_videos_counter + 6000);
      });
    });
  }

  const { blocked_videos_counter, review_popup_threshold } = await chrome.storage.local.get(["blocked_videos_counter", "review_popup_threshold"]);
  if (review_popup_threshold > 0 && blocked_videos_counter >= review_popup_threshold) {
    chrome.runtime.sendMessage({
      funct: 4,
    }, (response) => {
      if (response.showPopup) {
        if (document.visibilityState === "visible") createPanel();
        else {
          document.addEventListener("visibilitychange", function onVisibilityChange() {
            if (document.visibilityState === "visible") {
              createPanel();
              document.removeEventListener("visibilitychange", onVisibilityChange);
            }
          });
        }
      }
    });
  }
})();


function setReviewPopupThreshold(threshold) {
  if (threshold > 15000) threshold = -1; // disable if too high
  chrome.storage.local.set({ review_popup_threshold: threshold });
}
