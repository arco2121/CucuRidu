(function () {
    const isNativeHost = Boolean(
        window.Capacitor?.isNativePlatform?.() || window.Capacitor?.Plugins?.LanServer
    );
    const LanServer = window.Capacitor?.Plugins?.LanServer || null;
    const HTTP_PORT = 3000;
    const WS_PORT = 3001;
    const LAN_TOKEN = "LAN_LOCAL_TOKEN";
    const SESSION_STORAGE_KEY = "cucuRiduLanSession";
    const ROOM_STORAGE_KEY = "cucuRiduLanRoomSnapshot";

    // Disattiva eventuali redirect SSO web di syncIDToken.js / midleChecks.js
    window.__cucuRiduSsoRedirecting = true;

    // Edge-to-edge + safe area per barre Android trasparenti
    const setupEdgeToEdgeViewport = () => {
        let vp = document.querySelector("meta[name='viewport']");
        if (!vp) {
            vp = document.createElement("meta");
            vp.name = "viewport";
            vp.content = "width=device-width, initial-scale=1.0, viewport-fit=cover";
            document.head.appendChild(vp);
        } else if (!/viewport-fit\s*=/i.test(vp.content)) {
            vp.content = vp.content.replace(/,\s*$/, "") + ", viewport-fit=cover";
        }

        if (!document.getElementById("cucuSafeAreaStyle")) {
            const style = document.createElement("style");
            style.id = "cucuSafeAreaStyle";
            style.textContent = `
                html {
                    background-color: var(--background, #FFA9C5);
                    min-height: 100%;
                }
                body {
                    background-color: var(--background, #FFA9C5);
                    min-height: 100dvh;
                    margin: 0;
                    padding-top: env(safe-area-inset-top, 0px);
                    padding-bottom: env(safe-area-inset-bottom, 0px);
                    padding-left: env(safe-area-inset-left, 0px);
                    padding-right: env(safe-area-inset-right, 0px);
                    box-sizing: border-box;
                }
                [data-web-only] {
                    display: none !important;
                }
            `;
            document.head.appendChild(style);
        }
    };
    if (document.head) setupEdgeToEdgeViewport();
    else document.addEventListener("DOMContentLoaded", setupEdgeToEdgeViewport);

    const markExternalNavigation = () => {
        window.__cucuExternalNav = true;
        setTimeout(() => { window.__cucuExternalNav = false; }, 1500);
    };

    const origAnchorClick = HTMLAnchorElement.prototype.click;
    const openExternalUrl = (rawUrl) => {
        if (!rawUrl) return;
        markExternalNavigation();
        if (window.Capacitor?.Plugins?.Browser?.open) {
            window.Capacitor.Plugins.Browser.open({ url: rawUrl }).catch(() => {
                const a = document.createElement("a");
                a.href = rawUrl;
                a.target = "_blank";
                a.rel = "noopener noreferrer";
                origAnchorClick.call(a);
            });
            return;
        }
        const a = document.createElement("a");
        a.href = rawUrl;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        origAnchorClick.call(a);
    };

    // Intercetta anche i link creati dinamicamente (es. tasto "Regole" -> GitHub in index.js)
    // lasciando intatti i download locali (blob:/data: con attributo download)
    HTMLAnchorElement.prototype.click = function () {
        const href = this.getAttribute("href") || this.href || "";
        if (href && !this.hasAttribute("download") && !/^(blob:|data:|#)/i.test(href)) {
            try {
                const parsed = new URL(href, window.location.origin);
                if (parsed.origin !== window.location.origin || this.target === "_blank") {
                    openExternalUrl(parsed.href);
                    return;
                }
            } catch {}
        }
        return origAnchorClick.call(this);
    };

    // Fallback listener Capacitor per tasto/gesture Indietro
    if (window.Capacitor?.Plugins?.App?.addListener) {
        window.Capacitor.Plugins.App.addListener("backButton", () => {
            if (window.CucuRiduBack?.handleBackAction) {
                window.CucuRiduBack.handleBackAction();
            } else if (window.history.length > 1) {
                window.history.back();
            } else {
                window.Capacitor.Plugins.App.exitApp?.();
            }
        });
    }

    const normalizeLanRoute = (rawUrl) => {
        if (!rawUrl || typeof rawUrl !== "string") return rawUrl;
        if (/^(mailto:|tel:|data:|blob:|javascript:|#)/i.test(rawUrl)) return rawUrl;
        try {
            const parsed = new URL(rawUrl, window.location.origin);
            if (parsed.origin !== window.location.origin) return rawUrl;

            let pathname = parsed.pathname;
            if (pathname.length > 1 && pathname.endsWith("/")) pathname = pathname.slice(0, -1);

            if (pathname === "/" || pathname === "/home" || pathname === "/index") {
                pathname = "/index.html";
            } else if (pathname === "/creaStanza") {
                pathname = "/creaStanza.html";
            } else if (/^\/partecipaStanza\/([a-zA-Z0-9_-]+)$/.test(pathname)) {
                const code = pathname.match(/^\/partecipaStanza\/([a-zA-Z0-9_-]+)$/)[1].toUpperCase();
                parsed.searchParams.set("stanza", code);
                pathname = "/partecipaStanzaProfile.html";
            } else if (pathname === "/partecipaStanza" || pathname === "/partecipaStanza.html") {
                pathname = parsed.searchParams.get("stanza")
                    ? "/partecipaStanzaProfile.html"
                    : "/partecipaStanza.html";
            } else if (pathname === "/game") {
                pathname = "/game.html";
            } else if (pathname === "/creaMazzo" || pathname === "/creaMazzi") {
                pathname = "/creaMazzo.html";
            } else if (pathname === "/error") {
                pathname = "/error.html";
            } else if (pathname === "/offline") {
                pathname = "/offline.html";
            } else {
                return rawUrl;
            }

            parsed.pathname = pathname;
            return parsed.pathname + parsed.search + parsed.hash;
        } catch {
            return rawUrl;
        }
    };

    const getSavedSession = () => {
        try {
            return JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY) || "null");
        } catch {
            return null;
        }
    };
    const saveSessionData = (data) => {
        const merged = { ...(getSavedSession() || {}), ...data };
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(merged));
        return merged;
    };
    const clearSessionData = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        sessionStorage.removeItem(ROOM_STORAGE_KEY);
    };

    // Sessioni LAN: l'Host e' l'unica autorita'. Rilascia un token per ogni giocatore e l'identita'
    // di un ospite si ricava SOLO da quel token, mai dallo userId che dichiara lui.
    const TOKENS_STORAGE_KEY = "cucuRiduLanTokens";
    const SETTINGS_STORAGE_KEY = "cucuRiduSettings";
    const readJson = (storage, key) => {
        try {
            return JSON.parse(storage.getItem(key) || "{}") || {};
        } catch {
            return {};
        }
    };

    // Lato Host: vive quanto lo snapshot della stanza (sessionStorage)
    const lanSessions = {
        resolve(token) {
            const all = readJson(sessionStorage, TOKENS_STORAGE_KEY);
            return typeof token === "string" && Object.prototype.hasOwnProperty.call(all, token) ? all[token] : null;
        },
        issue(userId, stanzaId) {
            const all = readJson(sessionStorage, TOKENS_STORAGE_KEY);
            const existing = Object.keys(all).find((t) => all[t].userId === userId && all[t].stanzaId === stanzaId);
            if (existing) return existing;
            const token = Array.from(window.crypto.getRandomValues(new Uint8Array(32)),
                (b) => b.toString(16).padStart(2, "0")).join("");
            all[token] = { userId, stanzaId };
            sessionStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(all));
            return token;
        },
        revoke(token) {
            const all = readJson(sessionStorage, TOKENS_STORAGE_KEY);
            if (!this.resolve(token)) return;
            delete all[token];
            sessionStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(all));
        }
    };

    // Lato Ospite: il token sta in settings.savingToken, come nella versione web
    const getSavingToken = () => {
        const token = readJson(localStorage, SETTINGS_STORAGE_KEY).savingToken;
        return typeof token === "string" && token ? token : null;
    };
    const setSavingToken = (token) => {
        const settings = readJson(localStorage, SETTINGS_STORAGE_KEY);
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ ...settings, savingToken: token }));
    };

    // 1. Intercetta il redirect da creaStanza / partecipaStanzaProfile con ?nome=...&pfp=...
    const currentUrl = new URL(window.location.href);
    const nomeParam = currentUrl.searchParams.get("nome");
    const pfpParam = currentUrl.searchParams.get("pfp");
    const stanzaParam = currentUrl.searchParams.get("stanza");

    if (nomeParam && pfpParam) {
        saveSessionData({
            nome: nomeParam,
            pfp: pfpParam,
            stanzaId: stanzaParam ? stanzaParam.toUpperCase() : null,
            userId: null,
            action: stanzaParam ? "Partecipa" : "Crea"
        });
        window.location.replace("/game.html");
        return;
    }

    // 2. Normalizza eventuali route senza .html
    const normalizedCurrent = normalizeLanRoute(window.location.href);
    const currentRelative = window.location.pathname + window.location.search + window.location.hash;
    if (normalizedCurrent && normalizedCurrent !== window.location.href && normalizedCurrent !== currentRelative) {
        window.location.replace(normalizedCurrent);
        return;
    }

    // 3. Popola <meta name="dataFromBackEnd"> SUBITO (prima di globalConfig.js)
    const bootstrapData = {
        lanMode: true,
        isHost: isNativeHost,
        stanza: (stanzaParam || "").toUpperCase(),
        stanzaId: (stanzaParam || "").toUpperCase(),
        pfp: "",
        nome: "",
        token: LAN_TOKEN,
        userId: "",
        action: null,
        loadToken: false,
        openSettings: currentUrl.searchParams.get("openSettings") === "true"
    };

    if (window.location.pathname.endsWith("/game.html")) {
        const saved = getSavedSession();
        if (!saved || (!saved.nome && !saved.userId)) {
            window.location.replace("/index.html");
            return;
        }
        Object.assign(bootstrapData, saved);
        if (saved.stanzaId) bootstrapData.stanza = saved.stanzaId;
    }

    const syncMetaDataFromBackEnd = () => {
        try {
            const meta = document.querySelector("meta[name='dataFromBackEnd']");
            if (!meta) return false;
            const existing = JSON.parse(meta.getAttribute("content") || "{}");
            meta.setAttribute("content", JSON.stringify({ ...existing, ...bootstrapData }));
            return true;
        } catch (e) {
            console.error("[LAN] Errore sync meta dataFromBackEnd:", e);
            return false;
        }
    };
    if (!syncMetaDataFromBackEnd()) {
        document.addEventListener("DOMContentLoaded", syncMetaDataFromBackEnd);
    }

    // L'ospite ha caricato la pagina dal server dell'Host: la sua origin e' gia' il link da condividere
    let hostJoinUrl = isNativeHost ? "" : window.location.origin;
    const isValidLanUrl = (u) => typeof u === "string" && /^https?:\/\/\d+\.\d+\.\d+\.\d+/i.test(u);

    const getLanDisplayLabel = () =>
        isValidLanUrl(hostJoinUrl) ? hostJoinUrl : "Nessun Wi-Fi / Hotspot attivo";

    const updateLanUrlDisplays = () => {
        const label = getLanDisplayLabel();
        document.querySelectorAll("[data-lan-join-url]").forEach((el) => {
            el.textContent = label;
        });
    };

    const ensureHostServerStarted = async () => {
        if (!isNativeHost || !LanServer) return hostJoinUrl;
        try {
            const info = await LanServer.start({ httpPort: HTTP_PORT, wsPort: WS_PORT });
            const rawIp = info?.ip || "";
            const resolvedUrl = info?.joinUrl || info?.httpUrl || (rawIp ? `http://${rawIp}:${HTTP_PORT}` : "");
            hostJoinUrl = isValidLanUrl(resolvedUrl) ? resolvedUrl : "";
            window.__LAN_JOIN_URL__ = hostJoinUrl;
            updateLanUrlDisplays();
        } catch (e) {
            console.warn("[LAN] LanServer.start:", e?.message || e);
        }
        return hostJoinUrl;
    };
    const hostReadyPromise = isNativeHost ? ensureHostServerStarted() : Promise.resolve(hostJoinUrl);

    // 4. Mini-Express in memoria per eseguire il vero appConfig.js
    const createExpressBridge = () => {
        const routes = { GET: new Map(), POST: new Map() };
        const register = (method, paths, ...handlers) => {
            const list = Array.isArray(paths) ? paths : [paths];
            for (const p of list) routes[method].set(p, handlers);
        };
        return {
            set: () => {},
            use: () => {},
            get: (paths, ...handlers) => register("GET", paths, ...handlers),
            post: (paths, ...handlers) => register("POST", paths, ...handlers),
            hasRoute: (method, pathname) => Boolean(routes[method]?.has(pathname)),
            handle: async (method, rawUrl, { body = {}, headers = {} } = {}) => {
                const parsed = new URL(rawUrl, window.location.origin);
                const handlers = routes[method]?.get(parsed.pathname);
                if (!handlers) return null;

                const query = Object.fromEntries(parsed.searchParams.entries());
                return new Promise((resolve, reject) => {
                    let statusCode = 200;
                    const resHeaders = {};
                    const req = {
                        method,
                        originalUrl: parsed.pathname + parsed.search,
                        protocol: "http",
                        headers,
                        body,
                        query,
                        params: {},
                        session: { storeData: getSavedSession() || {} },
                        get: (name) => headers[String(name).toLowerCase()] || window.location.host
                    };
                    const res = {
                        headersSent: false,
                        status(code) { statusCode = code; return this; },
                        header(k, v) { resHeaders[k.toLowerCase()] = v; return this; },
                        setHeader(k, v) { resHeaders[k.toLowerCase()] = v; return this; },
                        json(payload) {
                            this.headersSent = true;
                            resolve({ status: statusCode, headers: resHeaders, body: JSON.stringify(payload), data: payload });
                        },
                        send(payload) {
                            this.headersSent = true;
                            const isObj = payload !== null && typeof payload === "object";
                            resolve({
                                status: statusCode,
                                headers: resHeaders,
                                body: isObj ? JSON.stringify(payload) : String(payload),
                                data: payload
                            });
                        },
                        redirect(target) {
                            this.headersSent = true;
                            resolve({ status: 302, headers: { location: target }, body: "", data: null });
                        },
                        render() { this.send(""); },
                        sendFile() { this.send(""); }
                    };
                    let idx = 0;
                    const next = (err) => {
                        if (err) return reject(err);
                        const fn = handlers[idx++];
                        if (!fn) return resolve({ status: statusCode, headers: resHeaders, body: "", data: null });
                        Promise.resolve(fn(req, res, next)).catch(reject);
                    };
                    next();
                });
            }
        };
    };

    const fakeSession = {
        setupSession: () => (req, res, next) => next && next(),
        get: async () => getSavedSession() || {},
        // sincrona come Session.set: il valore finisce in "fallback" e poi in savingToken
        set: (req, data) => {
            const merged = saveSessionData(data);
            return isNativeHost && merged.userId && merged.stanzaId
                ? lanSessions.issue(merged.userId, merged.stanzaId)
                : null;
        },
        validate: async (checks, auth) => ({
            validation: LAN_TOKEN,
            stanzaId: auth?.stanzaId || null,
            userId: auth?.userId || null
        }),
        invalidate: async (req, token) => {
            if (token) lanSessions.revoke(token);
            clearSessionData();
        }
    };

    // 5. Mini-Socket.IO server in memoria per eseguire il vero serverConfig.js
    const createServerSocketBridge = () => {
        const middlewares = [];
        const connectionHandlers = [];
        const socketsById = new Map();
        const rooms = new Map();

        const joinRoom = (socketId, roomId) => {
            if (!roomId) return;
            if (!rooms.has(roomId)) rooms.set(roomId, new Set());
            rooms.get(roomId).add(socketId);
        };
        const leaveRoom = (socketId, roomId) => {
            const set = rooms.get(roomId);
            if (!set) return;
            set.delete(socketId);
            if (set.size === 0) rooms.delete(roomId);
        };
        const emitToRoom = (roomId, event, args, excludeId = null) => {
            const set = rooms.get(roomId);
            if (!set) return;
            for (const targetId of Array.from(set)) {
                if (targetId === excludeId) continue;
                socketsById.get(targetId)?._deliverToClient(event, args);
            }
        };

        const io = {
            use: (fn) => middlewares.push(fn),
            on: (event, fn) => { if (event === "connection") connectionHandlers.push(fn); },
            to: (roomId) => ({ emit: (event, ...args) => emitToRoom(roomId, event, args) }),
            in: (roomId) => ({
                fetchSockets: async () =>
                    Array.from(rooms.get(roomId) || []).map((id) => socketsById.get(id)).filter(Boolean)
            }),
            socketsLeave: (roomId) => {
                const set = rooms.get(roomId);
                if (!set) return;
                for (const id of Array.from(set)) {
                    socketsById.get(id)?.rooms?.delete(roomId);
                    leaveRoom(id, roomId);
                }
            },
            sockets: {
                sockets: socketsById,
                adapter: { rooms }
            }
        };

        const attachClientSocket = (socketId, auth, deliverToClient) => {
            if (socketsById.has(socketId)) {
                const old = socketsById.get(socketId);
                for (const r of old.rooms) leaveRoom(socketId, r);
                socketsById.delete(socketId);
            }

            const handlers = new Map();
            const joinedRooms = new Set([socketId]);
            joinRoom(socketId, socketId);

            const socket = {
                id: socketId,
                handshake: { auth: { validation: LAN_TOKEN, ...(auth || {}) } },
                data: {},
                rooms: joinedRooms,
                on: (ev, fn) => {
                    if (!handlers.has(ev)) handlers.set(ev, []);
                    handlers.get(ev).push(fn);
                },
                join: (roomId) => { joinedRooms.add(roomId); joinRoom(socketId, roomId); },
                leave: (roomId) => { joinedRooms.delete(roomId); leaveRoom(socketId, roomId); },
                emit: (ev, ...args) => deliverToClient(ev, args),
                to: (roomId) => ({ emit: (ev, ...args) => emitToRoom(roomId, ev, args, socketId) }),
                disconnect: () => detachClientSocket(socketId, "server disconnect"),
                _deliverToClient: deliverToClient,
                _receiveFromClient: async (ev, args = []) => {
                    const list = handlers.get(ev) || [];
                    for (const fn of list) {
                        await Promise.resolve(fn(...args));
                    }
                    persistHostRoomSnapshot();
                }
            };

            socketsById.set(socketId, socket);

            return new Promise((resolve) => {
                const runMiddlewares = (idx = 0) => {
                    if (idx >= middlewares.length) {
                        for (const fn of connectionHandlers) fn(socket);
                        resolve(socket);
                        return;
                    }
                    try {
                        Promise.resolve(
                            middlewares[idx](socket, (err) => {
                                if (err) {
                                    deliverToClient("connect_error", [{ message: err.message || String(err) }]);
                                    socketsById.delete(socketId);
                                    resolve(null);
                                    return;
                                }
                                runMiddlewares(idx + 1);
                            })
                        ).catch((err) => {
                            deliverToClient("connect_error", [{ message: err?.message || String(err) }]);
                            socketsById.delete(socketId);
                            resolve(null);
                        });
                    } catch (err) {
                        deliverToClient("connect_error", [{ message: err?.message || String(err) }]);
                        socketsById.delete(socketId);
                        resolve(null);
                    }
                };
                runMiddlewares();
            });
        };

        const detachClientSocket = async (socketId, reason = "transport close") => {
            const socket = socketsById.get(socketId);
            if (!socket) return;
            await socket._receiveFromClient("disconnecting", [reason]);
            for (const r of Array.from(socket.rooms)) leaveRoom(socketId, r);
            socketsById.delete(socketId);
            await socket._receiveFromClient("disconnect", [reason]);
        };

        return { io, attachClientSocket, detachClientSocket };
    };

    const Engine = window.CucuRiduEngine;
    let Stanze = null;
    let expressApp = null;
    let socketBridge = null;

    const persistHostRoomSnapshot = () => {
        if (!isNativeHost || !Stanze) return;
        try {
            const firstEntry = Stanze.entries().next();
            if (firstEntry.done) {
                sessionStorage.removeItem(ROOM_STORAGE_KEY);
                return;
            }
            const [, stanza] = firstEntry.value;
            if (!stanza || stanza.stato === Engine?.StatoStanza?.END) {
                sessionStorage.removeItem(ROOM_STORAGE_KEY);
                return;
            }
            sessionStorage.setItem(ROOM_STORAGE_KEY, JSON.stringify(stanza.toJSON()));
        } catch (e) {
            console.error("[LAN] Errore salvataggio snapshot stanza:", e);
        }
    };

    const restoreHostRoomSnapshot = async () => {
        if (!isNativeHost || !Stanze || !Engine?.Stanza) return;
        try {
            const raw = sessionStorage.getItem(ROOM_STORAGE_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (!parsed?.id) return;
            const restored = await Engine.Stanza.fromJSON(parsed);
            if (restored && restored.stato !== Engine.StatoStanza.END) {
                Stanze.set(restored.id, restored);
            }
        } catch (e) {
            console.error("[LAN] Errore ripristino snapshot stanza:", e);
        }
    };

    let restorePromise = Promise.resolve();
    if (Engine?.appConfig && Engine?.serverConfig && Engine?.SingleStanze) {
        Stanze = new Engine.SingleStanze();
        const generationMemory = new Set();
        const archivioSegnalazioni = new Engine.SegnalazioniLocali();
        expressApp = createExpressBridge();
        socketBridge = createServerSocketBridge();

        Engine.appConfig(
            expressApp,
            fakeSession,
            LAN_TOKEN,
            Stanze,
            [],
            true,
            30 * 60 * 1000,
            { version: "1.6.0", cluster: false },
            archivioSegnalazioni,
            null,
            false
        );
        Engine.serverConfig(
            socketBridge.io,
            fakeSession,
            LAN_TOKEN,
            Stanze,
            generationMemory,
            30 * 60 * 1000,
            archivioSegnalazioni
        );
        restorePromise = restoreHostRoomSnapshot();
    }

    // 6. Intercetta <img src="/qrCode..."> delegando al vero appConfig.js e normalizzando l'URL
    const originalSrcDescriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, "src");
    if (originalSrcDescriptor?.set) {
        Object.defineProperty(HTMLImageElement.prototype, "src", {
            configurable: true,
            enumerable: originalSrcDescriptor.enumerable,
            get() {
                return originalSrcDescriptor.get.call(this);
            },
            set(value) {
                if (typeof value === "string" && value.startsWith("/qrCode") && expressApp) {
                    (async () => {
                        await hostReadyPromise;
                        const parsed = new URL(value, window.location.origin);
                        const rawTarget = parsed.searchParams.get("url") || "";
                        let fixedTarget = hostJoinUrl;
                        if (rawTarget) {
                            try {
                                const targetUrl = new URL(rawTarget, window.location.origin);
                                const normalizedPath = normalizeLanRoute(targetUrl.pathname + targetUrl.search + targetUrl.hash);
                                fixedTarget = hostJoinUrl.replace(/\/$/, "") + normalizedPath;
                            } catch {
                                fixedTarget = rawTarget.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, hostJoinUrl);
                            }
                        }
                        parsed.searchParams.set("url", fixedTarget);
                        const res = await expressApp.handle("GET", parsed.pathname + parsed.search);
                        if (res?.body) {
                            const svgUri = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(res.body);
                            originalSrcDescriptor.set.call(this, svgUri);
                        }
                    })();
                    return;
                }
                originalSrcDescriptor.set.call(this, value);
            }
        });
    }

    // 7. Intercetta fetch() sulle API di appConfig.js
    const nativeFetch = window.fetch.bind(window);
    const pendingGuestChecks = new Map();

    window.fetch = async (input, init = {}) => {
        const rawUrl = typeof input === "string" ? input : input?.url || "";
        const method = (init?.method || (typeof input !== "string" ? input?.method : "GET") || "GET").toUpperCase();

        let pathname = "";
        try {
            pathname = new URL(rawUrl, window.location.origin).pathname;
        } catch {
            return nativeFetch(input, init);
        }

        const jsonResponse = (payload) => new Response(JSON.stringify(payload), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

        if (method === "POST" && expressApp?.hasRoute("POST", pathname)) {
            let body = {};
            try {
                if (typeof init.body === "string") body = JSON.parse(init.body);
            } catch {}

            if (pathname === "/doRoomExists" && !isNativeHost) {
                const roomId = String(body.roomId || "").toUpperCase();
                const exists = await queryHostRoomExists(roomId);
                return new Response(JSON.stringify({ result: exists }), {
                    status: 200,
                    headers: { "Content-Type": "application/json" }
                });
            }

            if (pathname === "/saveGameReference") {
                saveSessionData({
                    userId: body.userId,
                    stanzaId: body.stanzaId,
                    action: null
                });
                await new Promise((r) => setTimeout(r, 120));
                // il token dell'ospite lo rilascia l'Host (messaggio __session__)
                if (!isNativeHost) return jsonResponse({ result: true, fallback: getSavingToken() });
            }

            if (pathname === "/deleteGameReference" && !isNativeHost) {
                const token = body.token || getSavingToken();
                if (token && guestWs?.readyState === WebSocket.OPEN) {
                    guestWs.send(JSON.stringify({ event: "__deleteSession__", data: { token } }));
                }
                setSavingToken(null);
                clearSessionData();
                return jsonResponse({ result: true });
            }

            const result = await expressApp.handle("POST", pathname, { body });
            return new Response(result.body, {
                status: result.status,
                headers: { "Content-Type": "application/json", ...result.headers }
            });
        }

        return nativeFetch(input, init);
    };

    document.addEventListener("click", (e) => {
        const anchor = e.target?.closest?.("a[href]");
        if (!anchor) return;
        const href = anchor.getAttribute("href");
        if (!href || /^(#|javascript:|data:|blob:)/i.test(href)) return;
        try {
            const parsed = new URL(href, window.location.origin);
            if (parsed.origin !== window.location.origin || anchor.target === "_blank") {
                e.preventDefault();
                openExternalUrl(parsed.href);
                return;
            }
        } catch {}
        const fixed = normalizeLanRoute(href);
        if (fixed && fixed !== href) anchor.setAttribute("href", fixed);
    }, true);

    // 8. Collega gli elementi LAN definiti direttamente nei file .ejs
    const bindLanCustomElements = async () => {
        if (typeof window.navigateWithLoading === "function" && !window.navigateWithLoading.__lanWrapped) {
            const origNav = window.navigateWithLoading;
            window.navigateWithLoading = (target, ...rest) => {
                const fixed = normalizeLanRoute(target);
                return origNav(fixed || target, ...rest);
            };
            window.navigateWithLoading.__lanWrapped = true;
        }

        if (isNativeHost) await hostReadyPromise;

        let obs = null;
        const syncElements = () => {
            if (obs) obs.disconnect();
            try {
                // Nasconde gli elementi riservati al sito online
                document.querySelectorAll("[data-web-only]").forEach((el) => {
                    if (el.style.display !== "none") {
                        el.style.display = "none";
                    }
                });

                // Mostra gli elementi riservati alla modalità LAN (e opzionalmente solo Host)
                document.querySelectorAll("[data-lan-only]").forEach((el) => {
                    if (el.hasAttribute("data-lan-host-only") && !isNativeHost) return;
                    if (el.style.display === "none") {
                        el.style.display = "";
                    }
                });

                // Aggiorna tutti i testi con data-lan-join-url solo se il testo è cambiato
                const label = getLanDisplayLabel();
                document.querySelectorAll("[data-lan-join-url]").forEach((el) => {
                    if (el.textContent !== label) {
                        el.textContent = label;
                    }
                });

                // Collega tutti i bottoni con data-lan-refresh-ip
                document.querySelectorAll("[data-lan-refresh-ip]").forEach((btn) => {
                    if (btn.dataset.lanRefreshBound) return;
                    btn.dataset.lanRefreshBound = "1";
                    btn.addEventListener("click", async (e) => {
                        e.stopPropagation();
                        await ensureHostServerStarted();
                        syncElements();
                    });
                });
            } finally {
                if (obs && document.body) {
                    obs.observe(document.body, { childList: true, subtree: true });
                }
            }
        };

        obs = new MutationObserver(syncElements);
        syncElements();
    };
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", bindLanCustomElements);
    } else {
        bindLanCustomElements();
    }

    // 9. Ponte WebSocket LAN per client remoti connessi all'Hotspot dell'Host
    const clientAttachPromises = new Map();
    const sendWsToClient = (clientId, event, data) => {
        if (!LanServer?.sendToClient) return;
        LanServer.sendToClient({
            clientId,
            payload: JSON.stringify({ event, data })
        }).catch((err) => console.warn("[LAN] sendToClient fallito:", err?.message || err));
    };

    // Identita' di un ospite: null = dice di essere qualcuno ma non ha un token valido
    const authForGuest = (claimed) => {
        const requested = String(claimed.stanzaId || "").toUpperCase();
        const session = lanSessions.resolve(claimed.token);
        if (session && (!requested || requested === session.stanzaId)) {
            return { userId: session.userId, stanzaId: session.stanzaId, token: claimed.token };
        }
        if (claimed.userId) return null;
        return { userId: "", stanzaId: requested };
    };

    // Prima di ogni confermaStanza l'ospite riceve il token del proprio giocatore
    const deliverToGuest = (clientId) => (ev, args) => {
        if (ev === "confermaStanza") {
            const { giocatoreId, referenceStanza } = socketBridge.io.sockets.sockets.get(clientId)?.data || {};
            if (giocatoreId && referenceStanza) {
                sendWsToClient(clientId, "__session__", {
                    token: lanSessions.issue(giocatoreId, referenceStanza),
                    userId: giocatoreId,
                    stanzaId: referenceStanza
                });
            }
        }
        sendWsToClient(clientId, ev, args);
    };

    if (isNativeHost && LanServer?.addListener && socketBridge) {
        (async () => {
            await hostReadyPromise;
            try { await LanServer.removeAllListeners?.(); } catch {}

            LanServer.addListener("clientMessage", async ({ clientId, payload }) => {
                try {
                    const msg = typeof payload === "string" ? JSON.parse(payload) : payload;
                    if (!msg || typeof msg !== "object") return;

                    const evName = msg.event || msg.type;
                    const evData = msg.data !== undefined ? msg.data : msg;

                    if (evName === "__ping__") return;

                    if (evName === "__hello__") {
                        const p = restorePromise.then(() => {
                            const auth = authForGuest(evData?.auth || {});
                            if (!auth) {
                                sendWsToClient(clientId, "connect_error", [{ message: "SESSION_EXPIRED" }]);
                                return null;
                            }
                            return socketBridge.attachClientSocket(clientId, auth, deliverToGuest(clientId));
                        });
                        clientAttachPromises.set(clientId, p);
                        const attached = await p;
                        if (attached) {
                            sendWsToClient(clientId, "__helloAck__", { clientId });
                        }
                        return;
                    }

                    if (evName === "__checkSession__") {
                        await restorePromise;
                        const session = lanSessions.resolve(evData?.token);
                        const stanza = session ? await Stanze.get(session.stanzaId) : null;
                        const active = Boolean(stanza && stanza.stato !== Engine.StatoStanza.END
                            && stanza.trovaGiocatore(session.userId));
                        sendWsToClient(clientId, "__checkSessionResult__", {
                            reqId: evData?.reqId || "",
                            active,
                            userId: active ? session.userId : null,
                            stanzaId: active ? session.stanzaId : null
                        });
                        return;
                    }

                    if (evName === "__deleteSession__") {
                        lanSessions.revoke(evData?.token);
                        return;
                    }

                    if (evName === "__doRoomExists__") {
                        const roomId = String(evData?.roomId || "").toUpperCase();
                        const reqId = evData?.reqId || "";
                        const res = await expressApp.handle("POST", "/doRoomExists", { body: { roomId } });
                        sendWsToClient(clientId, "__doRoomExistsResult__", {
                            reqId,
                            result: Boolean(res?.data?.result)
                        });
                        return;
                    }

                    if (evName) {
                        if (clientAttachPromises.has(clientId)) {
                            await clientAttachPromises.get(clientId);
                        }
                        const sock = socketBridge.io.sockets.sockets.get(clientId);
                        const args = Array.isArray(evData) ? evData : (evData !== undefined ? [evData] : []);
                        // sessione gia' ripristinata: un secondo partecipaStanza creerebbe un doppione
                        if (sock && evName === "partecipaStanza" && sock.data.giocatoreId
                            && sock.data.referenceStanza === args[0]?.id) {
                            await sock._receiveFromClient("__sincronizza__", [{ id: args[0].id, vista: "" }]);
                            return;
                        }
                        if (sock) await sock._receiveFromClient(evName, args);
                    }
                } catch (e) {
                    console.error("[LAN] Messaggio client non valido:", e);
                }
            });

            LanServer.addListener("clientDisconnected", ({ clientId }) => {
                clientAttachPromises.delete(clientId);
                socketBridge.detachClientSocket(clientId, "transport close");
            });
        })();
    }

    // 10. Connessione WebSocket lato Ospite (PC / altro telefono) verso ws://<IP-Host>:3001
    let guestWs = null;
    let guestPingTimer = null;

    const startGuestPing = (ws) => {
        if (guestPingTimer) clearInterval(guestPingTimer);
        guestPingTimer = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ event: "__ping__", data: {} }));
            }
        }, 3000);
    };

    const ensureGuestWs = () => {
        if (guestWs && (guestWs.readyState === WebSocket.OPEN || guestWs.readyState === WebSocket.CONNECTING)) {
            return guestWs;
        }
        const wsHost = window.location.hostname || "192.168.43.1";
        const wsUrl = `ws://${wsHost}:${WS_PORT}`;
        guestWs = new WebSocket(wsUrl);

        guestWs.addEventListener("open", () => {
            startGuestPing(guestWs);
        });

        guestWs.addEventListener("message", (evt) => {
            try {
                const msg = JSON.parse(evt.data);
                const evName = msg.event || msg.type;
                const evData = msg.data !== undefined ? msg.data : msg;

                if (evName === "__doRoomExistsResult__") {
                    const reqId = evData?.reqId || "";
                    if (pendingGuestChecks.has(reqId)) {
                        const { resolve, timer } = pendingGuestChecks.get(reqId);
                        clearTimeout(timer);
                        pendingGuestChecks.delete(reqId);
                        resolve(Boolean(evData?.result));
                    } else if (pendingGuestChecks.size === 1) {
                        const [onlyKey, entry] = pendingGuestChecks.entries().next().value;
                        clearTimeout(entry.timer);
                        pendingGuestChecks.delete(onlyKey);
                        entry.resolve(Boolean(evData?.result));
                    }
                }
            } catch {}
        });

        guestWs.addEventListener("error", () => {
            console.warn(`[LAN] Errore connessione WebSocket verso ${wsUrl}`);
        });

        guestWs.addEventListener("close", () => {
            if (guestPingTimer) {
                clearInterval(guestPingTimer);
                guestPingTimer = null;
            }
            for (const [reqId, { resolve, timer }] of pendingGuestChecks.entries()) {
                clearTimeout(timer);
                pendingGuestChecks.delete(reqId);
                resolve(false);
            }
        });

        return guestWs;
    };

    const queryHostRoomExists = (roomId) => new Promise((resolve) => {
        const ws = ensureGuestWs();
        const reqId = "chk_" + Math.random().toString(36).slice(2, 10);
        const timer = setTimeout(() => {
            pendingGuestChecks.delete(reqId);
            console.warn("[LAN] Timeout verifica stanza sull'Host");
            resolve(false);
        }, 3500);
        pendingGuestChecks.set(reqId, { resolve, timer });
        const send = () => ws.send(JSON.stringify({ event: "__doRoomExists__", data: { reqId, roomId } }));
        if (ws.readyState === WebSocket.OPEN) send();
        else ws.addEventListener("open", send, { once: true });
    });

    // Ospite con una partita ancora aperta: da home/profilo torna direttamente in gioco
    const resumeGuestSession = () => {
        const token = getSavingToken();
        if (isNativeHost || !token || window.location.pathname.endsWith("/game.html")) return;
        const ws = ensureGuestWs();
        const reqId = "ses_" + Math.random().toString(36).slice(2, 10);
        const onResult = (evt) => {
            let msg;
            try { msg = JSON.parse(evt.data); } catch { return; }
            if (msg.event !== "__checkSessionResult__" || msg.data?.reqId !== reqId) return;
            ws.removeEventListener("message", onResult);
            if (!msg.data.active) {
                setSavingToken(null);
                return;
            }
            saveSessionData({ userId: msg.data.userId, stanzaId: msg.data.stanzaId, action: null });
            window.location.replace("/game.html");
        };
        ws.addEventListener("message", onResult);
        const send = () => ws.send(JSON.stringify({ event: "__checkSession__", data: { reqId, token } }));
        if (ws.readyState === WebSocket.OPEN) send();
        else ws.addEventListener("open", send, { once: true });
    };
    resumeGuestSession();

    // 11. Factory del socket client
    const createSocket = (opts = {}) => {
        const listeners = new Map();
        const anyListeners = [];
        let hostAttachPromise = Promise.resolve();
        let manualDisconnect = false;
        let reconnectTimer = null;
        const guestOutbox = [];

        const dispatchLocal = (ev, args = []) => {
            for (const fn of anyListeners) {
                try { fn(ev, ...args); } catch (e) { console.error(`[LAN:any:${ev}]`, e); }
            }
            for (const fn of listeners.get(ev) || []) {
                try { fn(...args); } catch (e) { console.error(`[LAN:client:${ev}]`, e); }
            }
        };

        const scheduleGuestReconnect = () => {
            if (isNativeHost || manualDisconnect || reconnectTimer) return;
            reconnectTimer = setTimeout(() => {
                reconnectTimer = null;
                if (!clientSocket.connected && !manualDisconnect) {
                    clientSocket.connect();
                }
            }, 1500);
        };

        const flushGuestOutbox = (ws) => {
            while (guestOutbox.length && ws && ws.readyState === WebSocket.OPEN && clientSocket.connected) {
                ws.send(guestOutbox.shift());
            }
        };

        const clientSocket = {
            id: isNativeHost ? "HOST_LOCAL" : "GUEST_" + Math.random().toString(36).slice(2, 9),
            connected: false,
            auth: opts.auth || {},
            io: { on() {}, off() {} },
            on(ev, fn) {
                if (!listeners.has(ev)) listeners.set(ev, []);
                listeners.get(ev).push(fn);
                return this;
            },
            onAny(fn) {
                anyListeners.push(fn);
                return this;
            },
            off(ev, fn) {
                if (!listeners.has(ev)) return this;
                if (!fn) listeners.delete(ev);
                else listeners.set(ev, listeners.get(ev).filter((f) => f !== fn));
                return this;
            },
            connect() {
                manualDisconnect = false;
                if (clientSocket.connected) return this;
                if (isNativeHost) {
                    hostAttachPromise = Promise.all([hostReadyPromise, restorePromise]).then(async () => {
                        const saved = getSavedSession();
                        const auth = {
                            ...clientSocket.auth,
                            stanzaId: clientSocket.auth.stanzaId || saved?.stanzaId || "",
                            userId: clientSocket.auth.userId || saved?.userId || ""
                        };
                        const attached = await socketBridge.attachClientSocket(clientSocket.id, auth, dispatchLocal);
                        if (attached) {
                            clientSocket.connected = true;
                            dispatchLocal("connect");
                        }
                    });
                } else {
                    const ws = ensureGuestWs();
                    if (!ws.__cucuClientBound) {
                        ws.__cucuClientBound = true;
                        ws.addEventListener("message", (evt) => {
                            try {
                                const msg = JSON.parse(evt.data);
                                const evName = msg.event || msg.type;
                                const evData = msg.data !== undefined ? msg.data : msg;

                                if (evName === "__helloAck__") {
                                    clientSocket.connected = true;
                                    dispatchLocal("connect");
                                    flushGuestOutbox(ws);
                                    return;
                                }
                                if (evName === "__session__") {
                                    setSavingToken(evData.token);
                                    saveSessionData({ userId: evData.userId, stanzaId: evData.stanzaId, action: null });
                                    return;
                                }
                                if (evName && !evName.startsWith("__")) {
                                    const args = Array.isArray(evData) ? evData : (evData !== undefined ? [evData] : []);
                                    dispatchLocal(evName, args);
                                }
                            } catch (e) {
                                console.error("[LAN] Errore parsing messaggio WS:", e);
                            }
                        });
                        ws.addEventListener("close", () => {
                            const wasConnected = clientSocket.connected;
                            clientSocket.connected = false;
                            if (wasConnected) dispatchLocal("disconnect", ["transport close"]);
                            scheduleGuestReconnect();
                        });
                        ws.addEventListener("error", () => {
                            scheduleGuestReconnect();
                        });
                    }

                    const sendHello = () => {
                        const saved = getSavedSession();
                        const auth = {
                            ...clientSocket.auth,
                            stanzaId: clientSocket.auth.stanzaId || saved?.stanzaId || "",
                            userId: clientSocket.auth.userId || saved?.userId || "",
                            token: getSavingToken()
                        };
                        ws.send(JSON.stringify({ event: "__hello__", data: { auth } }));
                    };
                    if (ws.readyState === WebSocket.OPEN) sendHello();
                    else if (!ws.__cucuOpenBound) {
                        ws.__cucuOpenBound = true;
                        ws.addEventListener("open", () => {
                            ws.__cucuOpenBound = false;
                            sendHello();
                        }, { once: true });
                    }
                }
                return this;
            },
            emit(ev, ...args) {
                if (isNativeHost) {
                    hostAttachPromise.then(() => {
                        const serverSock = socketBridge?.io?.sockets?.sockets?.get(clientSocket.id);
                        if (serverSock) serverSock._receiveFromClient(ev, args);
                    });
                } else {
                    const packet = JSON.stringify({ event: ev, data: args });
                    if (guestWs && guestWs.readyState === WebSocket.OPEN && clientSocket.connected) {
                        guestWs.send(packet);
                    } else {
                        guestOutbox.push(packet);
                        if (!clientSocket.connected) clientSocket.connect();
                    }
                }
                return this;
            },
            disconnect() {
                manualDisconnect = true;
                if (reconnectTimer) {
                    clearTimeout(reconnectTimer);
                    reconnectTimer = null;
                }
                clientSocket.connected = false;
                if (isNativeHost) socketBridge?.detachClientSocket(clientSocket.id, "io client disconnect");
                else guestWs?.close();
            }
        };

        if (opts.autoConnect !== false) {
            clientSocket.connect();
        }
        return clientSocket;
    };

    window.io = createSocket;

    window.CucuRiduLan = {
        isNativeHost,
        createSocket,
        getHostJoinUrl: () => hostJoinUrl,
        refreshHostUrl: ensureHostServerStarted,
        normalizeLanRoute,
        clearSessionData,
        openExternalUrl
    };
})();