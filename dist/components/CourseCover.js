"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.CATEGORIES = void 0;
var _propTypes = _interopRequireDefault(require("prop-types"));
var _icons = require("@openedx/paragon/icons");
var _KitIcon = _interopRequireDefault(require("./KitIcon"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, e) { if ("object" != typeof t || !t) return t; var r; if ("undefined" != typeof Symbol && void 0 !== (r = t[Symbol.toPrimitive])) { var i = r.call(t, e || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === e ? String : Number)(t); }
const CATEGORIES = exports.CATEGORIES = ['clinical', 'safety', 'compliance', 'soft', 'general'];

// Studio image, or a generated cover from the category colour + course code (F-92 BR-2).
const CourseCover = ({
  imageUrl,
  category,
  code,
  certificate = false,
  className = '',
  style
}) => {
  const cat = CATEGORIES.includes(category) ? category : 'general';
  const generated = !imageUrl;
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
    className: `cls-cover ${generated ? `cls-cover--generated cls-cover--${cat}` : ''} ${className}`.trim(),
    style: generated ? style : _objectSpread(_objectSpread({}, style), {}, {
      backgroundImage: `url("${imageUrl}")`
    }),
    "aria-hidden": "true",
    children: [code && /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
      className: "cls-code-chip",
      children: code
    }), certificate && /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
      className: "cls-cert-flag",
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
        src: _icons.WorkspacePremium,
        size: 18
      })
    })]
  });
};
CourseCover.propTypes = {
  imageUrl: _propTypes.default.string,
  category: _propTypes.default.string,
  code: _propTypes.default.string,
  certificate: _propTypes.default.bool,
  className: _propTypes.default.string,
  style: _propTypes.default.shape({})
};
var _default = exports.default = CourseCover;