(async () => {
  const { support_url, review_url } = await import(chrome.runtime.getURL("config.js"));

  function createPanel() {
    const host = document.createElement("div");
    host.id = "mmfytb_popup_container";

    // append somewhere safe (NOT ytd-popup-container if you plan to shadow it)
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
        <script src="${chrome.runtime.getURL("content_popup/index.js")}"></script>
      </div>
    </div>
  `;
    shadow.innerHTML = htmlCode;
    shadow.querySelector("#close_button").addEventListener("click", () => {
      shadow.querySelector("#mmfytb_review_popup").remove();
    });

    // Handle Yes/No button clicks
    const yesButton = shadow.querySelector(".positive_action");
    const noButton = shadow.querySelector(".negative_action");
    const textElement = shadow.querySelector("#text");
    const actionsBar = shadow.querySelector("#actions_bar");

    yesButton.addEventListener("click", () => {
      textElement.textContent = "Thank you! Please rate us on the extension store.";
      actionsBar.innerHTML = `
      <button class="action_button negative_action close_later">No thanks</button>
      <a href="${review_url}" target="_blank"><button class="action_button positive_action rate_button">Rate Extension</button></a>
    `;

    shadow.querySelectorAll(".action_button").forEach((button) => {
        button.addEventListener("click", () => {
          shadow.querySelector("#mmfytb_review_popup").remove();
        });
      });
    });

    noButton.addEventListener("click", () => {
      textElement.textContent = "Please let us know what you would like to improve";
      actionsBar.innerHTML = `
        <button class="action_button negative_action close_dismiss">No thanks</button>
        <a href="${support_url}" target="_blank"><button class="action_button positive_action feedback_button">Report issue</button></a>
        `;

      shadow.querySelectorAll(".action_button").forEach((button) => {
        button.addEventListener("click", () => {
          shadow.querySelector("#mmfytb_review_popup").remove();
        });
      });
    });
  }

  setTimeout(() => {
    createPanel();
  }, 5000);
})();
