require('dotenv').config();
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
const onCluster = process.env.USE_CLUSTER === "true" || process.env.ON_PLATFORM === "true";

const initApp = async () => {
    if (!onCluster) return await singleApp(allowedOrigins);

    await attempt(
        () => clusterApp(allowedOrigins),
        async (err) => {
            console.warn("Cluster failed => " + err.message);
            await singleApp(allowedOrigins);
        }
    );
};

initApp().catch((err) => {
    console.error("InitApp failed => " + err.message);
    process.exit(1);
});