const connectionPanel = document.getElementById("connectionPanel");
let lockConnectionState = false;
const toggleConnectionState = () => lockConnectionState = !lockConnectionState;

document.addEventListener("DOMContentLoaded", () => {
    const showByConnectionManager = document.querySelectorAll(".showByConnectionManager");

    window.addEventListener("offline", () => document.dispatchEvent(stateDisconnected));
    window.addEventListener("online", () => document.dispatchEvent(stateConnected));

    (() => {
        document.addEventListener("doConnected", () => {
            if(lockConnectionState) return;
            connectionPanel.dispatchEvent(hidePanel);
            showByConnectionManager.forEach(pan => pan.dispatchEvent(showPanelCond));
        });

        document.addEventListener("doDisconnected", () => {
            if(lockConnectionState) return;
            showByConnectionManager.forEach(pan => pan.dispatchEvent(hidePanelCond));
            connectionPanel.dispatchEvent(showPanel);
        });
    })();
});