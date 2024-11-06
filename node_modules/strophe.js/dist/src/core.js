"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var utils = _interopRequireWildcard(require("./utils.js"));
var _builder = _interopRequireDefault(require("./builder.js"));
var shims = _interopRequireWildcard(require("./shims.js"));
var _connection = _interopRequireDefault(require("./connection.js"));
var _handler = _interopRequireDefault(require("./handler.js"));
var _saslAnon = _interopRequireDefault(require("./sasl-anon.js"));
var _saslExternal = _interopRequireDefault(require("./sasl-external.js"));
var _sasl = _interopRequireDefault(require("./sasl.js"));
var _saslOauthbearer = _interopRequireDefault(require("./sasl-oauthbearer.js"));
var _saslPlain = _interopRequireDefault(require("./sasl-plain.js"));
var _saslSha = _interopRequireDefault(require("./sasl-sha1.js"));
var _saslSha2 = _interopRequireDefault(require("./sasl-sha256.js"));
var _saslSha3 = _interopRequireDefault(require("./sasl-sha384.js"));
var _saslSha4 = _interopRequireDefault(require("./sasl-sha512.js"));
var _saslXoauth = _interopRequireDefault(require("./sasl-xoauth2.js"));
var _timedHandler = _interopRequireDefault(require("./timed-handler.js"));
var _constants = require("./constants.js");
var _request = _interopRequireDefault(require("./request.js"));
var _bosh = _interopRequireDefault(require("./bosh.js"));
var _websocket = _interopRequireDefault(require("./websocket.js"));
var _workerWebsocket = _interopRequireDefault(require("./worker-websocket.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * A container for all Strophe library functions.
 *
 * This object is a container for all the objects and constants
 * used in the library.  It is not meant to be instantiated, but to
 * provide a namespace for library objects, constants, and functions.
 *
 * @namespace Strophe
 * @property {Handler} Handler
 * @property {Builder} Builder
 * @property {Request} Request Represents HTTP Requests made for a BOSH connection
 * @property {Bosh} Bosh Support for XMPP-over-HTTP via XEP-0124 (BOSH)
 * @property {Websocket} Websocket Support for XMPP over websocket
 * @property {WorkerWebsocket} WorkerWebsocket Support for XMPP over websocket in a shared worker
 * @property {number} TIMEOUT=1.1 Timeout multiplier. A waiting BOSH HTTP request
 *  will be considered failed after Math.floor(TIMEOUT * wait) seconds have elapsed.
 *  This defaults to 1.1, and with default wait, 66 seconds.
 * @property {number} SECONDARY_TIMEOUT=0.1 Secondary timeout multiplier.
 *  In cases where Strophe can detect early failure, it will consider the request
 *  failed if it doesn't return after `Math.floor(SECONDARY_TIMEOUT * wait)`
 *  seconds have elapsed. This defaults to 0.1, and with default wait, 6 seconds.
 * @property {SASLAnonymous} SASLAnonymous SASL ANONYMOUS authentication.
 * @property {SASLPlain} SASLPlain SASL PLAIN authentication
 * @property {SASLSHA1} SASLSHA1 SASL SCRAM-SHA-1 authentication
 * @property {SASLSHA256} SASLSHA256 SASL SCRAM-SHA-256 authentication
 * @property {SASLSHA384} SASLSHA384 SASL SCRAM-SHA-384 authentication
 * @property {SASLSHA512} SASLSHA512 SASL SCRAM-SHA-512 authentication
 * @property {SASLOAuthBearer} SASLOAuthBearer SASL OAuth Bearer authentication
 * @property {SASLExternal} SASLExternal SASL EXTERNAL authentication
 * @property {SASLXOAuth2} SASLXOAuth2 SASL X-OAuth2 authentication
 * @property {Status} Status
 * @property {NS} NS
 * @property {XHTML} XHTML
 */
const Strophe = {
  /** @constant: VERSION */
  VERSION: '1.6.1',
  TIMEOUT: 1.1,
  SECONDARY_TIMEOUT: 0.1,
  shims,
  Request: _request.default,
  // Transports
  Bosh: _bosh.default,
  Websocket: _websocket.default,
  WorkerWebsocket: _workerWebsocket.default,
  // Available authentication mechanisms
  SASLAnonymous: _saslAnon.default,
  SASLPlain: _saslPlain.default,
  SASLSHA1: _saslSha.default,
  SASLSHA256: _saslSha2.default,
  SASLSHA384: _saslSha3.default,
  SASLSHA512: _saslSha4.default,
  SASLOAuthBearer: _saslOauthbearer.default,
  SASLExternal: _saslExternal.default,
  SASLXOAuth2: _saslXoauth.default,
  Builder: _builder.default,
  Connection: _connection.default,
  ElementType: _constants.ElementType,
  ErrorCondition: _constants.ErrorCondition,
  Handler: _handler.default,
  LogLevel: _constants.LogLevel,
  NS: _constants.NS,
  SASLMechanism: _sasl.default,
  Status: _constants.Status,
  TimedHandler: _timedHandler.default,
  ...utils,
  XHTML: {
    ..._constants.XHTML,
    validTag: utils.validTag,
    validCSS: utils.validCSS,
    validAttribute: utils.validAttribute
  },
  /**
   * This function is used to extend the current namespaces in
   * Strophe.NS. It takes a key and a value with the key being the
   * name of the new namespace, with its actual value.
   * @example: Strophe.addNamespace('PUBSUB', "http://jabber.org/protocol/pubsub");
   *
   * @param {string} name - The name under which the namespace will be
   *     referenced under Strophe.NS
   * @param {string} value - The actual namespace.
   */
  addNamespace(name, value) {
    Strophe.NS[name] = value;
  },
  /**
   * _Private_ function that properly logs an error to the console
   * @private
   * @param {Error} e
   */
  _handleError(e) {
    if (typeof e.stack !== 'undefined') {
      Strophe.fatal(e.stack);
    }
    Strophe.fatal('error: ' + e.message);
  },
  /**
   * User overrideable logging function.
   *
   * This function is called whenever the Strophe library calls any
   * of the logging functions.  The default implementation of this
   * function logs only fatal errors.  If client code wishes to handle the logging
   * messages, it should override this with
   * > Strophe.log = function (level, msg) {
   * >   (user code here)
   * > };
   *
   * Please note that data sent and received over the wire is logged
   * via {@link Strophe.Connection#rawInput|Strophe.Connection.rawInput()}
   * and {@link Strophe.Connection#rawOutput|Strophe.Connection.rawOutput()}.
   *
   * The different levels and their meanings are
   *
   *   DEBUG - Messages useful for debugging purposes.
   *   INFO - Informational messages.  This is mostly information like
   *     'disconnect was called' or 'SASL auth succeeded'.
   *   WARN - Warnings about potential problems.  This is mostly used
   *     to report transient connection errors like request timeouts.
   *   ERROR - Some error occurred.
   *   FATAL - A non-recoverable fatal error occurred.
   *
   * @param {number} level - The log level of the log message.
   *     This will be one of the values in Strophe.LogLevel.
   * @param {string} msg - The log message.
   */
  log(level, msg) {
    if (level === this.LogLevel.FATAL) {
      var _console;
      (_console = console) === null || _console === void 0 ? void 0 : _console.error(msg);
    }
  },
  /**
   * Log a message at the Strophe.LogLevel.DEBUG level.
   * @param {string} msg - The log message.
   */
  debug(msg) {
    this.log(this.LogLevel.DEBUG, msg);
  },
  /**
   * Log a message at the Strophe.LogLevel.INFO level.
   * @param {string} msg - The log message.
   */
  info(msg) {
    this.log(this.LogLevel.INFO, msg);
  },
  /**
   * Log a message at the Strophe.LogLevel.WARN level.
   * @param {string} msg - The log message.
   */
  warn(msg) {
    this.log(this.LogLevel.WARN, msg);
  },
  /**
   * Log a message at the Strophe.LogLevel.ERROR level.
   * @param {string} msg - The log message.
   */
  error(msg) {
    this.log(this.LogLevel.ERROR, msg);
  },
  /**
   * Log a message at the Strophe.LogLevel.FATAL level.
   * @param {string} msg - The log message.
   */
  fatal(msg) {
    this.log(this.LogLevel.FATAL, msg);
  },
  /**
   * _Private_ variable that keeps track of the request ids for connections.
   * @private
   */
  _requestId: 0,
  /**
   * _Private_ variable Used to store plugin names that need
   * initialization on Strophe.Connection construction.
   * @private
   */
  _connectionPlugins: {},
  /**
   * Extends the Strophe.Connection object with the given plugin.
   * @param {string} name - The name of the extension.
   * @param {Object} ptype - The plugin's prototype.
   */
  addConnectionPlugin(name, ptype) {
    Strophe._connectionPlugins[name] = ptype;
  }
};
var _default = Strophe;
exports.default = _default;