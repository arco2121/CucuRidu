off("listaGiocatori");
const optionsBtn = document.getElementById("optionsBtn");
const showGiocatoriPause = document.getElementById("showGiocatoriPause");

on("listaGiocatoriAggiornamento", (data) => {
    const { giocatori = [] } = data || {};
    // chi e' master lo dice la lista stessa: se il master esce il ruolo passa
    // a un altro e la X deve comparire a lui senza aspettare altri eventi
    const io = giocatori.find(g => g.id === referenceGiocatore?.id);

    renderFragment(showGiocatoriPause, "components/giocatorePauseRow", {
        giocatori: giocatori,
        seiMaster: !!io?.masterRole,
        mioId: referenceGiocatore?.id ?? null
    });
});

// un solo listener sul contenitore: le righe vengono ridisegnate di continuo
showGiocatoriPause.addEventListener("click", (e) => {
    const btn = e.target.closest(".kick_btn");
    if (!btn) return;
    const nome = btn.getAttribute("data-nome") || "questo giocatore";
    if (!confirm("Cacciare " + nome + " dalla stanza?")) return;
    btn.disabled = true;
    emit("cacciaGiocatore", {
        id: referenceStanza,
        giocatore: btn.getAttribute("data-id")
    });
});

optionsBtn.addEventListener("click", () => {
    pauseMenu.dispatchEvent(hidePanel);
    optionPanel.dispatchEvent(showPanel);
});