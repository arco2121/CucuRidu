off("aggiornamentoChat");

const chatView = document.getElementById("chat");
const sendBtn = document.getElementById("sendBtn");
const inputMessage = document.getElementById("inputMessage");
let chatHistory = [];
let notify = true;
const delayChat = 2000;

const renderChat = async (chat = []) => {
    if(chat.length + chatHistory.length === 0) {
        chatView.innerHTML = "<h1>Bha... a me sembra tutto morto qui</h1>";
        chatView.classList.remove("chat");
        return;
    }

    chatView.classList.add("chat");
    const historySet = new Set(chatHistory.map(m => m.messaggio));
    const newMessages = chat.filter(m => !historySet.has(m.messaggio));
    chatHistory.push(...newMessages);

    chatView.innerHTML += await renderFragment(chatView, "components/chatMessages", {
        messages: newMessages,
        you: referenceGiocatore.id,
        notInject: true
    });

    chatView.lastElementChild.scrollIntoView({
        behavior: "smooth"
    });

    if(newMessages.length !== 0 && notify) {
        notify = false;
        const lastMessage = newMessages.pop();
        const body = `${lastMessage.username}: ${lastMessage.messaggio}`;
        await sendNotifica("Cucu Ridu - Chat", body);
        setTimeout(() => notify = true, delayChat);
    }
};

on("aggiornamentoChat", async (data) => renderChat(data["chat"]));

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