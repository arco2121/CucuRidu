const doRoomExists = async (room) => {
    try {
        const response = await fetch('/doRoomExists', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: {
                roomId: room
            }
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

    sendStanza.addEventListener("submit", async (e) => {
        e.preventDefault();
        if(!isLoadScreen()) document.dispatchEvent(loadScreen);
        const stanzaId = new FormData(sendStanza).get("stanza");
        const { result } = await doRoomExists(stanzaId);
        if(isLoadScreen()) document.dispatchEvent(unloadScreen);
        if(result === true)  sendStanza.submit();
        else alert("Non può entrare... Entraa? Non Entra! Entraaa? Non Entra! ENTRAAA? NON PENSO PROPRIO!1!")
    })
})