const unloadScreen = new CustomEvent("loadScreenEnd");
const loadScreen = new CustomEvent("loadScreenStart");
const loadingScreen = document.querySelector(".loadingscreen");
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