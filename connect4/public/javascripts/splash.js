const socket = new WebSocket("ws://localhost:3000/");
const onlinePlayers = document.querySelector("#play span");
socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if(data.event == "onlinePlayers"){
        onlinePlayers.innerHTML = data.onlinePlayers;
    }
}