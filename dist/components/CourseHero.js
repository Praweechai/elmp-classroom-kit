"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _propTypes = _interopRequireDefault(require("prop-types"));
var _icons = require("@openedx/paragon/icons");
var _i18n = require("../i18n");
var _KeyFacts = _interopRequireDefault(require("./KeyFacts"));
var _KitIcon = _interopRequireDefault(require("./KitIcon"));
var _LinkContext = require("./LinkContext");
var _Progress = require("./Progress");
var _StatusPill = _interopRequireDefault(require("./StatusPill"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const ACTION = {
  start: _i18n.messages.start,
  resume: _i18n.messages.resume,
  review: _i18n.messages.review
};

// "Required for …" banner from CA-04 `required_by[]` (F-93). Completed assignments are not shown.
const RequiredBanner = ({
  item
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const {
    locale
  } = intl;
  const date = (0, _i18n.formatDate)(item.due_at, locale);
  const overdue = item.status === 'overdue';
  const due = overdue ? intl.formatMessage(_i18n.messages.late, {
    date,
    n: Math.abs(item.days_left ?? 0)
  }) : intl.formatMessage(_i18n.messages.due, {
    date,
    n: Math.max(0, item.days_left ?? 0)
  });
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
    className: `cls-hero__required${overdue ? ' is-late' : ''}`,
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
      src: _icons.Event,
      size: 20
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("p", {
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
        children: intl.formatMessage(_i18n.messages.requiredFor, {
          roadmap: (0, _i18n.localized)(item.roadmap_title, locale)
        })
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        children: due
      })]
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_StatusPill.default, {
      status: item.status
    })]
  });
};
RequiredBanner.propTypes = {
  item: _propTypes.default.shape({
    roadmap_title: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.shape({})]),
    due_at: _propTypes.default.string,
    days_left: _propTypes.default.number,
    status: _propTypes.default.string
  }).isRequired
};

// S-75 top of the course home (doc 04 §6.5): back link, code chip, title, description, key facts,
// required banner(s) and the progress block with the main action.
const CourseHero = ({
  title,
  code,
  description,
  backHref,
  facts = [],
  requiredBy = [],
  progress,
  aside
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const Link = (0, _LinkContext.useLinkComponent)();
  const open = requiredBy.filter(item => item.status !== 'completed');
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("section", {
    className: `cls-hero${aside ? ' cls-hero--aside' : ''}`,
    "aria-labelledby": "cls-hero-title",
    children: [backHref && /*#__PURE__*/(0, _jsxRuntime.jsxs)(Link, {
      className: "cls-hero__back",
      href: backHref,
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
        src: _icons.ArrowBack,
        size: 18
      }), intl.formatMessage(_i18n.messages.navHome)]
    }), code && /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
      className: "cls-hero__code",
      children: code
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("h1", {
      id: "cls-hero-title",
      className: "cls-hero__title",
      children: title
    }), description && /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
      className: "cls-hero__desc",
      children: description
    }), facts.length > 0 && /*#__PURE__*/(0, _jsxRuntime.jsx)(_KeyFacts.default, {
      facts: facts
    }), open.map(item => /*#__PURE__*/(0, _jsxRuntime.jsx)(RequiredBanner, {
      item: item
    }, item.assignment_id ?? (0, _i18n.localized)(item.roadmap_title, 'en'))), progress && /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls-hero__progress",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        className: "cls-hero__progress-text",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("h2", {
          children: intl.formatMessage(_i18n.messages.yourProgress)
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Progress.ProgressBar, {
          value: progress.percent,
          size: "lg"
        }), progress.total > 0 && /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          className: "cls-num",
          children: intl.formatMessage(_i18n.messages.unitsDone, {
            done: progress.done,
            total: progress.total
          })
        })]
      }), progress.href && /*#__PURE__*/(0, _jsxRuntime.jsx)(Link, {
        className: "cls-btn cls-btn--primary cls-btn--lg",
        href: progress.href,
        children: intl.formatMessage(ACTION[progress.action] || _i18n.messages.resume)
      })]
    }), aside && /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      className: "cls-hero__aside",
      children: aside
    }), progress?.href &&
    /*#__PURE__*/
    // Phones: the main action stays reachable at the bottom of the screen (doc 04 §6.5).
    (0, _jsxRuntime.jsx)("div", {
      className: "cls-hero__sticky",
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(Link, {
        className: "cls-btn cls-btn--primary cls-btn--lg",
        href: progress.href,
        tabIndex: -1,
        "aria-hidden": "true",
        children: intl.formatMessage(ACTION[progress.action] || _i18n.messages.resume)
      })
    })]
  });
};
CourseHero.propTypes = {
  title: _propTypes.default.string.isRequired,
  code: _propTypes.default.string,
  description: _propTypes.default.string,
  backHref: _propTypes.default.string,
  facts: _KeyFacts.default.propTypes.facts,
  requiredBy: _propTypes.default.arrayOf(_propTypes.default.shape({})),
  progress: _propTypes.default.shape({
    percent: _propTypes.default.number,
    done: _propTypes.default.number,
    total: _propTypes.default.number,
    href: _propTypes.default.string,
    action: _propTypes.default.oneOf(['start', 'resume', 'review'])
  }),
  aside: _propTypes.default.node
};
var _default = exports.default = CourseHero;