const currentQuestion = document.querySelector(".domanda");
const confirmBtn = document.getElementById("sendConferma");
const defaultText = currentQuestion.textContent;
const allAnswers = fromFragments["risposte"];
const prevBtn = document.getElementById("prima");
const nextBtn = document.getElementById("dopo");
const answer_index = document.getElementById("answer_index");
let currentIndex = 0;

const updateQuestion = () => {
    const currentSelection = allAnswers[currentIndex];
    const risposte = [].concat(currentSelection[1]).map(c => Array.isArray(c) ? c[0] : String(c));
    currentQuestion.textContent = fillBlanks(defaultText, risposte);
    answer_index.textContent = currentIndex + 1 + "/" + allAnswers.length;
};

prevBtn.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + allAnswers.length) % allAnswers.length;
    updateQuestion();
});

nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % allAnswers.length;
    updateQuestion();
});

updateQuestion();

confirmBtn?.addEventListener("click", () => {
    emit("scegliVincitore", {
        id: referenceStanza,
        vincitore: allAnswers[currentIndex][0]
    });
});