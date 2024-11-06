"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _shims = require("./shims");
var _builder = require("./builder.js");
var _core = _interopRequireDefault(require("./core"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/**
 * A JavaScript library to enable XMPP over Websocket in Strophejs.
 *
 * This file implements XMPP over WebSockets for Strophejs.
 * If a Connection is established with a Websocket url (ws://...)
 * Strophe will use WebSockets.
 * For more information on XMPP-over-WebSocket see RFC 7395:
 * http://tools.ietf.org/html/rfc7395
 *
 * WebSocket support implemented by Andreas Guth (andreas.guth@rwth-aachen.de)
 */

/* global clearTimeout, location */

/**
 * @typedef {import("./builder.js").default} Builder
 * @typedef {import("./connection.js").default} Connection
 */

/**
 * Helper class that handles WebSocket Connections
 *
 * The Strophe.WebSocket class is used internally by Strophe.Connection
 * to encapsulate WebSocket sessions. It is not meant to be used from user's code.
 */
class Websocket {
  /**
   * Create and initialize a Strophe.WebSocket object.
   * Currently only sets the connection Object.
   * @param {Connection} connection - The Strophe.Connection that will use WebSockets.
   */
  constructor(connection) {
    this._conn = connection;
    this.strip = 'wrapper';
    const service = connection.service;
    if (service.indexOf('ws:') !== 0 && service.indexOf('wss:') !== 0) {
      // If the service is not an absolute URL, assume it is a path and put the absolute
      // URL together from options, current URL and the path.
      let new_service = '';
      if (connection.options.protocol === 'ws' && location.protocol !== 'https:') {
        new_service += 'ws';
      } else {
        new_service += 'wss';
      }
      new_service += '://' + location.host;
      if (service.indexOf('/') !== 0) {
        new_service += location.pathname + service;
      } else {
        new_service += service;
      }
      connection.service = new_service;
    }
  }

  /**
   * _Private_ helper function to generate the <stream> start tag for WebSockets
   * @private
   * @return {Builder} - A Strophe.Builder with a <stream> element.
   */
  _buildStream() {
    return (0, _builder.$build)('open', {
      'xmlns': _core.default.NS.FRAMING,
      'to': this._conn.domain,
      'version': '1.0'
    });
  }

  /**
   * _Private_ checks a message for stream:error
   * @private
   *
   * @param {Element} bodyWrap - The received stanza.
   *   connectstatus - The ConnectStatus that will be set on error.
   * @return {boolean} - true if there was a streamerror, false otherwise.
   */
  _checkStreamError(bodyWrap, connectstatus) {
    let errors;
    if (bodyWrap.getElementsByTagNameNS) {
      errors = bodyWrap.getElementsByTagNameNS(_core.default.NS.STREAM, 'error');
    } else {
      errors = bodyWrap.getElementsByTagName('stream:error');
    }
    if (errors.length === 0) {
      return false;
    }
    const error = errors[0];
    let condition = '';
    let text = '';
    const ns = 'urn:ietf:params:xml:ns:xmpp-streams';
    for (let i = 0; i < error.childNodes.length; i++) {
      const e = error.children[i];
      if (e.getAttribute('xmlns') !== ns) {
        break;
      }
      if (e.nodeName === 'text') {
        text = e.textContent;
      } else {
        condition = e.nodeName;
      }
    }
    let errorString = 'WebSocket stream error: ';
    if (condition) {
      errorString += condition;
    } else {
      errorString += 'unknown';
    }
    if (text) {
      errorString += ' - ' + text;
    }
    _core.default.error(errorString);

    // close the connection on stream_error
    this._conn._changeConnectStatus(connectstatus, condition);
    this._conn._doDisconnect();
    return true;
  }

  /**
   * Reset the connection.
   *
   * This function is called by the reset function of the Strophe Connection.
   * Is not needed by WebSockets.
   */
  // eslint-disable-next-line class-methods-use-this
  _reset() {
    return;
  }

  /**
   * _Private_ function called by Strophe.Connection.connect
   *
   * Creates a WebSocket for a connection and assigns Callbacks to it.
   * Does nothing if there already is a WebSocket.
   */
  _connect() {
    // Ensure that there is no open WebSocket from a previous Connection.
    this._closeSocket();

    /**
     * @typedef {Object} WebsocketLike
     * @property {(str: string) => void} WebsocketLike.send
     * @property {function(): void} WebsocketLike.close
     * @property {function(): void} WebsocketLike.onopen
     * @property {(e: Error) => void} WebsocketLike.onerror
     * @property {(e: Error) => void} WebsocketLike.onclose
     * @property {(message: MessageEvent) => void} WebsocketLike.onmessage
     * @property {string} WebsocketLike.readyState
     */

    /** @type {WebSocket|WebsocketLike} */
    this.socket = new _shims.WebSocket(this._conn.service, 'xmpp');
    this.socket.onopen = () => this._onOpen();
    this.socket.onerror = e => this._onError(e);
    this.socket.onclose = e => this._onClose(e);
    // Gets replaced with this._onMessage once _onInitialMessage is called
    this.socket.onmessage = message => this._onInitialMessage(message);
  }

  /**
   * _Private_ function called by Strophe.Connection._connect_cb
   * checks for stream:error
   * @param {Element} bodyWrap - The received stanza.
   */
  _connect_cb(bodyWrap) {
    const error = this._checkStreamError(bodyWrap, _core.default.Status.CONNFAIL);
    if (error) {
      return _core.default.Status.CONNFAIL;
    }
  }

  /**
   * _Private_ function that checks the opening <open /> tag for errors.
   *
   * Disconnects if there is an error and returns false, true otherwise.
   * @private
   * @param {Element} message - Stanza containing the <open /> tag.
   */
  _handleStreamStart(message) {
    let error = null;

    // Check for errors in the <open /> tag
    const ns = message.getAttribute('xmlns');
    if (typeof ns !== 'string') {
      error = 'Missing xmlns in <open />';
    } else if (ns !== _core.default.NS.FRAMING) {
      error = 'Wrong xmlns in <open />: ' + ns;
    }
    const ver = message.getAttribute('version');
    if (typeof ver !== 'string') {
      error = 'Missing version in <open />';
    } else if (ver !== '1.0') {
      error = 'Wrong version in <open />: ' + ver;
    }
    if (error) {
      this._conn._changeConnectStatus(_core.default.Status.CONNFAIL, error);
      this._conn._doDisconnect();
      return false;
    }
    return true;
  }

  /**
   * _Private_ function that handles the first connection messages.
   *
   * On receiving an opening stream tag this callback replaces itself with the real
   * message handler. On receiving a stream error the connection is terminated.
   * @param {MessageEvent} message
   */
  _onInitialMessage(message) {
    if (message.data.indexOf('<open ') === 0 || message.data.indexOf('<?xml') === 0) {
      // Strip the XML Declaration, if there is one
      const data = message.data.replace(/^(<\?.*?\?>\s*)*/, '');
      if (data === '') return;
      const streamStart = new _shims.DOMParser().parseFromString(data, 'text/xml').documentElement;
      this._conn.xmlInput(streamStart);
      this._conn.rawInput(message.data);

      //_handleStreamSteart will check for XML errors and disconnect on error
      if (this._handleStreamStart(streamStart)) {
        //_connect_cb will check for stream:error and disconnect on error
        this._connect_cb(streamStart);
      }
    } else if (message.data.indexOf('<close ') === 0) {
      // <close xmlns="urn:ietf:params:xml:ns:xmpp-framing />
      // Parse the raw string to an XML element
      const parsedMessage = new _shims.DOMParser().parseFromString(message.data, 'text/xml').documentElement;
      // Report this input to the raw and xml handlers
      this._conn.xmlInput(parsedMessage);
      this._conn.rawInput(message.data);
      const see_uri = parsedMessage.getAttribute('see-other-uri');
      if (see_uri) {
        const service = this._conn.service;
        // Valid scenarios: WSS->WSS, WS->ANY
        const isSecureRedirect = service.indexOf('wss:') >= 0 && see_uri.indexOf('wss:') >= 0 || service.indexOf('ws:') >= 0;
        if (isSecureRedirect) {
          this._conn._changeConnectStatus(_core.default.Status.REDIRECT, 'Received see-other-uri, resetting connection');
          this._conn.reset();
          this._conn.service = see_uri;
          this._connect();
        }
      } else {
        this._conn._changeConnectStatus(_core.default.Status.CONNFAIL, 'Received closing stream');
        this._conn._doDisconnect();
      }
    } else {
      this._replaceMessageHandler();
      const string = this._streamWrap(message.data);
      const elem = new _shims.DOMParser().parseFromString(string, 'text/xml').documentElement;
      this._conn._connect_cb(elem, null, message.data);
    }
  }

  /**
   * Called by _onInitialMessage in order to replace itself with the general message handler.
   * This method is overridden by Strophe.WorkerWebsocket, which manages a
   * websocket connection via a service worker and doesn't have direct access
   * to the socket.
   */
  _replaceMessageHandler() {
    this.socket.onmessage = m => this._onMessage(m);
  }

  /**
   * _Private_ function called by Strophe.Connection.disconnect
   * Disconnects and sends a last stanza if one is given
   * @param {Element|Builder} [pres] - This stanza will be sent before disconnecting.
   */
  _disconnect(pres) {
    if (this.socket && this.socket.readyState !== _shims.WebSocket.CLOSED) {
      if (pres) {
        this._conn.send(pres);
      }
      const close = (0, _builder.$build)('close', {
        'xmlns': _core.default.NS.FRAMING
      });
      this._conn.xmlOutput(close.tree());
      const closeString = _core.default.serialize(close);
      this._conn.rawOutput(closeString);
      try {
        this.socket.send(closeString);
      } catch (e) {
        _core.default.warn("Couldn't send <close /> tag.");
      }
    }
    setTimeout(() => this._conn._doDisconnect(), 0);
  }

  /**
   * _Private_ function to disconnect.
   * Just closes the Socket for WebSockets
   */
  _doDisconnect() {
    _core.default.debug('WebSockets _doDisconnect was called');
    this._closeSocket();
  }

  /**
   * PrivateFunction _streamWrap
   * _Private_ helper function to wrap a stanza in a <stream> tag.
   * This is used so Strophe can process stanzas from WebSockets like BOSH
   */
  // eslint-disable-next-line class-methods-use-this
  _streamWrap(stanza) {
    return '<wrapper>' + stanza + '</wrapper>';
  }

  /**
   * _Private_ function to close the WebSocket.
   *
   * Closes the socket if it is still open and deletes it
   */
  _closeSocket() {
    if (this.socket) {
      try {
        this.socket.onclose = null;
        this.socket.onerror = null;
        this.socket.onmessage = null;
        this.socket.close();
      } catch (e) {
        _core.default.debug(e.message);
      }
    }
    this.socket = null;
  }

  /**
   * _Private_ function to check if the message queue is empty.
   * @return {true} - True, because WebSocket messages are send immediately after queueing.
   */
  // eslint-disable-next-line class-methods-use-this
  _emptyQueue() {
    return true;
  }

  /**
   * _Private_ function to handle websockets closing.
   */
  _onClose(e) {
    if (this._conn.connected && !this._conn.disconnecting) {
      _core.default.error('Websocket closed unexpectedly');
      this._conn._doDisconnect();
    } else if (e && e.code === 1006 && !this._conn.connected && this.socket) {
      // in case the onError callback was not called (Safari 10 does not
      // call onerror when the initial connection fails) we need to
      // dispatch a CONNFAIL status update to be consistent with the
      // behavior on other browsers.
      _core.default.error('Websocket closed unexcectedly');
      this._conn._changeConnectStatus(_core.default.Status.CONNFAIL, 'The WebSocket connection could not be established or was disconnected.');
      this._conn._doDisconnect();
    } else {
      _core.default.debug('Websocket closed');
    }
  }

  /**
   * Called on stream start/restart when no stream:features
   * has been received.
   */
  _no_auth_received(callback) {
    _core.default.error('Server did not offer a supported authentication mechanism');
    this._conn._changeConnectStatus(_core.default.Status.CONNFAIL, _core.default.ErrorCondition.NO_AUTH_MECH);
    if (callback) {
      callback.call(this._conn);
    }
    this._conn._doDisconnect();
  }

  /**
   * _Private_ timeout handler for handling non-graceful disconnection.
   *
   * This does nothing for WebSockets
   */
  _onDisconnectTimeout() {} // eslint-disable-line class-methods-use-this

  /**
   * _Private_ helper function that makes sure all pending requests are aborted.
   */
  _abortAllRequests() {} // eslint-disable-line class-methods-use-this

  /**
   * _Private_ function to handle websockets errors.
   * @param {Object} error - The websocket error.
   */
  _onError(error) {
    _core.default.error('Websocket error ' + JSON.stringify(error));
    this._conn._changeConnectStatus(_core.default.Status.CONNFAIL, 'The WebSocket connection could not be established or was disconnected.');
    this._disconnect();
  }

  /**
   * _Private_ function called by Strophe.Connection._onIdle
   * sends all queued stanzas
   */
  _onIdle() {
    const data = this._conn._data;
    if (data.length > 0 && !this._conn.paused) {
      for (let i = 0; i < data.length; i++) {
        if (data[i] !== null) {
          let stanza;
          if (data[i] === 'restart') {
            stanza = this._buildStream().tree();
          } else {
            stanza = data[i];
          }
          const rawStanza = _core.default.serialize(stanza);
          this._conn.xmlOutput(stanza);
          this._conn.rawOutput(rawStanza);
          this.socket.send(rawStanza);
        }
      }
      this._conn._data = [];
    }
  }

  /**
   * _Private_ function to handle websockets messages.
   *
   * This function parses each of the messages as if they are full documents.
   * [TODO : We may actually want to use a SAX Push parser].
   *
   * Since all XMPP traffic starts with
   * <stream:stream version='1.0'
   *                xml:lang='en'
   *                xmlns='jabber:client'
   *                xmlns:stream='http://etherx.jabber.org/streams'
   *                id='3697395463'
   *                from='SERVER'>
   *
   * The first stanza will always fail to be parsed.
   *
   * Additionally, the seconds stanza will always be <stream:features> with
   * the stream NS defined in the previous stanza, so we need to 'force'
   * the inclusion of the NS in this stanza.
   *
   * @param {MessageEvent} message - The websocket message event
   */
  _onMessage(message) {
    let elem;
    // check for closing stream
    const close = '<close xmlns="urn:ietf:params:xml:ns:xmpp-framing" />';
    if (message.data === close) {
      this._conn.rawInput(close);
      this._conn.xmlInput(message);
      if (!this._conn.disconnecting) {
        this._conn._doDisconnect();
      }
      return;
    } else if (message.data.search('<open ') === 0) {
      // This handles stream restarts
      elem = new _shims.DOMParser().parseFromString(message.data, 'text/xml').documentElement;
      if (!this._handleStreamStart(elem)) {
        return;
      }
    } else {
      const data = this._streamWrap(message.data);
      elem = new _shims.DOMParser().parseFromString(data, 'text/xml').documentElement;
    }
    if (this._checkStreamError(elem, _core.default.Status.ERROR)) {
      return;
    }

    //handle unavailable presence stanza before disconnecting
    if (this._conn.disconnecting && elem.firstElementChild.nodeName === 'presence' && elem.firstElementChild.getAttribute('type') === 'unavailable') {
      this._conn.xmlInput(elem);
      this._conn.rawInput(_core.default.serialize(elem));
      // if we are already disconnecting we will ignore the unavailable stanza and
      // wait for the </stream:stream> tag before we close the connection
      return;
    }
    this._conn._dataRecv(elem, message.data);
  }

  /**
   * _Private_ function to handle websockets connection setup.
   * The opening stream tag is sent here.
   * @private
   */
  _onOpen() {
    _core.default.debug('Websocket open');
    const start = this._buildStream();
    this._conn.xmlOutput(start.tree());
    const startString = _core.default.serialize(start);
    this._conn.rawOutput(startString);
    this.socket.send(startString);
  }

  /**
   * _Private_ function to get a stanza out of a request.
   * WebSockets don't use requests, so the passed argument is just returned.
   * @param {Element} stanza - The stanza.
   * @return {Element} - The stanza that was passed.
   */
  // eslint-disable-next-line class-methods-use-this
  _reqToData(stanza) {
    return stanza;
  }

  /**
   * _Private_ part of the Connection.send function for WebSocket
   * Just flushes the messages that are in the queue
   */
  _send() {
    this._conn.flush();
  }

  /**
   * Send an xmpp:restart stanza.
   */
  _sendRestart() {
    clearTimeout(this._conn._idleTimeout);
    this._conn._onIdle.bind(this._conn)();
  }
}
var _default = Websocket;
exports.default = _default;