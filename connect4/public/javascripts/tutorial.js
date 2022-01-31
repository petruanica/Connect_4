import { config } from './config.js';


if (window.performance.getEntries('navigation').map((nav) => nav.type).includes('back_forward')) {
    window.location.reload();
}

const socket = new WebSocket(config.WEB_SOCKET_URL);
