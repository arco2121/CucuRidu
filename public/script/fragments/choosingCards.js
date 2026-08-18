const cards = document.querySelectorAll(".risposta");
const currentQuestion = document.querySelector(".domanda");
const sendCardsBtn = document.getElementById("sendCards");
// defaultText tiene i marcatori (§ prima di uno spazio vuoto = completamento
// tutto maiuscolo), il testo mostrato invece va sempre ripulito
const defaultText = currentQuestion.textContent.trim();
const maxSlots = parseInt(currentQuestion.id);
currentQuestion.textContent = pulisciFrase(defaultText);

const givenAnswerIndices = Array.from({length: maxSlots}, () => null);
const givenAnswerTexts = Array.from({length: maxSlots}, () => null);

const toggleCards = (target) => {
    const cardIndex = parseInt(target.getAttribute("data-card-index"));
    const cardText = target.getAttribute("textValue");

    const slotIndex = givenAnswerIndices.indexOf(cardIndex);
    if (slotIndex !== -1) {
        givenAnswerIndices[slotIndex] = null;
        givenAnswerTexts[slotIndex] = null;
    } else {
        const emptySlot = givenAnswerIndices.findIndex(v => v === null);
        if (emptySlot !== -1) {
            givenAnswerIndices[emptySlot] = cardIndex;
            givenAnswerTexts[emptySlot] = cardText;
        }
    }

    const currentAnswersCount = givenAnswerIndices.filter(v => v !== null).length;

    if (currentAnswersCount > 0) {
        currentQuestion.textContent = fillBlanks(defaultText, givenAnswerTexts);
    } else {
        currentQuestion.textContent = pulisciFrase(defaultText);
    }

    const isFull = givenAnswerIndices.every(v => v !== null);

    cards.forEach(card => {
        const thisCardIdx = parseInt(card.getAttribute("data-card-index"));
        const slot = givenAnswerIndices.indexOf(thisCardIdx);
        const isThisCardSelected = slot !== -1;

        if (isThisCardSelected) {
            card.classList.add("selected");
            card.classList.remove("unselected");
        } else if (isFull) {
            card.classList.remove("selected");
            card.classList.add("unselected");
        } else {
            card.classList.remove("selected", "unselected");
        }

        // con piu spazi da riempire serve sapere QUALE spazio occupa la carta
        const badge = document.getElementById("slot_" + card.id);
        if (badge) badge.textContent = (isThisCardSelected && maxSlots > 1) ? String(slot + 1) : "";
    });
};

cards.forEach(card => card.addEventListener("click", () => toggleCards(card)));
cards.forEach(card => Array.from(bannedSymbols).forEach(letter =>
    document.getElementById("rispostaText_" + card.id).textContent =
        document.getElementById("rispostaText_" + card.id).textContent.replaceAll(letter, "")
));

// --- Invio con conferma ------------------------------------------------------
// Prima l'invio era "spara e spera": se il pacchetto si perdeva durante una
// riconnessione il giocatore restava fermo qui e per tutti gli altri risultava
// come "non ha ancora risposto". Ora finche' il server non conferma (e quindi
// finche' questo fragment non viene sostituito) l'invio viene ripetuto. Il
// server tratta i reinvii come idempotenti, quindi ripetere non fa danni.
const testoConferma = sendCardsBtn?.textContent;
let ripetizioneInvio = null;

const inviaCompletamenti = () => emit("inviaRisposta", {
    id: referenceStanza,
    indexCarte: givenAnswerIndices
});

const fermaRipetizione = () => {
    if (ripetizioneInvio === null) return;
    clearFragmentInterval(ripetizioneInvio, fromFragments["pageId"]);
    ripetizioneInvio = null;
};

sendCardsBtn?.addEventListener("click", () => {
    if (ripetizioneInvio !== null) return;
    if (givenAnswerIndices.some(v => v === null)) {
        alert("Finisci di selezionare le risposte, mongolo");
        return;
    }

    sendCardsBtn.disabled = true;
    sendCardsBtn.textContent = "Invio...";
    inviaCompletamenti();

    let tentativi = 0;
    ripetizioneInvio = fragmentInterval(() => {
        tentativi++;
        if (tentativi > 5) {
            fermaRipetizione();
            sendCardsBtn.disabled = false;
            sendCardsBtn.textContent = testoConferma || "Conferma";
            alert("Il server non risponde, riprova a confermare");
            return;
        }
        inviaCompletamenti();
    }, 3500, fromFragments["pageId"]);
});

// --- Vista di chi legge: chi ha gia inviato -----------------------------------
const numeroCompletati = document.getElementById("numeroCompletati");
const showCompletati = document.getElementById("showCompletati");

if (numeroCompletati && showCompletati) {
    off("aggiornamentoAttesaRisposta");
    on("aggiornamentoAttesaRisposta", (data) => {
        const { numeroGiocatori, totaleAttesi, giocatori } = data || {};
        numeroCompletati.textContent = "Completati: " + (numeroGiocatori ?? 0)
            + (typeof totaleAttesi === "number" ? " / " + totaleAttesi : "");
        renderFragment(showCompletati, "components/giocatoreRow", {
            giocatori: giocatori || [],
            animation: false
        });
    });
    emit("aggiornaAttesaRisposta", { stanzaId: referenceStanza });
    fragmentInterval(() => emit("aggiornaAttesaRisposta", { stanzaId: referenceStanza }),
        8000, fromFragments["pageId"]);
}