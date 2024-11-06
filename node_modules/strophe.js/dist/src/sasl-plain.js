"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sasl = _interopRequireDefault(require("./sasl.js"));
var _utils = _interopRequireDefault(require("./utils"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class SASLPlain extends _sasl.default {
  /**
   * SASL PLAIN authentication.
   */
  constructor() {
    let mechname = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'PLAIN';
    let isClientFirst = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    let priority = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 50;
    super(mechname, isClientFirst, priority);
  }

  // eslint-disable-next-line class-methods-use-this
  test(connection) {
    return connection.authcid !== null;
  }

  // eslint-disable-next-line class-methods-use-this
  onChallenge(connection) {
    const {
      authcid,
      authzid,
      domain,
      pass
    } = connection;
    if (!domain) {
      throw new Error('SASLPlain onChallenge: domain is not defined!');
    }
    // Only include authzid if it differs from authcid.
    // See: https://tools.ietf.org/html/rfc6120#section-6.3.8
    let auth_str = authzid !== `${authcid}@${domain}` ? authzid : '';
    auth_str = auth_str + '\u0000';
    auth_str = auth_str + authcid;
    auth_str = auth_str + '\u0000';
    auth_str = auth_str + pass;
    return _utils.default.utf16to8(auth_str);
  }
}
var _default = SASLPlain;
exports.default = _default;