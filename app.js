const fs = require('fs');
require('dotenv').config({ path: fs.existsSync('.env') ? '.env' : '.envXample' });
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
const cluster = process.env.USE_CLUSTER === "true" && process.env.ON_PLATFORM === "true";
const local = process.env.ON_PLATFORM !== "true" ? "http://localhost:" : false;
const port = !local ? 7860 : 0

const initApp = async () => {
    if (!cluster) return await singleApp(local, port, allowedOrigins);

    await attempt(
        () => clusterApp(local, port, allowedOrigins),
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