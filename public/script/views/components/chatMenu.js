off("aggiornamentoChat");

const chatView = document.getElementById("chat");
const sendBtn = document.getElementById("sendBtn");
const inputMessage = document.getElementById("inputMessage");
let chatHistory = [];
let notify = true;
const delayChat = 2000;

const renderChat = async (chat = [], renderAll = true) => {
    if(chat.length + chatHistory.length === 0) {
        chatView.innerHTML = "<h1>Bha... a me sembra tutto morto qui</h1>";
        chatView.classList.remove("chat");
        return;
    }

    chatView.classList.add("chat");
    const historySet = new Set(chatHistory.map(m => m.timestamp));
    const newMessages = chat.filter(m => !historySet.has(m.timestamp));
    chatHistory.push(...newMessages);

    const rendered = await renderFragment(chatView, "components/chatMessages", {
        messages: renderAll ? chatHistory : newMessages,
        you: referenceGiocatore.id,
        notInject: true
    });

    if(renderAll)
        chatView.innerHTML = rendered;
    else
        chatView.innerHTML += rendered;

    chatView.lastElementChild.scrollIntoView({
        behavior: "smooth"
    });

    if(newMessages.length !== 0 && notify) {
        notify = false;
        const lastMessage = newMessages.pop();
        await sendNotifica(lastMessage.username + " - Cucu Ridu", lastMessage.messaggio);
        setTimeout(() => notify = true, delayChat);
    }
};

on("aggiornamentoChat", async (data) => renderChat(data["chat"], data["renderAll"]));

sendBtn.addEventListener("click", () => {
    if(inputMessage.value === "") {
        alert("Pensi di scrivere qualcosa o di spammare il tasto come una scimmia ?!");
        return;
    }

    emit("messaggioChat", {
        message: inputMessage.value,
        id: referenceStanza
    });

    inputMessage.value = "";
});