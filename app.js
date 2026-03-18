const path = require("path");
const singleApp = require(path.join(__dirname, "/app/single"));

const onCluster = process.env.USE_CLUSTER === "true";

if(!onCluster) singleApp();