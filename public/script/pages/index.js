document.addEventListener("DOMContentLoaded", () => {
    document.dispatchEvent(unloadScreen);

    const joinRoom = document.getElementById('joinRoom');
    const createRoom = document.getElementById('createRoom');
    const optionsBtn = document.getElementById("optionsBtn");
    const rules = document.getElementById("rules");
    const sectionDefault = document.querySelector(".sectionToHide");

    joinRoom.addEventListener("click", () => navigateWithLoading("/partecipaStanza"));
    createRoom.addEventListener("click", () => navigateWithLoading("/creaStanza"));
    rules.addEventListener("click", () => {
        const link = document.createElement("a");
        link.target = "_blank";
        link.href = "https://github.com/arco2121/CucuRidu/wiki/Regole";
        link.click();
    });
    optionsBtn.addEventListener("click", () => {
        sectionDefault.dispatchEvent(hidePanel);
        optionPanel.dispatchEvent(showPanel);
    });

    if(fromBackEnd["openSettings"])
        optionsBtn.click();
});

document.dispatchEvent(preventBack);
exitFrom = true;