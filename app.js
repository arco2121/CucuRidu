const envFiles = {};
require('dotenv').config({
    path: ['.envXample', '.ENV'],
    processEnv: envFiles,
    quiet: true,
    override: true
});
const path = require("path");
const singleApp = require(path.join(__dirname, "/application/single"));
const clusterApp = require(path.join(__dirname, "/application/cluster"));
const attempt = async (operation, fallback) => {
    try { return await operation();}
    catch (err) {return await fallback(err);}
};
const ENV = {
    ...envFiles,
    ...process.env
};

const allowedOrigins = [
    "https://cucuridu.web.app",
    'https://cucuridu.onrender.com',
    'https://arco2120-cucuridu.hf.space',
    'https://cucuridu-gmgv.onrender.com',
    'https://cucuridu-jean.onrender.com',
    ENV.ON_PLATFORM !== "true" ? "http://localhost:" : null
];
const cluster = ENV.USE_CLUSTER === "true";
const local = allowedOrigins[allowedOrigins.length - 1] ?? false;
const port = !local ? 7860 : 0

// Rete di sicurezza: un errore non gestito dentro un handler asincrono non
// deve piu poter chiudere il processo e buttare fuori tutta la partita.
process.on('unhandledRejection', (motivo) => {
    console.error("Promise non gestita =>", motivo?.message || motivo);
});
process.on('uncaughtException', (err) => {
    console.error("Eccezione non gestita =>", err?.message || err);
});

const initApp = async () => {
    if (!cluster) return await singleApp(local, port, allowedOrigins, ENV);
    await attempt(
        () => clusterApp(local, port, allowedOrigins, ENV),
        async (err) => {
            console.warn("Cluster failed => " + err.message);
            await singleApp(local, port, allowedOrigins, ENV);
        }
    );
};

initApp().catch((err) => {
    console.error("InitApp failed => " + err.message);
    process.exit(1);
});