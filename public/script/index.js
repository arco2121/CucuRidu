document.addEventListener("DOMContentLoaded", () => {
    document.dispatchEvent(unloadScreen);

    const joinRoom = document.getElementById('joinRoom');
    const createRoom = document.getElementById('createRoom');

    const navigateWithLoading = (url) => {
        document.dispatchEvent(loadScreen);

        setTimeout(() => {
            window.location.href = url;
        }, 300);
    };

    joinRoom.addEventListener("click", () => navigateWithLoading("/partecipaStanza"));
    createRoom.addEventListener("click", () => navigateWithLoading("/creaStanza"));
});