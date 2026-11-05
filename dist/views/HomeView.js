"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.courseShape = exports.NO_ACCESS = void 0;
var _react = require("react");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _icons = require("@openedx/paragon/icons");
var _i18n = require("../i18n");
var _CertificateCard = _interopRequireDefault(require("../components/CertificateCard"));
var _ContinueCard = _interopRequireDefault(require("../components/ContinueCard"));
var _CourseCard = _interopRequireDefault(require("../components/CourseCard"));
var _Feedback = require("../components/Feedback");
var _GreetingBand = _interopRequireDefault(require("../components/GreetingBand"));
var _HoursCard = _interopRequireDefault(require("../components/HoursCard"));
var _KitIcon = _interopRequireDefault(require("../components/KitIcon"));
var _RequiredGroup = _interopRequireDefault(require("../components/RequiredGroup"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, e) { if ("object" != typeof t || !t) return t; var r; if ("undefined" != typeof Symbol && void 0 !== (r = t[Symbol.toPrimitive])) { var i = r.call(t, e || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === e ? String : Number)(t); }
const NO_ACCESS = exports.NO_ACCESS = ['unmapped', 'inactive', 'forbidden'];
const SILENT = ['disabled', 'unauthenticated'];
const FILTERS = [['in_progress', _i18n.messages.statusInProgress], ['not_started', _i18n.messages.statusNotStarted], ['passed', _i18n.messages.statusCompleted]];
const courseShape = exports.courseShape = _propTypes.default.shape({
  key: _propTypes.default.string.isRequired,
  title: _propTypes.default.string.isRequired,
  code: _propTypes.default.string,
  imageUrl: _propTypes.default.string,
  href: _propTypes.default.string,
  resumeHref: _propTypes.default.string,
  state: _propTypes.default.oneOf(['not_started', 'in_progress', 'almost', 'passed']),
  progress: _propTypes.default.number,
  units: _propTypes.default.number,
  certificateUrl: _propTypes.default.string
});

// Course key → first open assignment that requires it (strip on the card, F-92).
const requiredIndex = (assignments, locale) => {
  const out = {};
  assignments.filter(a => a.status !== 'completed').forEach(a => a.courses.forEach(c => {
    out[c.course_key] ??= {
      roadmap: (0, _i18n.localized)(a.roadmap?.title, locale),
      dueAt: a.due_at,
      overdue: a.status === 'overdue',
      ceHours: c.ce_hours
    };
  }));
  assignments.forEach(a => a.courses.forEach(c => {
    if (out[c.course_key]) {
      out[c.course_key].ceHours ??= c.ce_hours;
    } else {
      out[c.course_key] = {
        ceHours: c.ce_hours,
        notRequired: true
      };
    }
  }));
  return out;
};
const HomeSkeleton = () => /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
  className: "cls-stack",
  "aria-busy": "true",
  children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Skeleton, {
    width: "45%",
    height: 32
  }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Skeleton, {
    width: "60%"
  }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Skeleton, {
    height: 136,
    radius: 16
  }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Skeleton, {
    height: 120,
    radius: 14
  }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Skeleton, {
    height: 120,
    radius: 14
  })]
});

// S-70 Classroom home (doc 04 §6.1, F-90…F-92). Data: Open edX courses (view models) + Portal CA-03.
// Renders inside the app's own <main> landmark.
const HomeView = ({
  firstName,
  courses = [],
  coursesLoading = false,
  training,
  trainingStatus = 'loading',
  trainingError,
  latestCertificate,
  onDownloadCertificate,
  links = {},
  highlightId,
  onRetry,
  now = new Date()
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const {
    locale
  } = intl;
  const [filter, setFilter] = (0, _react.useState)(null);
  const errorCode = trainingStatus === 'error' ? trainingError?.code || 'unavailable' : null;
  const portal = trainingStatus === 'ready' || trainingStatus === 'refreshing' && training ? training : null;
  const assignments = (0, _react.useMemo)(() => portal?.assignments || [], [portal]);
  const required = (0, _react.useMemo)(() => requiredIndex(assignments, locale), [assignments, locale]);
  if (coursesLoading && trainingStatus === 'loading') {
    return /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      className: "cls-page cls-root",
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(HomeSkeleton, {})
    });
  }
  const continueKey = portal?.continue?.course_key;
  const continueCourse = courses.find(c => c.key === continueKey && c.state !== 'passed') || (!portal ? courses.find(c => c.state === 'in_progress') : undefined);
  const continueRoadmap = portal?.continue ? (0, _i18n.localized)(assignments.find(a => a.id === portal.continue.assignment_id)?.roadmap?.title, locale) : undefined;
  const allPassed = courses.length > 0 && courses.every(c => c.state === 'passed') && !assignments.some(a => a.status !== 'completed');
  const nextOpen = assignments.find(a => a.status !== 'completed');
  const inFilter = c => c.state === filter || filter === 'in_progress' && c.state === 'almost';
  const shown = filter ? courses.filter(inFilter) : courses;
  const year = Number(new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    timeZone: 'Asia/Bangkok'
  }).format(now));
  const summary = portal?.summary;
  const nothingAtAll = !coursesLoading && !courses.length && !assignments.length;
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
    className: "cls-page cls-root",
    children: /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls-home-grid",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        className: "cls-main-col",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_GreetingBand.default, {
          firstName: firstName,
          summary: summary,
          now: now
        }), errorCode && NO_ACCESS.includes(errorCode) && /*#__PURE__*/(0, _jsxRuntime.jsxs)("section", {
          className: "cls-panel cls-noaccess",
          role: "status",
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("h2", {
            children: intl.formatMessage(_i18n.messages.noAccessTitle)
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
            children: intl.formatMessage(_i18n.messages.noAccess)
          })]
        }), errorCode && !NO_ACCESS.includes(errorCode) && !SILENT.includes(errorCode) && /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Notice, {
          onRetry: onRetry,
          children: intl.formatMessage(_i18n.messages.unavailable)
        }), continueCourse && /*#__PURE__*/(0, _jsxRuntime.jsx)(_ContinueCard.default, {
          title: continueCourse.title,
          code: continueCourse.code,
          imageUrl: continueCourse.imageUrl,
          href: continueCourse.resumeHref || continueCourse.href,
          roadmap: continueRoadmap,
          unitIndex: continueCourse.unitsDone != null && continueCourse.units ? Math.min(continueCourse.unitsDone + 1, continueCourse.units) : undefined,
          unitCount: continueCourse.units,
          progress: continueCourse.progress
        }), allPassed && /*#__PURE__*/(0, _jsxRuntime.jsxs)("section", {
          className: "cls-panel cls-alldone",
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
            className: "cls-alldone__icon",
            children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
              src: _icons.CheckCircle,
              size: 28
            })
          }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
            children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("h2", {
              children: intl.formatMessage(_i18n.messages.allDoneTitle)
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
              children: nextOpen ? intl.formatMessage(_i18n.messages.nextDue, {
                title: (0, _i18n.localized)(nextOpen.roadmap?.title, locale),
                date: (0, _i18n.formatDate)(nextOpen.due_at, locale)
              }) : intl.formatMessage(_i18n.messages.summaryAllDone)
            })]
          })]
        }), trainingStatus === 'loading' && /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Skeleton, {
          height: 120,
          radius: 14
        }), assignments.length > 0 && /*#__PURE__*/(0, _jsxRuntime.jsxs)("section", {
          "aria-labelledby": "cls-required-title",
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
            className: "cls-section-title",
            children: /*#__PURE__*/(0, _jsxRuntime.jsx)("h2", {
              id: "cls-required-title",
              children: intl.formatMessage(_i18n.messages.required)
            })
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
            className: "cls-stack",
            children: assignments.map(a => /*#__PURE__*/(0, _jsxRuntime.jsx)(_RequiredGroup.default, {
              assignment: a,
              courseHref: links.courseHome,
              highlighted: String(highlightId) === String(a.id)
            }, a.id))
          })]
        }), nothingAtAll && !errorCode && trainingStatus !== 'loading' && /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
          className: "cls-panel",
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.EmptyState, {
            title: intl.formatMessage(_i18n.messages.emptyTitle),
            children: intl.formatMessage(_i18n.messages.empty)
          })
        }), (courses.length > 0 || coursesLoading) && /*#__PURE__*/(0, _jsxRuntime.jsxs)("section", {
          "aria-labelledby": "cls-all-title",
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
            className: "cls-section-title",
            children: /*#__PURE__*/(0, _jsxRuntime.jsx)("h2", {
              id: "cls-all-title",
              children: intl.formatMessage(_i18n.messages.allCourses)
            })
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
            className: "cls-chips",
            role: "group",
            "aria-label": intl.formatMessage(_i18n.messages.filterLabel),
            children: FILTERS.map(([key, label]) => /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
              type: "button",
              className: "cls-chip",
              "aria-pressed": filter === key,
              onClick: () => setFilter(filter === key ? null : key),
              children: intl.formatMessage(label)
            }, key))
          }), coursesLoading ? /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Skeleton, {
            height: 300,
            radius: 12
          }) : /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
            className: "cls-cards",
            children: [shown.map(c => {
              const req = required[c.key];
              return /*#__PURE__*/(0, _jsxRuntime.jsx)(_CourseCard.default, _objectSpread(_objectSpread({}, c), {}, {
                ceHours: req?.ceHours ?? c.ceHours,
                required: req && !req.notRequired && c.state !== 'passed' ? req : undefined
              }), c.key);
            }), !shown.length && /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
              className: "cls-muted",
              children: intl.formatMessage(_i18n.messages.noCoursesInFilter)
            })]
          })]
        })]
      }), portal && /*#__PURE__*/(0, _jsxRuntime.jsxs)("aside", {
        className: "cls-side-col",
        "aria-label": intl.formatMessage(_i18n.messages.navHours),
        children: [summary?.ce_target_hours != null && /*#__PURE__*/(0, _jsxRuntime.jsx)(_HoursCard.default, {
          year: year,
          earned: summary.ce_hours || 0,
          target: summary.ce_target_hours,
          yearEnds: `${year}-12-31`,
          href: links.hours
        }), latestCertificate && /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
            className: "cls-kicker cls-side-title",
            children: intl.formatMessage(_i18n.messages.certificateLatest)
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_CertificateCard.default, {
            certificate: latestCertificate,
            onDownload: onDownloadCertificate
          })]
        })]
      })]
    })
  });
};
HomeView.propTypes = {
  firstName: _propTypes.default.string.isRequired,
  courses: _propTypes.default.arrayOf(courseShape),
  coursesLoading: _propTypes.default.bool,
  training: _propTypes.default.shape({
    summary: _propTypes.default.shape({}),
    continue: _propTypes.default.shape({
      course_key: _propTypes.default.string,
      assignment_id: _propTypes.default.number
    }),
    assignments: _propTypes.default.arrayOf(_propTypes.default.shape({}))
  }),
  trainingStatus: _propTypes.default.oneOf(['loading', 'ready', 'refreshing', 'error']),
  trainingError: _propTypes.default.shape({
    code: _propTypes.default.string
  }),
  latestCertificate: _propTypes.default.shape({}),
  onDownloadCertificate: _propTypes.default.func,
  links: _propTypes.default.shape({
    courseHome: _propTypes.default.func,
    hours: _propTypes.default.string,
    certificates: _propTypes.default.string
  }),
  highlightId: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.number]),
  onRetry: _propTypes.default.func,
  now: _propTypes.default.instanceOf(Date)
};
var _default = exports.default = HomeView;