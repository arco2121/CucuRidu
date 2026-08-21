const connectionPanel = document.getElementById("connectionPanel");
let lockConnectionState = false;
const toggleConnectionState = () => lockConnectionState = !lockConnectionState;

document.addEventListener("DOMContentLoaded", () => {
    const showByConnectionManager = document.querySelectorAll(".showByConnectionManager");

    /**
     * "online"/"offline" sono eventi di RETE del browser (navigator.onLine),
     * NON lo stato vero di Socket.IO: possono disallinearsi. Es. sul
     * telefono si torna da WhatsApp a Chrome, la rete torna su e il browser
     * spara "online" quasi subito, ma il socket (dentro il Worker) magari
     * non si e' ancora accorto di essere morto — coi ping/pong tollerati
     * fino a ~50s (vedi pingInterval/pingTimeout in single.js/cluster.js) o
     * perche i suoi timer erano fermi mentre la scheda era in background.
     * Prima qui si spegneva subito il pannello offline su "online": sembrava
     * tutto a posto ma i messaggi mandati e gli eventi in arrivo (lista
     * giocatori compresa) sparivano nel vuoto finche' il socket non si
     * riconnetteva davvero da solo.
     *
     * "offline" resta un segnale affidabile (niente rete = niente socket):
     * va bene disconnettere subito. "online" invece chiede conferma vera al
     * socket (checkConnection): se e' gia connesso il pannello si spegne
     * subito, altrimenti lo spinge a riconnettersi ORA e sara' il vero
     * evento connect/reconnect a spegnere il pannello quando succede
     * davvero.
     */
    window.addEventListener("offline", () => document.dispatchEvent(stateDisconnected));
    window.addEventListener("online", () => checkConnection());

    // Stesso discorso quando la scheda torna visibile dopo essere stata in
    // background (cambio app su mobile, altra scheda...): non aspettiamo il
    // pingTimeout naturale, controlliamo subito.
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) checkConnection();
    });

    (() => {
        document.addEventListener("doConnected", () => {
            if(lockConnectionState) return;
            connectionPanel.dispatchEvent(hidePanel);
            showByConnectionManager.forEach(pan => pan.dispatchEvent(showPanelCond));
        });

        document.addEventListener("doDisconnected", () => {
            if(lockConnectionState) return;
            showByConnectionManager.forEach(pan => pan.dispatchEvent(hidePanelCond));
            connectionPanel.dispatchEvent(showPanel);
        });
    })();
});