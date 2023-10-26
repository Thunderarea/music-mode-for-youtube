document.title = chrome.i18n.getMessage(document.body.id);

let i18nElements = document.querySelectorAll("[data-i18n]");
let childNodes;
i18nElements.forEach(el => {
  el.textContent = "";
  childNodes = new DOMParser().parseFromString(chrome.i18n.getMessage(el.dataset.i18n), "text/html").body.childNodes;
  childNodes.forEach(node => {
    el.append(node);
  });
});