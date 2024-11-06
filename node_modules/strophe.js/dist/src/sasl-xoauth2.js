"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sasl = _interopRequireDefault(require("./sasl.js"));
var _utils = _interopRequireDefault(require("./utils"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/**
 * @typedef {import("./connection.js").default} Connection
 */

class SASLXOAuth2 extends _sasl.default {
  /**
   * SASL X-OAuth2 authentication.
   */
  constructor() {
    let mechname = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'X-OAUTH2';
    let isClientFirst = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    let priority = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 30;
    super(mechname, isClientFirst, priority);
  }

  /**
   * @param {Connection} connection
   */
  // eslint-disable-next-line class-methods-use-this
  test(connection) {
    return connection.pass !== null;
  }

  /**
   * @param {Connection} connection
   */
  // eslint-disable-next-line class-methods-use-this
  onChallenge(connection) {
    let auth_str = '\u0000';
    if (connection.authcid !== null) {
      auth_str = auth_str + connection.authzid;
    }
    auth_str = auth_str + '\u0000';
    auth_str = auth_str + connection.pass;
    return _utils.default.utf16to8(auth_str);
  }
}
var _default = SASLXOAuth2;
exports.default = _default;