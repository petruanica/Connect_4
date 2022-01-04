//@ts-check

const path = require("path");
const express = require('express');
const http = require("http");
const websocket = require("ws");

const indexRouter = require('./routes/index');
const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use('/', indexRouter);
app.use(express.static(__dirname + "/public"));

const server = http.createServer(app);
server.listen(3000);





const webSocketServer = new websocket.Server({ server });

// client part 
let clients = [];

function updateClients() {
    const data = {
        "event": "onlinePlayers",
        "onlinePlayers": clients.length,
    }
    for (const client of clients) {
        client.send(JSON.stringify(data));
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


// gamer part 
let gamers = [];

function updateGamers() {
    let index = 0;           // ce face index? 
    const data = {
        "event": "playersConnected",
        "playersGame": gamers.length
    }
    for (const socket of gamers ) {
        socket.send(JSON.stringify(data));
        index++;
    }
}

function addGamer(webSocket) {
    gamers.push(webSocket);
    updateGamers();
}

function removeGamer(webSocket) {
    gamers = gamers.filter(socket => socket !== webSocket);
    updateGamers();
}



const games = [];
let currentGame = {};
const mapSocketToGame = {};
let queue = [];

function removeFromQueue(webSocket) {
    queue = queue.filter(socket => socket !== webSocket);
}

webSocketServer.on("connection", (webSocket) => {
    addClient(webSocket);

    //.
    webSocket.on("message", (message) => {
        // console.log("[LOG] " + message.toString());
        const received = JSON.parse(message.toString());
        //{"event": ceva, "asdadada"}
        console.log(received);
        if (received.event == "gameStart") {
            addGamer(webSocket);
            console.log("Add gamer");
            const data = {
                "event": 'setColor',
                "color": 'red',
            }
            // games
            if (currentGame.player1 == undefined) {
                currentGame.player1 = webSocket;

                webSocket.send(JSON.stringify(data));
            } else {
                currentGame.player2 = webSocket;
                data.color = 'yellow';
                webSocket.send(JSON.stringify(data));

                games.push(currentGame);
                console.log(games.length);
                const gameCount = games.length - 1;
                mapSocketToGame[currentGame.player1] = gameCount;
                mapSocketToGame[currentGame.player2] = gameCount;
                currentGame = {};
            }
        } else if(received.event == "move"){
            const index = mapSocketToGame[webSocket];
            const theGame = games[index];
            if(theGame == undefined){
                console.log("An odd number of players joined");
                return;
            }
            if(theGame.player1 == undefined || theGame.player2 == undefined){
                console.log("No matching player!");
                return;
            }
            let otherPlayer = theGame.player1;
            // only do this if we have more than 2 players
            if(webSocket == otherPlayer){
                otherPlayer = theGame.player2;
            }
            console.log("Move at col :",received.column);
            const data = {
                "event": "makeMove",
                "column": received.column,
            }
            console.log(otherPlayer);
            otherPlayer.send(JSON.stringify(data));
        } else if (received.event == "enqueued") {
            queue.push(webSocket);
            console.log("players in queue: " + queue.length);

            if (queue.length == 2) {
                const data = {
                    "event": "playersReady",
                    "message": "ready to start game"
                }
                queue[0].send(JSON.stringify(data));
                queue[1].send(JSON.stringify(data));
                queue = [];
            }
        } 
    });

    webSocket.on("close", () => {
        removeClient(webSocket);
        removeGamer(webSocket);
        removeFromQueue(webSocket);

        // const index = mapSocketToGame[webSocket];
        // const theGame = games[index];
        // if (theGame == undefined) {
        //     console.log("An odd number of players joined");
        //     return;
        // }
        // if (theGame.player1 == undefined || theGame.player2 == undefined) {
        //     console.log("No matching player!");
        //     return;
        // }
        // let otherPlayer = theGame.player1;
        // // only do this if we have more than 2 players
        // if (webSocket == otherPlayer) {
        //     otherPlayer = theGame.player2;
        // }

        // const data = {
        //     "event": "gameEndedByDisconnect",
        //     "message": "Opponent disconneced",
        // }
        // console.log(otherPlayer);
        // otherPlayer.send(JSON.stringify(data));

        // console.log("Someone disconected!", clients.length);
    })
});
