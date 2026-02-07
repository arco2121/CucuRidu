//Initialize vars
const Express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const express = require("express");

//Configuration
const app = Express();
const serverConfig = createServer(app);
const port = process.env.PORT || 3000;
const server = new Server(serverConfig, {
    cors: {
        methods: ["GET", "POST"]
    },
    connectionStateRecovery: {},
    pingInterval: 10000,
    pingTimeout: 8000
});
app.use(express.static("public")); //Puoi cambiare in base a come strutturi

//Endpoints
app.get("/", (req, res) => {
    res.render("index");
});

server.on("connection", (user) => {

});

//Listening
app.listen(port, (error) => {
    console.log(`Server started on port ${port}`);
    if (error) {
        console.log(error.message);
    }
});