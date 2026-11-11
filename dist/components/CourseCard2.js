"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.categoryLabel = exports.StatusChip = exports.CARD_STATUSES = void 0;
var _propTypes = _interopRequireDefault(require("prop-types"));
var _i18n = require("../i18n");
var _CourseCover = _interopRequireWildcard(require("./CourseCover"));
var _LinkContext = require("./LinkContext");
var _Progress = require("./Progress");
var _Learner = require("./Learner21");
var _jsxRuntime = require("react/jsx-runtime");
var cache;
function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var r, c, a = Object.defineProperty, n = { __proto__: null, default: e }; if (Object(e) !== e) return n; if (cache || "function" != typeof WeakMap || (cache = new WeakMap()), cache) { if (cache.has(e)) return cache.get(e); cache.set(e, n); } for (c in e) "default" !== c && {}.hasOwnProperty.call(e, c) && ((r = a && Object.getOwnPropertyDescriptor(e, c)) && (r.get || r.set) ? a(n, c, r) : n[c] = e[c]); return n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// Plan 5 course card (S-100/S-101, NetAcad arrangement): cover with code + Required chip, category + status chip,
// title, meta (self-paced · units · hours · due), progress bar, last active + action. Grid or list layout.
// Kit 2.1: one colour per status (D-92) on the chip and on the strip under the cover (strip length = progress).

const CARD_STATUSES = exports.CARD_STATUSES = ['not_started', 'in_progress', 'almost', 'due_soon', 'overdue', 'completed'];
const CHIP = {
  overdue: _i18n.messages.statusOverdue,
  due_soon: _i18n.messages.statusDueSoon,
  almost: _i18n.messages.statusAlmost,
  completed: _i18n.messages.statusCompleted,
  not_started: _i18n.messages.v2StTodo,
  in_progress: _i18n.messages.statusInProgress
};
const CATEGORY_LABEL = {
  clinical: _i18n.messages.catClinical,
  safety: _i18n.messages.catSafety,
  compliance: _i18n.messages.catCompliance,
  soft: _i18n.messages.catSoft,
  general: _i18n.messages.catGeneral
};
const StatusChip = ({
  status
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const label = CHIP[status] || CHIP.in_progress;
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
    className: `cls3-chip cls3-tone--${(0, _Learner.statusTone)(status)}`,
    children: intl.formatMessage(label)
  });
};
exports.StatusChip = StatusChip;
StatusChip.propTypes = {
  status: _propTypes.default.oneOf(CARD_STATUSES).isRequired
};

// Category: CA-15 gives {key, en, th}; CA-11 gives only the key → kit label.
const categoryLabel = (category, intl) => {
  if (!category) {
    return '';
  }
  if (typeof category === 'object') {
    return (0, _i18n.localized)(category, intl.locale);
  }
  return CATEGORY_LABEL[category] ? intl.formatMessage(CATEGORY_LABEL[category]) : category;
};
exports.categoryLabel = categoryLabel;
const CourseCard2 = ({
  code,
  title,
  category,
  coverUrl,
  colour,
  required = false,
  status = 'not_started',
  progress = 0,
  units,
  hours,
  dueAt,
  lastActivityAt,
  href,
  resumeHref,
  layout = 'grid',
  now
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const Link = (0, _LinkContext.useLinkComponent)();
  const t = (m, v) => intl.formatMessage(m, v);
  const done = status === 'completed';
  const action = done && _i18n.messages.review || status === 'not_started' && _i18n.messages.start || _i18n.messages.continue;
  const catKey = typeof category === 'string' ? category : category?.key;
  const coverStyle = !coverUrl && colour ? {
    background: `linear-gradient(135deg, ${colour}, ${colour}CC)`
  } : undefined;
  const meta = [t(_i18n.messages.cardSelfPaced), units != null && t(_i18n.messages.units, {
    n: units
  }), hours != null && t(_i18n.messages.duration, {
    hours: (0, _i18n.formatHours)(hours, intl.locale)
  }), dueAt && !done && t(_i18n.messages.cardDue, {
    date: (0, _i18n.formatDate)(dueAt, intl.locale)
  })].filter(Boolean).join(' · ');
  const pct = done ? 100 : Math.min(Math.round(progress), status === 'almost' ? 99 : 100);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("article", {
    className: `cls3-course cls3-course--${layout} cls3-tone--${(0, _Learner.statusTone)(status)} cls3-lift cls3-rise`,
    style: {
      '--p': pct / 100
    },
    children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls3-course__cover",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_CourseCover.default, {
        imageUrl: coverUrl,
        category: _CourseCover.CATEGORIES.includes(catKey) ? catKey : 'general',
        code: code,
        style: coverStyle
      }), required && /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        className: "cls3-course__req",
        children: t(_i18n.messages.cardRequired)
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        className: "cls3-strip-fill",
        "aria-hidden": "true"
      })]
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls3-course__body",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        className: "cls3-course__eyebrow",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
          children: categoryLabel(category, intl)
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(StatusChip, {
          status: status
        })]
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("h3", {
        className: "cls3-course__title",
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(Link, {
          href: href,
          children: title
        })
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
        className: "cls3-course__meta",
        children: meta
      }), status !== 'not_started' && /*#__PURE__*/(0, _jsxRuntime.jsx)(_Progress.ProgressBar, {
        value: pct,
        label: title
      }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        className: "cls3-course__foot",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("small", {
          children: lastActivityAt ? t(_i18n.messages.mlLastActive, {
            when: (0, _i18n.timeAgo)(lastActivityAt, intl.locale, now?.getTime())
          }) : ''
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(Link, {
          className: `cls-btn cls-btn--sm ${done ? 'cls-btn--secondary' : 'cls-btn--primary'}`,
          href: resumeHref || href,
          "aria-label": `${t(action)}: ${title}`,
          children: t(action)
        })]
      })]
    })]
  });
};
CourseCard2.propTypes = {
  code: _propTypes.default.string,
  title: _propTypes.default.string.isRequired,
  category: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.shape({
    key: _propTypes.default.string,
    en: _propTypes.default.string,
    th: _propTypes.default.string
  })]),
  coverUrl: _propTypes.default.string,
  colour: _propTypes.default.string,
  required: _propTypes.default.bool,
  status: _propTypes.default.oneOf(CARD_STATUSES),
  progress: _propTypes.default.number,
  units: _propTypes.default.number,
  hours: _propTypes.default.number,
  dueAt: _propTypes.default.string,
  lastActivityAt: _propTypes.default.string,
  href: _propTypes.default.string.isRequired,
  resumeHref: _propTypes.default.string,
  layout: _propTypes.default.oneOf(['grid', 'list']),
  now: _propTypes.default.instanceOf(Date)
};
var _default = exports.default = CourseCard2;