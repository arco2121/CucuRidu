const unloadScreen = new Event("loadScreenEnd");
const loadScreen = new Event("loadScreenStart");
const stateConnected = new Event("doConnected");
const stateDisconnected = new Event("doDisconnected");

const showPanel = new Event("showPanel", {
    bubbles: true
});
const hidePanel = new Event("hidePanel", {
    bubbles: true
});
const showOpacity = new Event("showOpacity", {
    bubbles: true
});
const hideOpacity = new Event("hideOpacity", {
    bubbles: true
});
const showPanelCond = new Event("showPanelCond", {
    bubbles: true
});
const hidePanelCond = new Event("hidePanelCond", {
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
const fragmentRendered = new Event("fragmentRendered");

(() => {
    const timeOut = 150;
    document.addEventListener('hidePanel', (e) => {
        const section = e.target;
        section.classList.replace('visible', 'hidden');
    });
    document.addEventListener("showPanel", (e) => {
        const panel = e.target;
        setTimeout(() => panel.classList.replace('hidden', 'visible'), timeOut);
    });
    document.addEventListener('hidePanelCond', (e) => {
        const section = e.target;
        section.classList.add('hidden');
    });
    document.addEventListener("showPanelCond", (e) => {
        const panel = e.target;
        setTimeout(() => {
            if(panel.classList.contains("visible")) panel.classList.remove('hidden')
        }, timeOut);
    });
    document.addEventListener('hideOpacity', (e) => {
        const section = e.target;
        section.classList.replace('appear', 'disappear');
    });
    document.addEventListener("showOpacity", (e) => {
        const panel = e.target;
        panel.classList.replace('disappear', 'appear');
    });
})();