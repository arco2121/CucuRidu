importScripts("/socket.io/socket.io.js");
let socket = null;

const lobbyController = (event = {}) => {
    switch (event.type) {
        case "init": {
            console.log("Initializing...");
            socket = io({
                auth: event.params,
                tryAllTransports: true,
                transports: ["websocket", "polling"],
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 1000,
                pingTimeout: 60000,
                pingInterval: 25000,
                autoConnect: true,
            });

            socket.on("connect", () => postMessage({ event: "connect", params: null }));

            socket.on("disconnect", () => postMessage({ event: "disconnect", params: null }));

            socket.on("reconnect", () => postMessage({ event: "reconnect", params: null }));

            socket.on("reconnect_attempt", () => postMessage({ event: "reconnect_attempt", params: null }));

            socket.on("reconnect_failed", () => postMessage({ event: "reconnect_failed", params: null }));

            socket.on("connect_error", (err) => postMessage({ event: "connect_error", params: err }));

            socket.onAny((tag, ...args) => {
                const data = (args.length > 0 && typeof args[0] === 'object') ? args[0] : args[0];
                postMessage({ event: tag, params: data });
                postMessage({ event: "any", params: null });
            });

            socket.connect();
            break;
        }

        default: socket.emit(event.type, event.params);
    }
};

onmessage = (event) => lobbyController(event.data);