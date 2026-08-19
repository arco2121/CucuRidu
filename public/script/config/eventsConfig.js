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
const timeOut = 150;

(() => {
    document.addEventListener('hidePanel', (e) => {
        const section = e.target;
        section.classList.replace('visible', 'hidden');
    });
    document.addEventListener("showPanel", (e) => {
        const panel = e.target;
        setTimeout(() => {
            // "instant" va tolta nello STESSO istante in cui "hidden" diventa
            // "visible": se la togliessimo prima, per il tempo che passa fino
            // a qui il pannello avrebbe solo "hidden" (senza instant) e
            // l'animazione popdown ripartirebbe da capo, lampeggiando visibile
            // proprio mentre si sta cercando di aprirlo davvero.
            panel.classList.remove('instant');
            panel.classList.replace('hidden', 'visible');
        }, timeOut);
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