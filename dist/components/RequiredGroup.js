"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = require("react");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _icons = require("@openedx/paragon/icons");
var _i18n = require("../i18n");
var _KitIcon = _interopRequireDefault(require("./KitIcon"));
var _LinkContext = require("./LinkContext");
var _Progress = require("./Progress");
var _StatusPill = _interopRequireDefault(require("./StatusPill"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const COURSE_STATUS = {
  passed: _i18n.messages.statusPassed,
  in_progress: _i18n.messages.statusInProgress,
  not_started: _i18n.messages.statusNotStarted
};
const CourseRow = ({
  course,
  href
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const Link = (0, _LinkContext.useLinkComponent)();
  const title = (0, _i18n.localized)(course.title, intl.locale);
  const ready = course.enrolled !== false;
  const state = COURSE_STATUS[course.status] ? course.status : 'not_started';
  const content = /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
      className: `cls-st cls-st--${ready ? state : 'pending'}`,
      style: {
        '--cls-st-pct': `${course.grade_percent || 50}%`
      },
      "aria-hidden": "true",
      children: state === 'passed' && /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
        src: _icons.Check,
        size: 16
      })
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
      children: title
    }), course.ce_hours != null && /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
      className: "cls-row__hours cls-num",
      children: intl.formatMessage(_i18n.messages.ceHours, {
        hours: (0, _i18n.formatHours)(course.ce_hours, intl.locale)
      })
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
      className: "cls-row__status",
      children: ready ? intl.formatMessage(COURSE_STATUS[state]) : intl.formatMessage(_i18n.messages.preparing)
    }), ready && href ? /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
      src: _icons.ChevronRight,
      size: 20,
      className: "cls-row__chev"
    }) : /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {})]
  });
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("li", {
    children: ready && href ? /*#__PURE__*/(0, _jsxRuntime.jsx)(Link, {
      className: "cls-row",
      href: href,
      children: content
    }) : /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      className: "cls-row",
      children: content
    })
  });
};
CourseRow.propTypes = {
  course: _propTypes.default.shape({
    title: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.shape({})]),
    status: _propTypes.default.string,
    enrolled: _propTypes.default.bool,
    ce_hours: _propTypes.default.number,
    grade_percent: _propTypes.default.number
  }).isRequired,
  href: _propTypes.default.string
};

// One card per assignment (doc 04 §5.6, F-91). Takes a CA-03 `assignments[]` item.
const RequiredGroup = ({
  assignment,
  courseHref,
  highlighted = false
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const {
    locale
  } = intl;
  const completed = assignment.status === 'completed';
  const [open, setOpen] = (0, _react.useState)(!completed);
  const [flash, setFlash] = (0, _react.useState)(highlighted);
  const ref = (0, _react.useRef)(null);
  const listId = `required-${assignment.id}-courses`;
  (0, _react.useEffect)(() => {
    if (!highlighted) {
      return undefined;
    }
    ref.current?.scrollIntoView?.({
      block: 'start'
    });
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 1200);
    return () => clearTimeout(t);
  }, [highlighted]);
  const date = (0, _i18n.formatDate)(assignment.due_at, locale);
  let dueLine = intl.formatMessage(_i18n.messages.due, {
    date,
    n: Math.max(0, assignment.days_left ?? 0)
  });
  if (completed) {
    dueLine = intl.formatMessage(_i18n.messages.completedOn, {
      date: (0, _i18n.formatDate)(assignment.completed_at, locale)
    });
  } else if (assignment.status === 'overdue') {
    dueLine = intl.formatMessage(_i18n.messages.late, {
      date,
      n: Math.abs(assignment.days_left ?? 0)
    });
  }
  const roadmap = (0, _i18n.localized)(assignment.roadmap?.title, locale);
  const overdue = assignment.status === 'overdue';
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("section", {
    ref: ref,
    id: `required-${assignment.id}`,
    className: `cls-group${overdue ? ' cls-group--overdue' : ''}${flash ? ' is-highlighted' : ''}`,
    "aria-labelledby": `required-${assignment.id}-title`,
    children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls-group__head",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("h3", {
          className: "cls-group__title",
          id: `required-${assignment.id}-title`,
          children: [roadmap, /*#__PURE__*/(0, _jsxRuntime.jsx)(_StatusPill.default, {
            status: assignment.status
          })]
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("p", {
          className: `cls-group__due${overdue ? ' cls-group__due--late' : ''}`,
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
            src: _icons.Event,
            size: 16
          }), dueLine]
        })]
      }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        className: "cls-group__pct cls-num",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Progress.ProgressRing, {
          value: assignment.progress_percent || 0,
          size: 32,
          label: roadmap
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("span", {
          "aria-hidden": "true",
          children: [assignment.progress_percent || 0, "%"]
        })]
      })]
    }), completed && /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
      type: "button",
      className: "cls-btn cls-btn--ghost cls-btn--sm cls-group__toggle",
      "aria-expanded": open,
      "aria-controls": listId,
      onClick: () => setOpen(!open),
      children: intl.formatMessage(open ? _i18n.messages.hideCourses : _i18n.messages.showCourses)
    }), open && /*#__PURE__*/(0, _jsxRuntime.jsx)("ul", {
      id: listId,
      children: assignment.courses.map(course => /*#__PURE__*/(0, _jsxRuntime.jsx)(CourseRow, {
        course: course,
        href: courseHref?.(course)
      }, course.course_key))
    })]
  });
};
RequiredGroup.propTypes = {
  assignment: _propTypes.default.shape({
    id: _propTypes.default.number.isRequired,
    roadmap: _propTypes.default.shape({
      title: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.shape({})])
    }),
    status: _propTypes.default.oneOf(['on_track', 'due_soon', 'overdue', 'completed']).isRequired,
    due_at: _propTypes.default.string,
    days_left: _propTypes.default.number,
    progress_percent: _propTypes.default.number,
    completed_at: _propTypes.default.string,
    courses: _propTypes.default.arrayOf(_propTypes.default.shape({
      course_key: _propTypes.default.string.isRequired
    })).isRequired
  }).isRequired,
  courseHref: _propTypes.default.func,
  highlighted: _propTypes.default.bool
};
var _default = exports.default = RequiredGroup;