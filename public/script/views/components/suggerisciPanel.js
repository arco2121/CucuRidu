/*
 * Pannello per proporre frasi e completamenti NUOVI.
 *
 * Fratello minore di segnalaPanel.js: quello serve a dire "questa carta e'
 * sbagliata", questo a dire "aggiungete questa". Passa dallo stesso archivio
 * (tabella segnalazioni) ma con tipi diversi - suggerimento_frase /
 * suggerimento_completamento - cosi nella pagina /segnalazioni restano
 * separati dalle correzioni.
 */
const suggerisciMenu = document.getElementById("suggerisciMenu");

document.addEventListener("DOMContentLoaded", () => {
    const lista = document.getElementById("suggerisciLista");
    const testo = document.getElementById("suggerisciTesto");
    const aiuto = document.getElementById("suggerisciAiuto");
    const aggiungiBtn = document.getElementById("aggiungiSuggerimentoBtn");
    const inviaBtn = document.getElementById("inviaSuggerimentoBtn");
    const exitBtn = document.getElementById("exitSuggerisciBtn");
    const game_section = document.getElementById("game_section");
    const pauseMenu = document.getElementById("pauseMenu");
    const suggerisciBtn = document.getElementById("suggerisciBtn");
    const bottoniTipo = document.querySelectorAll(".suggerisci_tipo");
    if (!suggerisciMenu || !lista || !testo) return;

    // il server ne accetta al massimo 15 per invio (MASSIMO_PER_INVIO)
    const MASSIMO = 15;
    const testiAiuto = {
        completamento: "Una carta da avere in mano. Es: \"un maiale in tuta da sci\"",
        frase: "Metti un _ per ogni spazio da riempire. Es: \"Non uscirei mai di casa senza _\""
    };
    const segnaposto = {
        completamento: "un maiale in tuta da sci",
        frase: "Non uscirei mai di casa senza _"
    };

    let tipoCorrente = "completamento";
    const elementi = [];
    const testoInvia = inviaBtn ? inviaBtn.textContent : "Invia";

    const aggiornaTipo = (tipo) => {
        tipoCorrente = tipo === "frase" ? "frase" : "completamento";
        bottoniTipo.forEach(bottone =>
            bottone.classList.toggle("suggerisci_tipo_attivo",
                bottone.getAttribute("data-tipo") === tipoCorrente));
        if (aiuto) aiuto.textContent = testiAiuto[tipoCorrente];
        testo.placeholder = segnaposto[tipoCorrente];
    };

    /** Ridisegna la lista di quello che si sta per mandare. */
    const disegnaLista = () => {
        lista.innerHTML = "";
        if (!elementi.length) return;

        elementi.forEach((elemento, indice) => {
            const riga = document.createElement("div");
            riga.className = "segnala_riga shrinks_on_active_for_no_reason "
                + (elemento.tipo === "frase" ? "segnala_riga_frase" : "segnala_riga_completamento");

            const etichetta = document.createElement("span");
            etichetta.className = "segnala_etichetta sour_gummy_bold";
            etichetta.textContent = elemento.tipo === "frase" ? "Frase" : "Carta";

            const corpo = document.createElement("span");
            corpo.className = "segnala_testo";
            corpo.textContent = elemento.testo;

            const togli = document.createElement("span");
            togli.className = "suggerisci_togli sour_gummy_bold";
            togli.textContent = "×";
            togli.title = "Togli dalla lista";

            riga.appendChild(etichetta);
            riga.appendChild(corpo);
            riga.appendChild(togli);

            riga.addEventListener("click", () => {
                elementi.splice(indice, 1);
                disegnaLista();
            });

            lista.appendChild(riga);
        });
    };

    /**
     * Sposta quello che c'e' scritto nella casella dentro la lista.
     * Ritorna false solo se il testo c'era ma non andava bene: cosi chi invia
     * sa che deve fermarsi, mentre una casella vuota non blocca niente.
     */
    const accodaTesto = (obbligatorio) => {
        const valore = testo.value.trim();
        if (!valore) {
            if (obbligatorio) alert("Scrivi prima qualcosa");
            return !obbligatorio;
        }
        if (elementi.length >= MASSIMO) {
            alert("Uno alla volta, non piu di " + MASSIMO + " per invio");
            return false;
        }
        if (tipoCorrente === "frase" && !valore.includes("_")) {
            alert("In una frase ci vuole almeno un _ dove va il completamento");
            return false;
        }
        if (elementi.some(e => e.tipo === tipoCorrente && e.testo === valore)) {
            alert("Questo l'hai gia scritto");
            return false;
        }

        elementi.push({ tipo: tipoCorrente, testo: valore });
        testo.value = "";
        disegnaLista();
        return true;
    };

    const apri = () => {
        elementi.length = 0;
        testo.value = "";
        aggiornaTipo("completamento");
        disegnaLista();
        if (inviaBtn) { inviaBtn.disabled = false; inviaBtn.textContent = testoInvia; }
        if (pauseMenu) pauseMenu.dispatchEvent(hidePanel);
        suggerisciMenu.dispatchEvent(showPanel);
    };

    const chiudi = () => {
        suggerisciMenu.dispatchEvent(hidePanel);
        if (game_section) game_section.dispatchEvent(showPanel);
    };

    bottoniTipo.forEach(bottone =>
        bottone.addEventListener("click", () => aggiornaTipo(bottone.getAttribute("data-tipo"))));

    if (suggerisciBtn) suggerisciBtn.addEventListener("click", apri);
    if (exitBtn) exitBtn.addEventListener("click", chiudi);
    if (aggiungiBtn) aggiungiBtn.addEventListener("click", () => accodaTesto(true));

    if (inviaBtn) inviaBtn.addEventListener("click", () => {
        // chi scrive una cosa sola non deve prima "aggiungerla": la prendiamo
        // direttamente dalla casella
        if (!accodaTesto(false)) return;
        if (!elementi.length) {
            alert("Scrivi prima qualcosa");
            return;
        }

        inviaBtn.disabled = true;
        inviaBtn.textContent = "Invio...";
        emit("suggerisci", {
            id: referenceStanza,
            elementi: elementi.map(e => ({
                tipo: "suggerimento_" + e.tipo,
                testo: e.testo
            }))
        });
    });

    off("suggerimentoEsito");
    on("suggerimentoEsito", (data) => {
        if (inviaBtn) { inviaBtn.disabled = false; inviaBtn.textContent = testoInvia; }
        if (data && data.ok) {
            elementi.length = 0;
            testo.value = "";
            disegnaLista();
            alert("Ricevuto, grazie. Se e' bella la mettiamo dentro");
            chiudi();
        } else {
            alert((data && data.messaggio) || "Non sono riuscito a inviare il suggerimento");
        }
    });

    aggiornaTipo("completamento");
});
