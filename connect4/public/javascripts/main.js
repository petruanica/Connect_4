'use strict';
// @ts-check

import { Game } from "./game.js";
import { config } from "./config.js";

// check if page was reloaded; if yes, redirect to splash screen
if (window.performance.getEntriesByType('navigation').map((nav) => nav.type).includes('reload')) {
    window.location.href = "./";
}


const message = document.querySelector("#message");
const socket = new WebSocket(config.WEB_SOCKET_URL);

let game;


socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log(data);
    if (data.event == "playersConnected") {
        message.innerHTML = data.playersGame;
    } else if (data.event == "move") {
        console.log("I have to make a move at column", data);
        game.placeColumn(data.column, data.randomClicked);
    } else if (data.event == "setColor") {
        console.log("I am " + data.color);
        const playerColor = data.color;
        const playerDivs = document.querySelectorAll(".player-div");

        const circleYou = document.querySelectorAll(".player-turn")[0]; // you
        const circleOpponent = document.querySelectorAll(".player-turn")[1]; // other

        if (playerColor == 'red') {
            playerDivs[0].style.borderColor = 'red';
            playerDivs[1].style.borderColor = 'orange';
            circleYou.style.backgroundColor = 'red';
            circleOpponent.style.backgroundColor = 'orange';
        } else {
            playerDivs[0].style.borderColor = 'orange';
            playerDivs[1].style.borderColor = 'red';
            circleYou.style.backgroundColor = 'orange';
            circleOpponent.style.backgroundColor = 'red';
        }
        startGame(playerColor);
    } else if (data.event == "gameWonByOTher") {
        game.handleWonGame(data.positions, data.color);
    } else if (data.event == "gameWonByTimePenalty") {
        game.handleGameEndByTimePenalty();
    } else if (data.event == "gameWonByDisconnect" && !game.gameEnded) {
        console.log(data.message);
        game.handleGameEndByDisconnect();
    }else if(data.event == "requestRematch"){
        game.handleRematchRequest();
    }else if(data.event == "rematchAccepted"){
        game.handleRematchAccepted();
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

  }


export function turnTimePenalty() {
    game.addTimePenalty();
}