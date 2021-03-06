'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _authentication = require('./authentication');

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  } else {
    var newObj = {};
    if (obj != null) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          newObj[key] = obj[key];
        }
      }
    }
    newObj.default = obj;
    return newObj;
  }
}

var authentication = _interopRequireWildcard(_authentication);

exports.default = {
  authentication
};

module.exports = exports['default']; // eslint-disable-line
