document.addEventListener("DOMContentLoaded", () => {
    document.dispatchEvent(unloadScreen);

    const joinRoom = document.getElementById('joinRoom');
    const createRoom = document.getElementById('createRoom');
    const optionsBtn = document.getElementById("optionsBtn");

    joinRoom.addEventListener("click", () => navigateWithLoading("/partecipaStanza"));
    createRoom.addEventListener("click", () => navigateWithLoading("/creaStanza"));
    optionsBtn.addEventListener("click", () => document.dispatchEvent(showOptions));
});