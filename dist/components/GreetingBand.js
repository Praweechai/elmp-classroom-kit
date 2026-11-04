"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _propTypes = _interopRequireDefault(require("prop-types"));
var _i18n = require("../i18n");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// "Good morning, Nok" + one summary line (doc 04 §5.3, F-90 §2). Summary = CA-03 `summary`.
const GreetingBand = ({
  firstName,
  summary,
  now
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const {
    locale
  } = intl;
  const parts = [];
  if (summary?.overdue > 0) {
    parts.push(/*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
      className: "cls-greet__late",
      children: intl.formatMessage(_i18n.messages.summaryOverdue, {
        n: summary.overdue
      })
    }, "late"));
  }
  if (summary?.due_this_month > 0) {
    parts.push(/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
      children: intl.formatMessage(_i18n.messages.summaryDueMonth, {
        n: summary.due_this_month
      })
    }, "month"));
  }
  if (summary && summary.ce_target_hours != null) {
    parts.push(/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
      className: "cls-num",
      children: intl.formatMessage(_i18n.messages.summaryHours, {
        earned: (0, _i18n.formatHours)(summary.ce_hours, locale),
        target: (0, _i18n.formatHours)(summary.ce_target_hours, locale)
      })
    }, "hours"));
  }
  if (summary && !summary.overdue && !summary.due_this_month && !summary.due_soon) {
    parts.unshift(/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
      children: intl.formatMessage(_i18n.messages.summaryAllDone)
    }, "done"));
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
    className: "cls-greet",
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("h1", {
      children: intl.formatMessage(_i18n.messages[(0, _i18n.greetingKey)(now)], {
        name: firstName
      })
    }), parts.length > 0 && /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
      children: parts
    })]
  });
};
GreetingBand.propTypes = {
  firstName: _propTypes.default.string.isRequired,
  summary: _propTypes.default.shape({
    overdue: _propTypes.default.number,
    due_soon: _propTypes.default.number,
    due_this_month: _propTypes.default.number,
    ce_hours: _propTypes.default.number,
    ce_target_hours: _propTypes.default.number
  }),
  now: _propTypes.default.instanceOf(Date)
};
var _default = exports.default = GreetingBand;