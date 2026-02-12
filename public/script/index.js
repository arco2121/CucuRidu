document.addEventListener("DOMContentLoaded", () => {
    document.dispatchEvent(unloadScreen);
    const joinRoom = document.getElementById('joinRoom');
    const createRoom = document.getElementById('createRoom');

    joinRoom.addEventListener("click", () => window.location.href = "/partecipaStanza");
    createRoom.addEventListener("click", () => window.location.href = "/creaStanza");
});