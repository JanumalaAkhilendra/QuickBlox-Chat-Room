"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sasl = _interopRequireDefault(require("./sasl.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/**
 * @typedef {import("./connection.js").default} Connection
 */

class SASLAnonymous extends _sasl.default {
  /**
   * SASL ANONYMOUS authentication.
   */
  constructor() {
    let mechname = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'ANONYMOUS';
    let isClientFirst = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    let priority = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 20;
    super(mechname, isClientFirst, priority);
  }

  /**
   * @param {Connection} connection
   */
  // eslint-disable-next-line class-methods-use-this
  test(connection) {
    return connection.authcid === null;
  }
}
var _default = SASLAnonymous;
exports.default = _default;