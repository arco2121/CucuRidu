const cards = document.querySelectorAll(".risposta");
const currentQuestion = document.querySelector(".domanda");
const sendCardsBtn = document.getElementById("sendCards");
const defaultText = currentQuestion.textContent.trim();
const maxSlots = parseInt(currentQuestion.id);

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
        currentQuestion.textContent = defaultText;
    }

    const isFull = givenAnswerIndices.every(v => v !== null);

    cards.forEach(card => {
        const thisCardIdx = parseInt(card.getAttribute("data-card-index"));
        const isThisCardSelected = givenAnswerIndices.includes(thisCardIdx);

        if (isThisCardSelected) {
            card.classList.add("selected");
            card.classList.remove("unselected");
        } else if (isFull) {
            card.classList.remove("selected");
            card.classList.add("unselected");
        } else {
            card.classList.remove("selected", "unselected");
        }
    });
};

cards.forEach(card => card.addEventListener("click", () => toggleCards(card)));
cards.forEach(card => Array.from(bannedSymbols).forEach(letter =>
    document.getElementById("rispostaText_" + card.id).textContent =
        document.getElementById("rispostaText_" + card.id).textContent.replaceAll(letter, "")
));

sendCardsBtn?.addEventListener("click", () => {
    if (givenAnswerIndices.some(v => v === null)) {
        alert("Finisci di selezionare le risposte, mongolo");
        return;
    }
    emit("inviaRisposta", {
        id: referenceStanza,
        indexCarte: givenAnswerIndices
    });
});