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
const allowedOrigins = [
    "https://cucuridu.web.app",
    'https://cucuridu.onrender.com',
    'https://arco2120-cucuridu.hf.space'
];
const attempt = async (operation, fallback) => {
    try { return await operation();}
    catch (err) {return await fallback(err);}
};
const ENV = {
    ...envFiles,
    ...process.env
};
const cluster = ENV.USE_CLUSTER === "true";
const local = ENV.ON_PLATFORM !== "true" ? "http://localhost:" : false;
const port = !local ? 7860 : 0

const initApp = async () => {
    if (!cluster) return await singleApp(local, port, allowedOrigins);
    await attempt(
        () => clusterApp(local, port, allowedOrigins, ENV),
        async (err) => {
            console.warn("Cluster failed => " + err.message);
            await singleApp(local, port, allowedOrigins);
        }
    );
};

initApp().catch((err) => {
    console.error("InitApp failed => " + err.message);
    process.exit(1);
});