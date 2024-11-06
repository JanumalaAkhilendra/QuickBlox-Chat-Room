"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sasl = _interopRequireDefault(require("./sasl.js"));
var _utils = _interopRequireDefault(require("./utils"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class SASLOAuthBearer extends _sasl.default {
  /**
   * SASL OAuth Bearer authentication.
   */
  constructor() {
    let mechname = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'OAUTHBEARER';
    let isClientFirst = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    let priority = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 40;
    super(mechname, isClientFirst, priority);
  }

  // eslint-disable-next-line class-methods-use-this
  test(connection) {
    return connection.pass !== null;
  }

  // eslint-disable-next-line class-methods-use-this
  onChallenge(connection) {
    let auth_str = 'n,';
    if (connection.authcid !== null) {
      auth_str = auth_str + 'a=' + connection.authzid;
    }
    auth_str = auth_str + ',';
    auth_str = auth_str + '\u0001';
    auth_str = auth_str + 'auth=Bearer ';
    auth_str = auth_str + connection.pass;
    auth_str = auth_str + '\u0001';
    auth_str = auth_str + '\u0001';
    return _utils.default.utf16to8(auth_str);
  }
}
var _default = SASLOAuthBearer;
exports.default = _default;