//@ts-check

const path = require("path");
const express = require('express');
const http = require("http");
const websocket = require("ws");

const indexRouter = require('./routes/index');
const { on } = require("events");
const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use('/', indexRouter);
app.use(express.static(__dirname + "/public"));

const server = http.createServer(app);
server.listen(3000);

const webSocketServer = new websocket.Server({ server });
let clients = [];

function updateClients() {
    for (const client of clients) {
        client.send(clients.length);
    }
}

function addClient(webSocket) {
    clients.push(webSocket);
    updateClients();
}

function removeClient(webSocket) {
    clients = clients.filter(socket => socket !== webSocket);
    updateClients();
}
let gamers = [];
const names = ["name1","name2","name3","name4","name5"]

function updateGamers() {
    for(const socket of gamers ){
        socket.send(gamers.length);
    }
}

function addGamer(webSocket) {
    gamers.push(websocket);
    updateGamers();
}

function removeGamer(webSocket) {
    gamers = gamers.filter(socket => socket !== webSocket);
    updateGamers();
}

webSocketServer.on("connection", (webSocket) => {
    addClient(webSocket);
    // console.log("Someone connected", clients.length);

    webSocket.on("message", (message) => {
        console.log("[LOG] " + message);
        const mes = message.toString();
        if (mes.includes("game")) {
            gamers.push(webSocket);
        }
    });
    webSocket.on("close", () => {
        removeClient(webSocket);
        // console.log("Someone disconected!", clients.length);
    })
});
