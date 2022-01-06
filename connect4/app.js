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



class ImprovedSocket{


    /**
     * sends and event through the websocket
     * @param {String} eventType name of the event 
     * @param {Object} data the information sent on the socket
     */
    send(eventType,data){
        data['event'] = eventType;
        // super.send(JSON.stringify(data));
    }

}

/**
 * returns the websocket of the other player 
 * @return {WebSocket} the socket that belongs to the other player
 */
function getOtherPlayer(webSocket){
    const index = mapSocketToGame[webSocket];
    const theGame = games[index];
    if (theGame == undefined) {
        console.error("An odd number of players joined");
        return;
    }
    if (theGame.player1 == undefined || theGame.player2 == undefined) {
        console.error("No matching player!");
        return;
    }
    console.log("The two players are in the game win index", index);
    let otherPlayer = theGame.player1;
    // only do this if we have more than 2 players
    if (webSocket == otherPlayer) {
        otherPlayer = theGame.player2;
    }
    return otherPlayer;
}

function removeFromQueue(webSocket) {
    queue = queue.filter(socket => socket !== webSocket);
}

const games = [];
let currentGame = {};
const mapSocketToGame = {};
let queue = [];


webSocketServer.on("connection", (webSocket) => {
    addClient(webSocket);

    webSocket.on("message", (message) => {
        // console.log("[LOG] " + message.toString());
        const received = JSON.parse(message.toString());
        //{"event": ceva, "asdadada"}
        console.log(received);
        if (received.event == "gameStart") {
            console.log("Add gamer");
            const data = {
                "event": 'setColor',
                "color": 'red',
            }
            if (currentGame.player1 == undefined) {
                currentGame.player1 = webSocket;
                webSocket.send(JSON.stringify(data));
            } else {
                currentGame.player2 = webSocket;
                data.color = 'orange';
                webSocket.send(JSON.stringify(data));

                games.push(currentGame);
                console.log(games.length);
                const gameCount = games.length - 1;
                mapSocketToGame[currentGame.player1] = gameCount;
                mapSocketToGame[currentGame.player2] = gameCount;
                currentGame = {};
                console.log("Two players connected to game", gameCount);
            }
        } else if (received.event == "move") {
            let otherPlayer = getOtherPlayer(webSocket);
            console.log("Move at col :", received.column);
            const data = received;
            data["event"] = "move";
            otherPlayer.send(JSON.stringify(data));
        } else if (received.event == "gameWon") {
            let otherPlayer = getOtherPlayer(webSocket);
            console.log("Game was won by the other player");
            const data = {
                "event": "gameWonByOTher",
                "color":  received.color,
                "positions": received.positions
            }
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
        } else if (received.event == "timePenalty") {
            let otherPlayer = getOtherPlayer(webSocket);
            const data = {
                "event": "gameWonByTimePenalty",
                "message": "opponent ran out of time",
            }
            otherPlayer.send(JSON.stringify(data));
        } else if (received.event == "disconnected") {
            let otherPlayer = getOtherPlayer(webSocket);
            const data = {
                "event": "gameWonByDisconnect",
                "message": "opponent disconnected",
            }
            otherPlayer.send(JSON.stringify(data));
        }
    });

    webSocket.on("close", () => {
        removeClient(webSocket);
        removeFromQueue(webSocket);
    })
});