'use strict';
// patch: react-cosmos/dist/dom/index.js

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.mountDomRenderer = mountDomRenderer;
Object.defineProperty(exports, 'rendererConnect', {
  enumerable: true,
  get: function get() {
    return _rendererConnect.rendererConnect;
  },
});
Object.defineProperty(exports, 'rendererId', {
  enumerable: true,
  get: function get() {
    return _rendererId.rendererId;
  },
});

var _react = _interopRequireDefault(require('react'));

// var _reactDom = require("react-dom");
var _reactDom = require('react-dom/client');

var _container = require('./container');

var _DomFixtureLoader = require('./DomFixtureLoader');

require('./globalErrorHandler');

var _rendererConnect = require('./rendererConnect');

var _rendererId = require('./rendererId');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function mountDomRenderer(_ref) {
  var rendererConfig = _ref.rendererConfig,
    fixtures = _ref.fixtures,
    decorators = _ref.decorators,
    onErrorReset = _ref.onErrorReset;
  var domContainer = (0, _container.getDomContainer)(
    rendererConfig.containerQuerySelector,
  );
  // (0, _reactDom.render)( /*#__PURE__*/_react.default.createElement(_DomFixtureLoader.DomFixtureLoader, {
  var root = (0, _reactDomClient.createRoot)(domContainer);
  root.render(
    /*#__PURE__*/ _react.default.createElement(
      _DomFixtureLoader.DomFixtureLoader,
      {
        fixtures: fixtures,
        decorators: decorators,
        onErrorReset: onErrorReset,
        // }), domContainer);
      },
    ),
  );
}
