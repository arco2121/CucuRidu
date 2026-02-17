const doRoomExists = async (room) => {
    try {
        const response = await fetch('/doRoomExists', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                roomId: room
            })
        });

        if (!response.ok) {
            throw new Error(`Errore nella richiesta: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Oop, qualcosa è andato storto: ${error.message}`);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.dispatchEvent(unloadScreen);
    const sendStanza = document.getElementById("sendStanza");
    const inputStanza = document.getElementById("inputCode");
    let doing = false;

    sendStanza.addEventListener("click", async () => {
        if(doing) return;
        doing = true;
        const stanzaId = inputStanza.value;
        const { result } = await doRoomExists(stanzaId);
        if(result === true)  navigateWithLoading("/partecipaStanza?stanza=" + stanzaId);
        else alert("Non può entrare... Entraa? Non Entra! Entraaa? Non Entra! ENTRAAA? NON PENSO PROPRIO!1!");
        doing = false;
    })
})