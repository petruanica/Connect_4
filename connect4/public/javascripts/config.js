class Config {
    constructor() {
        this.WEB_SOCKET_URL = "ws://localhost:3000"; /* WebSocket URL */
    }
}

const config = new Config();
export { config };