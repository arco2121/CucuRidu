const path = require("path");
const singleApp = require(path.join(__dirname, "/application/single"));
const clusterApp = require(path.join(__dirname, "/application/cluster"));
const allowedOrigins = [
    "https://cucuridu.web.app",
    'https://cucuridu.onrender.com',
    'https://arco2120-cucuridu.hf.space'
];
const attempt = (operation, fallback) => {
    try { return operation(); }
    catch (err) { fallback(err); }
};
const onCluster = process.env.USE_CLUSTER === "true" && process.env.NODE_ENV === "production";

const initApp = () => {
    if(!onCluster) return singleApp(allowedOrigins);
    attempt(() => clusterApp(allowedOrigins), (err) => {
        console.warn("Cluster failed => " + err.message);
        singleApp(allowedOrigins);
    });
};

attempt(initApp, (err) => {
    console.error("InitApp failed => " + err.message);
    process.exit(1);
});