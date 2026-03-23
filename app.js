const path = require("path");
const singleApp = require(path.join(__dirname, "/application/single"));
const clusterApp = require(path.join(__dirname, "/application/cluster"));
const allowedOrigins = [
    "https://cucuridu.web.app",
    'https://cucuridu.onrender.com',
    'https://arco2120-cucuridu.hf.space'
];

const onCluster = process.env.USE_CLUSTER === "true" && process.env.NODE_ENV === "production";

if(!onCluster) singleApp(allowedOrigins);
else clusterApp(allowedOrigins);