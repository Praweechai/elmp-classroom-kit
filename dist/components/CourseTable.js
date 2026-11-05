"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.coursePercent = exports.CourseStatus = exports.CourseFilters = exports.COURSE_STATUSES = exports.COURSE_FILTERS = void 0;
var _react = require("react");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _icons = require("@openedx/paragon/icons");
var _i18n = require("../i18n");
var _KitIcon = _interopRequireDefault(require("./KitIcon"));
var _LinkContext = require("./LinkContext");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, e) { if ("object" != typeof t || !t) return t; var r; if ("undefined" != typeof Symbol && void 0 !== (r = t[Symbol.toPrimitive])) { var i = r.call(t, e || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === e ? String : Number)(t); } // Course status after the Plan 4 completion rule (F-111): completed only when every unit is done AND passed.
const COURSE_STATUSES = exports.COURSE_STATUSES = ['completed', 'almost', 'in_progress', 'overdue', 'not_started'];
const STATUS_LABEL = {
  completed: _i18n.messages.statusCompleted,
  almost: _i18n.messages.statusAlmost,
  in_progress: _i18n.messages.statusInProgress,
  overdue: _i18n.messages.statusOverdue,
  not_started: _i18n.messages.statusNotStarted
};
const coursePercent = c => {
  if (c.units_total > 0) {
    return Math.max(0, Math.min(100, Math.round(c.units_done / c.units_total * 100)));
  }
  return Math.max(0, Math.min(100, Math.round(Number(c.progress_percent) || 0)));
};
exports.coursePercent = coursePercent;
const CourseStatus = ({
  status,
  unitsLeft
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const key = STATUS_LABEL[status] ? status : 'not_started';
  const text = key === 'almost' && unitsLeft > 0 ? intl.formatMessage(_i18n.messages.almostLeft, {
    n: unitsLeft
  }) : intl.formatMessage(STATUS_LABEL[key]);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("span", {
    className: `cls-cstatus cls-cstatus--${key}`,
    children: [key === 'completed' && /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
      src: _icons.CheckCircle,
      size: 14
    }), text]
  });
};
exports.CourseStatus = CourseStatus;
CourseStatus.propTypes = {
  status: _propTypes.default.oneOf(COURSE_STATUSES).isRequired,
  unitsLeft: _propTypes.default.number
};

// Filter chips (F-114 §7): In progress also holds "Almost done" and "Overdue".
const COURSE_FILTERS = exports.COURSE_FILTERS = {
  all: () => true,
  in_progress: c => ['in_progress', 'almost', 'overdue'].includes(c.status),
  not_started: c => c.status === 'not_started',
  completed: c => c.status === 'completed'
};
const FILTER_LABEL = {
  all: _i18n.messages.filterAll,
  in_progress: _i18n.messages.statusInProgress,
  not_started: _i18n.messages.statusNotStarted,
  completed: _i18n.messages.statusCompleted
};
const CourseFilters = ({
  value,
  onChange,
  counts
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
    className: "cls-chips",
    role: "group",
    "aria-label": intl.formatMessage(_i18n.messages.filterLabel),
    children: Object.keys(COURSE_FILTERS).map(key => /*#__PURE__*/(0, _jsxRuntime.jsxs)("button", {
      type: "button",
      className: "cls-chip",
      "aria-pressed": value === key,
      onClick: () => onChange(key),
      children: [intl.formatMessage(FILTER_LABEL[key]), counts && /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        className: "cls-chip__n cls-num",
        children: counts[key]
      })]
    }, key))
  });
};
exports.CourseFilters = CourseFilters;
CourseFilters.propTypes = {
  value: _propTypes.default.oneOf(Object.keys(COURSE_FILTERS)).isRequired,
  onChange: _propTypes.default.func.isRequired,
  counts: _propTypes.default.objectOf(_propTypes.default.number)
};
const STATUS_ORDER = {
  overdue: 0,
  almost: 1,
  in_progress: 2,
  not_started: 3,
  completed: 4
};
const SORTERS = {
  course: (a, b, lang) => a.titleText.localeCompare(b.titleText, lang),
  progress: (a, b) => a.pct - b.pct,
  score: (a, b) => (a.score_pct ?? -1) - (b.score_pct ?? -1),
  status: (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
};
const SortHeader = ({
  column,
  label,
  sort,
  onSort,
  className
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const active = sort.key === column;
  let icon = _icons.UnfoldMore;
  if (active) {
    icon = sort.dir === 'asc' ? _icons.ArrowUpward : _icons.ArrowDownward;
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("th", {
    scope: "col",
    className: className,
    "aria-sort": active ? `${sort.dir}ending` : undefined,
    children: /*#__PURE__*/(0, _jsxRuntime.jsxs)("button", {
      type: "button",
      className: "cls-sort",
      onClick: () => onSort(column),
      "aria-label": intl.formatMessage(_i18n.messages.sortBy, {
        column: label
      }),
      children: [label, /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
        src: icon,
        size: 16
      })]
    })
  });
};
SortHeader.propTypes = {
  column: _propTypes.default.string.isRequired,
  label: _propTypes.default.string.isRequired,
  sort: _propTypes.default.shape({
    key: _propTypes.default.string,
    dir: _propTypes.default.string
  }).isRequired,
  onSort: _propTypes.default.func.isRequired,
  className: _propTypes.default.string
};

// "My courses" table (doc 04-design §4): Course · Progress · Score · Status · ›. Phone: each row becomes a card (CSS).
const CourseTable = ({
  courses = [],
  filter = 'all',
  search = '',
  limit,
  caption
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const Link = (0, _LinkContext.useLinkComponent)();
  const [sort, setSort] = (0, _react.useState)({
    key: 'status',
    dir: 'asc'
  });
  const lang = intl.locale;
  const rows = (0, _react.useMemo)(() => {
    const q = search.trim().toLowerCase();
    const list = courses.map(c => _objectSpread(_objectSpread({}, c), {}, {
      titleText: (0, _i18n.localized)(c.title, lang),
      pct: coursePercent(c)
    })).filter(COURSE_FILTERS[filter] || COURSE_FILTERS.all).filter(c => !q || c.titleText.toLowerCase().includes(q) || (c.code || '').toLowerCase().includes(q));
    const by = SORTERS[sort.key];
    list.sort((a, b) => (sort.dir === 'asc' ? 1 : -1) * by(a, b, lang) || a.titleText.localeCompare(b.titleText, lang));
    return limit ? list.slice(0, limit) : list;
  }, [courses, filter, search, sort, lang, limit]);
  const onSort = key => setSort(s => ({
    key,
    dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc'
  }));
  if (!rows.length) {
    return /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
      className: "cls-dempty",
      children: intl.formatMessage(_i18n.messages.noCoursesInFilter)
    });
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("table", {
    className: "cls-ctable",
    children: [caption && /*#__PURE__*/(0, _jsxRuntime.jsx)("caption", {
      className: "cls-sr",
      children: caption
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("thead", {
      children: /*#__PURE__*/(0, _jsxRuntime.jsxs)("tr", {
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(SortHeader, {
          column: "course",
          label: intl.formatMessage(_i18n.messages.course),
          sort: sort,
          onSort: onSort
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(SortHeader, {
          column: "progress",
          label: intl.formatMessage(_i18n.messages.progressLabel),
          sort: sort,
          onSort: onSort
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(SortHeader, {
          column: "score",
          label: intl.formatMessage(_i18n.messages.colScore),
          sort: sort,
          onSort: onSort,
          className: "cls-ctable__score"
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(SortHeader, {
          column: "status",
          label: intl.formatMessage(_i18n.messages.colStatus),
          sort: sort,
          onSort: onSort
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("th", {
          scope: "col",
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
            className: "cls-sr",
            children: intl.formatMessage(_i18n.messages.openCourse, {
              title: ''
            }).trim()
          })
        })]
      })
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("tbody", {
      children: rows.map(c => {
        const unitsLeft = c.units_total > 0 ? Math.max(0, c.units_total - c.units_done) : 0;
        const meta = [c.units_total > 0 ? intl.formatMessage(_i18n.messages.units, {
          n: c.units_total
        }) : null, c.required ? intl.formatMessage(_i18n.messages.requiredShort) : null].filter(Boolean).join(' · ');
        return /*#__PURE__*/(0, _jsxRuntime.jsxs)("tr", {
          className: `cls-ctable__row cls-ctable__row--${c.status}`,
          children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("td", {
            className: "cls-ctable__course",
            children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
              className: `cls-codechip cls-codechip--${c.category || 'general'}`,
              "aria-hidden": "true",
              children: (c.code || c.titleText).slice(0, 2).toUpperCase()
            }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("span", {
              children: [c.href ? /*#__PURE__*/(0, _jsxRuntime.jsx)(Link, {
                href: c.href,
                className: "cls-ctable__title",
                children: c.titleText
              }) : /*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
                className: "cls-ctable__title",
                children: c.titleText
              }), meta && /*#__PURE__*/(0, _jsxRuntime.jsx)("small", {
                children: meta
              })]
            })]
          }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("td", {
            className: "cls-ctable__progress",
            children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
              className: "cls-bar",
              role: "progressbar",
              "aria-valuemin": 0,
              "aria-valuemax": 100,
              "aria-valuenow": c.pct,
              "aria-label": `${intl.formatMessage(_i18n.messages.progressLabel)}: ${c.titleText}`,
              children: /*#__PURE__*/(0, _jsxRuntime.jsx)("i", {
                style: {
                  width: `${c.pct}%`
                }
              })
            }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("span", {
              className: "cls-num",
              children: [c.pct, "%"]
            })]
          }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("td", {
            className: "cls-ctable__score cls-num",
            children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("span", {
              className: "cls-ctable__label",
              children: [intl.formatMessage(_i18n.messages.colScore), " "]
            }), c.score_pct == null ? '—' : /*#__PURE__*/(0, _jsxRuntime.jsxs)("b", {
              children: [Math.round(c.score_pct), "%"]
            })]
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)("td", {
            className: "cls-ctable__status",
            children: /*#__PURE__*/(0, _jsxRuntime.jsx)(CourseStatus, {
              status: STATUS_LABEL[c.status] ? c.status : 'not_started',
              unitsLeft: unitsLeft
            })
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)("td", {
            className: "cls-ctable__go",
            "aria-hidden": "true",
            children: c.href && /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
              src: _icons.ChevronRight,
              size: 20
            })
          })]
        }, c.course_key);
      })
    })]
  });
};
CourseTable.propTypes = {
  courses: _propTypes.default.arrayOf(_propTypes.default.shape({
    course_key: _propTypes.default.string.isRequired,
    code: _propTypes.default.string,
    category: _propTypes.default.string,
    title: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.shape({})]).isRequired,
    units_done: _propTypes.default.number,
    units_total: _propTypes.default.number,
    progress_percent: _propTypes.default.number,
    score_pct: _propTypes.default.number,
    status: _propTypes.default.string,
    required: _propTypes.default.bool,
    href: _propTypes.default.string
  })),
  filter: _propTypes.default.oneOf(Object.keys(COURSE_FILTERS)),
  search: _propTypes.default.string,
  limit: _propTypes.default.number,
  caption: _propTypes.default.string
};
var _default = exports.default = CourseTable;