const unloadScreen = new CustomEvent("loadScreenEnd");
const loadScreen = new CustomEvent("loadScreenStart");
const loadingScreen = document.querySelector(".loadingscreen");
const stateConnected = new CustomEvent("doConnected");
const stateDisconnected = new CustomEvent("doDisconnected");
const hideRendering = new CustomEvent("hideRenderingStart", {
    bubbles: true
});
const unhideRendering = new CustomEvent("hideRenderingEnd", {
    bubbles: true
});
const showPanel = new CustomEvent("showPanel", {
    bubbles: true
});
const hidePanel = new CustomEvent("hidePanel", {
    bubbles: true
});
const navigateWithLoading = (url) => {
    document.dispatchEvent(loadScreen);

    setTimeout(() => {
        if(typeof url === "function")
            return url();
        else
            window.location.href = url;
    }, timing);
};
const fragmentRendered = new CustomEvent("fragmentRendered");

(() => {
    const timeOut = 150;
    document.addEventListener("hideRenderingStart", (e) => {
        const container = e.target;
        container.classList.add("hideRendering");
    });
    document.addEventListener("hideRenderingEnd", (e) => {
        const container = e.target;
        setTimeout(() => container.classList.remove("hideRendering"), timeOut);
    });
    document.addEventListener('hidePanel', (e) => {
        const section = e.target;
        section.classList.replace('visible', 'hidden');
    });
    document.addEventListener("showPanel", (e) => {
        const panel = e.target;
        setTimeout(() => panel.classList.replace('hidden', 'visible'), timeOut);
    });
})();