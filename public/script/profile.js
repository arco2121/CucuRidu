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

        const data = await response.json();

        console.log(`Nome generato: ${data.nome}`);
        console.log(`PFP URL: ${data.pfp}`);

        return data;
    } catch (error) {
        console.error(`Oop, qualcosa è andato storto: ${error.message}`);
    }
};

document.addEventListener("DOMContentLoaded", async () => {
    document.dispatchEvent(unloadScreen);
    const possibleStanzaId = document.getElementById("possibleStanzaId").value;
    const displayPfp = document.getElementById("displayPfp");
    const displayName = document.getElementById("displayName");

    const btn_randomize = document.getElementById("randomize");
    const btn_confirm = document.getElementById("confirm");

    async function getNewInfos () {
        let infos = await getInfo();

        console.log(infos);

        if (infos) {
            displayPfp.src = infos.pfp;
            displayName.innerText = infos.nome;
        }
    }

    await getNewInfos();

    btn_randomize.addEventListener("click", getNewInfos);
    btn_confirm.addEventListener("click", () => possibleStanzaId !== "" ?
        window.location.href = "/partecipaStanza?pfp=" + encodeURIComponent(displayPfp.src) + "&nome=" + encodeURIComponent(displayName.textContent) + "&stanza=" + encodeURIComponent(possibleStanzaId) :
        window.location.href = "/creaStanza?pfp=" + encodeURIComponent(displayPfp.src) + "&nome=" + encodeURIComponent(displayName.textContent));

});