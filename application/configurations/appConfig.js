const path = require("path");
const { getIcon, generateName, generatePfp, getAllPfp, getknownPacks, translateToPack } = require(path.join(__dirname, "../include/script/generazione"));
const { StatoStanza } = require(path.join(__dirname, "../include/script/Stanza"));
const { Mazzo } = require(path.join(__dirname, "../include/script/Mazzo"));
const crypto = require('crypto');

/**
 * Configura gli endpoint dell' application Express
 * @param app
 * @param serverSession
 * @param TEMPORARY_TOKEN
 * @param Stanze
 */
const appConfig = (app, serverSession, TEMPORARY_TOKEN, Stanze) => {

    const renderPage = (res, page, params = {}) => res.render("header", {
        params: params,
        page: page,
        headerIcon: getIcon(true),
    });

    const resumeGame = async (req, res, next) => {
        const { userId, stanzaId } = await serverSession.get(req, req.query?.token);
        const redirecting = req.query?.token ? "?token=" + req.query.token : "";
        if(userId && (await Stanze.get(stanzaId))?.trovaGiocatore(userId)) return res.redirect("/game" + redirecting);
        req.deleteToken = !!req.query?.token;
        next();
    };

    app.get("/", resumeGame, (req, res) => {
        const { openSettings } = req.query;
        renderPage(res, "index", {
            icon: getIcon(),
            deleteToken: req.deleteToken,
            bgm: "MainMenu-City_Stroll",
            openSettings: openSettings === "true"
        });
    });
    app.get(['/home', '/index'], (req, res) => res.redirect('/'));

    app.get("/partecipaStanza/:codiceStanza", resumeGame, (req, res) => {
        const stanza = req.params["codiceStanza"];
        if (stanza) renderPage(res, "profile", {
            stanza: stanza,
            setOfPfp: getAllPfp(),
            deleteToken: req.deleteToken,
            bgm: "Choosing_Menu-Feeling_Good"
        });
        else res.redirect("/");
    });

    app.get("/partecipaStanza", resumeGame, (req, res) => {
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
        } else if (stanza) renderPage(res, "profile", {
            stanza: stanza,
            setOfPfp: getAllPfp(),
            deleteToken: req.deleteToken,
            bgm: "Choosing_Menu-Feeling_Good"
        }); else renderPage(res, "join", {
            bgm: "Choosing_Menu-Feeling_Good",
            deleteToken: req.deleteToken
        });
    });

    app.get("/creaStanza", resumeGame, (req, res) => {
        const {nome, pfp} = req.query;
        if (nome && pfp) {
            const token = serverSession.set(req, {
                nome: nome,
                pfp: pfp,
                bgm: "Choosing_Menu-Feeling_Good"
            });
            res.redirect("/game?token=" + token);
        } else renderPage(res, "profile", {
            setOfPfp: getAllPfp(),
            deleteToken: req.deleteToken,
            bgm: "Choosing_Menu-Feeling_Good"
        });
    });

    app.get("/game", async (req, res) => {
        const check = ["nome", "pfp", "stanzaId", "userId"];
        const {nome, pfp, stanzaId, userId} = await serverSession.validate(check, req.session.storeData, req.query?.token);
        if (userId && stanzaId && await Stanze.has(stanzaId) && (await Stanze.get(stanzaId)).trovaGiocatore(userId))
            renderPage(res, "lobby", {
                userId: userId,
                stanzaId: stanzaId,
                token: TEMPORARY_TOKEN,
                knownPacks: getknownPacks(),
                bgm: "GameMusic-Candy_Bazaar"
            });
        else if (nome && pfp) {
            renderPage(res, "lobby", {
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

    app.get("/creaMazzo", (req, res) => renderPage(res, "createPacks", {
        loadToken: false,
    }));

    app.get("/offline", (req, res) => renderPage(res, "offline", {
        loadToken: false,
    }));

    app.get('/serviceWorker', (req, res) => {
        res.sendFile(path.resolve(__dirname, '..', '../public/script/config/serviceWorker.js'));
    });

    app.get("/error", (req, res) => {
        let status = 104;
        let message = "Questa pagina non esiste, brutta sottospecie di spermatozoo di elefante con la disfunzione erettile";
        if (req.query["alreadyConnected"]) {
            status = 420;
            message = "Allora signora, si scanti fora e torni alla pagina del gioco";
        }
        renderPage(res, "error", {
            error: status,
            icon: getIcon(),
            message: message,
            loadToken: false,
            bgm: "Error-Tough_Decisions"
        });
    });

    app.post("/generateInfo", (req, res) => {
        res.status(200).json({nome: generateName(), pfp: generatePfp()});
    });

    app.head("/ping", (req, res) => {
        res.status(200).end();
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
