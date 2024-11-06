"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sasl = _interopRequireDefault(require("./sasl.js"));
var _scram = _interopRequireDefault(require("./scram.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class SASLSHA384 extends _sasl.default {
  /**
   * SASL SCRAM SHA 384 authentication.
   */
  constructor() {
    let mechname = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'SCRAM-SHA-384';
    let isClientFirst = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    let priority = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 71;
    super(mechname, isClientFirst, priority);
  }

  // eslint-disable-next-line class-methods-use-this
  test(connection) {
    return connection.authcid !== null;
  }

  // eslint-disable-next-line class-methods-use-this
  async onChallenge(connection, challenge) {
    return await _scram.default.scramResponse(connection, challenge, 'SHA-384', 384);
  }

  // eslint-disable-next-line class-methods-use-this
  clientChallenge(connection, test_cnonce) {
    return _scram.default.clientChallenge(connection, test_cnonce);
  }
}
var _default = SASLSHA384;
exports.default = _default;