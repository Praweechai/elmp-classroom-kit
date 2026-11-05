"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.COURSE_STATES = void 0;
var _propTypes = _interopRequireDefault(require("prop-types"));
var _icons = require("@openedx/paragon/icons");
var _i18n = require("../i18n");
var _CourseCover = _interopRequireDefault(require("./CourseCover"));
var _KitIcon = _interopRequireDefault(require("./KitIcon"));
var _LinkContext = require("./LinkContext");
var _Progress = require("./Progress");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// Plan 4 F-111: "passed" = Completed (passed + every unit done); "almost" = passed, units left.
const COURSE_STATES = exports.COURSE_STATES = ['not_started', 'in_progress', 'almost', 'passed'];
const actionFor = (state, hasCertificate) => {
  if (state === 'passed') {
    return hasCertificate ? _i18n.messages.viewCertificate : _i18n.messages.review;
  }
  return state === 'in_progress' || state === 'almost' ? _i18n.messages.continue : _i18n.messages.start;
};

// Course card (doc 04 §5.4, F-92). The whole card links to the course home; the button resumes.
const CourseCard = ({
  title,
  code,
  imageUrl,
  category,
  href,
  resumeHref,
  durationHours,
  ceHours,
  units,
  unitsDone,
  progress = 0,
  state = 'not_started',
  certificateUrl,
  required,
  completedAt,
  enrolled = true
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const Link = (0, _LinkContext.useLinkComponent)();
  const {
    locale
  } = intl;
  const passed = state === 'passed';
  let strip = {
    cls: '',
    text: intl.formatMessage(_i18n.messages.course)
  };
  if (passed && completedAt) {
    strip = {
      cls: '',
      text: intl.formatMessage(_i18n.messages.completedStrip, {
        date: (0, _i18n.formatDate)(completedAt, locale)
      })
    };
  } else if (required) {
    const date = (0, _i18n.formatDate)(required.dueAt, locale);
    strip = {
      cls: required.overdue ? 'cls-strip--overdue' : 'cls-strip--required',
      text: intl.formatMessage(_i18n.messages.requiredStrip, {
        roadmap: required.roadmap,
        date
      })
    };
  }
  const action = actionFor(state, Boolean(certificateUrl));
  const actionHref = passed && certificateUrl ? certificateUrl : resumeHref || href;
  const meta = [durationHours != null && [_icons.Schedule, intl.formatMessage(_i18n.messages.duration, {
    hours: (0, _i18n.formatHours)(durationHours, locale)
  })], ceHours != null && [_icons.Event, intl.formatMessage(_i18n.messages.ceHours, {
    hours: (0, _i18n.formatHours)(ceHours, locale)
  })], units != null && [_icons.ViewList, intl.formatMessage(_i18n.messages.units, {
    n: units
  })]].filter(Boolean);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("article", {
    className: "cls-card",
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      className: `cls-strip ${strip.cls}`.trim(),
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        children: strip.text
      })
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_CourseCover.default, {
      imageUrl: imageUrl,
      category: category,
      code: code,
      certificate: passed && Boolean(certificateUrl)
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls-card__body",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("h3", {
        className: "cls-card__title",
        title: title,
        children: enrolled ? /*#__PURE__*/(0, _jsxRuntime.jsx)(Link, {
          className: "cls-card__link",
          href: href,
          children: title
        }) : title
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
        className: "cls-meta",
        children: meta.map(([icon, text]) => /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
            src: icon,
            size: 18
          }), text]
        }, text))
      }), enrolled && state !== 'not_started' && /*#__PURE__*/(0, _jsxRuntime.jsx)(_Progress.ProgressBar, {
        value: passed ? 100 : Math.min(progress, 99),
        label: title
      }), enrolled && state === 'almost' && /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
        className: "cls-almost",
        role: "note",
        children: units != null && unitsDone != null ? intl.formatMessage(_i18n.messages.almostLeft, {
          n: Math.max(1, units - unitsDone)
        }) : intl.formatMessage(_i18n.messages.statusAlmost)
      })]
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      className: "cls-card__foot",
      children: enrolled ? /*#__PURE__*/(0, _jsxRuntime.jsx)(Link, {
        className: `cls-btn cls-btn--block ${passed ? 'cls-btn--secondary' : 'cls-btn--primary'}`,
        href: actionHref,
        "aria-label": `${intl.formatMessage(action)}: ${title}`,
        children: intl.formatMessage(action)
      }) : /*#__PURE__*/(0, _jsxRuntime.jsxs)("p", {
        className: "cls-preparing",
        role: "status",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
          className: "cls-live",
          "aria-hidden": "true"
        }), intl.formatMessage(_i18n.messages.preparing)]
      })
    })]
  });
};
CourseCard.propTypes = {
  title: _propTypes.default.string.isRequired,
  code: _propTypes.default.string,
  imageUrl: _propTypes.default.string,
  category: _propTypes.default.string,
  href: _propTypes.default.string,
  resumeHref: _propTypes.default.string,
  durationHours: _propTypes.default.number,
  ceHours: _propTypes.default.number,
  units: _propTypes.default.number,
  unitsDone: _propTypes.default.number,
  progress: _propTypes.default.number,
  state: _propTypes.default.oneOf(COURSE_STATES),
  certificateUrl: _propTypes.default.string,
  required: _propTypes.default.shape({
    roadmap: _propTypes.default.string,
    dueAt: _propTypes.default.string,
    overdue: _propTypes.default.bool
  }),
  completedAt: _propTypes.default.string,
  enrolled: _propTypes.default.bool
};
var _default = exports.default = CourseCard;