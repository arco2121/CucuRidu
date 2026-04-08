const tornaHome = document.getElementById("tornaHome");
const showGiocatori = document.getElementById("showGiocatori");

renderFragment(showGiocatori, "components/giocatoreRow", {
    giocatori: fromFragments["classifica"],
    animation: false
});

tornaHome.addEventListener("click", () => lasciaStanza());
deactivateMenu = true;