"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _propTypes = _interopRequireDefault(require("prop-types"));
var _icons = require("@openedx/paragon/icons");
var _i18n = require("../i18n");
var _CourseCover = _interopRequireDefault(require("./CourseCover"));
var _KitIcon = _interopRequireDefault(require("./KitIcon"));
var _LinkContext = require("./LinkContext");
var _Progress = require("./Progress");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// "Continue where you left off" (doc 04 §5.5, F-90 §3).
const ContinueCard = ({
  title,
  code,
  imageUrl,
  category,
  href,
  roadmap,
  unitIndex,
  unitCount,
  unitTitle,
  progress = 0
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const Link = (0, _LinkContext.useLinkComponent)();
  const unitLine = [unitIndex && unitCount ? intl.formatMessage(_i18n.messages.unitOf, {
    i: unitIndex,
    n: unitCount
  }) : null, unitTitle].filter(Boolean).join(' · ');
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("article", {
    className: "cls-continue",
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_CourseCover.default, {
      imageUrl: imageUrl,
      category: category,
      code: code
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("p", {
        className: "cls-continue__k",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
          src: _icons.PlayCircle,
          size: 16
        }), roadmap ? intl.formatMessage(_i18n.messages.continueLabel, {
          roadmap
        }) : intl.formatMessage(_i18n.messages.continue)]
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("h2", {
        className: "cls-continue__title",
        children: title
      }), unitLine && /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
        className: "cls-continue__unit",
        children: unitLine
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Progress.ProgressBar, {
        value: progress,
        label: title
      })]
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)(Link, {
      className: "cls-btn cls-btn--primary",
      href: href,
      "aria-label": `${intl.formatMessage(_i18n.messages.continue)}: ${title}`,
      children: intl.formatMessage(_i18n.messages.continue)
    })]
  });
};
ContinueCard.propTypes = {
  title: _propTypes.default.string.isRequired,
  code: _propTypes.default.string,
  imageUrl: _propTypes.default.string,
  category: _propTypes.default.string,
  href: _propTypes.default.string.isRequired,
  roadmap: _propTypes.default.string,
  unitIndex: _propTypes.default.number,
  unitCount: _propTypes.default.number,
  unitTitle: _propTypes.default.string,
  progress: _propTypes.default.number
};
var _default = exports.default = ContinueCard;