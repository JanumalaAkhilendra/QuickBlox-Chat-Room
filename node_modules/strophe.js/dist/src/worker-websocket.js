"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _websocket = _interopRequireDefault(require("./websocket.js"));
var _builder = require("./builder.js");
var _core = _interopRequireDefault(require("./core.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/**
 * @license MIT
 * @copyright JC Brand
 */

/**
 * @typedef {import("./connection.js").default} Connection
 * @typedef {import("./builder.js").default} Builder
 */

/**
 * Helper class that handles a websocket connection inside a shared worker.
 */
class WorkerWebsocket extends _websocket.default {
  /**
   * Create and initialize a Strophe.WorkerWebsocket object.
   * @param {Connection} connection - The Strophe.Connection
   */
  constructor(connection) {
    super(connection);
    this._conn = connection;
    this.worker = new SharedWorker(this._conn.options.worker, 'Strophe XMPP Connection');
    this.worker.onerror = e => {
      var _console;
      (_console = console) === null || _console === void 0 ? void 0 : _console.error(e);
      _core.default.log(_core.default.LogLevel.ERROR, `Shared Worker Error: ${e}`);
    };
  }

  /**
   * @private
   */
  _setSocket() {
    this.socket = {
      send: str => this.worker.port.postMessage(['send', str]),
      close: () => this.worker.port.postMessage(['_closeSocket']),
      onopen: () => {},
      onerror: () => e => this._onError(e),
      onclose: () => e => this._onClose(e),
      onmessage: () => {},
      readyState: null
    };
  }
  _connect() {
    this._setSocket();
    this._messageHandler = m => this._onInitialMessage(m);
    this.worker.port.start();
    this.worker.port.onmessage = ev => this._onWorkerMessage(ev);
    this.worker.port.postMessage(['_connect', this._conn.service, this._conn.jid]);
  }

  /**
   * @param {Function} callback
   */
  _attach(callback) {
    this._setSocket();
    this._messageHandler = m => this._onMessage(m);
    this._conn.connect_callback = callback;
    this.worker.port.start();
    this.worker.port.onmessage = ev => this._onWorkerMessage(ev);
    this.worker.port.postMessage(['_attach', this._conn.service]);
  }

  /**
   * @param {number} status
   * @param {string} jid
   */
  _attachCallback(status, jid) {
    if (status === _core.default.Status.ATTACHED) {
      this._conn.jid = jid;
      this._conn.authenticated = true;
      this._conn.connected = true;
      this._conn.restored = true;
      this._conn._changeConnectStatus(_core.default.Status.ATTACHED);
    } else if (status === _core.default.Status.ATTACHFAIL) {
      this._conn.authenticated = false;
      this._conn.connected = false;
      this._conn.restored = false;
      this._conn._changeConnectStatus(_core.default.Status.ATTACHFAIL);
    }
  }

  /**
   * @param {Element|Builder} pres - This stanza will be sent before disconnecting.
   */
  _disconnect(pres) {
    pres && this._conn.send(pres);
    const close = (0, _builder.$build)('close', {
      'xmlns': _core.default.NS.FRAMING
    });
    this._conn.xmlOutput(close.tree());
    const closeString = _core.default.serialize(close);
    this._conn.rawOutput(closeString);
    this.worker.port.postMessage(['send', closeString]);
    this._conn._doDisconnect();
  }
  _closeSocket() {
    this.socket.close();
  }

  /**
   * Called by _onInitialMessage in order to replace itself with the general message handler.
   * This method is overridden by WorkerWebsocket, which manages a
   * websocket connection via a service worker and doesn't have direct access
   * to the socket.
   */
  _replaceMessageHandler() {
    this._messageHandler = m => this._onMessage(m);
  }

  /**
   * function that handles messages received from the service worker
   * @private
   * @param {MessageEvent} ev
   */
  _onWorkerMessage(ev) {
    const lmap = {};
    lmap['debug'] = _core.default.LogLevel.DEBUG;
    lmap['info'] = _core.default.LogLevel.INFO;
    lmap['warn'] = _core.default.LogLevel.WARN;
    lmap['error'] = _core.default.LogLevel.ERROR;
    lmap['fatal'] = _core.default.LogLevel.FATAL;
    const {
      data
    } = ev;
    const method_name = data[0];
    if (method_name === '_onMessage') {
      this._messageHandler(data[1]);
    } else if (method_name in this) {
      try {
        this[method_name].apply(this, ev.data.slice(1));
      } catch (e) {
        _core.default.log(_core.default.LogLevel.ERROR, e);
      }
    } else if (method_name === 'log') {
      const level = data[1];
      const msg = data[2];
      _core.default.log(lmap[level], msg);
    } else {
      _core.default.log(_core.default.LogLevel.ERROR, `Found unhandled service worker message: ${data}`);
    }
  }
}
var _default = WorkerWebsocket;
exports.default = _default;