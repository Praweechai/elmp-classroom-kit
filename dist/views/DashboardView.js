"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.DashboardSkeleton = void 0;
var _react = require("react");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _icons = require("@openedx/paragon/icons");
var _i18n = require("../i18n");
var _CertificateCard = _interopRequireDefault(require("../components/CertificateCard"));
var _CourseTable = _interopRequireWildcard(require("../components/CourseTable"));
var _Dashboard = require("../components/Dashboard");
var _Feedback = require("../components/Feedback");
var _LinkContext = require("../components/LinkContext");
var _jsxRuntime = require("react/jsx-runtime");
var cache;
function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var r, c, a = Object.defineProperty, n = { __proto__: null, default: e }; if (Object(e) !== e) return n; if (cache || "function" != typeof WeakMap || (cache = new WeakMap()), cache) { if (cache.has(e)) return cache.get(e); cache.set(e, n); } for (c in e) "default" !== c && {}.hasOwnProperty.call(e, c) && ((r = a && Object.getOwnPropertyDescriptor(e, c)) && (r.get || r.set) ? a(n, c, r) : n[c] = e[c]); return n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// S-90 Home 2.0 (F-114). Pure view: the dashboard fork loads CA-11 `GET /dashboard` and passes it in.
// Grid (doc 04-design §3): banner · gauge | my learning | required · deadlines (2) | streak ·
// courses (2) | quizzes + certificate.
const HOURS_RING_SCALE = 10; // the "Hours learned" ring is full at 10 h; the number is always shown as text

const pair = v => Array.isArray(v) ? v : [0, 0];
const DashboardSkeleton = () => /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
  className: "cls-dash",
  "aria-busy": "true",
  children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Skeleton, {
    className: "cls-dash__full",
    height: 52,
    radius: 12
  }), [0, 1, 2].map(i => /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Skeleton, {
    height: 236,
    radius: 16
  }, i)), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Skeleton, {
    className: "cls-dash__two",
    height: 220,
    radius: 16
  }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Skeleton, {
    height: 220,
    radius: 16
  })]
});
exports.DashboardSkeleton = DashboardSkeleton;
const DashboardView = ({
  dashboard,
  status = 'ready',
  firstName,
  now,
  features = {},
  onRetry,
  onDownloadCertificate,
  coursesHref,
  certificatesHref,
  courseLimit = 5
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const Link = (0, _LinkContext.useLinkComponent)();
  const [filter, setFilter] = (0, _react.useState)('all');
  if (status === 'loading') {
    return /*#__PURE__*/(0, _jsxRuntime.jsx)(DashboardSkeleton, {});
  }
  const d = dashboard || {};
  const down = status === 'error';
  const rings = d.rings || {};
  const [reqDone, reqTotal] = pair(rings.required_done);
  const [quizDone, quizTotal] = pair(rings.quizzes_passed);
  const hours = rings.hours_learned;
  const courses = d.courses || [];
  const counts = Object.fromEntries(Object.entries(_CourseTable.COURSE_FILTERS).map(([k, f]) => [k, courses.filter(f).length]));
  const lead = firstName ? `${intl.formatMessage(_i18n.messages[(0, _i18n.greetingKey)(now)], {
    name: firstName
  })}!` : undefined;
  const t = (m, v) => intl.formatMessage(m, v);
  const unavailable = /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
    className: "cls-dempty",
    children: t(_i18n.messages.notAvailable)
  });
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
    className: "cls-dash",
    children: [down && /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      className: "cls-dash__full",
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Notice, {
        onRetry: onRetry,
        children: t(_i18n.messages.unavailable)
      })
    }), !down && /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      className: "cls-dash__full",
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.EncouragementBanner, {
        banner: d.banner,
        lead: lead,
        now: now
      })
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.DashCard, {
      title: t(_i18n.messages.dashOverall),
      sub: t(_i18n.messages.dashOverallSub),
      titleId: "cls-d-gauge",
      className: "cls-dcard--gauge",
      children: down ? unavailable : /*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.Gauge, {
        pct: d.gauge?.required_done_on_time_pct ?? null,
        label: d.gauge?.label
      })
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_Dashboard.StatGroup, {
      title: t(_i18n.messages.dashMyLearning),
      sub: t(_i18n.messages.dashThisYear),
      titleId: "cls-d-mine",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.StatRing, {
        icon: _icons.MenuBook,
        tone: "green",
        label: t(_i18n.messages.statEnrolled),
        value: down ? '—' : String(rings.enrolled ?? 0),
        pct: rings.enrolled > 0 ? 100 : 0
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.StatRing, {
        icon: _icons.CheckCircle,
        tone: "blue",
        label: t(_i18n.messages.statCompleted),
        value: down ? '—' : String(rings.completed ?? 0),
        pct: (0, _Dashboard.pctOf)(rings.completed, rings.enrolled)
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.StatRing, {
        icon: _icons.AccessTime,
        tone: "pink",
        label: t(_i18n.messages.statHoursLearned),
        sub: t(_i18n.messages.statHoursLearnedSub),
        value: down || hours == null ? '—' : t(_i18n.messages.hoursShort, {
          hours: (0, _i18n.formatHours)(hours, intl.locale)
        }),
        pct: hours ? Math.min(100, hours / HOURS_RING_SCALE * 100) : 0
      })]
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_Dashboard.StatGroup, {
      title: t(_i18n.messages.required),
      sub: (0, _i18n.localized)(d.required_title, intl.locale) || undefined,
      titleId: "cls-d-req",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.StatRing, {
        icon: _icons.Shield,
        tone: d.gauge?.label === 'needs_attention' ? 'late' : 'green',
        label: t(_i18n.messages.statRequiredDone),
        value: down ? '—' : `${reqDone}/${reqTotal}`,
        pct: (0, _Dashboard.pctOf)(reqDone, reqTotal)
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.StatRing, {
        icon: _icons.Quiz,
        tone: "violet",
        label: t(_i18n.messages.statQuizzes),
        value: down ? '—' : `${quizDone}/${quizTotal}`,
        pct: (0, _Dashboard.pctOf)(quizDone, quizTotal)
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.StatRing, {
        icon: _icons.WorkspacePremium,
        tone: "gold",
        label: t(_i18n.messages.statCertificates),
        value: down ? '—' : String(rings.certificates ?? 0),
        pct: rings.certificates > 0 ? 100 : 0
      })]
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.DashCard, {
      title: t(_i18n.messages.dashDeadlines),
      sub: t(_i18n.messages.dashDeadlinesSub),
      titleId: "cls-d-dl",
      className: "cls-dash__two",
      children: down ? unavailable : /*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.DeadlineList, {
        items: d.deadlines
      })
    }), features.streak !== false && /*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.DashCard, {
      title: t(_i18n.messages.dashStreak),
      titleId: "cls-d-streak",
      children: down || !d.streak ? unavailable : /*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.StreakWeek, {
        days: d.streak.days,
        current: d.streak.current,
        best: d.streak.best,
        today: now
      })
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.DashCard, {
      title: t(_i18n.messages.dashCourses, {
        n: courses.length
      }),
      sub: t(_i18n.messages.dashCoursesSub),
      titleId: "cls-d-courses",
      className: "cls-dash__two cls-dcard--courses",
      action: coursesHref && courses.length > courseLimit ? /*#__PURE__*/(0, _jsxRuntime.jsx)(Link, {
        className: "cls-btn cls-btn--secondary cls-btn--sm",
        href: coursesHref,
        children: t(_i18n.messages.seeAll)
      }) : null,
      children: down ? unavailable : /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_CourseTable.CourseFilters, {
          value: filter,
          onChange: setFilter,
          counts: counts
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_CourseTable.default, {
          courses: courses,
          filter: filter,
          limit: courseLimit,
          caption: t(_i18n.messages.dashCourses, {
            n: courses.length
          })
        })]
      })
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls-dash__side",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.DashCard, {
        title: t(_i18n.messages.dashQuizzes),
        titleId: "cls-d-quiz",
        children: down ? unavailable : /*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.NextQuizList, {
          items: d.next_quizzes
        })
      }), !down && d.latest_certificate && /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        className: "cls-dash__cert",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_CertificateCard.default, {
          certificate: d.latest_certificate,
          onDownload: onDownloadCertificate,
          headingLevel: 2
        }), certificatesHref && /*#__PURE__*/(0, _jsxRuntime.jsx)(Link, {
          className: "cls-btn cls-btn--ghost cls-btn--sm",
          href: certificatesHref,
          children: t(_i18n.messages.seeAll)
        })]
      })]
    })]
  });
};
DashboardView.propTypes = {
  dashboard: _propTypes.default.shape({
    banner: _propTypes.default.shape({}),
    gauge: _propTypes.default.shape({
      required_done_on_time_pct: _propTypes.default.number,
      label: _propTypes.default.string
    }),
    rings: _propTypes.default.shape({}),
    required_title: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.shape({})]),
    deadlines: _propTypes.default.arrayOf(_propTypes.default.shape({})),
    streak: _propTypes.default.shape({
      days: _propTypes.default.arrayOf(_propTypes.default.bool),
      current: _propTypes.default.number,
      best: _propTypes.default.number
    }),
    courses: _propTypes.default.arrayOf(_propTypes.default.shape({})),
    next_quizzes: _propTypes.default.arrayOf(_propTypes.default.shape({})),
    latest_certificate: _propTypes.default.shape({})
  }),
  status: _propTypes.default.oneOf(['loading', 'ready', 'error']),
  firstName: _propTypes.default.string,
  now: _propTypes.default.instanceOf(Date),
  features: _propTypes.default.shape({
    streak: _propTypes.default.bool
  }),
  onRetry: _propTypes.default.func,
  onDownloadCertificate: _propTypes.default.func,
  coursesHref: _propTypes.default.string,
  certificatesHref: _propTypes.default.string,
  courseLimit: _propTypes.default.number
};
var _default = exports.default = DashboardView;