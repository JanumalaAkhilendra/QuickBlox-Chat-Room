"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sasl = _interopRequireDefault(require("./sasl.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class SASLExternal extends _sasl.default {
  /**
   * SASL EXTERNAL authentication.
   *
   * The EXTERNAL mechanism allows a client to request the server to use
   * credentials established by means external to the mechanism to
   * authenticate the client. The external means may be, for instance,
   * TLS services.
   */
  constructor() {
    let mechname = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'EXTERNAL';
    let isClientFirst = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    let priority = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;
    super(mechname, isClientFirst, priority);
  }

  // eslint-disable-next-line class-methods-use-this
  onChallenge(connection) {
    /* According to XEP-178, an authzid SHOULD NOT be presented when the
     * authcid contained or implied in the client certificate is the JID (i.e.
     * authzid) with which the user wants to log in as.
     *
     * To NOT send the authzid, the user should therefore set the authcid equal
     * to the JID when instantiating a new Strophe.Connection object.
     */
    return connection.authcid === connection.authzid ? '' : connection.authzid;
  }
}
var _default = SASLExternal;
exports.default = _default;