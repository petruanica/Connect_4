class Config {
    constructor () {
        this.WEB_SOCKET_URL = 'wss://connect4-rseh.onrender.com/'; /* WebSocket URL */
        this.TIMER_SECONDS = 15;
    }
}

const config = new Config();
export { config };
