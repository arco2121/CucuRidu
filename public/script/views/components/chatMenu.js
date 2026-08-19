off("aggiornamentoChat");

const chatView = document.getElementById("chat");
const sendBtn = document.getElementById("sendBtn");
const inputMessage = document.getElementById("inputMessage");
const chatMenu = document.getElementById("chatMenu");
const chatBadge = document.getElementById("chatBadge");
let chatHistory = [];

// Pallino di notifica sul tasto chat: si accende se arriva un messaggio da
// un altro giocatore mentre la chat e' chiusa, si spegne quando la apri.
const chatEAperta = () => !!chatMenu && chatMenu.classList.contains("visible");
chatMenu?.addEventListener("showPanel", () => chatBadge?.classList.remove("chat_badge_visible"));

const chatVuota = `
    <div class="chat_vuota">
        <span class="chat_vuota_faccia">(  ˶ ˘ ³˘)ﾉ</span>
        <span class="chat_vuota_testo sour_gummy_regular_italic">Qui non ha ancora scritto nessuno,<br>rompi tu il ghiaccio</span>
    </div>`;

const scorriInFondo = (istantaneo = false) => {
    if (!chatView) return;
    chatView.scrollTo({
        top: chatView.scrollHeight,
        behavior: istantaneo ? "auto" : "smooth"
    });
};

const renderChat = async (chat = [], renderAll = true) => {
    if (!chatView) return;

    if (chat.length + chatHistory.length === 0) {
        chatView.innerHTML = chatVuota;
        chatView.classList.remove("chat");
        return;
    }

    const historySet = new Set(chatHistory.map(m => m.timestamp));
    const newMessages = chat.filter(m => !historySet.has(m.timestamp));
    chatHistory.push(...newMessages);

    const rendered = await renderFragment(chatView, "components/chatMessages", {
        messages: renderAll ? chatHistory : newMessages,
        you: referenceGiocatore.id,
        notInject: true
    });

    const eraInFondo = chatView.scrollHeight - chatView.scrollTop - chatView.clientHeight < 80;

    chatView.classList.add("chat");
    if (renderAll)
        chatView.innerHTML = rendered;
    else {
        if (chatView.querySelector(".chat_vuota")) chatView.innerHTML = "";
        chatView.appendChild(document.createRange().createContextualFragment(rendered));
    }

    // si scende in automatico solo se stavi gia guardando il fondo, cosi
    // non ti strappa via mentre leggi i messaggi vecchi
    if (renderAll || eraInFondo || newMessages.some(m => m.giocatoreId === referenceGiocatore.id))
        scorriInFondo(renderAll);
};

on("aggiornamentoChat", async (data) => {
    const chat = data["chat"] || [];
    const renderAll = !!data["renderAll"];
    if (!renderAll) {
        const historySet = new Set(chatHistory.map(m => m.timestamp));
        const nuovi = chat.filter(m => !historySet.has(m.timestamp));
        const daAltri = nuovi.some(m => m.giocatoreId !== referenceGiocatore.id);
        if (daAltri && !chatEAperta()) chatBadge?.classList.add("chat_badge_visible");
    }
    await renderChat(chat, renderAll);
});

const adattaAltezza = () => {
    if (!inputMessage) return;
    inputMessage.style.height = "auto";
    inputMessage.style.height = Math.min(inputMessage.scrollHeight, 110) + "px";
};

const inviaMessaggio = () => {
    const testo = (inputMessage?.value || "").trim();
    if (testo === "") {
        alert("Pensi di scrivere qualcosa o di spammare il tasto come una scimmia ?!");
        return;
    }

    emit("messaggioChat", {
        message: testo,
        id: referenceStanza
    });

    inputMessage.value = "";
    adattaAltezza();
    inputMessage.focus();
};

sendBtn?.addEventListener("click", inviaMessaggio);
inputMessage?.addEventListener("input", adattaAltezza);

// Invio con Enter, a capo con Shift+Enter. Sul telefono si usa il bottone.
inputMessage?.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || e.shiftKey) return;
    if (window.matchMedia("(hover: none)").matches) return;
    e.preventDefault();
    inviaMessaggio();
});
