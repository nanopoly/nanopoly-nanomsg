'use strict';

const is = require('is_js');
const shortid = require('shortid');
const NanoMSG = require('nanomsg');

/**
 * @description Wrapper class for nanomsg sockets
 * @class Socket
 */
class Socket {
    /**
     * @description Creates an instance of Socket.
     * @param {string} type     socket type
     * @memberof Socket
     */
    constructor(type, id) {
        this._id = `${type}/${
            is.string(id) && shortid.isValid(id) ? id : shortid.generate()
        }`;
        this._type = type;
        this._socket = NanoMSG.socket(this._type, { encoding: 'utf8' });
    }

    /**
     * @description establishes a connection
     * @param {number} [port=8000]      server's port number
     * @param {string} [ip='0.0.0.0']   server's ip address
     * @throws NanopolyError
     * @memberof Socket
     */
    connect(port = 8000, ip = '0.0.0.0', method) {
        this._address = `${ip}:${port}`;
        if (is.not.function(this._socket[method]))
            throw new Error(
                `invalid method(${method}) for working with ${this._type} sockets`
            );

        this._socket[method](`tcp://${ip}:${port}`);
    }

    /**
     * @description sets message handler on nanomsq socket
     * @param {string} [event]  event type
     * @param {function} fn     handler function
     * @memberof Socket
     */
    handle(event, fn) {
        if (is.function(event)) {
            fn = event;
            event = 'data';
        }
        if (is.not.function(fn)) throw new Error(event, fn);

        this._socket.on(event, fn);
    }

    /**
     * @description alias method for sending new messages through nanomsg socket
     * @param {string} msg      payload
     * @memberof Socket
     */
    send(msg) {
        try {
            if (is.array(msg)) this._socket.send(msg);
            else
                this._socket.send(
                    is.not.string(msg) ? JSON.stringify(msg) : msg
                );
        } catch (e) {
            return;
        }
    }

    /**
     * @description alias method for closing nanomsg socket
     * @memberof Socket
     */
    disconnect() {
        this._socket.close();
    }
}

module.exports = Socket;
