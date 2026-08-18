/*
 * Pannello per segnalare frasi e completamenti sbagliati.
 *
 * Si apre dal menu di pausa e mostra la frase del round in corso piu le carte
 * che hai in mano in quel momento: tocchi quelle sbagliate, aggiungi una nota
 * se ti va, invii. Serve a non doversi fare gli screenshot mentre si gioca.
 */
const segnalaMenu = document.getElementById("segnalaMenu");

document.addEventListener("DOMContentLoaded", () => {
    const lista = document.getElementById("segnalaLista");
    const nota = document.getElementById("segnalaNota");
    const inviaBtn = document.getElementById("inviaSegnalazioneBtn");
    const exitBtn = document.getElementById("exitSegnalaBtn");
    const game_section = document.getElementById("game_section");
    const pauseMenu = document.getElementById("pauseMenu");
    const segnalaBtn = document.getElementById("segnalaBtn");
    if (!segnalaMenu || !lista) return;

    // indice della riga -> { tipo, testo }, cosi il testo puo contenere
    // qualsiasi carattere senza rompere niente
    const scelti = new Map();
    const testoInvia = inviaBtn ? inviaBtn.textContent : "Invia";

    const vuoto = '<h4 class="segnala_vuoto sour_gummy_regular_italic">Niente da segnalare al momento</h4>';

    /** Rimette insieme l'elenco con la frase del round e le carte in mano. */
    const costruisciLista = () => {
        scelti.clear();
        lista.innerHTML = "";

        const elementi = [];
        const frase = typeof fraseCorrente === "string" ? fraseCorrente : null;
        if (frase) elementi.push({ tipo: "frase", testo: frase });

        const mano = Array.isArray(referenceGiocatore?.mazzo) ? referenceGiocatore.mazzo : [];
        for (const carta of mano) {
            const testo = Array.isArray(carta) ? carta[0] : carta;
            if (typeof testo === "string" && testo.trim())
                elementi.push({ tipo: "completamento", testo: testo });
        }

        if (!elementi.length) {
            lista.innerHTML = vuoto;
            return;
        }

        elementi.forEach((elemento, indice) => {
            const riga = document.createElement("div");
            riga.className = "segnala_riga shrinks_on_active_for_no_reason "
                + (elemento.tipo === "frase" ? "segnala_riga_frase" : "segnala_riga_completamento");

            const etichetta = document.createElement("span");
            etichetta.className = "segnala_etichetta sour_gummy_bold";
            etichetta.textContent = elemento.tipo === "frase" ? "Frase" : "Carta";

            const testo = document.createElement("span");
            testo.className = "segnala_testo";
            // i marcatori di formattazione non c'entrano niente con chi legge
            testo.textContent = pulisciFrase(elemento.testo).replace(/[§$]/g, "");

            const indicatore = document.createElement("span");
            indicatore.className = "segnala_indicatore";

            riga.appendChild(etichetta);
            riga.appendChild(testo);
            riga.appendChild(indicatore);

            riga.addEventListener("click", () => {
                if (scelti.has(indice)) {
                    scelti.delete(indice);
                    riga.classList.remove("segnala_scelto");
                } else {
                    scelti.set(indice, elemento);
                    riga.classList.add("segnala_scelto");
                }
            });

            lista.appendChild(riga);
        });
    };

    const apri = () => {
        costruisciLista();
        if (nota) nota.value = "";
        if (inviaBtn) { inviaBtn.disabled = false; inviaBtn.textContent = testoInvia; }
        if (pauseMenu) pauseMenu.dispatchEvent(hidePanel);
        segnalaMenu.dispatchEvent(showPanel);
    };

    const chiudi = () => {
        segnalaMenu.dispatchEvent(hidePanel);
        if (game_section) game_section.dispatchEvent(showPanel);
    };

    if (segnalaBtn) segnalaBtn.addEventListener("click", apri);
    if (exitBtn) exitBtn.addEventListener("click", chiudi);

    if (inviaBtn) inviaBtn.addEventListener("click", () => {
        if (!scelti.size) {
            alert("Prima tocca cosa non va, poi invia");
            return;
        }

        inviaBtn.disabled = true;
        inviaBtn.textContent = "Invio...";
        emit("segnala", {
            id: referenceStanza,
            elementi: Array.from(scelti.values()),
            nota: nota ? nota.value : ""
        });
    });

    off("segnalazioneEsito");
    on("segnalazioneEsito", (data) => {
        if (inviaBtn) { inviaBtn.disabled = false; inviaBtn.textContent = testoInvia; }
        if (data && data.ok) {
            alert("Segnalato, grazie. Ce lo guardiamo con calma");
            chiudi();
        } else {
            alert((data && data.messaggio) || "Non sono riuscito a inviare la segnalazione");
        }
    });
});
