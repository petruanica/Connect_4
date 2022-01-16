/* eslint-disable no-undef */
'use strict';
// @ts-check

import { Game } from './game.js';
import { config } from './config.js';

console.log('I came in from :', document.referrer); //
if (document.referrer == '') {
    window.location.href = './';
}

// check if page was reloaded; if yes, redirect to splash screen
if (window.performance.getEntriesByType('navigation').map((nav) => nav.type).includes('reload')) {
    // window.dispatchEvent(new Event('beforeunload'));
    window.location.href = './';
}

const socket = new WebSocket(config.WEB_SOCKET_URL);
let game;

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log(data);
    if (data.event == Messages.GAME_MOVE) {
        console.log('I have to make a move at column', data);
        game.placeColumn(data.column, data.randomClicked);
    } else if (data.event == Messages.GAME_SET_COLOR) {
        console.log('I am ' + data.color);
        const playerColor = data.color;
        startGame(playerColor);
    } else if (data.event == Messages.GAME_WON_BY_OTHER) {
        game.handleWonGame(data.positions, data.color);
    } else if (data.event == Messages.GAME_WON_BY_TIMEPENALTY) {
        game.handleGameEndByTimePenalty();
    } else if (data.event == Messages.GAME_WON_BY_DISCONNECT && !game.gameEnded) {
        console.log(data.message);
        game.handleGameEndByDisconnect();
    } else if (data.event == Messages.GAME_REMATCH_REQUEST) {
        game.handleRematchRequest();
    } else if (data.event == Messages.GAME_REMATCH_ACCEPTED) {
        game.handleRematchAccepted();
    } else if (data.event == Messages.GAME_DRAW) {
        console.log(data.message);
        game.handleGameDraw();
    }
}

socket.onopen = () => {
    const data = {
        event: Messages.GAME_STARTED,
        message: 'Hello from a game!'
    }
    socket.send(JSON.stringify(data));
};

// close socket nicely
window.onbeforeunload = () => {
    if (game.gameEnded == false) {
        const data = {
            event: Messages.PLAYER_DISCONNECTED,
            message: 'Goodbye!'
        }
        socket.send(JSON.stringify(data));
    }
    socket.close();
}

function startGame (playerColor) {
    console.log(playerColor);

    game = new Game(socket, playerColor);
}

export function turnTimePenalty () {
    game.addTimePenalty();
}
