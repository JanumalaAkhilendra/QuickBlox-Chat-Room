"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SessionError = void 0;
class SessionError extends Error {
  /**
   * @param {string} message
   */
  constructor(message) {
    super(message);
    this.name = 'StropheSessionError';
  }
}
exports.SessionError = SessionError;