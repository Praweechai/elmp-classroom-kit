"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _propTypes = _interopRequireDefault(require("prop-types"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// Plan 5 page strip (NetAcad arrangement): big page name + one line under it, on Courses, Grades, Progress,
// Certificates. The Shell 3 top bar already holds the page <h1>, so the strip title is an <h2>.
const PageStrip = ({
  title,
  children,
  id
}) => /*#__PURE__*/(0, _jsxRuntime.jsxs)("section", {
  className: "cls3-strip",
  "aria-labelledby": id,
  children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("h2", {
    id: id,
    className: "cls3-strip__title",
    children: title
  }), children && /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
    children: children
  })]
});
PageStrip.propTypes = {
  title: _propTypes.default.node.isRequired,
  children: _propTypes.default.node,
  id: _propTypes.default.string.isRequired
};
var _default = exports.default = PageStrip;