class ImprovedSocket{

    /**
     * 
     * @param {websocket} webSocket 
     */
    constructor(webSocket){
        this.webSocket = webSocket;
    }
    /**
     * sends and event through the websocket
     * @param {String} eventType name of the event 
     * @param {Object} data the information sent on the socket
     */
    sendEvent(eventType,data){
        data['event'] = eventType;
        this.webSocket.send(JSON.stringify(data));
    }
    /**
     * Sends an object on the socket by calling JSON.stringify()
     * @param {Object} data object to send to through the websocket
     */
    send(data){
        if(typeof(data) == 'string'){
            this.webSocket.send(data);
        }else{
            this.webSocket.send(JSON.stringify(data));
        }
    }

    /**
     * Wrapper around webSocket.on(event,callback)
     * @param {String} event event name
     * @param {Object} callback callback  
     */
    on(event, callback){
        this.webSocket.on(event,callback);
    }
}

module.exports.ImprovedSocket = ImprovedSocket;