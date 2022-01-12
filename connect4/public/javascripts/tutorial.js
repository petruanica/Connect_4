import { config } from "./config.js";

const socket = new WebSocket(config.WEB_SOCKET_URL);
console.log("Socket" + socket);
// close socket nicely
window.onbeforeunload = () => {
    console.log("Exit here");
    const data = {
        "event": Messages.DISCONNECT,
        "message": "Disconect from splash!"
    }
    socket.send(JSON.stringify(data));
    socket.close();
}