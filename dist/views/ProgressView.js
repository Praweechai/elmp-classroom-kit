"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.WeekBars = exports.Donut = void 0;
var _propTypes = _interopRequireDefault(require("prop-types"));
var _icons = require("@openedx/paragon/icons");
var _i18n = require("../i18n");
var _Dashboard = require("../components/Dashboard");
var _Feedback = require("../components/Feedback");
var _LinkContext = require("../components/LinkContext");
var _PageStrip = _interopRequireDefault(require("../components/PageStrip"));
var _Progress = require("../components/Progress");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// S-103 Progress (F-134): page strip, three stat cards (completed, in progress, hours), overall completion
// donut + hours-per-week bars (8 weeks), course progress list, required training deadlines.
// Part 1 = CA-11 only: the weekly bars need CA-16, so the 7-day streak takes their place until then.
const ACTIVE = ['in_progress', 'almost', 'overdue', 'due_soon'];
const R = 54;
const C = 2 * Math.PI * R;
const coursePct = c => c.status === 'completed' ? 100 : Math.round((0, _Dashboard.pctOf)(c.units_done, c.units_total));
const Donut = ({
  pct,
  label
}) => /*#__PURE__*/(0, _jsxRuntime.jsxs)("svg", {
  className: "cls3-donut",
  width: "140",
  height: "140",
  viewBox: "0 0 140 140",
  role: "img",
  "aria-label": label,
  children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("circle", {
    cx: "70",
    cy: "70",
    r: R,
    fill: "none",
    className: "cls3-donut__track",
    strokeWidth: "14"
  }), pct > 0 && /*#__PURE__*/(0, _jsxRuntime.jsx)("circle", {
    cx: "70",
    cy: "70",
    r: R,
    fill: "none",
    className: "cls3-donut__fill",
    strokeWidth: "14",
    strokeDasharray: `${C * pct / 100} ${C}`,
    strokeLinecap: "round",
    transform: "rotate(-90 70 70)"
  }), /*#__PURE__*/(0, _jsxRuntime.jsx)("text", {
    x: "70",
    y: "78",
    textAnchor: "middle",
    className: "cls3-donut__num",
    children: `${pct}%`
  })]
});
exports.Donut = Donut;
Donut.propTypes = {
  pct: _propTypes.default.number.isRequired,
  label: _propTypes.default.string.isRequired
};

// Weekly minutes (CA-16, oldest first) as bars. Each bar has its own screen-reader line.
const WeekBars = ({
  weeks
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const max = Math.max(60, ...weeks.map(w => w.minutes));
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("ul", {
    className: "cls3-bars",
    children: weeks.map(w => {
      const hours = (0, _i18n.formatHours)(w.minutes / 60, intl.locale);
      const date = (0, _i18n.formatDate)(w.week_start, intl.locale, {
        year: undefined
      });
      return /*#__PURE__*/(0, _jsxRuntime.jsxs)("li", {
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
          className: "cls3-bars__val",
          "aria-hidden": "true",
          children: w.minutes ? hours : ''
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
          className: "cls3-bars__col",
          "aria-hidden": "true",
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)("i", {
            style: {
              height: `${w.minutes / max * 100}%`
            }
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
          className: "cls3-bars__lbl",
          "aria-hidden": "true",
          children: date
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
          className: "cls-sr",
          children: intl.formatMessage(_i18n.messages.prWeekBar, {
            date,
            hours
          })
        })]
      }, w.week_start);
    })
  });
};
exports.WeekBars = WeekBars;
WeekBars.propTypes = {
  weeks: _propTypes.default.arrayOf(_propTypes.default.shape({
    week_start: _propTypes.default.string,
    minutes: _propTypes.default.number
  })).isRequired
};
const ProgressView = ({
  dashboard,
  grades,
  status = 'ready',
  now,
  hoursGoal,
  onRetry,
  features = {}
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const Link = (0, _LinkContext.useLinkComponent)();
  const t = (m, v) => intl.formatMessage(m, v);
  const strip = /*#__PURE__*/(0, _jsxRuntime.jsx)(_PageStrip.default, {
    id: "cls3-progress-strip",
    title: t(_i18n.messages.shell3Progress),
    children: t(_i18n.messages.pageProgressIntro)
  });
  if (status === 'loading') {
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls3-page",
      "aria-busy": "true",
      children: [strip, /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
        className: "cls3-stats cls3-stats--3",
        children: [0, 1, 2].map(i => /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Skeleton, {
          height: 88,
          radius: 16
        }, i))
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
        className: "cls3-even",
        children: [0, 1].map(i => /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Skeleton, {
          height: 240,
          radius: 16
        }, i))
      })]
    });
  }
  if (status === 'error') {
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls3-page",
      children: [strip, /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Notice, {
        onRetry: onRetry,
        children: t(_i18n.messages.notAvailable)
      })]
    });
  }
  const d = dashboard || {};
  const courses = d.courses || [];
  const rings = d.rings || {};
  const enrolled = rings.enrolled ?? courses.length;
  const done = rings.completed ?? courses.filter(c => c.status === 'completed').length;
  const active = courses.filter(c => ACTIVE.includes(c.status)).length;
  const hours = rings.hours_learned;
  const scale = hoursGoal || 10;
  const overall = courses.length ? Math.round(courses.reduce((s, c) => s + coursePct(c), 0) / courses.length) : 0;
  const unitsDone = courses.reduce((s, c) => s + (c.units_done || 0), 0);
  const unitsTotal = courses.reduce((s, c) => s + (c.units_total || 0), 0);
  const weeks = grades?.weekly_minutes;
  const summary = grades?.summary;
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
    className: "cls3-page",
    children: [strip, /*#__PURE__*/(0, _jsxRuntime.jsxs)("ul", {
      className: "cls3-stats cls3-stats--3",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.StatRing, {
        icon: _icons.CheckCircle,
        tone: "green",
        label: t(_i18n.messages.prCompleted),
        value: `${done}/${enrolled}`,
        pct: (0, _Dashboard.pctOf)(done, enrolled)
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.StatRing, {
        icon: _icons.PlayCircle,
        tone: "blue",
        label: t(_i18n.messages.statusInProgress),
        value: `${active}/${enrolled}`,
        pct: (0, _Dashboard.pctOf)(active, enrolled)
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.StatRing, {
        icon: _icons.AccessTime,
        tone: "gold",
        label: t(_i18n.messages.prHours),
        sub: hoursGoal ? t(_i18n.messages.prHoursGoal, {
          hours: (0, _i18n.formatHours)(hoursGoal, intl.locale)
        }) : undefined,
        value: hours == null ? '—' : t(_i18n.messages.hoursShort, {
          hours: (0, _i18n.formatHours)(hours, intl.locale)
        }),
        pct: hours ? Math.min(100, hours / scale * 100) : 0
      })]
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls3-even",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(_Dashboard.DashCard, {
        title: t(_i18n.messages.prOverall),
        titleId: "cls3-pr-overall",
        className: "cls3-center",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(Donut, {
          pct: overall,
          label: t(_i18n.messages.prOverallAria, {
            pct: overall
          })
        }), unitsTotal > 0 && /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          className: "cls3-note",
          children: t(_i18n.messages.unitsOf, {
            done: unitsDone,
            total: unitsTotal
          })
        })]
      }), weeks && weeks.length > 0 ? /*#__PURE__*/(0, _jsxRuntime.jsxs)(_Dashboard.DashCard, {
        title: t(_i18n.messages.prWeekly),
        sub: t(_i18n.messages.prWeeklySub),
        titleId: "cls3-pr-weekly",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(WeekBars, {
          weeks: weeks
        }), summary && /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          className: "cls3-note",
          children: t(_i18n.messages.prThisWeek, {
            hours: (0, _i18n.formatHours)((summary.minutes_week || 0) / 60, intl.locale),
            n: summary.days_active_month || 0
          })
        })]
      }) : features.streak !== false && d.streak && /*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.DashCard, {
        title: t(_i18n.messages.dashStreak),
        titleId: "cls3-pr-streak",
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.StreakWeek, {
          days: d.streak.days,
          current: d.streak.current,
          best: d.streak.best,
          today: now
        })
      })]
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls3-two",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.DashCard, {
        title: t(_i18n.messages.prCourses),
        titleId: "cls3-pr-courses",
        children: courses.length === 0 ? /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          className: "cls-dempty",
          children: t(_i18n.messages.coursesEmpty)
        }) : /*#__PURE__*/(0, _jsxRuntime.jsx)("ul", {
          className: "cls3-plist",
          children: courses.map(c => {
            const title = (0, _i18n.localized)(c.title, intl.locale);
            const p = coursePct(c);
            return /*#__PURE__*/(0, _jsxRuntime.jsxs)("li", {
              children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
                className: "cls3-plist__name",
                children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(Link, {
                  href: c.href,
                  children: title
                }), /*#__PURE__*/(0, _jsxRuntime.jsx)("small", {
                  children: t(_i18n.messages.unitsOf, {
                    done: c.units_done ?? 0,
                    total: c.units_total ?? 0
                  })
                })]
              }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Progress.ProgressBar, {
                value: p,
                label: title
              }), /*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
                className: "cls-num",
                children: `${p}%`
              })]
            }, c.course_key);
          })
        })
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("aside", {
        className: "cls3-side-col",
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.DashCard, {
          title: t(_i18n.messages.dashDeadlines),
          titleId: "cls3-pr-dl",
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.DeadlineList, {
            items: d.deadlines
          })
        })
      })]
    })]
  });
};
ProgressView.propTypes = {
  dashboard: _propTypes.default.shape({
    // CA-11
    rings: _propTypes.default.shape({}),
    courses: _propTypes.default.arrayOf(_propTypes.default.shape({})),
    deadlines: _propTypes.default.arrayOf(_propTypes.default.shape({})),
    streak: _propTypes.default.shape({
      days: _propTypes.default.arrayOf(_propTypes.default.bool),
      current: _propTypes.default.number,
      best: _propTypes.default.number
    })
  }),
  grades: _propTypes.default.shape({
    // CA-16 (Part 2): weekly bars + this-week line
    summary: _propTypes.default.shape({
      minutes_week: _propTypes.default.number,
      days_active_month: _propTypes.default.number
    }),
    weekly_minutes: _propTypes.default.arrayOf(_propTypes.default.shape({}))
  }),
  status: _propTypes.default.oneOf(['loading', 'ready', 'error']),
  now: _propTypes.default.instanceOf(Date),
  hoursGoal: _propTypes.default.number,
  onRetry: _propTypes.default.func,
  features: _propTypes.default.shape({
    streak: _propTypes.default.bool
  })
};
var _default = exports.default = ProgressView;