"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UnitTitle = exports.PlayerTopBar = void 0;
var _propTypes = _interopRequireDefault(require("prop-types"));
var _icons = require("@openedx/paragon/icons");
var _i18n = require("../i18n");
var _KitIcon = _interopRequireDefault(require("./KitIcon"));
var _LinkContext = require("./LinkContext");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const clamp = v => Math.max(0, Math.min(100, Math.round(Number(v) || 0)));

// S-76 top bar (doc 04 §5.12): back to the course page, outline toggle, course title, "Unit 3 of 8",
// and a 3 px line for the whole course's progress. Replaces the Open edX header inside the player.
const PlayerTopBar = ({
  courseTitle,
  courseHref,
  unitIndex,
  unitCount,
  progress,
  outlineOpen,
  onToggleOutline
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const Link = (0, _LinkContext.useLinkComponent)();
  const pct = progress == null ? null : clamp(progress);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("header", {
    className: "cls-player-bar",
    "aria-label": intl.formatMessage(_i18n.messages.playerLabel),
    children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls-player-bar__row",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(Link, {
        className: "cls-player-bar__back",
        href: courseHref,
        "aria-label": intl.formatMessage(_i18n.messages.playerBackLabel),
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
          src: _icons.ArrowBack
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
          className: "cls-player-bar__back-text",
          children: intl.formatMessage(_i18n.messages.playerBack)
        })]
      }), onToggleOutline && /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
        type: "button",
        className: "cls-icon-btn cls-player-bar__outline",
        "aria-label": intl.formatMessage(_i18n.messages.playerOutline),
        "aria-expanded": Boolean(outlineOpen),
        onClick: onToggleOutline,
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
          src: _icons.MenuBook
        })
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
        className: "cls-player-bar__title",
        title: courseTitle,
        children: courseTitle
      }), unitCount > 0 && unitIndex > 0 && /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
        className: "cls-player-bar__count cls-num",
        children: intl.formatMessage(_i18n.messages.unitOf, {
          i: unitIndex,
          n: unitCount
        })
      })]
    }), pct != null && /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      className: "cls-player-bar__progress",
      role: "progressbar",
      "aria-label": intl.formatMessage(_i18n.messages.playerProgress),
      "aria-valuemin": 0,
      "aria-valuemax": 100,
      "aria-valuenow": pct,
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        style: {
          width: `${pct}%`
        }
      })
    })]
  });
};
exports.PlayerTopBar = PlayerTopBar;
PlayerTopBar.propTypes = {
  courseTitle: _propTypes.default.string.isRequired,
  courseHref: _propTypes.default.string.isRequired,
  unitIndex: _propTypes.default.number,
  unitCount: _propTypes.default.number,
  progress: _propTypes.default.number,
  outlineOpen: _propTypes.default.bool,
  onToggleOutline: _propTypes.default.func
};

// S-76 unit heading: small section name above the unit title (H1 30, doc 04 §6.6).
const UnitTitle = ({
  title,
  section
}) => /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
  className: "cls-unit-title",
  children: [section && /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
    className: "cls-unit-title__section",
    children: section
  }), /*#__PURE__*/(0, _jsxRuntime.jsx)("h1", {
    children: title
  })]
});
exports.UnitTitle = UnitTitle;
UnitTitle.propTypes = {
  title: _propTypes.default.string.isRequired,
  section: _propTypes.default.string
};