const unloadScreen = new Event("loadScreenEnd");
const loadScreen = new Event("loadScreenStart");
const loadingScreen = document.querySelector(".loadingscreen");
const hideRendering = new Event("hideRenderingStart", {
    bubbles: true
});
const unhideRendering = new Event("hideRenderingEnd", {
    bubbles: true
});
const showPanel = new Event("showPanel", {
    bubbles: true
});
const hidePanel = new Event("hidePanel", {
    bubbles: true
});
const navigateWithLoading = (url) => {
    document.dispatchEvent(loadScreen);

    setTimeout(() => {
        if(typeof url === "function")
            return url();
        else
            window.location.replace(url);
    }, timing);
};

(() => {
    document.addEventListener("hideRenderingStart", (e) => {
        const container = e.target;
        container.classList.add("hideRendering");
    });
    document.addEventListener("hideRenderingEnd", (e) => {
        const container = e.target;
        container.classList.remove("hideRendering");
    });
    document.addEventListener('hidePanel', (e) => {
        const section = e.target;
        section.classList.replace('visible', 'hidden');
    });
    document.addEventListener("showPanel", (e) => {
        const panel = e.target;
        setTimeout(() => panel.classList.replace('hidden', 'visible'), timing);
    });
})();

(() => {
    const settings = JSON.parse(localStorage.getItem("cucuRiduSettings") || "{}");
    const token = settings.savingToken;
    const params = new URLSearchParams(window.location.search);
    if (!params.has("token") && token) {
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set("token", token);
        window.location.replace(newUrl.href);
    }
})();

/*if(window.self !== window.top) {
    try {
        window.top.location.href = window.location.href;
    } catch {
        (async () => await renderFragment(document.body, "absolutePanel", {
            title: "Accesso negato",
            message: "Scusa, ma niente compenetrazioni ammesse",
            redirect: fromBackEnd["knownOrigin"] || window.location.href
        }))();
    }
}*/