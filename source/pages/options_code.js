let sitesIDs = ["youtube", "youtube_music", "embedded", "google_search"];

let sitesInfo = {
  "youtube": {
    "name": chrome.i18n.getMessage("youtube"),
    "options": ["video", "thumbnails", "avatars", "adblocker", "other_images"]
  },
  "youtube_music": {
    "name": chrome.i18n.getMessage("youtube_music"),
    "options": ["video", "thumbnails", "avatars", "adblocker", "other_images"]
  },
  "embedded": {
    "name": chrome.i18n.getMessage("embedded"),
    "options": ["video", "thumbnails", "avatars", "adblocker"]
  },
  "google_search": {
    "name": chrome.i18n.getMessage("google_search_full"),
    "options": []
  }
};

init();

function init() {
  addTemplates();
  initializeListeners();
  initializeOptions();
}

function addTemplates() {
  let code = sitesIDs.map(id => {
    return getSiteHTML(id, sitesInfo[id])
  }).join("");
  let childNodes = new DOMParser().parseFromString(code, "text/html").body.childNodes;
  childNodes.forEach(node => {
    document.querySelector("#addOptions").append(node);
  });
}

function getSiteHTML(id, item) {
  return `
  <div class="pageBody" id="${id}">
    <div class="settings setbord optionsGroupTitle">
      <div class="descr_toggle">
        <div class="settingsText">
          <div class="settingsHead"><span data-i18n="${id}"></span></div>
          <div class="settingsDescription" data-i18n="${id}Description"></div>
        </div>
        <div class="toggleButton">
          <label class="switch">
            <input type="checkbox" name="${id}" class="groupCheckboxes">
            <span class="slider round"></span>
          </label>
        </div>
      </div>
    </div>
    <div class="optionsContainer">
    ${item.options.map(option => {
    return `
          <div class="settings setbord">
            <div class="descr_toggle">
              <ul class="settingsTextIcon">
                <li class="settingsText">
                  <div class="settingsHead"><span data-i18n="${option}"></span></div>
                  <div class="settingsDescription" data-i18n="${option}Description"></div>
                </li>
              </ul>
              <div class="toggleButton">
                <label class="switch">
                  <input type="checkbox" name="${id + "_" + option}" class="optionsCheckboxes">
                  <span class="slider round"></span>
                </label>
              </div>
            </div>
          </div>
        `;
  }).join("")
    }
    </div>
  </div>`
}

function initializeListeners() {
  document.querySelectorAll("input[type='checkbox']").forEach(checkbox => {
    let isGroupCheckbox = checkbox.classList.contains("groupCheckboxes");
    let optionName = checkbox.name;

    checkbox.addEventListener("change", function () {
      detectChange(isGroupCheckbox, optionName, this.checked);
    });
  });
}

function initializeOptions() {
  chrome.storage.local.get(null, storedValues => {
    let checkboxes = document.querySelectorAll("input[type='checkbox']");
    checkboxes.forEach(checkbox => {
      checkbox.checked = storedValues[checkbox.name];
      checkbox.dispatchEvent(new Event("change"));
    });
  });
}

function detectChange(isGroupCheckbox, optionName, checked) {
  if (isGroupCheckbox) groupCheckboxChange(optionName, checked);
  chrome.storage.local.get(null, storedValues => {
    if (storedValues[optionName] != undefined) {
      let newValues = {};
      newValues[optionName] = checked;
      if (optionName == "popup_current_page") newValues["sspages"] = [];
      chrome.storage.local.set(newValues);
    }
  });
}

function groupCheckboxChange(optionName, checked) {
  let optionsContainer = document.querySelector("#" + optionName + " .optionsContainer");
  if (checked) optionsContainer.classList.add("visibleOptions");
  else optionsContainer.classList.remove("visibleOptions");
}