importScripts("/socket.io/socket.io.js");
let socket = null;

const lobbyController = (event = {}) => {
    switch (event.type) {
        case "init": {
            console.log("Initializing...");
            socket = io({
                auth: event.params,
                transports: ["websocket", "polling"],
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 500,
                pingTimeout: 20000,
                pingInterval: 25000,
                autoConnect: false,
                connectionStateRecovery: {
                    maxDisconnectionDuration: 60 * 1000,
                    skipMiddlewares: true,
                }
            });

            socket.on("connect", () => postMessage({ event: "connect", params: null }));

            socket.on("disconnect", () => postMessage({ event: "disconnect", params: null }));

            socket.on("reconnect", () => postMessage({ event: "reconnect", params: null }));

            socket.on("reconnect_attempt", () => postMessage({ event: "reconnect_attempt", params: null }));

            socket.on("reconnect_failed", () => postMessage({ event: "reconnect_failed", params: null }));

            socket.on("connect_error", (err) => postMessage({ event: "connect_error", params: err }));

            socket.onAny((tag, ...args) => {
                const data = (args.length === 1 && typeof args[0] === 'object') ? args[0] : Object.assign({}, ...args);
                postMessage({ event: "any", params: null });
                postMessage({ event: tag, params: data });
            });

            socket.connect();
            break;
        }

        default: socket.emit(event.type, event.params);
    }
};

onmessage = (event) => lobbyController(event.data);