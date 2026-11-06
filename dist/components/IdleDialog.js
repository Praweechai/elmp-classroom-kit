"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = require("react");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _icons = require("@openedx/paragon/icons");
var _i18n = require("../i18n");
var _KitIcon = _interopRequireDefault(require("./KitIcon"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// F-117 "Are you still there?" (warning, 60 s countdown) → "Paused — continue when ready".
// Modal: focus on the one button, Tab stays inside, announced as an alert dialog.
const IdleDialog = ({
  state,
  secondsLeft = 0,
  onResume
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const titleId = (0, _react.useId)();
  const bodyId = (0, _react.useId)();
  const button = (0, _react.useRef)(null);
  const open = state === 'warning' || state === 'paused';
  (0, _react.useEffect)(() => {
    if (!open) {
      return undefined;
    }
    const back = document.activeElement;
    button.current?.focus();
    const onKey = event => {
      if (event.key === 'Tab') {
        event.preventDefault();
        button.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (back && document.contains(back) && back.focus) {
        back.focus();
      }
    };
  }, [open, state]);
  if (!open) {
    return null;
  }
  const paused = state === 'paused';
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
    className: "cls-idle",
    role: "presentation",
    children: /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls-idle__box",
      role: "alertdialog",
      "aria-modal": "true",
      "aria-labelledby": titleId,
      "aria-describedby": bodyId,
      children: [paused && /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
        src: _icons.PauseCircle,
        size: 40,
        className: "cls-idle__icon"
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("h2", {
        id: titleId,
        className: "cls-idle__title",
        children: intl.formatMessage(paused ? _i18n.messages.pausedTitle : _i18n.messages.idleTitle)
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
        id: bodyId,
        className: "cls-idle__body",
        children: paused ? intl.formatMessage(_i18n.messages.pausedBody) : intl.formatMessage(_i18n.messages.idleBody, {
          n: secondsLeft
        })
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
        ref: button,
        type: "button",
        className: "cls-btn cls-btn--primary",
        onClick: onResume,
        children: intl.formatMessage(paused ? _i18n.messages.pausedContinue : _i18n.messages.idleHere)
      })]
    })
  });
};
IdleDialog.propTypes = {
  state: _propTypes.default.oneOf(['active', 'warning', 'paused']).isRequired,
  secondsLeft: _propTypes.default.number,
  onResume: _propTypes.default.func.isRequired
};
var _default = exports.default = IdleDialog;