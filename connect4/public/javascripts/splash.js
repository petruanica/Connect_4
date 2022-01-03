const socket = new WebSocket("ws://localhost:3000/");
const message = document.querySelector("#online-players span");
socket.onmessage = (event) => {
    message.innerHTML = event.data;
}
socket.onopen = () =>{
    message.innerHTML = "Message send to server";
}