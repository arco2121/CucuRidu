document.addEventListener("DOMContentLoaded", () => {
    document.dispatchEvent(unloadScreen);

    const joinRoom = document.getElementById('joinRoom');
    const createRoom = document.getElementById('createRoom');

    joinRoom.addEventListener("click", () => navigateWithLoading("/partecipaStanza"));
    createRoom.addEventListener("click", () => navigateWithLoading("/creaStanza"));
});