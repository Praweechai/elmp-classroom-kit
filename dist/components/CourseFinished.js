"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.nextRequiredCourse = exports.default = void 0;
var _propTypes = _interopRequireDefault(require("prop-types"));
var _icons = require("@openedx/paragon/icons");
var _i18n = require("../i18n");
var _KitIcon = _interopRequireDefault(require("./KitIcon"));
var _LinkContext = require("./LinkContext");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const DONE = ['passed', 'completed'];

// CA-03 training → the next required course to take (not this one, not finished), most urgent first.
const nextRequiredCourse = (training, currentKey) => {
  const rank = {
    overdue: 0,
    due_soon: 1,
    on_track: 2,
    not_started: 3
  };
  const open = (training?.assignments || []).filter(a => a.status !== 'completed').sort((a, b) => (rank[a.status] ?? 9) - (rank[b.status] ?? 9) || String(a.due_at).localeCompare(String(b.due_at)));
  for (let i = 0; i < open.length; i += 1) {
    const course = open[i].courses.find(c => c.course_key !== currentKey && !DONE.includes(c.status));
    if (course) {
      return {
        course,
        assignment: open[i]
      };
    }
  }
  return null;
};

// S-77 course finished (doc 04 §6.7): check mark, course title, stats, certificate, up next, back link.
// `record` reports the Portal refresh (CA-05) in a polite live region.
exports.nextRequiredCourse = nextRequiredCourse;
const CourseFinished = ({
  courseTitle,
  grade,
  ceHours,
  finishedAt,
  certificateHref,
  upNext,
  backHref,
  record
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const {
    locale
  } = intl;
  const Link = (0, _LinkContext.useLinkComponent)();
  const stats = [];
  if (grade != null) {
    stats.push([_i18n.messages.statGrade, `${Math.round(grade)}%`]);
  }
  if (ceHours > 0) {
    stats.push([_i18n.messages.statHours, intl.formatMessage(_i18n.messages.duration, {
      hours: (0, _i18n.formatHours)(ceHours, locale)
    })]);
  }
  if (finishedAt) {
    stats.push([_i18n.messages.statDate, (0, _i18n.formatDate)(finishedAt, locale)]);
  }
  const recordText = {
    updating: _i18n.messages.recordUpdating,
    updated: _i18n.messages.recordUpdated,
    later: _i18n.messages.recordLater
  }[record];
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("section", {
    className: "cls-finished",
    "aria-labelledby": "cls-finished-title",
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
      className: "cls-finished__check",
      "aria-hidden": "true",
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
        src: _icons.Check,
        size: 48
      })
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
      className: "cls-finished__lead",
      children: intl.formatMessage(_i18n.messages.finishedLead)
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("h1", {
      id: "cls-finished-title",
      className: "cls-finished__title",
      children: courseTitle
    }), stats.length > 0 && /*#__PURE__*/(0, _jsxRuntime.jsx)("dl", {
      className: "cls-finished__stats",
      children: stats.map(([label, value]) => /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("dt", {
          children: intl.formatMessage(label)
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("dd", {
          className: "cls-num",
          children: value
        })]
      }, label.id))
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
      className: "cls-finished__record",
      role: "status",
      children: recordText ? intl.formatMessage(recordText) : ''
    }), certificateHref && /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls-finished__cert",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        className: "cls-cert__seal",
        "aria-hidden": "true",
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
          src: _icons.WorkspacePremium,
          size: 22
        })
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
        children: intl.formatMessage(_i18n.messages.certificateReady)
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(Link, {
        className: "cls-btn cls-btn--secondary cls-btn--sm",
        href: certificateHref,
        children: intl.formatMessage(_i18n.messages.viewCertificate)
      })]
    }), upNext && /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("hr", {
        className: "cls-finished__rule"
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("h2", {
        className: "cls-finished__next-title",
        children: intl.formatMessage(_i18n.messages.upNext)
      }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        className: "cls-finished__next",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
            className: "cls-finished__next-course",
            children: (0, _i18n.localized)(upNext.course.title, locale)
          }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("p", {
            className: "cls-finished__next-meta",
            children: [(0, _i18n.localized)(upNext.assignment.roadmap?.title, locale), ' · ', intl.formatMessage(_i18n.messages.dueShort, {
              date: (0, _i18n.formatDate)(upNext.assignment.due_at, locale)
            })]
          })]
        }), upNext.href && /*#__PURE__*/(0, _jsxRuntime.jsxs)(Link, {
          className: "cls-btn cls-btn--primary",
          href: upNext.href,
          children: [intl.formatMessage(_i18n.messages.start), /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
            src: _icons.ArrowForward,
            size: 18
          })]
        })]
      })]
    }), backHref && /*#__PURE__*/(0, _jsxRuntime.jsx)(Link, {
      className: "cls-finished__back",
      href: backHref,
      children: intl.formatMessage(_i18n.messages.backToLearning)
    })]
  });
};
CourseFinished.propTypes = {
  courseTitle: _propTypes.default.string.isRequired,
  grade: _propTypes.default.number,
  ceHours: _propTypes.default.number,
  finishedAt: _propTypes.default.string,
  certificateHref: _propTypes.default.string,
  upNext: _propTypes.default.shape({
    course: _propTypes.default.shape({
      title: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.shape({})])
    }).isRequired,
    assignment: _propTypes.default.shape({
      roadmap: _propTypes.default.shape({
        title: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.shape({})])
      }),
      due_at: _propTypes.default.string
    }).isRequired,
    href: _propTypes.default.string
  }),
  backHref: _propTypes.default.string,
  record: _propTypes.default.oneOf(['updating', 'updated', 'later'])
};
var _default = exports.default = CourseFinished;