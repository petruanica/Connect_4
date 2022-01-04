'use strict';
// @ts-check

import {Game} from "./game.js";


const player1 = document.querySelectorAll(".player-div")[0];
const player2 = document.querySelectorAll(".player-div")[1];
const message = document.querySelector("#message");

const socket = new WebSocket("ws://localhost:3000/");

let game;
let playerColor;

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
        playerColor = data.color;
        document.querySelector('#color').innerHTML = "I am " + data.color;
        startGame();
    }
}

socket.onopen = () => {
    const data = {
        "event": "gameStart",
        "message": "Hello from a game!"
    }
    socket.send(JSON.stringify(data));
};


function startGame() {
    console.log(playerColor);

    game = new Game(socket, playerColor);

    const resetButton = document.querySelector('#reset-board');
    resetButton.addEventListener('click', () => game.resetGame()); // don't lose this https://javascript.info/bind
}

export function turnTimePenalty() {
    game.addTimePenalty();
}