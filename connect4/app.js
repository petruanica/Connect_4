// @ts-check

const messages = require('./public/javascripts/messages');
const path = require('path');
const express = require('express');
const http = require('http');
const ws = require('ws');
const fs = require('fs');
const improvedws = require('./improvedSocket');
const gameStats = require('./gamestats')

const indexRouter = require('./routes/index');

const app = express();
const port = process.argv[2];

// console.log(fs.readFileSync.toString());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

console.log(app.use.toString())
app.use('/', indexRouter);
app.use(express.static(path.join(__dirname, '/public')));

const server = http.createServer(app);
server.on('connection', updateGameStats);

server.listen(port);
const webSocketServer = new ws.Server({ server });

function updateGameStats () {
    const data = fs.readFileSync('general_stats.json');
    const stats = JSON.parse(data.toString());
    gameStats.gamesPlayed = stats.gamesPlayed;
    if (stats.actualGamesPlayed == 0) { gameStats.averageGameLength = 0; } else { gameStats.averageGameLength = Math.round(stats.gamesLengthSum / stats.actualGamesPlayed * 10) / 10; }
    // 2 decimal round
}

function addGameToStats (isRealGame = true, gameLength = undefined) {
    const data = fs.readFileSync('general_stats.json');
    const stats = JSON.parse(data.toString());
    stats.gamesPlayed = stats.gamesPlayed + 1;
    if (gameLength != undefined) {
        stats.gamesLengthSum += gameLength;
    }
    gameStats.gamesPlayed = stats.gamesPlayed;
    if (isRealGame) {
        stats.actualGamesPlayed++;
    }
    if (stats.actualGamesPlayed == 0) { gameStats.averageGameLength = 0; } else { gameStats.averageGameLength = Math.round(stats.gamesLengthSum / stats.actualGamesPlayed * 10) / 10; }
    // 2 decimal round
    fs.writeFileSync('general_stats.json', JSON.stringify(stats));
    updateClients();
}

// client part
let clients = [];

function updateClients () {
    const data = {
        event: messages.GAME_STATS,
        onlinePlayers: clients.length
    }
    for (const client of clients) {
        client.send(JSON.stringify(data));
    }
}

function addClient (webSocket) {
    clients.push(webSocket);
    updateClients();
}

function removeClient (webSocket) {
    clients = clients.filter(socket => socket !== webSocket);
    updateClients();
}

/**
 * returns the websocket of the other player
 * @return {improvedws.ImprovedSocket} the socket that belongs to the other player
 */
function getOtherPlayer (webSocket) {
    const theGame = findGame(webSocket);
    if (theGame == undefined) {
        console.error('An odd number of players joined');
        return;
    }
    if (theGame.player1 == undefined || theGame.player2 == undefined) {
        console.error('No matching player!');
        return;
    }
    // console.log("The two players are in the game win index", index);
    let otherPlayer = theGame.player1;
    // only do this if we have more than 2 players
    if (webSocket == otherPlayer) {
        otherPlayer = theGame.player2;
    }
    return otherPlayer;
}

function removeFromQueue (webSocket) {
    queue = queue.filter(socket => socket !== webSocket);
}

function findGame (webSocket) {
    return games.find(game => game.player1 == webSocket || game.player2 == webSocket);
}

function removeGame (webSocket) {
    games = games.filter(game => clients.includes(game.player1) || clients.includes(game.player2));
}

let games = [];
let currentGame = {};
let queue = [];
let gameCount = 0;


webSocketServer.on('connection', (socket) => {
    const webSocket = new improvedws.ImprovedSocket(socket);
    addClient(webSocket);

    webSocket.on('message', (message) => {
        // console.log("[LOG] " + message.toString());
        const received = JSON.parse(message.toString());
        if (received.event == messages.GAME_STARTED) {
            console.log('Add gamer');
            const data = {
                event: messages.GAME_SET_COLOR,
                color: 'red'
            }
            if (currentGame.player1 == undefined) {
                currentGame.player1 = webSocket;
            } else {
                currentGame.player1.send(data);

                currentGame.player2 = webSocket;
                data.color = 'orange';
                webSocket.send(data);

                games.push(currentGame);
                console.log(games.length);
                currentGame = {};
                console.log('Two players connected to game', gameCount);
                gameCount++;
            }
        } else if (received.event == messages.GAME_MOVE) {
            const otherPlayer = getOtherPlayer(webSocket);
            console.log('Move at col :', received.column);
            otherPlayer.send(received);
        } else if (received.event == messages.GAME_WON) {
            const otherPlayer = getOtherPlayer(webSocket);
            console.log('Game was won by the other player');
            console.log('Length : ', received.gameLength);
            const data = {
                event: messages.GAME_WON_BY_OTHER,
                color: received.color,
                positions: received.positions
            }
            otherPlayer.send(data);
            addGameToStats(true, received.gameLength);
        } else if (received.event == messages.GAME_DRAW) {
            const otherPlayer = getOtherPlayer(webSocket);
            console.log('Game ended in a draw!');
            otherPlayer.send(received);
            addGameToStats(true, received.gameLength);
        } else if (received.event == messages.GAME_QUEUE) {
            queue.push(webSocket);
            console.log('players in queue: ' + queue.length);
            if (queue.length == 2) {
                const data = {
                    event: messages.PLAYERS_READY,
                    message: 'ready to start game'
                }
                queue[0].send(data);
                queue[1].send(data);
                queue = [];
            }
        } else if (received.event == messages.GAME_LOST_PENALTY) {
            const otherPlayer = getOtherPlayer(webSocket);
            const data = {
                event: messages.GAME_WON_BY_TIMEPENALTY,
                message: 'opponent ran out of time'
            }
            otherPlayer.send(data);
            addGameToStats(false);
        } else if (received.event == messages.PLAYER_DISCONNECTED) {
            const otherPlayer = getOtherPlayer(webSocket);
            const data = {
                event: messages.GAME_WON_BY_DISCONNECT,
                message: 'opponent disconnected'
            }
            console.log('someone disconnected');
            otherPlayer.send(data);
            addGameToStats(false);
        } else if (received.event == messages.GAME_REMATCH_REQUEST) {
            const otherPlayer = getOtherPlayer(webSocket);
            otherPlayer.send(received);
        } else if (received.event == messages.GAME_REMATCH_ACCEPTED) {
            const otherPlayer = getOtherPlayer(webSocket);
            otherPlayer.send(received); // send the same event to the client
        }
    });

    webSocket.on('close', () => {
        removeClient(webSocket);
        removeFromQueue(webSocket);
        removeGame();
    })
});
