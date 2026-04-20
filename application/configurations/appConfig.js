const path = require("path");
const { getIcon, generateName, generatePfp, getAllPfp, getknownPacks, translateToPack } = require(path.join(__dirname, "../include/script/generazione"));
const { StatoStanza } = require(path.join(__dirname, "../include/script/Stanza"));
const { Mazzo } = require(path.join(__dirname, "../include/script/Mazzo"));
const crypto = require('crypto');
const express = require("express");
const cors = require("cors");
const { SitemapStream } = require('sitemap');
const { createGzip } = require('zlib');

/**
 * Configura gli endpoint dell' application Express
 * @param app
 * @param serverSession
 * @param TEMPORARY_TOKEN
 * @param Stanze
 * @param allowedOrigins
 * @param local
 * @param timeout
 * @param pagesOptions
 */
const appConfig = (app, serverSession, TEMPORARY_TOKEN, Stanze, allowedOrigins, local, timeout = 3600000, pagesOptions = {
    notifications: false,
    version: '1.0.0',
    cluster: false,
    readyState: true
}) => {

    const renderPage = (req, res, page, params = {}) => {
        const filter = /MSIE|Trident|webOS|LG Browser|Tizen|SamsungBrowser\/[1-9]\.|Opera Mini|Chrome\/([1-6][0-9])\.|Firefox\/([1-5][0-9])\.|Version\/([1-9]|10|11)(\.[0-9]+)? Safari\/|iPhone OS ([1-9]|10|11|12)_|Android [1-7]\./i;
        const target = req.headers['user-agent'] || "";
        const legacy = filter.test(target);
        const details = {
            scripts: legacy ? "/dist/script" : "/script",
            styles: pagesOptions.cluster ? "/dist/style/" : "/style",
            legacy: legacy
        };

        res.render("header", {
            params: {
                ...pagesOptions,
                ...params,
                ...details
            },
            page: page,
            ...details,
            cluster: pagesOptions.cluster,
            headerIcon: getIcon(true)
        });
    }

    const preCheck = async (req, res, next) => {
        if (!pagesOptions.readyState)
            return res.status(503).json({
                error: "L'istanza è in fase di build/avvio. Riprova tra pochi secondi."
            });
        const { userId, stanzaId } = await serverSession.get(req, req.query?.token);
        const redirecting = req.query?.token ? "?token=" + req.query.token : "";
        if(userId && (await Stanze.get(stanzaId))?.trovaGiocatore(userId)) return res.redirect("/game" + redirecting);
        req.deleteToken = !!req.query?.token;
        next();
    };

    app.use(express.static(path.join(__dirname, "..", "../public")));
    app.set("view engine", "ejs");
    app.set('trust proxy', 1);
    app.use(express.urlencoded({extended: true}));
    app.use(express.json());
    if(!local)
        app.use(cors({
            origin: (origin, callback) => {
                if (!origin || allowedOrigins.indexOf(origin) !== -1) callback(null, true);
                else callback(new Error('Non consentito dalla policy CORS'));
            },
            credentials: true
        }));
    app.use(serverSession.setupSession({
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: !local,
            sameSite: !local ? 'none' : null,
            maxAge: timeout
        }
    }));

    app.get("/", preCheck, (req, res) => {
        const { openSettings } = req.query;
        renderPage(req, res, "index", {
            icon: getIcon(),
            deleteToken: req.deleteToken,
            bgm: "MainMenu-City_Stroll",
            openSettings: openSettings === "true"
        });
    });
    app.get(['/home', '/index'], (req, res) => res.redirect('/'));

    app.get("/partecipaStanza/:codiceStanza", preCheck, (req, res) => {
        const stanza = req.params["codiceStanza"];
        if (stanza) renderPage(req, res, "profile", {
            stanza: stanza,
            setOfPfp: getAllPfp(),
            deleteToken: req.deleteToken,
            bgm: "Choosing_Menu-Feeling_Good"
        });
        else res.redirect("/");
    });

    app.get("/partecipaStanza", preCheck, (req, res) => {
        const {nome, pfp, stanza} = req.query;
        if (nome && pfp && stanza) {
            const token = serverSession.set(req, {
                nome: nome,
                pfp: pfp,
                stanzaId: stanza,
                deleteToken: req.deleteToken,
                bgm: "Choosing_Menu-Feeling_Good"
            });
            res.redirect("/game?token=" + token);
        } else if (stanza) renderPage(req, res, "profile", {
            stanza: stanza,
            setOfPfp: getAllPfp(),
            deleteToken: req.deleteToken,
            bgm: "Choosing_Menu-Feeling_Good"
        }); else renderPage(req, res, "join", {
            bgm: "Choosing_Menu-Feeling_Good",
            deleteToken: req.deleteToken
        });
    });

    app.get("/creaStanza", preCheck, (req, res) => {
        const {nome, pfp} = req.query;
        if (nome && pfp) {
            const token = serverSession.set(req, {
                nome: nome,
                pfp: pfp,
                bgm: "Choosing_Menu-Feeling_Good"
            });
            res.redirect("/game?token=" + token);
        } else renderPage(req, res, "profile", {
            setOfPfp: getAllPfp(),
            deleteToken: req.deleteToken,
            bgm: "Choosing_Menu-Feeling_Good"
        });
    });

    app.get("/game", async (req, res) => {
        const check = ["nome", "pfp", "stanzaId", "userId"];
        const {nome, pfp, stanzaId, userId} = await serverSession.validate(check, req.session.storeData, req.query?.token);
        if (userId && stanzaId && await Stanze.has(stanzaId) && (await Stanze.get(stanzaId)).trovaGiocatore(userId))
            renderPage(req, res, "lobby", {
                userId: userId,
                stanzaId: stanzaId,
                token: TEMPORARY_TOKEN,
                knownPacks: getknownPacks(),
                bgm: "GameMusic-Candy_Bazaar"
            });
        else if (nome && pfp) {
            renderPage(req, res, "lobby", {
                nome: nome,
                pfp: pfp,
                stanzaId: stanzaId,
                token: TEMPORARY_TOKEN,
                action: !stanzaId ? "Crea" : "Partecipa",
                knownPacks: getknownPacks(),
                bgm: "GameMusic-Candy_Bazaar"
            });
        } else {
            await serverSession.invalidate(req, req.query?.token);
            res.redirect("/");
        }
    });

    app.get("/creaMazzo", (req, res) => renderPage(req, res, "createPacks", {
        loadToken: false,
    }));

    app.get("/healthz", (req, res) => {
        if(pagesOptions.readyState) res.status(200).send('OK');
        else res.status(503).send('NOPE');
    });

    app.get("/offline", (req, res) => renderPage(req, res, "offline", {
        loadToken: false,
    }));

    app.get('/worker', (req, res) => {
        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Cache-Control', 'no-cache, proxy-revalidate');
        res.setHeader('Service-Worker-Allowed', '/');

        res.sendFile(path.resolve(__dirname, '..', '../public/script/config/worker.js'));
    });

    app.get("/error", (req, res) => {
        let status = 104;
        let message = "Questa pagina non esiste, brutta sottospecie di spermatozoo di elefante con la disfunzione erettile";

        if (req.query["alreadyConnected"]) {
            status = 420;
            message = "Allora signora, si scanti fora e torni alla pagina del gioco";
        }
        renderPage(req, res, "error", {
            error: status,
            icon: getIcon(),
            message: message,
            loadToken: false,
            bgm: "Error-Tough_Decisions"
        });
    });

    app.get('/sitemap', async (req, res) => {
        res.header('Content-Type', 'application/xml');
        res.header('Content-Encoding', 'gzip');
        try {
            const protocol = req.protocol;
            const host = req.get('host');
            const url = `${protocol}://${host}`;
            const smStream = new SitemapStream({ hostname: url });
            const pipeline = smStream.pipe(createGzip());

            smStream.write({ url: '/', changefreq: 'daily', priority: 1.0 });
            smStream.write({ url: '/partecipaStanza', changefreq: 'daily', priority: 0.5 });
            smStream.write({ url: '/creaStanza', changefreq: 'daily', priority: 0.5 });
            smStream.write({ url: '/creaMazzo', changefreq: 'daily', priority: 0.5 });

            smStream.end();
            pipeline.pipe(res).on('error', (e) => { throw e });

        } catch (e) {
            console.error(e);
            res.status(500).end();
        }
    });

    app.post("/generateInfo", (req, res) => {
        res.status(200).json({nome: generateName(), pfp: generatePfp()});
    });

    app.head("/ping", (req, res) => {
        res.status(pagesOptions.readyState ? 200 : 503).send();
    });

    app.post("/doRoomExists", async (req, res) => {
        const {roomId} = req.body;
        const stato = Boolean(await Stanze.has(roomId) && await Stanze.get(roomId).stato !== StatoStanza.END);
        res.status(200).json({result: stato});
    })

    app.post("/saveGameReference", async (req, res) => {
        const {userId, stanzaId} = req.body || {};
        if (userId && stanzaId) {
            const token = serverSession.set(req, {
                userId: userId,
                stanzaId: stanzaId,
            });
            return res.status(200).json({
                result: true,
                fallback: token
            });
        }
        await serverSession.invalidate(req);
        res.status(406).json({result: false});
    });

    app.post("/deleteGameReference", async (req, res) => {
        await serverSession.invalidate(req, req.body?.token);
        res.status(200).json({result: true});
    });

    app.post("/createPack", (req, res) => {
        const packsPair = req.body || "";
        const packs = [];
        for(const pair of packsPair) {
            const righe = translateToPack(pair);
            if(Mazzo.controllaMazzo(righe)) {
                const mazzoFinale = {
                    frasi: righe[0],
                    completamenti: righe[1],
                    name: righe[2][0] || "default"
                };
                const datiString = JSON.stringify(mazzoFinale, Object.keys(mazzoFinale).sort());
                const hash = crypto.createHash('sha256')
                    .update(datiString)
                    .digest('hex');
                packs.push({...mazzoFinale, hash: hash});
            } else
                return res.status(400).json({
                    success: false
                });
        }
        res.status(200).json({
            success: true,
            packs: JSON.stringify(packs)
        });
    });

    app.use((req, res) => res.redirect("/error"));
};

module.exports = appConfig;
