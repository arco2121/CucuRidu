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

    const btn_randomize = document.getElementById("randomize");
    const btn_confirm = document.getElementById("confirm");



    async function getNewInfos () {
        let infos = await getInfo();

        if (infos) {
            displayPfp.src = infos.pfp;
            displayName.innerText = infos.nome;
        }
    }

    await getNewInfos();

    btn_randomize.addEventListener("click", async () => {
        if(!isLoadScreen()) document.dispatchEvent(loadScreen);
        await getNewInfos();
        if(isLoadScreen()) document.dispatchEvent(unloadScreen);
    });
    btn_confirm.addEventListener("click", () => possibleStanzaId !== "" ?
        window.location.href = "/partecipaStanza?pfp=" + encodeURIComponent(displayPfp.src) + "&nome=" + encodeURIComponent(displayName.textContent) + "&stanza=" + encodeURIComponent(possibleStanzaId) :
        window.location.href = "/creaStanza?pfp=" + encodeURIComponent(displayPfp.src) + "&nome=" + encodeURIComponent(displayName.textContent));

    document.dispatchEvent(unloadScreen);
});