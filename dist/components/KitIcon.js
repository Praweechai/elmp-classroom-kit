"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _propTypes = _interopRequireDefault(require("prop-types"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// Paragon icons (Material Symbols set, doc 04 §4). Decorative unless a label is given.
const KitIcon = ({
  src: Src,
  size = 20,
  label,
  className
}) => /*#__PURE__*/(0, _jsxRuntime.jsx)(Src, {
  width: size,
  height: size,
  className: className,
  focusable: "false",
  "aria-hidden": label ? undefined : true,
  role: label ? 'img' : undefined,
  "aria-label": label
});
KitIcon.propTypes = {
  src: _propTypes.default.elementType.isRequired,
  size: _propTypes.default.number,
  label: _propTypes.default.string,
  className: _propTypes.default.string
};
var _default = exports.default = KitIcon;