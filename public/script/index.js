document.addEventListener("DOMContentLoaded", () => {
    document.dispatchEvent(unloadScreen);

    const joinRoom = document.getElementById('joinRoom');
    const createRoom = document.getElementById('createRoom');
    const optionsBtn = document.getElementById("optionsBtn");
    const rules = document.getElementById("rules");
    const sectionDefault = document.querySelector(".sectionToHide");

    joinRoom.addEventListener("click", () => navigateWithLoading("/partecipaStanza"));
    createRoom.addEventListener("click", () => navigateWithLoading("/creaStanza"));
    rules.addEventListener("click", () => navigateWithLoading("https://github.com/arco2121/CucuRidu/wiki/Come-Giocare"));
    optionsBtn.addEventListener("click", () => {
        sectionDefault.dispatchEvent(hidePanel);
        optionPanel.dispatchEvent(showPanel);
    });
});

document.dispatchEvent(preventBack);
exitFrom = true;