document.addEventListener("DOMContentLoaded", () => {
    const game_section = document.getElementById("game_section");
    const pauseMenu = document.getElementById("pauseMenu");
    const leaveBtn = document.getElementById("leaveBtn");
    const exitPauseBtn = document.getElementById("exitPauseBtn");
    const menuBtn = document.getElementById("menuBtn");
    const codiceStanzaPause = document.getElementById("codiceStanzaPause");

    leaveBtn.addEventListener("click", () => socket.emit("lasciaStanza", {
        id: referenceStanza,
        giocatore: referenceGiocatore.id
    }));

    exitPauseBtn.addEventListener("click", () => {
        pauseMenu.dispatchEvent(hidePanel);
        game_section.dispatchEvent(showPanel);
    });

    menuBtn.addEventListener("click", () => {
        socket.emit("listaGiocatori", {
            stanzaId: referenceStanza
        });
        game_section.dispatchEvent(hidePanel);
        codiceStanzaPause.textContent = referenceStanza;
        pauseMenu.dispatchEvent(showPanel);
    });
});

document.addEventListener("fragmentRendered", () => {
    if(isLoadScreen()) document.dispatchEvent(unloadScreen);
})

document.dispatchEvent(preventBack);
exitFrom = true;