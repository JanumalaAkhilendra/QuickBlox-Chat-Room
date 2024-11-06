"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "$build", {
  enumerable: true,
  get: function () {
    return _builder.$build;
  }
});
Object.defineProperty(exports, "$iq", {
  enumerable: true,
  get: function () {
    return _builder.$iq;
  }
});
Object.defineProperty(exports, "$msg", {
  enumerable: true,
  get: function () {
    return _builder.$msg;
  }
});
Object.defineProperty(exports, "$pres", {
  enumerable: true,
  get: function () {
    return _builder.$pres;
  }
});
Object.defineProperty(exports, "Strophe", {
  enumerable: true,
  get: function () {
    return _core.default;
  }
});
var _core = _interopRequireDefault(require("./core.js"));
var _builder = require("./builder.js");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/*global globalThis*/

globalThis.$build = _builder.$build;
globalThis.$iq = _builder.$iq;
globalThis.$msg = _builder.$msg;
globalThis.$pres = _builder.$pres;
globalThis.Strophe = _core.default;