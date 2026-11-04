"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ProgressRing = exports.ProgressBar = void 0;
var _propTypes = _interopRequireDefault(require("prop-types"));
var _i18n = require("../i18n");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const clamp = v => Math.max(0, Math.min(100, Math.round(Number(v) || 0)));
const ProgressBar = ({
  value,
  size = 'md',
  label,
  showValue = true
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const pct = clamp(value);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
    className: "cls-progress",
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      className: `cls-bar${size === 'lg' ? ' cls-bar--lg' : ''}`,
      role: "progressbar",
      "aria-valuemin": 0,
      "aria-valuemax": 100,
      "aria-valuenow": pct,
      "aria-label": label || intl.formatMessage(_i18n.messages.progressLabel),
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)("i", {
        style: {
          width: `${pct}%`
        }
      })
    }), showValue && /*#__PURE__*/(0, _jsxRuntime.jsxs)("span", {
      className: "cls-num",
      "aria-hidden": "true",
      children: [pct, "%"]
    })]
  });
};
exports.ProgressBar = ProgressBar;
ProgressBar.propTypes = {
  value: _propTypes.default.number.isRequired,
  size: _propTypes.default.oneOf(['md', 'lg']),
  label: _propTypes.default.string,
  showValue: _propTypes.default.bool
};
const RING = {
  32: 4,
  56: 6,
  120: 10
};

// 32 / 56 / 120 px rings (doc 04 §5.8). `children` replaces the centre label (e.g. "24/40").
const ProgressRing = ({
  value,
  size = 32,
  gold = false,
  label,
  children
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const pct = clamp(value);
  const stroke = RING[size] || 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const showText = size >= 56;
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("svg", {
    className: `cls-ring${gold ? ' cls-ring--gold' : ''}`,
    width: size,
    height: size,
    viewBox: `0 0 ${size} ${size}`,
    role: "progressbar",
    "aria-valuemin": 0,
    "aria-valuemax": 100,
    "aria-valuenow": pct,
    "aria-label": label || intl.formatMessage(_i18n.messages.progressLabel),
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("circle", {
      className: "cls-ring__track",
      cx: size / 2,
      cy: size / 2,
      r: r,
      fill: "none",
      strokeWidth: stroke
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("circle", {
      className: "cls-ring__fill",
      cx: size / 2,
      cy: size / 2,
      r: r,
      fill: "none",
      strokeWidth: stroke,
      strokeDasharray: c,
      strokeDashoffset: c * (1 - pct / 100)
    }), showText && /*#__PURE__*/(0, _jsxRuntime.jsx)("text", {
      x: "50%",
      y: "50%",
      dominantBaseline: "central",
      textAnchor: "middle",
      fontSize: size >= 120 ? 22 : 14,
      "aria-hidden": "true",
      children: children ?? `${pct}%`
    })]
  });
};
exports.ProgressRing = ProgressRing;
ProgressRing.propTypes = {
  value: _propTypes.default.number.isRequired,
  size: _propTypes.default.oneOf([32, 56, 120]),
  gold: _propTypes.default.bool,
  label: _propTypes.default.string,
  children: _propTypes.default.node
};