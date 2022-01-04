const socket = new WebSocket("ws://localhost:3000/");
const onlinePlayers = document.querySelector("#play>div>span");
socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log(data.event);
    if(data.event == "onlinePlayers"){
        onlinePlayers.innerHTML = data.onlinePlayers;
    } else if (data.event == "playersReady") {
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

    const data = {
        "event": "enqueued",
        "message": "waiting for opponent"
    }
    socket.send(JSON.stringify(data));
});