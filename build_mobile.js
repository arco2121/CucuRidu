const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const esbuild = require('esbuild');

const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const VIEWS_DIR = path.join(ROOT, 'views');
const FRAGMENTS_DIR = path.join(VIEWS_DIR, 'fragments');
const CARDS_DIR = path.join(ROOT, 'application', 'include', 'cards');
const NAMES_FILE = path.join(ROOT, 'application', 'include', 'names', 'names.json');
const MOBILE_WWW = path.join(ROOT, 'mobile', 'www');
const ANDROID_RES = path.join(ROOT, 'mobile', 'android', 'app', 'src', 'main', 'res');
const LAN_VERSION = '1.0.0-Lan';

const FALLBACK_NAMES = {
    names: [
        { nome: "Gabibbo", genere: "m" },
        { nome: "Gerry Scotti", genere: "m" },
        { nome: "Petunia", genere: "f" },
        { nome: "Pinguino", genere: "m" },
        { nome: "Lavastoviglie", genere: "f" },
        { nome: "Piccione", genere: "m" },
        { nome: "Criceto", genere: "m" },
        { nome: "Asteroide", genere: "m" },
        { nome: "Tostapane", genere: "m" },
        { nome: "Marmotta", genere: "f" },
        { nome: "Capibara", genere: "m" },
        { nome: "Sgabello", genere: "m" }
    ],
    adjectives: [
        { n: "Stort*", m: "Storto", f: "Storta", p: "Storti", fp: "Storte" },
        { n: "Cosmic*", m: "Cosmico", f: "Cosmica", p: "Cosmici", fp: "Cosmiche" },
        { n: "Sospett*", m: "Sospetto", f: "Sospetta", p: "Sospetti", fp: "Sospette" },
        { n: "Tattic*", m: "Tattico", f: "Tattica", p: "Tattici", fp: "Tattiche" },
        { n: "Radioattiv*", m: "Radioattivo", f: "Radioattiva", p: "Radioattivi", fp: "Radioattive" },
        { n: "Croccante", m: "Croccante", f: "Croccante", p: "Croccanti", fp: "Croccanti" },
        { n: "Supersonic*", m: "Supersonico", f: "Supersonica", p: "Supersonici", fp: "Supersoniche" },
        { n: "Abusiv*", m: "Abusivo", f: "Abusiva", p: "Abusivi", fp: "Abusive" },
        { n: "Ballerin*", m: "Ballerino", f: "Ballerina", p: "Ballerini", fp: "Ballerine" },
        { n: "Notturn*", m: "Notturno", f: "Notturna", p: "Notturni", fp: "Notturne" }
    ]
};

const copyDirRecursive = (src, dest) => {
    if (!fs.existsSync(src)) return;
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDirRecursive(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
};

const countFiles = (dir, ext) => {
    if (!fs.existsSync(dir)) return 0;
    return fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith(ext.toLowerCase())).length;
};

const syncAndroidIconFromManifest = () => {
    if (!fs.existsSync(ANDROID_RES)) return;

    const manifestPath = path.join(PUBLIC_DIR, 'manifest.json');
    let iconRelPath = 'assets/icon.png';
    let bgColor = '#faf7f2';

    if (fs.existsSync(manifestPath)) {
        try {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            if (manifest.background_color && /^#[0-9a-fA-F]{6}$/.test(manifest.background_color)) {
                bgColor = manifest.background_color;
            }
            if (Array.isArray(manifest.icons) && manifest.icons.length > 0) {
                const sorted = [...manifest.icons].sort((a, b) => {
                    const sizeA = parseInt(String(a.sizes || '0').split('x')[0], 10) || 0;
                    const sizeB = parseInt(String(b.sizes || '0').split('x')[0], 10) || 0;
                    return sizeB - sizeA;
                });
                const chosen = sorted.find(i => {
                    if (!i.src) return false;
                    const clean = i.src.replace(/^\.?\//, '');
                    return fs.existsSync(path.join(PUBLIC_DIR, clean));
                });
                if (chosen) iconRelPath = chosen.src.replace(/^\.?\//, '');
            }
        } catch (e) {
            console.warn('[buildMobile] Impossibile leggere manifest.json:', e.message);
        }
    }

    let sourceIcon = path.join(PUBLIC_DIR, iconRelPath);
    if (!fs.existsSync(sourceIcon)) {
        sourceIcon = path.join(PUBLIC_DIR, 'assets', 'icon_imgs', '1.png');
    }
    if (!fs.existsSync(sourceIcon)) {
        console.warn('[buildMobile] Icona non trovata:', sourceIcon);
        return;
    }

    const drawableDir = path.join(ANDROID_RES, 'drawable');
    const valuesDir = path.join(ANDROID_RES, 'values');
    const anydpiDir = path.join(ANDROID_RES, 'mipmap-anydpi-v26');
    fs.mkdirSync(drawableDir, { recursive: true });
    fs.mkdirSync(valuesDir, { recursive: true });
    fs.mkdirSync(anydpiDir, { recursive: true });

    fs.copyFileSync(sourceIcon, path.join(drawableDir, 'cucuridu_launcher_fg.png'));
    fs.writeFileSync(
        path.join(drawableDir, 'ic_launcher_foreground_padded.xml'),
        `<?xml version="1.0" encoding="utf-8"?>\n<inset xmlns:android="http://schemas.android.com/apk/res/android"\n    android:drawable="@drawable/cucuridu_launcher_fg"\n    android:inset="16%" />\n`,
        'utf8'
    );

    fs.writeFileSync(
        path.join(valuesDir, 'ic_launcher_background.xml'),
        `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">${bgColor}</color>\n</resources>\n`,
        'utf8'
    );

    const adaptiveXml = `<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n    <background android:drawable="@color/ic_launcher_background"/>\n    <foreground android:drawable="@drawable/ic_launcher_foreground_padded"/>\n</adaptive-icon>\n`;
    fs.writeFileSync(path.join(anydpiDir, 'ic_launcher.xml'), adaptiveXml, 'utf8');
    fs.writeFileSync(path.join(anydpiDir, 'ic_launcher_round.xml'), adaptiveXml, 'utf8');

    for (const entry of fs.readdirSync(ANDROID_RES, { withFileTypes: true })) {
        if (entry.isDirectory() && entry.name.startsWith('mipmap-') && entry.name !== 'mipmap-anydpi-v26') {
            const dir = path.join(ANDROID_RES, entry.name);
            for (const target of ['ic_launcher.png', 'ic_launcher_round.png']) {
                const dest = path.join(dir, target);
                if (fs.existsSync(dest)) fs.copyFileSync(sourceIcon, dest);
            }
        }
    }
};

const ensureGeneratedAssets = () => {
    try {
        execSync('npm run generateAll', { cwd: ROOT, stdio: 'inherit' });
    } catch (e) {
        console.warn('[buildMobile] Avviso generateAll:', e.message);
    }
};

const loadEmbeddedData = () => {
    ensureGeneratedAssets();

    let namesData = fs.existsSync(NAMES_FILE)
        ? JSON.parse(fs.readFileSync(NAMES_FILE, 'utf8'))
        : { names: [], adjectives: [] };

    if (!Array.isArray(namesData.names) || namesData.names.length === 0) {
        console.warn('[buildMobile] names.json assente o vuoto: uso lista nomi integrata di fallback.');
        namesData = FALLBACK_NAMES;
    }

    const packs = {};
    const knownPacks = [];
    if (fs.existsSync(CARDS_DIR)) {
        for (const entry of fs.readdirSync(CARDS_DIR, { withFileTypes: true })) {
            if (!entry.isDirectory()) continue;
            const packName = entry.name;
            const compFile = path.join(CARDS_DIR, packName, 'completamenti.json');
            const frasiFile = path.join(CARDS_DIR, packName, 'frasi.json');
            if (fs.existsSync(compFile) && fs.existsSync(frasiFile)) {
                knownPacks.push(packName);
                packs[packName] = {
                    completamenti: JSON.parse(fs.readFileSync(compFile, 'utf8')),
                    frasi: JSON.parse(fs.readFileSync(frasiFile, 'utf8'))
                };
            }
        }
    }

    const pfpCount = countFiles(path.join(PUBLIC_DIR, 'assets', 'pfps'), '.jpg');
    const iconCount = countFiles(path.join(PUBLIC_DIR, 'assets', 'icon_imgs'), '.png');

    console.log(
        `[buildMobile] Risorse caricate -> nomi: ${namesData.names?.length || 0}, ` +
        `aggettivi: ${namesData.adjectives?.length || 0}, mazzi: [${knownPacks.join(', ')}], pfp: ${pfpCount}`
    );

    if (!packs.standard || !Array.isArray(packs.standard.completamenti) || packs.standard.completamenti.length === 0) {
        throw new Error('Mazzo "standard" mancante o vuoto in application/include/cards/standard/');
    }

    return { namesData, packs, knownPacks, pfpCount, iconCount };
};

const buildGameEngineBundle = async (embedded) => {
    const outFile = path.join(MOBILE_WWW, 'script', 'lan', 'gameEngine.js');
    fs.mkdirSync(path.dirname(outFile), { recursive: true });

    const browserShimsPlugin = {
        name: 'cucuridu-browser-shims',
        setup(build) {
            build.onResolve({ filter: /^(fs|path|crypto)$/ }, (args) => ({
                path: args.path,
                namespace: 'node-shim'
            }));

            build.onLoad({ filter: /.*/, namespace: 'node-shim' }, (args) => {
                if (args.path === 'path') {
                    return {
                        contents: `
                            module.exports = {
                                join: (...parts) => parts.filter(Boolean).join('/').replace(/\\/+/g, '/'),
                                extname: (p) => {
                                    const i = String(p).lastIndexOf('.');
                                    return i >= 0 ? String(p).slice(i) : '';
                                }
                            };
                        `,
                        loader: 'js'
                    };
                }

                if (args.path === 'fs') {
                    return {
                        contents: `
                            const EMBEDDED = ${JSON.stringify(embedded)};
                            module.exports = {
                                readdirSync: (dir) => {
                                    const d = String(dir);
                                    if (d.includes('cards')) {
                                        return EMBEDDED.knownPacks.map(name => ({
                                            name,
                                            isDirectory: () => true
                                        }));
                                    }
                                    if (d.includes('pfps')) {
                                        return Array.from({ length: EMBEDDED.pfpCount }, (_, i) => (i + 1) + '.jpg');
                                    }
                                    if (d.includes('icon_imgs')) {
                                        return Array.from({ length: EMBEDDED.iconCount }, (_, i) => (i + 1) + '.png');
                                    }
                                    return [];
                                },
                                readFileSync: (filePath) => {
                                    const f = String(filePath).replace(/\\\\/g, '/');
                                    if (f.includes('names.json')) {
                                        return JSON.stringify(EMBEDDED.namesData);
                                    }
                                    const packMatch = f.match(/cards\\/([^/]+)\\/(completamenti|frasi)\\.json$/);
                                    if (packMatch) {
                                        const [, pack, tipo] = packMatch;
                                        return JSON.stringify(EMBEDDED.packs[pack]?.[tipo] || []);
                                    }
                                    return '{}';
                                },
                                renameSync: () => {}
                            };
                        `,
                        loader: 'js'
                    };
                }

                if (args.path === 'crypto') {
                    return {
                        contents: `
                            const K = new Uint32Array([
                                0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
                                0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
                                0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
                                0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
                                0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
                                0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
                                0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
                                0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
                            ]);
                            function sha256Hex(str) {
                                const bytes = new TextEncoder().encode(String(str));
                                const bitLen = bytes.length * 8;
                                const padLen = (((bytes.length + 8) >> 6) + 1) << 6;
                                const buf = new Uint8Array(padLen);
                                buf.set(bytes);
                                buf[bytes.length] = 0x80;
                                const view = new DataView(buf.buffer);
                                view.setUint32(padLen - 8, Math.floor(bitLen / 0x100000000), false);
                                view.setUint32(padLen - 4, bitLen >>> 0, false);

                                const H = new Uint32Array([
                                    0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,
                                    0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19
                                ]);
                                const W = new Uint32Array(64);
                                const rotr = (x, n) => (x >>> n) | (x << (32 - n));

                                for (let offset = 0; offset < padLen; offset += 64) {
                                    for (let i = 0; i < 16; i++) W[i] = view.getUint32(offset + i * 4, false);
                                    for (let i = 16; i < 64; i++) {
                                        const s0 = rotr(W[i - 15], 7) ^ rotr(W[i - 15], 18) ^ (W[i - 15] >>> 3);
                                        const s1 = rotr(W[i - 2], 17) ^ rotr(W[i - 2], 19) ^ (W[i - 2] >>> 10);
                                        W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0;
                                    }
                                    let [a, b, c, d, e, f, g, h] = H;
                                    for (let i = 0; i < 64; i++) {
                                        const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
                                        const ch = (e & f) ^ (~e & g);
                                        const temp1 = (h + S1 + ch + K[i] + W[i]) >>> 0;
                                        const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
                                        const maj = (a & b) ^ (a & c) ^ (b & c);
                                        const temp2 = (S0 + maj) >>> 0;
                                        h = g; g = f; f = e; e = (d + temp1) >>> 0;
                                        d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
                                    }
                                    H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0;
                                    H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
                                    H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0;
                                    H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
                                }
                                return Array.from(H).map(v => v.toString(16).padStart(8, '0')).join('');
                            }
                            module.exports = {
                                sha256Hex,
                                createHash: () => {
                                    let acc = '';
                                    return {
                                        update(data) { acc += String(data); return this; },
                                        digest() { return sha256Hex(acc); }
                                    };
                                }
                            };
                        `,
                        loader: 'js'
                    };
                }
            });

            build.onLoad({ filter: /application[\\/]include[\\/]script[\\/].*\.js$/ }, async (args) => {
                let src = await fs.promises.readFile(args.path, 'utf8');
                src = src.replace(
                    /require\(\s*\(?\s*path\.join\(\s*__dirname\s*,\s*['"]\/?([^'"]+)['"]\s*\)\s*\)?\s*\)/g,
                    (_, rel) => `require('./${rel}')`
                );
                return { contents: src, loader: 'js' };
            });
        }
    };

    const entryContent = `
        const { Stanza, StatoStanza } = require('./application/include/script/Stanza');
        const { Giocatore } = require('./application/include/script/Giocatore');
        const { Mazzo, TipoMazzo, normalizzaCarta } = require('./application/include/script/Mazzo');
        const gen = require('./application/include/script/generazione');
        const { sha256Hex } = require('crypto');
        const QRCode = require('qrcode-svg');

        window.CucuRiduEngine = {
            Stanza,
            StatoStanza,
            Giocatore,
            Mazzo,
            TipoMazzo,
            normalizzaCarta,
            sha256: sha256Hex,
            QRCode,
            ...gen
        };
    `;

    await esbuild.build({
        stdin: {
            contents: entryContent,
            resolveDir: ROOT,
            sourcefile: 'lan-engine-entry.js'
        },
        bundle: true,
        format: 'iife',
        target: ['es2020'],
        define: {
            __dirname: '"/application/include/script"',
            __filename: '"/application/include/script/index.js"'
        },
        plugins: [browserShimsPlugin],
        outfile: outFile
    });

    const sioShimDir = path.join(MOBILE_WWW, 'socket.io');
    fs.mkdirSync(sioShimDir, { recursive: true });
    fs.writeFileSync(
        path.join(sioShimDir, 'socket.io.js'),
        'window.io = function(opts) { return window.CucuRiduLan.createSocket(opts); };\n',
        'utf8'
    );
};

const renderViews = async (embedded) => {
    const allPfps = Array.from({ length: embedded.pfpCount }, (_, i) => `/assets/pfps/${i + 1}.jpg`);
    const baseDetails = {
        scripts: '/script',
        styles: '/style',
        legacy: false,
        cluster: false,
        allowedOrigins: [],
        headerIcon: '/assets/icon_imgs/1.png'
    };

    const pages = [
        {
            out: 'index.html',
            layout: 'header.ejs',
            page: 'index',
            params: {
                icon: '/assets/icon_imgs/1.png',
                deleteToken: false,
                bgm: 'MainMenu-City_Stroll',
                openSettings: false,
                lanMode: true
            }
        },
        {
            out: 'creaStanza.html',
            layout: 'header.ejs',
            page: 'profile',
            params: {
                setOfPfp: allPfps,
                deleteToken: false,
                bgm: 'Choosing_Menu-Feeling_Good',
                lanMode: true
            }
        },
        {
            out: 'partecipaStanza.html',
            layout: 'header.ejs',
            page: 'join',
            params: {
                bgm: 'Choosing_Menu-Feeling_Good',
                deleteToken: false,
                lanMode: true
            }
        },
        {
            out: 'partecipaStanzaProfile.html',
            layout: 'header.ejs',
            page: 'profile',
            params: {
                stanza: '',
                setOfPfp: allPfps,
                deleteToken: false,
                bgm: 'Choosing_Menu-Feeling_Good',
                lanMode: true
            }
        },
        {
            out: 'game.html',
            layout: 'header.ejs',
            page: 'lobby',
            params: {
                stanzaId: '',
                userId: '',
                nome: '',
                pfp: '',
                action: '',
                token: 'LAN_LOCAL_TOKEN',
                knownPacks: embedded.knownPacks,
                bgm: 'GameMusic-Candy_Bazaar',
                lanMode: true
            }
        },
        {
            out: 'creaMazzo.html',
            layout: 'header.ejs',
            page: 'createPacks',
            params: {
                loadToken: false,
                lanMode: true
            }
        },
        {
            out: 'error.html',
            layout: 'header.ejs',
            page: 'error',
            params: {
                error: 404,
                icon: '/assets/icon_imgs/1.png',
                message: 'Pagina non trovata',
                loadToken: false,
                bgm: 'Error-Tough_Decisions',
                lanMode: true
            }
        },
        {
            out: 'offline.html',
            layout: 'header.ejs',
            page: 'offline',
            params: {
                loadToken: false,
                lanMode: true
            }
        }
    ];

    for (const item of pages) {
        const mergedParams = {
            version: LAN_VERSION,
            ...baseDetails,
            ...item.params
        };

        let html = await ejs.renderFile(path.join(VIEWS_DIR, item.layout), {
            params: mergedParams,
            page: item.page,
            ...baseDetails
        });

        // Evita registrazione Service Worker nella WebView Android
        html = html.replace(/<script[^>]*registerWorker\.js[^>]*><\/script>\s*/gi, '');

        html = html.replace(
            '</head>',
            `    <script src="/script/lan/lanEngine.bundle.js"></script>\n    <script src="/script/lan/lanBridge.js"></script>\n</head>`
        );

        fs.writeFileSync(path.join(MOBILE_WWW, item.out), html, 'utf8');
    }
};

(async () => {
    fs.rmSync(MOBILE_WWW, { recursive: true, force: true });
    fs.mkdirSync(MOBILE_WWW, { recursive: true });

    console.log('1/4 Copia asset statici e frammenti EJS in mobile/www...');
    copyDirRecursive(PUBLIC_DIR, MOBILE_WWW);
    copyDirRecursive(FRAGMENTS_DIR, path.join(MOBILE_WWW, 'fragments'));

    /*console.log('2/4 Aggiornamento icona Android da manifest.json...');
    syncAndroidIconFromManifest();*/

    console.log('3/4 Compilazione motore di gioco per browser...');
    const embedded = loadEmbeddedData();
    await buildGameEngineBundle(embedded);

    console.log('4/4 Compilazione pagine EJS in HTML statici...');
    await renderViews(embedded);

    console.log('Build mobile completata in mobile/www/');
})();