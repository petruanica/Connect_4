class Config {
    constructor() {
        this.WEB_SOCKET_URL = "ws://localhost:3000"; /* WebSocket URL */
        this.TIMER_SECONDS = 10;
    }
}

const config = new Config();
export { config };