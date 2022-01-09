import { config } from "./config.js";


const socket = new WebSocket(config.WEB_SOCKET_URL);
const onlinePlayers = document.querySelector("#play>div>span");
const gamesPlayed = document.querySelector("#games-total");
socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log(data.event);
    if(data.event == Messages.GAME_STATS){
        onlinePlayers.innerHTML = data.onlinePlayers;
        gamesPlayed.innerHTML = data.gamesPlayed;
    } else if (data.event == Messages.PLAYERS_READY) {
        window.location.href = "./game";
    }
}

const playButton = document.querySelector("#play");
playButton.addEventListener("click", () => {
    const playButtonText = document.querySelector("#play>span");
    playButtonText.innerHTML = "Waiting for opponent...";
    const playButtonDiv = document.querySelector("#play>div");
    playButtonDiv.style.display = "none";
    playButton.className = "waiting-animation";
    playButton.disabled = true;

    const data = {
        "event": Messages.GAME_QUEUE,
        "message": "waiting for opponent"
    }
    socket.send(JSON.stringify(data));
});