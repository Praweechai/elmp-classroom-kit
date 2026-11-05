"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = require("react");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _icons = require("@openedx/paragon/icons");
var _i18n = require("../i18n");
var _CourseTable = _interopRequireWildcard(require("../components/CourseTable"));
var _Feedback = require("../components/Feedback");
var _KitIcon = _interopRequireDefault(require("../components/KitIcon"));
var _jsxRuntime = require("react/jsx-runtime");
var cache;
function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var r, c, a = Object.defineProperty, n = { __proto__: null, default: e }; if (Object(e) !== e) return n; if (cache || "function" != typeof WeakMap || (cache = new WeakMap()), cache) { if (cache.has(e)) return cache.get(e); cache.set(e, n); } for (c in e) "default" !== c && {}.hasOwnProperty.call(e, c) && ((r = a && Object.getOwnPropertyDescriptor(e, c)) && (r.get || r.set) ? a(n, c, r) : n[c] = e[c]); return n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// S-91 My courses (F-115): the full course table with search and filter chips.
const MyCoursesView = ({
  courses = [],
  status = 'ready',
  onRetry
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const [filter, setFilter] = (0, _react.useState)('all');
  const [search, setSearch] = (0, _react.useState)('');
  const counts = Object.fromEntries(Object.entries(_CourseTable.COURSE_FILTERS).map(([k, f]) => [k, courses.filter(f).length]));
  const label = intl.formatMessage(_i18n.messages.searchCourses);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
    className: "cls-dash cls-dash--single",
    children: /*#__PURE__*/(0, _jsxRuntime.jsxs)("section", {
      className: "cls-dcard cls-dash__full",
      "aria-labelledby": "cls-courses-title",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
        className: "cls-dcard__head",
        children: /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("h2", {
            id: "cls-courses-title",
            children: intl.formatMessage(_i18n.messages.dashCourses, {
              n: courses.length
            })
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
            children: intl.formatMessage(_i18n.messages.coursesPageIntro)
          })]
        })
      }), status === 'error' && /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Notice, {
        onRetry: onRetry,
        children: intl.formatMessage(_i18n.messages.unavailable)
      }), status === 'loading' && /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Skeleton, {
        height: 320,
        radius: 12
      }), status === 'ready' && /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
        children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
          className: "cls-coursebar",
          children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
            className: "cls-search",
            children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
              src: _icons.Search,
              size: 20
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)("input", {
              type: "search",
              value: search,
              placeholder: label,
              "aria-label": label,
              onChange: e => setSearch(e.target.value)
            })]
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_CourseTable.CourseFilters, {
            value: filter,
            onChange: setFilter,
            counts: counts
          })]
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_CourseTable.default, {
          courses: courses,
          filter: filter,
          search: search,
          caption: label
        })]
      })]
    })
  });
};
MyCoursesView.propTypes = {
  courses: _propTypes.default.arrayOf(_propTypes.default.shape({})),
  status: _propTypes.default.oneOf(['loading', 'ready', 'error']),
  onRetry: _propTypes.default.func
};
var _default = exports.default = MyCoursesView;