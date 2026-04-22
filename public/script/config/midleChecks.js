const settings = JSON.parse(localStorage.getItem("cucuRiduSettings") || "{}");
if (fromBackEnd["deleteToken"] === true) {
    settings["savingToken"] = null;
    localStorage.setItem("cucuRiduSettings", JSON.stringify(settings));
}

const token = settings.savingToken;
const params = new URLSearchParams(window.location.search);
if (!params.has("token") && token && fromBackEnd["loadToken"] !== false) {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("token", token);
    window.location.replace(newUrl.href);
}

if(settings.translate) document.addEventListener("DOMContentLoaded", () => translateDom(null, lang));