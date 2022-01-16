(function (exports) {
    exports.GAME_STARTED = 'gameStart';
    exports.GAME_SET_COLOR = 'setColor';
    exports.GAME_MOVE = 'move';
    exports.GAME_STATS = 'gameStats';
    exports.GAME_QUEUE = 'queue';
    exports.GAME_WON = 'gameWon';
    exports.GAME_WON_BY_OTHER = 'gameWonByOther';
    exports.GAME_WON_BY_DISCONNECT = 'gameWonByDisconnect';
    exports.GAME_WON_BY_TIMEPENALTY = 'gameWonByTimePenalty';
    exports.GAME_DRAW = 'gameDraw';
    exports.GAME_LOST_PENALTY = 'timePenalty';
    exports.GAME_REMATCH_REQUEST = 'rematchRequest';
    exports.GAME_REMATCH_ACCEPTED = 'rematchAccepted';
    exports.PLAYERS_READY = 'playersReady';
    exports.PLAYER_DISCONNECTED = 'playerDisconnected';
}(typeof exports === 'undefined' ? this.Messages = {} : exports));
