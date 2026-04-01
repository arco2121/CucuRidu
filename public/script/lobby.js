let deactivateMenu = false;
let aliver = null;
const stayAlive = () => {
    try {
        if (!aliver)
            aliver = new (window.AudioContext || window.webkitAudioContext)();
        if (aliver.state === 'suspended')
            aliver.resume();

        const oscillator = aliver.createOscillator();
        const gainNode = aliver.createGain();
        gainNode.gain.value = 0.001;
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, aliver.currentTime);
        oscillator.connect(gainNode);
        gainNode.connect(aliver.destination);
        oscillator.start();
    } catch (e) {
        console.error("Errore attivazione Alivet:", e);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const game_section = document.getElementById("game_section");
    const pauseMenu = document.getElementById("pauseMenu");
    const leaveBtn = document.getElementById("leaveBtn");
    const exitPauseBtn = document.getElementById("exitPauseBtn");
    const menuBtn = document.getElementById("menuBtn");
    const codiceStanzaPause = document.getElementById("codiceStanzaPause");

    leaveBtn.addEventListener("click", () => emit("lasciaStanza", {
        id: referenceStanza,
        giocatore: referenceGiocatore.id
    }));

    exitPauseBtn.addEventListener("click", () => {
        pauseMenu.dispatchEvent(hidePanel);
        game_section.dispatchEvent(showPanel);
    });

    menuBtn.addEventListener("click", () => {
        if(deactivateMenu) return;
        emit("listaGiocatori", {
            stanzaId: referenceStanza
        });
        game_section.dispatchEvent(hidePanel);
        codiceStanzaPause.textContent = referenceStanza;
        pauseMenu.dispatchEvent(showPanel);
    });
});

document.addEventListener("click", stayAlive, { once: true });

document.addEventListener("fragmentRendered", () => {
    if(isLoadScreen()) document.dispatchEvent(unloadScreen);
});

document.dispatchEvent(preventBack);
exitFrom = true;