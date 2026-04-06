off("listaGiocatori");
const optionsBtn = document.getElementById("optionsBtn");
const showGiocatoriPause = document.getElementById("showGiocatoriPause");

on("listaGiocatoriAggiornamento", (data) => {
    const { giocatori = [] } = data || {};

    renderFragment(showGiocatoriPause, "components/giocatorePauseRow", {
        giocatori: giocatori
    });
});

optionsBtn.addEventListener("click", () => {
    pauseMenu.dispatchEvent(hidePanel);
    optionPanel.dispatchEvent(showPanel);
});