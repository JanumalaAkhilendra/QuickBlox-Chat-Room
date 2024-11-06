"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _shims = require("./shims");
var _core = _interopRequireDefault(require("./core"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/**
 * Helper class that provides a cross implementation abstraction
 * for a BOSH related XMLHttpRequest.
 *
 * The Strophe.Request class is used internally to encapsulate BOSH request
 * information.  It is not meant to be used from user's code.
 *
 * @property {number} id
 * @property {number} sends
 * @property {XMLHttpRequest} xhr
 */
class Request {
  /**
   * Create and initialize a new Strophe.Request object.
   *
   * @param {Element} elem - The XML data to be sent in the request.
   * @param {Function} func - The function that will be called when the
   *     XMLHttpRequest readyState changes.
   * @param {number} rid - The BOSH rid attribute associated with this request.
   * @param {number} [sends=0] - The number of times this same request has been sent.
   */
  constructor(elem, func, rid) {
    let sends = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
    this.id = ++_core.default._requestId;
    this.xmlData = elem;
    this.data = _core.default.serialize(elem);
    // save original function in case we need to make a new request
    // from this one.
    this.origFunc = func;
    this.func = func;
    this.rid = rid;
    this.date = NaN;
    this.sends = sends;
    this.abort = false;
    this.dead = null;
    this.age = () => this.date ? (new Date().valueOf() - this.date.valueOf()) / 1000 : 0;
    this.timeDead = () => this.dead ? (new Date().valueOf() - this.dead.valueOf()) / 1000 : 0;
    this.xhr = this._newXHR();
  }

  /**
   * Get a response from the underlying XMLHttpRequest.
   * This function attempts to get a response from the request and checks
   * for errors.
   * @throws "parsererror" - A parser error occured.
   * @throws "bad-format" - The entity has sent XML that cannot be processed.
   * @return {Element} - The DOM element tree of the response.
   */
  getResponse() {
    var _this$xhr$responseXML;
    let node = (_this$xhr$responseXML = this.xhr.responseXML) === null || _this$xhr$responseXML === void 0 ? void 0 : _this$xhr$responseXML.documentElement;
    if (node) {
      if (node.tagName === 'parsererror') {
        _core.default.error('invalid response received');
        _core.default.error('responseText: ' + this.xhr.responseText);
        _core.default.error('responseXML: ' + _core.default.serialize(node));
        throw new Error('parsererror');
      }
    } else if (this.xhr.responseText) {
      var _node;
      // In Node (with xhr2) or React Native, we may get responseText but no responseXML.
      // We can try to parse it manually.
      _core.default.debug('Got responseText but no responseXML; attempting to parse it with DOMParser...');
      node = new _shims.DOMParser().parseFromString(this.xhr.responseText, 'application/xml').documentElement;
      const parserError = (_node = node) === null || _node === void 0 ? void 0 : _node.querySelector('parsererror');
      if (!node || parserError) {
        if (parserError) {
          _core.default.error('invalid response received: ' + parserError.textContent);
          _core.default.error('responseText: ' + this.xhr.responseText);
        }
        const error = new Error();
        error.name = _core.default.ErrorCondition.BAD_FORMAT;
        throw error;
      }
    }
    return node;
  }

  /**
   * _Private_ helper function to create XMLHttpRequests.
   * This function creates XMLHttpRequests across all implementations.
   * @private
   * @return {XMLHttpRequest}
   */
  _newXHR() {
    const xhr = new XMLHttpRequest();
    if (xhr.overrideMimeType) {
      xhr.overrideMimeType('text/xml; charset=utf-8');
    }
    // use Function.bind() to prepend ourselves as an argument
    xhr.onreadystatechange = this.func.bind(null, this);
    return xhr;
  }
}
var _default = Request;
exports.default = _default;