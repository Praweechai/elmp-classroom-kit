"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _propTypes = _interopRequireDefault(require("prop-types"));
var _i18n = require("../i18n");
var _Feedback = require("../components/Feedback");
var _Progress = require("../components/Progress");
var _HomeView = require("./HomeView");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// S-73 CE hours (doc 04 §6.4, F-97). Data = CA-06 `data`.
const HoursView = ({
  data,
  status = 'loading',
  error,
  year,
  onYearChange,
  onRetry
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const {
    locale
  } = intl;
  const be = y => (0, _i18n.kitLanguage)(locale) === 'th' ? y + 543 : y;
  const code = status === 'error' ? error?.code || 'unavailable' : null;
  const shownYear = data?.year ?? year;
  const years = data?.years_available?.length ? data.years_available : [shownYear].filter(Boolean);
  let body = null;
  if (status === 'loading' && !data) {
    body = /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls-stack",
      "aria-busy": "true",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Skeleton, {
        height: 140,
        radius: 14
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Skeleton, {
        height: 200,
        radius: 14
      })]
    });
  } else if (data) {
    const reached = data.earned >= data.target;
    const [earned, target] = [(0, _i18n.formatHours)(data.earned, locale), (0, _i18n.formatHours)(data.target, locale)];
    const value = intl.formatMessage(_i18n.messages.hoursValue, {
      earned,
      target
    });
    const pct = data.target > 0 ? data.earned / data.target * 100 : 100;
    const left = (0, _i18n.formatHours)(data.remaining ?? data.target - data.earned, locale);
    const note = reached ? intl.formatMessage(_i18n.messages.hoursReached) : intl.formatMessage(_i18n.messages.hoursToGo, {
      n: left,
      date: (0, _i18n.formatDate)(data.year_ends, locale)
    });
    body = /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
      children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("section", {
        className: "cls-panel cls-hours-hero",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Progress.ProgressRing, {
          value: pct,
          size: 120,
          gold: reached,
          label: value,
          children: `${earned} / ${target}`
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
            className: "cls-hours__big cls-num",
            children: value
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
            className: "cls-hours__note",
            children: note
          })]
        })]
      }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("section", {
        className: "cls-panel",
        "aria-labelledby": "cls-hours-list",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("h2", {
          id: "cls-hours-list",
          className: "cls-panel-title",
          children: intl.formatMessage(_i18n.messages.hoursListTitle)
        }), data.items.length ? /*#__PURE__*/(0, _jsxRuntime.jsxs)("table", {
          className: "cls-table",
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("thead", {
            children: /*#__PURE__*/(0, _jsxRuntime.jsxs)("tr", {
              children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("th", {
                scope: "col",
                children: intl.formatMessage(_i18n.messages.hoursColDate)
              }), /*#__PURE__*/(0, _jsxRuntime.jsx)("th", {
                scope: "col",
                children: intl.formatMessage(_i18n.messages.hoursColCourse)
              }), /*#__PURE__*/(0, _jsxRuntime.jsx)("th", {
                scope: "col",
                className: "cls-num-col",
                children: intl.formatMessage(_i18n.messages.hoursColHours)
              })]
            })
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)("tbody", {
            children: data.items.map(i => /*#__PURE__*/(0, _jsxRuntime.jsxs)("tr", {
              children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("td", {
                className: "cls-num",
                children: (0, _i18n.formatDate)(i.passed_on, locale)
              }), /*#__PURE__*/(0, _jsxRuntime.jsx)("td", {
                children: (0, _i18n.localized)(i.title, locale)
              }), /*#__PURE__*/(0, _jsxRuntime.jsx)("td", {
                className: "cls-num cls-num-col",
                children: (0, _i18n.formatHours)(i.hours, locale)
              })]
            }, i.course_key))
          })]
        }) : /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          className: "cls-muted",
          children: intl.formatMessage(_i18n.messages.hoursNone, {
            year: be(data.year)
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          className: "cls-footnote",
          children: intl.formatMessage(_i18n.messages.hoursFootnote)
        })]
      })]
    });
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
    className: "cls-page cls-root",
    children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("header", {
      className: "cls-page-head cls-page-head--row",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("h1", {
        children: intl.formatMessage(_i18n.messages.hoursPageTitle)
      }), years.length > 1 && /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        className: "cls-seg cls-seg--lg",
        role: "group",
        "aria-label": intl.formatMessage(_i18n.messages.hoursYearGroup),
        children: years.map(y => /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
          type: "button",
          "aria-pressed": y === shownYear,
          onClick: () => y !== shownYear && onYearChange?.(y),
          children: be(y)
        }, y))
      })]
    }), code && _HomeView.NO_ACCESS.includes(code) && /*#__PURE__*/(0, _jsxRuntime.jsxs)("section", {
      className: "cls-panel cls-noaccess",
      role: "status",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("h2", {
        children: intl.formatMessage(_i18n.messages.noAccessTitle)
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
        children: intl.formatMessage(_i18n.messages.noAccess)
      })]
    }), code && !_HomeView.NO_ACCESS.includes(code) && /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Notice, {
      onRetry: onRetry,
      children: intl.formatMessage(_i18n.messages.unavailable)
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      className: "cls-stack cls-stack--lg",
      children: body
    })]
  });
};
HoursView.propTypes = {
  data: _propTypes.default.shape({
    year: _propTypes.default.number,
    earned: _propTypes.default.number,
    target: _propTypes.default.number,
    remaining: _propTypes.default.number,
    year_ends: _propTypes.default.string,
    items: _propTypes.default.arrayOf(_propTypes.default.shape({})),
    years_available: _propTypes.default.arrayOf(_propTypes.default.number)
  }),
  status: _propTypes.default.oneOf(['loading', 'ready', 'refreshing', 'error']),
  error: _propTypes.default.shape({
    code: _propTypes.default.string
  }),
  year: _propTypes.default.number,
  onYearChange: _propTypes.default.func,
  onRetry: _propTypes.default.func
};
var _default = exports.default = HoursView;