const path = require("path");
const { getIcon, generateName, generatePfp, getAllPfp, getknownPacks, translateToPack } = require(path.join(__dirname, "../include/script/generazione"));
const { StatoStanza } = require(path.join(__dirname, "../include/script/Stanza"));
const { Mazzo } = require(path.join(__dirname, "../include/script/Mazzo"));
const crypto = require('crypto');
const express = require("express");
const cors = require("cors");
const { SitemapStream } = require('sitemap');
const { createGzip } = require('zlib');
const QRCode = require("qrcode-svg");

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
    version: '1.0.0',
    cluster: false
}, archivioSegnalazioni = null, chiaveSegnalazioni = null) => {

    const renderPage = (req, res, page, params = {
        simple: false,
    }) => {
        const filter = /MSIE|Trident|webOS|LG Browser|Tizen|SamsungBrowser\/[1-9]\.|Opera Mini|Chrome\/([1-6][0-9])\.|Firefox\/([1-5][0-9])\.|Version\/([1-9]|10|11)(\.[0-9]+)? Safari\/|iPhone OS ([1-9]|10|11|12)_|Android [1-7]\./i;
        const target = req.headers['user-agent'] || "";
        const legacy = filter.test(target);
        const details = {
            scripts: legacy ? "/dist/script" : "/script",
            styles: pagesOptions.cluster ? "/dist/style/" : "/style",
            legacy,
            allowedOrigins
        };

        res.render(params.simple ? "simpleHeader" : "header", {
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
    app.get("/localStorageSync", (req, res) => renderPage(req, res, "error", { simple: true, error: 100, message: "Non dovresti essere qua :(" }));

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
        if (userId && stanzaId && await Stanze.has(stanzaId) && (await Stanze.get(stanzaId))?.trovaGiocatore(userId))
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

    app.get('/qrCode', async (req, res) => {
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Content-Disposition', 'inline; filename="qrcode.svg"');
        res.setHeader('Cache-Control', 'public, max-age=36000');
        try {
            const url = req.query.url;
            const size = parseInt(req.query.size) || 400;
            const radius = parseFloat(req.query.radius) || 0;
            const padding = parseFloat(req.query.padding) || 0;
            const background = req.query.background || "none";
            const filler = req.query.filler || "#000000";
            const QR_ECL = {
                L: '7%',
                M: '15%',
                Q: '25%',
                H: '30%'
            };
            let quality = req.query.quality;
            if(!QR_ECL[quality])
                quality = "H";

            const qr = new QRCode({
                content: url,
                padding: padding,
                width: size,
                height: size,
                color: filler,
                background: background,
                ecl: quality,
            });
            const svg = qr.svg();
            const rValue = radius * (size / 40);
            const roundedSvg = svg.replace(/<rect(?! [^>]*id="bg"| [^>]*class="background")/g, `<rect rx="${rValue}" ry="${rValue}"`);

            res.send(roundedSvg);
        } catch (err) {
            console.log(err);
            res.status(500).send('Errore');
        }
    });

    app.post("/generateInfo", (req, res) => {
        res.status(200).json({nome: generateName(), pfp: generatePfp()});
    });

    app.get("/ping", (req, res) => {
        res.status(200).end();
    });

    /*
     * Elenco delle frasi e dei completamenti segnalati come sbagliati.
     * Protetto dalla chiave in SEGNALAZIONI_KEY: se non e' impostata la pagina
     * non esiste proprio, cosi non resta aperta per sbaglio.
     */
    app.get("/segnalazioni", async (req, res) => {
        if (!archivioSegnalazioni || !chiaveSegnalazioni) return res.redirect("/error");
        if (req.query?.chiave !== chiaveSegnalazioni) return res.redirect("/error");

        const scappa = (testo) => String(testo ?? "")
            .replace(/&/g, "&amp;").replace(/</g, "&lt;")
            .replace(/>/g, "&gt;").replace(/"/g, "&quot;");

        try {
            const righe = await archivioSegnalazioni.leggi(300);
            const quandoIt = (valore) => {
                if (!valore) return "";
                const d = new Date(valore);
                return isNaN(d) ? String(valore) : d.toLocaleString("it-IT");
            };

            const daFare = righe.filter(r => !r.risolta).length;

            // due famiglie nella stessa tabella: correzioni ("questo e'
            // sbagliato") e suggerimenti ("aggiungete questo")
            const eSuggerimento = (tipo) => String(tipo || "").startsWith("suggerimento_");
            const etichette = {
                frase: "Frase",
                completamento: "Completamento",
                suggerimento_frase: "Frase nuova",
                suggerimento_completamento: "Carta nuova"
            };
            const classeRiga = (r) => [
                String(r.tipo || "").includes("frase") ? "frase" : "compl",
                eSuggerimento(r.tipo) ? "sugg" : "corr",
                r.risolta ? "risolta" : ""
            ].filter(Boolean).join(" ");

            const quantiSuggerimenti = righe.filter(r => eSuggerimento(r.tipo)).length;
            const quanteCorrezioni = righe.length - quantiSuggerimenti;

            const corpo = righe.length
                ? righe.map(r => `<tr class="${classeRiga(r)}" data-id="${scappa(r.id)}">
                        <td class="fatto"><input type="checkbox" class="segnaFatto" ${r.risolta ? "checked" : ""} aria-label="Segna come fatta"></td>
                        <td class="quando">${scappa(quandoIt(r.creato_at))}</td>
                        <td class="tipo">${scappa(etichette[r.tipo] || r.tipo)}</td>
                        <td class="testo">${scappa(r.testo)}</td>
                        <td class="nota">${scappa(r.nota || "")}</td>
                        <td class="chi">${scappa(r.giocatore || "")}<br><small>${scappa(r.stanza_id || "")}</small></td>
                    </tr>`).join("")
                : `<tr><td colspan="6" class="vuoto">Niente di niente, per ora tutto a posto</td></tr>`;

            res.status(200).send(`<!doctype html><html lang="it"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Segnalazioni - Cucu Ridu</title><style>
body{font-family:system-ui,Arial,sans-serif;margin:0;padding:24px;background:#faf7f2;color:#2b2b2b}
h1{font-size:1.4rem;margin:0 0 4px}
p.sotto{margin:0 0 10px;color:#777;font-size:0.85rem}
label.filtro{display:inline-flex;align-items:center;gap:6px;margin:0 0 14px;font-size:0.85rem;color:#555;cursor:pointer}
table{border-collapse:collapse;width:100%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.12);border-radius:8px;overflow:hidden}
th,td{padding:9px 12px;text-align:left;vertical-align:top;font-size:0.88rem;border-bottom:1px solid #eee}
th{background:#f0ece5;font-size:0.75rem;text-transform:uppercase;letter-spacing:.04em;color:#666}
td.fatto{text-align:center;width:20px}
td.fatto input{width:18px;height:18px;cursor:pointer}
tr.frase .tipo{color:#a3560f;font-weight:600}
tr.compl .tipo{color:#3a6ea5;font-weight:600}
tr.sugg{background:#f6fbf5}
tr.sugg .tipo{color:#2f7d4f;font-weight:600}
tr.sugg .tipo::before{content:"+ "}
body.soloCorrezioni tr.sugg{display:none}
body.soloSuggerimenti tr.corr{display:none}
tr.risolta{opacity:0.45}
tr.risolta td.testo,tr.risolta td.nota{text-decoration:line-through}
body.nascondiRisolte tr.risolta{display:none}
td.quando,td.chi{white-space:nowrap;color:#777;font-size:0.8rem}
td.testo{font-weight:600;max-width:520px}
td.nota{color:#555;max-width:320px}
td.vuoto{text-align:center;color:#888;padding:30px}
</style></head><body>
<h1>Segnalazioni e suggerimenti</h1>
<p class="sotto">${righe.length} righe dalla piu recente, ${daFare} ancora da sistemare: ${quanteCorrezioni} correzioni (roba sbagliata trovata giocando) e ${quantiSuggerimenti} suggerimenti (frasi e carte nuove proposte dai giocatori).</p>
<label class="filtro"><input type="checkbox" id="nascondiRisolte">Nascondi quelle gia' fatte</label>
<label class="filtro">Mostra:
<select id="filtroTipo">
<option value="tutto">tutto</option>
<option value="correzioni">solo correzioni</option>
<option value="suggerimenti">solo suggerimenti</option>
</select></label>
<table><thead><tr><th>Fatto</th><th>Quando</th><th>Tipo</th><th>Testo</th><th>Nota</th><th>Chi</th></tr></thead>
<tbody>${corpo}</tbody></table>
<script>
(function () {
    var chiave = ${JSON.stringify(String(chiaveSegnalazioni))};
    document.querySelectorAll(".segnaFatto").forEach(function (box) {
        box.addEventListener("change", function () {
            var riga = box.closest("tr");
            var id = riga.getAttribute("data-id");
            var risolta = box.checked;
            box.disabled = true;
            fetch("/segnalazioni/segna", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chiave: chiave, id: id, risolta: risolta })
            }).then(function (r) { return r.json(); }).then(function (data) {
                if (!data || !data.ok) throw new Error("esito negativo");
                riga.classList.toggle("risolta", risolta);
            }).catch(function (e) {
                console.error(e);
                box.checked = !risolta;
                alert("Non sono riuscito a salvare, riprova");
            }).finally(function () {
                box.disabled = false;
            });
        });
    });
    var nascondi = document.getElementById("nascondiRisolte");
    nascondi.addEventListener("change", function () {
        document.body.classList.toggle("nascondiRisolte", nascondi.checked);
    });
    var filtro = document.getElementById("filtroTipo");
    filtro.addEventListener("change", function () {
        document.body.classList.toggle("soloCorrezioni", filtro.value === "correzioni");
        document.body.classList.toggle("soloSuggerimenti", filtro.value === "suggerimenti");
    });
})();
</script>
</body></html>`);
        } catch (e) {
            console.error("[segnalazioni]", e?.message || e);
            res.status(500).send("Errore nel leggere le segnalazioni");
        }
    });

    /*
     * Marca (o smarca) una segnalazione come risolta. Stessa chiave della
     * pagina /segnalazioni, passata nel corpo perche' qui non c'e' un form.
     */
    app.post("/segnalazioni/segna", async (req, res) => {
        if (!archivioSegnalazioni || !chiaveSegnalazioni) return res.status(404).end();
        const { chiave, id, risolta } = req.body || {};
        if (chiave !== chiaveSegnalazioni) return res.status(403).json({ ok: false });
        if (!id) return res.status(400).json({ ok: false });

        try {
            const ok = await archivioSegnalazioni.segna(String(id), !!risolta);
            res.status(200).json({ ok: !!ok });
        } catch (e) {
            console.error("[segnalazioni:segna]", e?.message || e);
            res.status(500).json({ ok: false });
        }
    });

    app.post("/doRoomExists", async (req, res) => {
        try {
            const {roomId} = req.body || {};
            // mancavano le parentesi: si leggeva .stato su una Promise, quindi
            // il controllo sullo stato non ha mai funzionato
            const stanza = roomId ? await Stanze.get(roomId) : null;
            res.status(200).json({result: Boolean(stanza && stanza.stato !== StatoStanza.END)});
        } catch (e) {
            console.error("[doRoomExists]", e?.message || e);
            res.status(200).json({result: false});
        }
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
            // qui il mazzo lo stiamo creando ADESSO: l'hash non esiste ancora,
            // quindi si controlla solo che il contenuto stia in piedi. Prima
            // si chiamava controllaMazzo, che pretende anche la firma: la
            // pagina /creaMazzo rispondeva 400 a qualsiasi mazzo, sempre.
            if(Mazzo.problemaMazzo(righe) === null) {
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
