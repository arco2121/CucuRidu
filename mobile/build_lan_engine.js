const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const APP_DIR = path.join(ROOT, "application");
const PUBLIC_DIR = path.join(ROOT, "public");
const OUT_FILE = path.join(PUBLIC_DIR, "script", "lan", "lanEngine.bundle.js");

function buildVirtualFs() {
    const files = {};
    const dirs = {};

    const namesPath = path.join(APP_DIR, "include", "names", "names.json");
    if (fs.existsSync(namesPath)) {
        files["/application/include/names/names.json"] = fs.readFileSync(namesPath, "utf-8");
    }

    const cardsRoot = path.join(APP_DIR, "include", "cards");
    const cardFolders = fs.existsSync(cardsRoot)
        ? fs.readdirSync(cardsRoot, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)
        : [];
    dirs["/application/include/cards"] = cardFolders;

    for (const folder of cardFolders) {
        for (const fileName of ["frasi.json", "completamenti.json"]) {
            const full = path.join(cardsRoot, folder, fileName);
            if (fs.existsSync(full)) {
                files[`/application/include/cards/${folder}/${fileName}`] = fs.readFileSync(full, "utf-8");
            }
        }
    }

    const countByExt = (dirPath, ext) =>
        fs.existsSync(dirPath)
            ? fs.readdirSync(dirPath).filter((f) => f.toLowerCase().endsWith(ext))
            : [];

    dirs["./public/assets/pfps"] = countByExt(path.join(PUBLIC_DIR, "assets", "pfps"), ".jpg");
    dirs["./public/assets/icon_imgs"] = countByExt(path.join(PUBLIC_DIR, "assets", "icon_imgs"), ".png");

    return { files, dirs };
}

const virtualFs = buildVirtualFs();

const lanShimsPlugin = {
    name: "cucuridu-lan-shims",
    setup(build) {
        const shims = new Set(["fs", "path", "crypto", "express", "cors", "sitemap", "zlib"]);

        build.onResolve({ filter: /^(fs|path|crypto|express|cors|sitemap|zlib)$/ }, (args) => {
            if (shims.has(args.path)) {
                return { path: args.path, namespace: "lan-shim" };
            }
            return null;
        });

        build.onLoad({ filter: /.*/, namespace: "lan-shim" }, (args) => {
            switch (args.path) {
                case "path":
                    return {
                        contents: `
                            const norm = (p) => {
                                const parts = String(p || "").replace(/\\\\/g, "/").split("/");
                                const stack = [];
                                for (const part of parts) {
                                    if (!part || part === ".") continue;
                                    if (part === "..") { if (stack.length) stack.pop(); }
                                    else stack.push(part);
                                }
                                return (String(p || "").startsWith("/") ? "/" : "") + stack.join("/");
                            };
                            module.exports = {
                                join: (...args) => norm(args.filter(Boolean).join("/")),
                                resolve: (...args) => norm("/" + args.filter(Boolean).join("/")),
                                basename: (p) => String(p || "").split(/[\\\\/]/).pop() || "",
                                dirname: (p) => {
                                    const s = String(p || "").replace(/\\\\/g, "/");
                                    const i = s.lastIndexOf("/");
                                    return i <= 0 ? "/" : s.slice(0, i);
                                },
                                extname: (p) => {
                                    const base = String(p || "").split(/[\\\\/]/).pop() || "";
                                    const dot = base.lastIndexOf(".");
                                    return dot > 0 ? base.slice(dot) : "";
                                }
                            };
                        `,
                        loader: "js"
                    };

                case "fs":
                    return {
                        contents: `
                            const VFS = ${JSON.stringify(virtualFs)};
                            const clean = (p) => String(p || "").replace(/\\\\/g, "/").replace(/\\/$/, "");
                            module.exports = {
                                existsSync: (p) => {
                                    const k = clean(p);
                                    return Boolean(VFS.files[k] !== undefined || VFS.dirs[k] !== undefined);
                                },
                                readFileSync: (p) => {
                                    const k = clean(p);
                                    if (VFS.files[k] === undefined) throw new Error("VFS file non trovato: " + k);
                                    return VFS.files[k];
                                },
                                readdirSync: (p, opts) => {
                                    const k = clean(p);
                                    const list = VFS.dirs[k] || [];
                                    if (opts && opts.withFileTypes) {
                                        return list.map((name) => ({ name, isDirectory: () => true }));
                                    }
                                    return [...list];
                                },
                                renameSync: () => {}
                            };
                        `,
                        loader: "js"
                    };

                case "crypto":
                    return {
                        contents: `
                            function sha256(ascii) {
                                const rightRotate = (v, a) => (v >>> a) | (v << (32 - a));
                                const maxWord = Math.pow(2, 32);
                                let result = "";
                                const words = [];
                                const utf8 = unescape(encodeURIComponent(String(ascii)));
                                const asciiBitLength = utf8.length * 8;
                                const hash = [];
                                const k = [];
                                let primeCounter = 0;
                                const isComposite = {};
                                for (let candidate = 2; primeCounter < 64; candidate++) {
                                    if (!isComposite[candidate]) {
                                        for (let i = 0; i < 313; i += candidate) isComposite[i] = candidate;
                                        if (primeCounter < 8) hash[primeCounter] = (Math.pow(candidate, 0.5) * maxWord) | 0;
                                        k[primeCounter++] = (Math.pow(candidate, 1 / 3) * maxWord) | 0;
                                    }
                                }
                                const padded = utf8 + "\\x80" + "\\x00".repeat((64 - ((utf8.length + 9) % 64)) % 64);
                                for (let i = 0; i < padded.length; i += 4) {
                                    words.push((padded.charCodeAt(i) << 24) | (padded.charCodeAt(i + 1) << 16) | (padded.charCodeAt(i + 2) << 8) | padded.charCodeAt(i + 3));
                                }
                                words.push((asciiBitLength / maxWord) | 0);
                                words.push(asciiBitLength | 0);
                                for (let j = 0; j < words.length;) {
                                    const w = words.slice(j, j += 16);
                                    const oldHash = hash.slice(0);
                                    for (let i = 0; i < 64; i++) {
                                        const w15 = w[i - 15], w2 = w[i - 2];
                                        const a = hash[0], e = hash[4];
                                        const temp1 = hash[7]
                                            + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
                                            + ((e & hash[5]) ^ ((~e) & hash[6]))
                                            + k[i]
                                            + (w[i] = (i < 16) ? w[i] : (
                                                w[i - 16]
                                                + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
                                                + w[i - 7]
                                                + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
                                            ) | 0);
                                        const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
                                            + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
                                        hash.unshift((temp1 + temp2) | 0);
                                        hash.pop();
                                        hash[4] = (hash[4] + temp1) | 0;
                                    }
                                    for (let i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
                                }
                                for (let i = 0; i < 8; i++) {
                                    for (let j = 3; j + 1; j--) {
                                        const b = (hash[i] >> (j * 8)) & 255;
                                        result += ((b < 16) ? "0" : "") + b.toString(16);
                                    }
                                }
                                return result;
                            }
                            module.exports = {
                                createHash: () => {
                                    let buf = "";
                                    return {
                                        update(chunk) { buf += String(chunk); return this; },
                                        digest() { return sha256(buf); }
                                    };
                                }
                            };
                        `,
                        loader: "js"
                    };

                case "express":
                    return {
                        contents: `
                            const noopMw = () => (req, res, next) => next && next();
                            function express() { return {}; }
                            express.static = noopMw;
                            express.json = noopMw;
                            express.urlencoded = noopMw;
                            module.exports = express;
                        `,
                        loader: "js"
                    };

                case "cors":
                    return { contents: `module.exports = () => (req, res, next) => next && next();`, loader: "js" };

                case "sitemap":
                    return { contents: `module.exports = { SitemapStream: class {} };`, loader: "js" };

                case "zlib":
                    return { contents: `module.exports = { createGzip: () => ({}) };`, loader: "js" };
            }
        });

        const appDirNorm = APP_DIR.replace(/\\/g, "/").toLowerCase();
        build.onLoad({ filter: /\.js$/ }, (args) => {
            const normArgsPath = args.path.replace(/\\/g, "/");
            if (!normArgsPath.toLowerCase().startsWith(appDirNorm)) return null;
            let src = fs.readFileSync(args.path, "utf-8");
            const relDir = "/" + path.relative(ROOT, path.dirname(args.path)).replace(/\\/g, "/");
            src = src.replace(
                /require\(\s*\(?\s*path\.join\(\s*__dirname\s*,\s*(['"`])([^'"`]+)\1\s*\)\s*\)?\s*\)/g,
                (_, quote, sub) => {
                    let fixed = sub;
                    if (fixed.startsWith("/")) fixed = "." + fixed;
                    else if (!fixed.startsWith(".")) fixed = "./" + fixed;
                    return `require(${quote}${fixed}${quote})`;
                }
            );
            return {
                contents: `var __dirname = ${JSON.stringify(relDir)};\n${src}`,
                loader: "js"
            };
        });
    }
};

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });

esbuild.build({
    entryPoints: [path.join(__dirname, "lan_engine_entry.js")],
    bundle: true,
    format: "iife",
    platform: "browser",
    target: ["es2020"],
    outfile: OUT_FILE,
    plugins: [lanShimsPlugin]
}).then(() => {
    console.log("LAN Engine compilato con successo in:", OUT_FILE);
}).catch((err) => {
    console.error(err);
    process.exit(1);
});