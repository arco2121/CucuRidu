document.dispatchEvent(unloadScreen);
document.addEventListener("DOMContentLoaded", () => {
    document.dispatchEvent(stateDisconnected);
    toggleConnectionState();
});