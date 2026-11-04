"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.STATUSES = void 0;
var _propTypes = _interopRequireDefault(require("prop-types"));
var _i18n = require("../i18n");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const LABELS = {
  on_track: _i18n.messages.statusOnTrack,
  due_soon: _i18n.messages.statusDueSoon,
  overdue: _i18n.messages.statusOverdue,
  completed: _i18n.messages.statusCompleted,
  not_started: _i18n.messages.statusNotStarted
};
const STATUSES = exports.STATUSES = Object.keys(LABELS);

// Always text + colour, never colour only (doc 04 §5.7).
const StatusPill = ({
  status
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const key = LABELS[status] ? status : 'not_started';
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
    className: `cls-pill cls-pill--${key}`,
    children: intl.formatMessage(LABELS[key])
  });
};
StatusPill.propTypes = {
  status: _propTypes.default.oneOf(STATUSES).isRequired
};
var _default = exports.default = StatusPill;