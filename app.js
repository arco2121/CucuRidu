const path = require("path");
const singleApp = require(path.join(__dirname, "/application/single"));
const allowedOrigins = [
    "https://cucuridu.web.app",
    'https://cucuridu.onrender.com',
    'https://arco2120-cucuridu.hf.space'
];

const onCluster = process.env.USE_CLUSTER === "true";

if(!onCluster) singleApp(allowedOrigins);