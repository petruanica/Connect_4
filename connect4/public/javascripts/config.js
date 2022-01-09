class Config {
    constructor() {
        this.WEB_SOCKET_URL = "ws://192.168.100.102:3000"; /* WebSocket URL */
        this.TIMER_SECONDS = 15;
    }
}

const config = new Config();
export { config };