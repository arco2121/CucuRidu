const getInfo = async () => {
    try {
        const response = await fetch('/generateInfo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Errore nella richiesta: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Oop, qualcosa è andato storto: ${error.message}`);
    }
};

document.addEventListener("DOMContentLoaded", async () => {
    const possibleStanzaId = fromBackEnd["stanza"] || "";
    const displayPfp = document.getElementById("displayPfp");
    const displayName = document.getElementById("displayName");
    const pfpPanel = document.getElementById("selectPfp");
    const btn_randomize = document.getElementById("randomize");
    const btn_confirm = document.getElementById("confirm");
    const profile = document.getElementById("profile");
    const pfpSelections = document.querySelectorAll(".pfp_selection");
    const randomImg = document.getElementById("randomImg");
    const randomUsername = document.getElementById("randomUsername");
    const usernamePanel = document.getElementById("selectUsername");
    const btn_confirmUsername = document.getElementById("confirmUsername");
    const editUsername = document.getElementById("changeNameBtn");
    const editBoxUsername = document.getElementById("customUsername");

    async function getNewInfos () {
        let infos = await getInfo();

        if (infos) {
            displayPfp.src = infos.pfp;
            displayName.innerText = infos.nome;
        }
    }

    await getNewInfos();
    let doing = false;

    pfpSelections.forEach(pfp => {
        pfp.addEventListener("click", () => {
            displayPfp.src = pfp.src;
            pfpPanel.dispatchEvent(hidePanel);
            profile.dispatchEvent(showPanel);
        });
    });

    randomImg.addEventListener("click", async () => {
        displayPfp.src = (await getInfo())["pfp"];
        pfpPanel.dispatchEvent(hidePanel);
        profile.dispatchEvent(showPanel);
    });

    randomUsername.addEventListener("click", async () => {
        displayName.textContent = (await getInfo())["nome"];
        usernamePanel.dispatchEvent(hidePanel);
        profile.dispatchEvent(showPanel);
    });

    displayPfp.addEventListener("click", () => {
       profile.dispatchEvent(hidePanel);
       pfpPanel.dispatchEvent(showPanel);
    });

    editUsername.addEventListener("click", () => {
        profile.dispatchEvent(hidePanel);
        usernamePanel.dispatchEvent(showPanel);
    });

    btn_confirmUsername.addEventListener("click", () => {
        if(!editBoxUsername.value || editBoxUsername.value === "") {
            alert("Possibilmente un nome sensato");
            return;
        }
        displayName.textContent = editBoxUsername.value;
        editBoxUsername.value = "";
        usernamePanel.dispatchEvent(hidePanel);
        profile.dispatchEvent(showPanel);
    });

    btn_randomize.addEventListener("click", async () => {
        if(doing) return;
        doing = true;
        await getNewInfos();
        doing = false;
    });



    btn_confirm.addEventListener("click", () => possibleStanzaId !== "" ?
        navigateWithLoading("/partecipaStanza?pfp=" + encodeURIComponent(displayPfp.src) + "&nome=" + encodeURIComponent(displayName.textContent) + "&stanza=" + encodeURIComponent(possibleStanzaId)) :
        navigateWithLoading("/creaStanza?pfp=" + encodeURIComponent(displayPfp.src) + "&nome=" + encodeURIComponent(displayName.textContent)));

    document.dispatchEvent(unloadScreen);
});