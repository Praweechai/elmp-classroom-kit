"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toCard = exports.default = exports.MyLearningSkeleton = exports.AchievementList = void 0;
var _react = require("react");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _icons = require("@openedx/paragon/icons");
var _i18n = require("../i18n");
var _CourseCard = _interopRequireWildcard(require("../components/CourseCard2"));
var _Dashboard = require("../components/Dashboard");
var _Feedback = require("../components/Feedback");
var _KitIcon = _interopRequireDefault(require("../components/KitIcon"));
var _LinkContext = require("../components/LinkContext");
var _jsxRuntime = require("react/jsx-runtime");
var cache;
function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var r, c, a = Object.defineProperty, n = { __proto__: null, default: e }; if (Object(e) !== e) return n; if (cache || "function" != typeof WeakMap || (cache = new WeakMap()), cache) { if (cache.has(e)) return cache.get(e); cache.set(e, n); } for (c in e) "default" !== c && {}.hasOwnProperty.call(e, c) && ((r = a && Object.getOwnPropertyDescriptor(e, c)) && (r.get || r.set) ? a(n, c, r) : n[c] = e[c]); return n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, e) { if ("object" != typeof t || !t) return t; var r; if ("undefined" != typeof Symbol && void 0 !== (r = t[Symbol.toPrimitive])) { var i = r.call(t, e || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === e ? String : Number)(t); } // S-100 My Learning (Plan 5, D-73/D-78): NetAcad arrangement — welcome strip, stat rings (old dashboard),
// "In progress" cards with sort / grid-list / category filter; right column = deadlines, latest achievements,
// next quizzes, streak. Pure view: the dashboard fork passes CA-11 (`dashboard`), and in Part 2 CA-15
// (`catalogue`, adds covers/hours/last active) and CA-13 (`achievements`). Missing Part 2 data = hidden.
const HOURS_RING_SCALE = 10;
const IN_PROGRESS = ['in_progress', 'almost', 'overdue', 'due_soon'];
const SORTS = {
  recent: _i18n.messages.mlSortRecent,
  due: _i18n.messages.mlSortDue,
  progress: _i18n.messages.mlSortProgress,
  title: _i18n.messages.mlSortTitle
};
const BADGE = {
  first_steps: _icons.Star,
  quiz_streak: _icons.Bolt,
  course_complete: _icons.CheckCircle,
  night_owl: _icons.Bedtime
};
const pair = v => Array.isArray(v) ? v : [0, 0];

// CA-11 course (+ CA-11 deadline, + CA-15 entry when Part 2 is on) → CourseCard2 props.
const toCard = (course, {
  deadline,
  entry,
  locale
}) => {
  const progress = entry?.progress_pct ?? (0, _Dashboard.pctOf)(course.units_done, course.units_total);
  let status = course.status === 'passed' ? 'completed' : course.status;
  const soon = deadline && deadline.days_left >= 0 && deadline.days_left <= 7;
  if (soon && status === 'in_progress') {
    status = 'due_soon';
  }
  return {
    code: course.code,
    title: (0, _i18n.localized)(course.title, locale),
    category: entry?.category || course.category,
    coverUrl: entry?.cover_url || course.image_url || undefined,
    colour: entry?.colour || undefined,
    required: Boolean(course.required),
    status,
    progress,
    units: course.units_total ?? entry?.units_total,
    hours: entry?.hours,
    dueAt: deadline?.due_at || entry?.due_at || undefined,
    lastActivityAt: entry?.last_activity_at || course.last_activity_at || undefined,
    href: course.href,
    resumeHref: course.resume_href
  };
};
exports.toCard = toCard;
const sorters = {
  recent: (a, b) => (b.lastActivityAt || '').localeCompare(a.lastActivityAt || ''),
  due: (a, b) => (a.dueAt || '9999').localeCompare(b.dueAt || '9999'),
  progress: (a, b) => b.progress - a.progress,
  title: (a, b) => a.title.localeCompare(b.title)
};
const AchievementList = ({
  items,
  limit = 3,
  allHref
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const Link = (0, _LinkContext.useLinkComponent)();
  const earned = items.filter(a => a.earned_at).sort((a, b) => b.earned_at.localeCompare(a.earned_at));
  const locked = items.filter(a => !a.earned_at);
  const shown = [...earned, ...locked].slice(0, limit);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("ul", {
      className: "cls3-ach",
      children: shown.map(a => /*#__PURE__*/(0, _jsxRuntime.jsxs)("li", {
        className: a.earned_at ? '' : 'cls3-ach--locked',
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
          className: "cls3-ach__badge",
          "aria-hidden": "true",
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
            src: a.earned_at ? BADGE[a.code] || _icons.Star : _icons.Lock,
            size: 20
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
            children: (0, _i18n.localized)(a.title, intl.locale)
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
            children: (0, _i18n.localized)(a.text, intl.locale)
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)("small", {
            children: a.earned_at ? (0, _i18n.formatDate)(a.earned_at, intl.locale) : a.progress && intl.formatMessage(_i18n.messages.mlAchievementProgress, {
              n: a.progress[0],
              max: a.progress[1]
            })
          })]
        })]
      }, a.code))
    }), allHref && /*#__PURE__*/(0, _jsxRuntime.jsx)(Link, {
      className: "cls3-link",
      href: allHref,
      children: intl.formatMessage(_i18n.messages.mlAchievementsAll)
    })]
  });
};
exports.AchievementList = AchievementList;
AchievementList.propTypes = {
  items: _propTypes.default.arrayOf(_propTypes.default.shape({
    code: _propTypes.default.string.isRequired,
    earned_at: _propTypes.default.string
  })).isRequired,
  limit: _propTypes.default.number,
  allHref: _propTypes.default.string
};
const MyLearningSkeleton = () => /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
  className: "cls3-ml",
  "aria-busy": "true",
  children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Skeleton, {
    width: "50%",
    height: 30
  }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
    className: "cls3-stats",
    children: [0, 1, 2, 3].map(i => /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Skeleton, {
      height: 88,
      radius: 16
    }, i))
  }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
    className: "cls3-two",
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      className: "cls3-cards cls3-cards--grid",
      children: [0, 1].map(i => /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Skeleton, {
        height: 320,
        radius: 16
      }, i))
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Skeleton, {
      height: 420,
      radius: 16
    })]
  })]
});
exports.MyLearningSkeleton = MyLearningSkeleton;
const MyLearningView = ({
  dashboard,
  catalogue,
  achievements,
  status = 'ready',
  firstName,
  now,
  features = {},
  onRetry,
  achievementsHref
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const t = (m, v) => intl.formatMessage(m, v);
  const [sort, setSort] = (0, _react.useState)('recent');
  const [layout, setLayout] = (0, _react.useState)('grid');
  const [filter, setFilter] = (0, _react.useState)('all');
  const d = dashboard || {};
  const cards = (0, _react.useMemo)(() => {
    const deadlines = d.deadlines || [];
    const entries = Object.fromEntries((catalogue || []).map(e => [e.course_key, e]));
    return (d.courses || []).map(c => toCard(c, {
      deadline: deadlines.find(x => x.course_key === c.course_key),
      entry: entries[c.course_key],
      locale: intl.locale
    }));
  }, [d.courses, d.deadlines, catalogue, intl.locale]);
  if (status === 'loading') {
    return /*#__PURE__*/(0, _jsxRuntime.jsx)(MyLearningSkeleton, {});
  }
  const down = status === 'error';
  const active = cards.filter(c => IN_PROGRESS.includes(c.status));
  const catOf = c => (typeof c.category === 'object' ? c.category?.key : c.category) || 'general';
  const categories = [...new Map(active.map(c => [catOf(c), (0, _CourseCard.categoryLabel)(c.category, intl)])).entries()];
  const shown = active.filter(c => filter === 'all' || catOf(c) === filter).sort(sorters[sort]);
  const rings = d.rings || {};
  const [reqDone, reqTotal] = pair(rings.required_done);
  const [quizDone, quizTotal] = pair(rings.quizzes_passed);
  const hours = rings.hours_learned;
  const dash = down ? '—' : null;
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
    className: "cls3-ml",
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("section", {
      className: "cls3-hero",
      "aria-label": t(_i18n.messages.shell3MyLearning),
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
        children: firstName ? t(_i18n.messages.mlWelcome, {
          name: firstName,
          n: active.length
        }) : null
      })
    }), down && /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Notice, {
      onRetry: onRetry,
      children: t(_i18n.messages.notAvailable)
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("ul", {
      className: "cls3-stats",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.StatRing, {
        icon: _icons.Shield,
        tone: d.gauge?.label === 'needs_attention' ? 'late' : 'green',
        label: t(_i18n.messages.statRequiredDone),
        value: dash || `${reqDone}/${reqTotal}`,
        pct: (0, _Dashboard.pctOf)(reqDone, reqTotal)
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.StatRing, {
        icon: _icons.Quiz,
        tone: "violet",
        label: t(_i18n.messages.statQuizzes),
        value: dash || `${quizDone}/${quizTotal}`,
        pct: (0, _Dashboard.pctOf)(quizDone, quizTotal)
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.StatRing, {
        icon: _icons.CheckCircle,
        tone: "blue",
        label: t(_i18n.messages.statCompleted),
        value: dash || `${rings.completed ?? 0}/${rings.enrolled ?? 0}`,
        pct: (0, _Dashboard.pctOf)(rings.completed, rings.enrolled)
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.StatRing, {
        icon: _icons.AccessTime,
        tone: "pink",
        label: t(_i18n.messages.statHoursLearned),
        value: dash || (hours == null ? '—' : t(_i18n.messages.hoursShort, {
          hours: (0, _i18n.formatHours)(hours, intl.locale)
        })),
        pct: hours ? Math.min(100, hours / HOURS_RING_SCALE * 100) : 0
      })]
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls3-two",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("section", {
        className: "cls3-main",
        "aria-labelledby": "cls3-inprog",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
          className: "cls3-head",
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("h2", {
            id: "cls3-inprog",
            children: t(_i18n.messages.mlInProgress)
          }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
            className: "cls3-controls",
            children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("label", {
              className: "cls3-select",
              htmlFor: "cls3-sort",
              children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
                className: "cls-sr",
                children: t(_i18n.messages.mlSort)
              }), /*#__PURE__*/(0, _jsxRuntime.jsx)("select", {
                id: "cls3-sort",
                value: sort,
                onChange: e => setSort(e.target.value),
                children: Object.entries(SORTS).map(([k, m]) => /*#__PURE__*/(0, _jsxRuntime.jsx)("option", {
                  value: k,
                  children: t(m)
                }, k))
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
          className: "cls3-pills",
          role: "group",
          "aria-label": t(_i18n.messages.mlFilters),
          children: [['all', t(_i18n.messages.mlAll)], ...categories].map(([k, label]) => /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
            type: "button",
            className: "cls3-pill",
            "aria-pressed": filter === k,
            onClick: () => setFilter(k),
            children: label
          }, k))
        }), !down && shown.length === 0 && /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          className: "cls3-empty",
          children: t(_i18n.messages.mlEmpty)
        }), shown.length > 0 && /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
          className: `cls3-cards cls3-cards--${layout}`,
          children: shown.map(c => /*#__PURE__*/(0, _jsxRuntime.jsx)(_CourseCard.default, _objectSpread(_objectSpread({}, c), {}, {
            layout: layout,
            now: now
          }), c.href || c.code))
        })]
      }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("aside", {
        className: "cls3-side-col",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.DashCard, {
          title: t(_i18n.messages.dashDeadlines),
          titleId: "cls3-dl",
          children: down ? /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
            className: "cls-dempty",
            children: t(_i18n.messages.notAvailable)
          }) : /*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.DeadlineList, {
            items: d.deadlines
          })
        }), achievements && achievements.length > 0 && /*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.DashCard, {
          title: t(_i18n.messages.mlAchievements),
          titleId: "cls3-ach",
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(AchievementList, {
            items: achievements,
            allHref: achievementsHref
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.DashCard, {
          title: t(_i18n.messages.dashQuizzes),
          titleId: "cls3-quiz",
          children: down ? /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
            className: "cls-dempty",
            children: t(_i18n.messages.notAvailable)
          }) : /*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.NextQuizList, {
            items: d.next_quizzes
          })
        }), features.streak !== false && !down && d.streak && /*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.DashCard, {
          title: t(_i18n.messages.dashStreak),
          titleId: "cls3-streak",
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.StreakWeek, {
            days: d.streak.days,
            current: d.streak.current,
            best: d.streak.best,
            today: now
          })
        })]
      })]
    })]
  });
};
MyLearningView.propTypes = {
  dashboard: _propTypes.default.shape({
    gauge: _propTypes.default.shape({
      label: _propTypes.default.string
    }),
    rings: _propTypes.default.shape({}),
    deadlines: _propTypes.default.arrayOf(_propTypes.default.shape({})),
    streak: _propTypes.default.shape({
      days: _propTypes.default.arrayOf(_propTypes.default.bool),
      current: _propTypes.default.number,
      best: _propTypes.default.number
    }),
    courses: _propTypes.default.arrayOf(_propTypes.default.shape({})),
    next_quizzes: _propTypes.default.arrayOf(_propTypes.default.shape({}))
  }),
  catalogue: _propTypes.default.arrayOf(_propTypes.default.shape({
    course_key: _propTypes.default.string
  })),
  // CA-15 data (Part 2)
  achievements: _propTypes.default.arrayOf(_propTypes.default.shape({
    code: _propTypes.default.string
  })),
  // CA-13 data (Part 2)
  status: _propTypes.default.oneOf(['loading', 'ready', 'error']),
  firstName: _propTypes.default.string,
  now: _propTypes.default.instanceOf(Date),
  features: _propTypes.default.shape({
    streak: _propTypes.default.bool
  }),
  onRetry: _propTypes.default.func,
  achievementsHref: _propTypes.default.string
};
var _default = exports.default = MyLearningView;