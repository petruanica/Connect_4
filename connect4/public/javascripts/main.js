'use strict';
// @ts-check

import { Game } from "./game.js";
import { config } from "./config.js";

// check if page was reloaded; if yes, redirect to splash screen
if (window.performance.getEntriesByType('navigation').map((nav) => nav.type).includes('reload')) {
    // window.location.href = "./";
}


const message = document.querySelector("#message");

const socket = new WebSocket(config.WEB_SOCKET_URL);

let game;

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log(data);
    if (data.event == "playersConnected") {
        message.innerHTML = data.playersGame;
    } else if (data.event == "makeMove") {
        console.log("I have to make a move at column", data.column);
        game.placeColumn(data.column);
    } else if (data.event == "setColor") {
        console.log("I am " + data.color);
        const playerColor = data.color;
        const playerDivs = document.querySelectorAll(".player-div");

        if (playerColor == 'red') {
            playerDivs[0].style.borderColor = 'red';
            playerDivs[1].style.borderColor = 'orange';
        } else {
            playerDivs[0].style.borderColor = 'orange';
            playerDivs[1].style.borderColor = 'red';
        }
        startGame(playerColor);
    } else if (data.event == "gameWonByOTher") {
        game.handleWonGame(data.positions, data.color);
    } else if (data.event == "gameWonByTimePenalty") {
        game.handleGameEndByTimePenalty();
    } else if (data.event == "gameWonByDisconnect" && !game.gameEnded) {
        console.log(data.message);
        game.handleGameEndByDisconnect();
    }
}

socket.onopen = () => {
    const data = {
        "event": "gameStart",
        "message": "Hello from a game!"
    }
    socket.send(JSON.stringify(data));
};


// close socket nicely
window.onbeforeunload = () => {
    const data = {
        "event": "disconnected",
        "message": "Goodbye!"
    }
    socket.send(JSON.stringify(data));
    socket.close();
}


function startGame(playerColor) {
    console.log(playerColor);

    game = new Game(socket, playerColor);

    const resetButton = document.querySelector('#rematch-button');
    resetButton.addEventListener('click', () => game.resetGame()); // don't lose this https://javascript.info/bind
}


export function turnTimePenalty() {
    game.addTimePenalty();
}