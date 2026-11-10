"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.statusGroup = exports.entryToCard = exports.default = void 0;
var _react = require("react");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _icons = require("@openedx/paragon/icons");
var _i18n = require("../i18n");
var _CourseCard = _interopRequireWildcard(require("../components/CourseCard2"));
var _Feedback = require("../components/Feedback");
var _KitIcon = _interopRequireDefault(require("../components/KitIcon"));
var _PageStrip = _interopRequireDefault(require("../components/PageStrip"));
var _MyLearningView = require("./MyLearningView");
var _jsxRuntime = require("react/jsx-runtime");
var cache;
function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var r, c, a = Object.defineProperty, n = { __proto__: null, default: e }; if (Object(e) !== e) return n; if (cache || "function" != typeof WeakMap || (cache = new WeakMap()), cache) { if (cache.has(e)) return cache.get(e); cache.set(e, n); } for (c in e) "default" !== c && {}.hasOwnProperty.call(e, c) && ((r = a && Object.getOwnPropertyDescriptor(e, c)) && (r.get || r.set) ? a(n, c, r) : n[c] = e[c]); return n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, e) { if ("object" != typeof t || !t) return t; var r; if ("undefined" != typeof Symbol && void 0 !== (r = t[Symbol.toPrimitive])) { var i = r.call(t, e || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === e ? String : Number)(t); } // S-101 Courses (F-132): page strip, status chips (All / Not started / In progress / Completed), name filter,
// category pills, grid/list. Part 1 = CA-11 courses (enrolled + required). Part 2 = CA-15 `catalogue`
// (adds open courses, covers, hours). `initialQuery` / `initialCategory` come from the top-bar search and
// the Explore menu (the fork reads ?q= and ?category=).
const DAY = 86400000;
const STATUS_FILTERS = [['all', _i18n.messages.mlAll], ['not_started', _i18n.messages.statusNotStarted], ['in_progress', _i18n.messages.statusInProgress], ['completed', _i18n.messages.statusCompleted]];
// overdue / due soon / almost done all count as "In progress" for the status filter.
const statusGroup = status => ['completed', 'not_started'].includes(status) ? status : 'in_progress';

// CA-15 entry → CourseCard2 props.
exports.statusGroup = statusGroup;
const entryToCard = (e, {
  locale,
  now = new Date()
}) => {
  let status = e.learner_status || 'not_started';
  const left = e.due_at ? (new Date(e.due_at).getTime() - now.getTime()) / DAY : null;
  if (status === 'in_progress' && left !== null && left >= 0 && left <= 7) {
    status = 'due_soon';
  }
  return {
    code: e.code,
    title: (0, _i18n.localized)(e.title, locale),
    category: e.category,
    coverUrl: e.cover_url || undefined,
    colour: e.colour || undefined,
    required: Boolean(e.required),
    status,
    progress: e.progress_pct || 0,
    units: e.units_total,
    hours: e.hours,
    dueAt: e.due_at || undefined,
    lastActivityAt: e.last_activity_at || undefined,
    href: e.href
  };
};
exports.entryToCard = entryToCard;
const catKey = c => (typeof c.category === 'object' ? c.category?.key : c.category) || 'general';
const CoursesView = ({
  dashboard,
  catalogue,
  status = 'ready',
  now,
  onRetry,
  initialQuery = '',
  initialCategory = 'all'
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const t = (m, v) => intl.formatMessage(m, v);
  const [group, setGroup] = (0, _react.useState)('all');
  const [q, setQ] = (0, _react.useState)(initialQuery);
  const [cat, setCat] = (0, _react.useState)(initialCategory || 'all');
  const [layout, setLayout] = (0, _react.useState)('grid');
  const cards = (0, _react.useMemo)(() => {
    if (catalogue) {
      return catalogue.map(e => entryToCard(e, {
        locale: intl.locale,
        now
      }));
    }
    const d = dashboard || {};
    return (d.courses || []).map(c => (0, _MyLearningView.toCard)(c, {
      deadline: (d.deadlines || []).find(x => x.course_key === c.course_key),
      locale: intl.locale
    }));
  }, [dashboard, catalogue, intl.locale, now]);
  const strip = /*#__PURE__*/(0, _jsxRuntime.jsx)(_PageStrip.default, {
    id: "cls3-courses-strip",
    title: t(_i18n.messages.shell3Courses),
    children: t(_i18n.messages.pageCoursesIntro)
  });
  if (status === 'loading') {
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls3-page",
      "aria-busy": "true",
      children: [strip, /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
        className: "cls3-cards cls3-cards--grid",
        children: [0, 1, 2, 3].map(i => /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Skeleton, {
          height: 300,
          radius: 16
        }, i))
      })]
    });
  }
  const categories = [...new Map(cards.map(c => [catKey(c), (0, _CourseCard.categoryLabel)(c.category, intl)])).entries()];
  const needle = q.trim().toLowerCase();
  const shown = cards.filter(c => group === 'all' || statusGroup(c.status) === group).filter(c => cat === 'all' || catKey(c) === cat).filter(c => !needle || `${c.title} ${c.code || ''}`.toLowerCase().includes(needle))
  // required first, then A–Z: the training HR asked for stays on top
  .sort((a, b) => Number(b.required) - Number(a.required) || a.title.localeCompare(b.title));
  const filtered = group !== 'all' || cat !== 'all' || needle;
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
    className: "cls3-page",
    children: [strip, status === 'error' && /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Notice, {
      onRetry: onRetry,
      children: t(_i18n.messages.notAvailable)
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls3-toolbar",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
        className: "cls3-pills",
        role: "group",
        "aria-label": t(_i18n.messages.coursesFilterStatus),
        children: STATUS_FILTERS.map(([k, m]) => /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
          type: "button",
          className: "cls3-pill",
          "aria-pressed": group === k,
          onClick: () => setGroup(k),
          children: t(m)
        }, k))
      }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        className: "cls3-controls",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("label", {
          className: "cls3-filter",
          htmlFor: "cls3-courses-q",
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
            src: _icons.Search,
            size: 18
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
            className: "cls-sr",
            children: t(_i18n.messages.coursesFilterLabel)
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)("input", {
            id: "cls3-courses-q",
            type: "search",
            value: q,
            placeholder: t(_i18n.messages.coursesFilter),
            onChange: e => setQ(e.target.value)
          })]
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
          className: "cls3-toggle",
          role: "group",
          "aria-label": t(_i18n.messages.mlView),
          children: [['grid', _icons.GridView, _i18n.messages.mlGrid], ['list', _icons.ViewList, _i18n.messages.mlList]].map(([k, icon, m]) => /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
            type: "button",
            "aria-pressed": layout === k,
            "aria-label": t(m),
            onClick: () => setLayout(k),
            children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
              src: icon,
              size: 18
            })
          }, k))
        })]
      })]
    }), categories.length > 1 && /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      className: "cls3-pills cls3-pills--quiet",
      role: "group",
      "aria-label": t(_i18n.messages.mlFilters),
      children: [['all', t(_i18n.messages.mlAll)], ...categories].map(([k, label]) => /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
        type: "button",
        className: "cls3-pill",
        "aria-pressed": cat === k,
        onClick: () => setCat(k),
        children: label
      }, k))
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
      className: "cls3-count",
      role: "status",
      children: t(_i18n.messages.coursesCount, {
        n: shown.length
      })
    }), shown.length > 0 ? /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      className: `cls3-cards cls3-cards--${layout} cls3-cards--wide`,
      children: shown.map(c => /*#__PURE__*/(0, _jsxRuntime.jsx)(_CourseCard.default, _objectSpread(_objectSpread({}, c), {}, {
        layout: layout,
        now: now
      }), c.href || c.code))
    }) : /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls3-empty",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
        children: t(_i18n.messages.coursesEmpty)
      }), filtered && /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
        type: "button",
        className: "cls-btn cls-btn--secondary cls-btn--sm",
        onClick: () => {
          setGroup('all');
          setCat('all');
          setQ('');
        },
        children: t(_i18n.messages.coursesClear)
      })]
    })]
  });
};
CoursesView.propTypes = {
  dashboard: _propTypes.default.shape({
    courses: _propTypes.default.arrayOf(_propTypes.default.shape({})),
    deadlines: _propTypes.default.arrayOf(_propTypes.default.shape({}))
  }),
  catalogue: _propTypes.default.arrayOf(_propTypes.default.shape({
    course_key: _propTypes.default.string
  })),
  // CA-15 (Part 2)
  status: _propTypes.default.oneOf(['loading', 'ready', 'error']),
  now: _propTypes.default.instanceOf(Date),
  onRetry: _propTypes.default.func,
  initialQuery: _propTypes.default.string,
  initialCategory: _propTypes.default.string
};
var _default = exports.default = CoursesView;