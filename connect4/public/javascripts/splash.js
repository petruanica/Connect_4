/* eslint-disable no-undef */
import { config } from './config.js';

if (window.performance.getEntries('navigation').map((nav) => nav.type).includes('back_forward')) {
    window.location.reload();
}

const socket = new WebSocket(config.WEB_SOCKET_URL);
const onlinePlayers = document.querySelector('#play>div>span');
socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log(data.event);
    if (data.event == Messages.GAME_STATS) {
        onlinePlayers.innerHTML = data.onlinePlayers;
    } else if (data.event == Messages.PLAYERS_READY) {
        window.location.href = './game';
    }
}

const playButton = document.querySelector('#play');
playButton.addEventListener('click', () => {
    const playButtonText = document.querySelector('#play>span');
    playButtonText.innerHTML = 'Waiting for opponent...';
    const playButtonDiv = document.querySelector('#play>div');
    playButtonDiv.style.display = 'none';
    playButton.className = 'waiting-animation';
    playButton.disabled = true;

    const data = {
        event: Messages.GAME_QUEUE,
        message: 'waiting for opponent'
    }
    socket.send(JSON.stringify(data));
});
