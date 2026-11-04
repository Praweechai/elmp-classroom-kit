"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _propTypes = _interopRequireDefault(require("prop-types"));
var _KitIcon = _interopRequireDefault(require("./KitIcon"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// Key-facts row on the course home (doc 04 §5.10, R-11 P-5).
const KeyFacts = ({
  facts
}) => /*#__PURE__*/(0, _jsxRuntime.jsx)("ul", {
  className: "cls-facts",
  children: facts.map(({
    icon,
    value,
    label,
    overdue
  }) => /*#__PURE__*/(0, _jsxRuntime.jsxs)("li", {
    className: `cls-fact${overdue ? ' cls-fact--overdue' : ''}`,
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
      className: "cls-fact__tile",
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
        src: icon,
        size: 20
      })
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("span", {
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
        children: value
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        children: label
      })]
    })]
  }, label))
});
KeyFacts.propTypes = {
  facts: _propTypes.default.arrayOf(_propTypes.default.shape({
    icon: _propTypes.default.elementType.isRequired,
    value: _propTypes.default.node.isRequired,
    label: _propTypes.default.string.isRequired,
    overdue: _propTypes.default.bool
  })).isRequired
};
var _default = exports.default = KeyFacts;