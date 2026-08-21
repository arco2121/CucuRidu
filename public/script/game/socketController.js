importScripts("/socket.io/socket.io.js");
let socket = null;

const socketController = (event = {}) => {
    switch (event.type) {

        case "socketId": {
            postMessage({ event: "socketId", params: socket.id });
            break;
        }
        case "init": {
            console.log("Initializing...");
            socket = io({
                auth: event.params,
                transports: ["websocket", "polling"],
                reconnection: true,
                // 50 ms voleva dire martellare il server con decine di tentativi
                // al secondo appena cadeva la linea: ora si riparte comunque
                // subito ma con un backoff sensato e senza arrendersi mai
                reconnectionDelay: 300,
                reconnectionDelayMax: 4000,
                randomizationFactor: 0.5,
                reconnectionAttempts: Infinity,
                timeout: 20000,
                autoConnect: false
            });

            socket.on("connect", () => postMessage({ event: "connect", params: null }));

            socket.on("disconnect", (motivo) => {
                postMessage({ event: "disconnect", params: { motivo } });
                // se e' stato il server a chiudere, socket.io NON riprova da solo:
                // senza questo il giocatore restava fermo su "disconnesso" per sempre
                if (motivo === "io server disconnect")
                    setTimeout(() => { try { socket.connect(); } catch (e) {} }, 1000);
            });

            // in socket.io v4 questi eventi stanno sul manager, non sul socket:
            // registrati sul socket non si attivavano mai
            socket.io.on("reconnect", () => postMessage({ event: "reconnect", params: null }));

            socket.io.on("reconnect_attempt", () => postMessage({ event: "reconnect_attempt", params: null }));

            socket.io.on("reconnect_failed", () => postMessage({ event: "reconnect_failed", params: null }));

            socket.on("connect_error", (err) => postMessage({ event: "connect_error", params: err }));

            socket.onAny((tag, ...args) => {
                const data = (args.length === 1 && typeof args[0] === 'object') ? args[0] : Object.assign({}, ...args);
                postMessage({ event: "any", params: null });
                postMessage({ event: tag, params: data });
            });

            socket.connect();
            break;
        }

        // Controllo su richiesta: usato quando il browser torna "online" o la
        // scheda torna visibile, per non aspettare fino a pingInterval+pingTimeout
        // prima di accorgersi che il socket era rimasto morto in background.
        case "__checkConnection__": {
            if (socket) {
                if (socket.connected)
                    postMessage({ event: "__connectionCheck__", params: { connected: true } });
                else
                    try { socket.connect(); } catch (e) {}
            }
            break;
        }

        default: socket.emit(event.type, event.params);
    }
};

onmessage = (event) => socketController(event.data);