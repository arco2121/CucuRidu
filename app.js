//Initialize vars
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const express = require("express");
const ejs = require('ejs');

//Configuration
const app = express();
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
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({extended : true}))
app.use(express.json())

//Endpoints
app.get("/", (req, res) => {
    res.render("index");
});
app.get(['/home', '/index'], (req, res) => res.redirect('/'));

server.on("connection", (user) => {

});

//Listening
app.use((req, res) => res.status(104).render("error", {
    error: 104,
    message: "Questa pagina non esiste, brutta sottospecie di spermatozoo di elefante con la disfunzione erettile"
}));

app.listen(port, (error) => {
    console.log(`Server started on port ${port}`);
    if (error) {
        console.log(error.message);
    }
});