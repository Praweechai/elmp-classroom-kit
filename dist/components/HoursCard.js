"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _propTypes = _interopRequireDefault(require("prop-types"));
var _i18n = require("../i18n");
var _LinkContext = require("./LinkContext");
var _Progress = require("./Progress");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// CE hours this year (doc 04 §6.1 side card, F-97). Takes CA-06 fields.
const HoursCard = ({
  year,
  earned,
  target,
  yearEnds,
  href
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const Link = (0, _LinkContext.useLinkComponent)();
  const {
    locale
  } = intl;
  const pct = target > 0 ? earned / target * 100 : 100;
  const reached = earned >= target;
  const remaining = Math.max(0, target - earned);
  const shownYear = (0, _i18n.kitLanguage)(locale) === 'th' ? year + 543 : year;
  const [earnedText, targetText] = [(0, _i18n.formatHours)(earned, locale), (0, _i18n.formatHours)(target, locale)];
  const value = intl.formatMessage(_i18n.messages.hoursValue, {
    earned: earnedText,
    target: targetText
  });
  const title = intl.formatMessage(_i18n.messages.hoursTitle, {
    year: shownYear
  });
  const note = reached ? intl.formatMessage(_i18n.messages.hoursReached) : intl.formatMessage(_i18n.messages.hoursToGo, {
    n: (0, _i18n.formatHours)(remaining, locale),
    date: (0, _i18n.formatDate)(yearEnds, locale)
  });
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("section", {
    className: "cls-panel cls-hours-card",
    "aria-label": title,
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
      className: "cls-kicker",
      children: href ? /*#__PURE__*/(0, _jsxRuntime.jsx)(Link, {
        href: href,
        children: title
      }) : title
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls-hours",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Progress.ProgressRing, {
        value: pct,
        size: 56,
        gold: reached,
        label: value,
        children: `${Math.min(100, Math.round(pct))}%`
      }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("p", {
          className: "cls-hours__big cls-num",
          children: [earnedText, " ", /*#__PURE__*/(0, _jsxRuntime.jsxs)("small", {
            children: ["/ ", targetText, " h"]
          })]
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          className: "cls-hours__note",
          children: note
        })]
      })]
    })]
  });
};
HoursCard.propTypes = {
  year: _propTypes.default.number.isRequired,
  earned: _propTypes.default.number.isRequired,
  target: _propTypes.default.number.isRequired,
  yearEnds: _propTypes.default.string,
  href: _propTypes.default.string
};
var _default = exports.default = HoursCard;