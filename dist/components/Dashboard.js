"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.weekdayLabels = exports.urgency = exports.pctOf = exports.bangkokDay = exports.TONES = exports.StreakWeek = exports.StatRing = exports.StatGroup = exports.NextQuizList = exports.Gauge = exports.EncouragementBanner = exports.DeadlineList = exports.DashCard = exports.BANNER_KINDS = void 0;
var _react = require("react");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _icons = require("@openedx/paragon/icons");
var _i18n = require("../i18n");
var _CourseCover = _interopRequireDefault(require("./CourseCover"));
var _KitIcon = _interopRequireDefault(require("./KitIcon"));
var _LinkContext = require("./LinkContext");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// Plan 4 home dashboard widgets (F-114, doc 04-design §4). Charts are plain SVG (NFR-D2) and
// always show their value as text (NFR-D3).
const clamp = v => Math.max(0, Math.min(100, Math.round(Number(v) || 0)));
const pctOf = (done, total) => total > 0 ? clamp(done / total * 100) : 0;

// Card frame used by every widget: title, optional sub line, optional action on the right.
exports.pctOf = pctOf;
const DashCard = ({
  title,
  sub,
  action,
  className = '',
  children,
  as: Tag = 'section',
  titleId
}) => /*#__PURE__*/(0, _jsxRuntime.jsxs)(Tag, {
  className: `cls-dcard ${className}`.trim(),
  "aria-labelledby": titleId,
  children: [(title || action) && /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
    className: "cls-dcard__head",
    children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      children: [title && /*#__PURE__*/(0, _jsxRuntime.jsx)("h2", {
        id: titleId,
        children: title
      }), sub && /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
        children: sub
      })]
    }), action]
  }), children]
});
exports.DashCard = DashCard;
DashCard.propTypes = {
  title: _propTypes.default.node,
  sub: _propTypes.default.node,
  action: _propTypes.default.node,
  className: _propTypes.default.string,
  children: _propTypes.default.node,
  as: _propTypes.default.elementType,
  titleId: _propTypes.default.string
};

// "Required training done on time" semicircle, 220×130, stroke 18 (doc 04-design §4).
const Gauge = ({
  pct,
  label,
  title
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const none = pct == null;
  const value = clamp(pct);
  const status = none ? intl.formatMessage(_i18n.messages.gaugeNone) : intl.formatMessage(label === 'on_track' ? _i18n.messages.gaugeOnTrack : _i18n.messages.gaugeAttention);
  const heading = title || intl.formatMessage(_i18n.messages.dashOverall);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
    className: `cls-gauge cls-gauge--${none ? 'none' : label}`,
    role: "img",
    "aria-label": none ? `${heading}: ${status}` : intl.formatMessage(_i18n.messages.gaugeAria, {
      title: heading,
      pct: value,
      status
    }),
    children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("svg", {
      width: "220",
      height: "130",
      viewBox: "0 0 220 130",
      "aria-hidden": "true",
      focusable: "false",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("path", {
        className: "cls-gauge__track",
        d: "M20 120a90 90 0 0 1 180 0",
        pathLength: "100"
      }), !none && value > 0 && /*#__PURE__*/(0, _jsxRuntime.jsx)("path", {
        className: "cls-gauge__fill cls-draw",
        d: "M20 120a90 90 0 0 1 180 0",
        pathLength: "100",
        strokeDasharray: `${value} 100`,
        style: {
          '--cls-dash': value
        }
      })]
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls-gauge__value",
      "aria-hidden": "true",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
        className: "cls-num",
        children: none ? '—' : `${value}%`
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        children: status
      })]
    })]
  });
};
exports.Gauge = Gauge;
Gauge.propTypes = {
  pct: _propTypes.default.number,
  label: _propTypes.default.oneOf(['on_track', 'needs_attention']),
  title: _propTypes.default.string
};
const TONES = exports.TONES = ['green', 'blue', 'gold', 'violet', 'pink', 'late'];

// 56 px ring, stroke 6, value inside; icon tile left, label right (doc 04-design §4).
const StatRing = ({
  icon,
  tone = 'green',
  label,
  sub,
  value,
  pct
}) => {
  const size = 56;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const fill = clamp(pct);
  const t = TONES.includes(tone) ? tone : 'green';
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("li", {
    className: `cls-stat cls-stat--${t}`,
    children: [icon && /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
      className: `cls-tile cls-tile--${t}`,
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
        src: icon,
        size: 22
      })
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("span", {
      className: "cls-stat__text",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
        children: label
      }), sub && /*#__PURE__*/(0, _jsxRuntime.jsx)("small", {
        children: sub
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        className: "cls-sr",
        children: value
      })]
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("span", {
      className: "cls-stat__ring",
      "aria-hidden": "true",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("svg", {
        width: size,
        height: size,
        viewBox: `0 0 ${size} ${size}`,
        focusable: "false",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("circle", {
          className: "cls-stat__track",
          cx: size / 2,
          cy: size / 2,
          r: r,
          strokeWidth: stroke
        }), fill > 0 && /*#__PURE__*/(0, _jsxRuntime.jsx)("circle", {
          className: "cls-stat__fill cls-draw",
          cx: size / 2,
          cy: size / 2,
          r: r,
          strokeWidth: stroke,
          strokeDasharray: c,
          strokeDashoffset: c * (1 - fill / 100),
          transform: `rotate(-90 ${size / 2} ${size / 2})`,
          style: {
            '--cls-dash': c
          }
        })]
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
        className: "cls-num",
        children: value
      })]
    })]
  });
};
exports.StatRing = StatRing;
StatRing.propTypes = {
  icon: _propTypes.default.elementType,
  tone: _propTypes.default.oneOf(TONES),
  label: _propTypes.default.string.isRequired,
  sub: _propTypes.default.string,
  value: _propTypes.default.string.isRequired,
  pct: _propTypes.default.number
};
const StatGroup = ({
  title,
  sub,
  children,
  titleId
}) => /*#__PURE__*/(0, _jsxRuntime.jsx)(DashCard, {
  title: title,
  sub: sub,
  titleId: titleId,
  className: "cls-dcard--stats",
  children: /*#__PURE__*/(0, _jsxRuntime.jsx)("ul", {
    className: "cls-stats",
    children: children
  })
});
exports.StatGroup = StatGroup;
StatGroup.propTypes = {
  title: _propTypes.default.string.isRequired,
  sub: _propTypes.default.string,
  children: _propTypes.default.node,
  titleId: _propTypes.default.string
};

// Bangkok calendar day, used for "dismissed today" (doc 04-design §4: dismiss × per day).
const bangkokDay = (now = new Date()) => new Intl.DateTimeFormat('en-CA', {
  timeZone: _i18n.TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
}).format(now);
exports.bangkokDay = bangkokDay;
const BANNER_KEY = 'elmp.banner.dismissed';
const readDismissed = () => {
  try {
    return window.localStorage.getItem(BANNER_KEY);
  } catch (e) {
    return null;
  }
};
const writeDismissed = value => {
  try {
    window.localStorage.setItem(BANNER_KEY, value);
  } catch (e) {/* private mode: dismiss for this visit only */}
};
const BANNER = {
  overdue: [_i18n.messages.bannerOverdue, _icons.Warning],
  due_soon: [_i18n.messages.bannerDueSoon, _icons.Schedule],
  streak: [_i18n.messages.bannerStreak, _icons.LocalFireDepartment],
  all_done: [_i18n.messages.bannerAllDone, _icons.Celebration]
};
const BANNER_KINDS = exports.BANNER_KINDS = Object.keys(BANNER);

// One sentence chosen by state (CA-11 `banner`), tinted by kind; dismissed until tomorrow.
const EncouragementBanner = ({
  banner,
  lead,
  now,
  onDismiss
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const today = bangkokDay(now);
  const key = banner ? `${banner.kind}:${today}` : '';
  const [hidden, setHidden] = (0, _react.useState)(() => readDismissed() === key);
  if (!banner || !BANNER[banner.kind] || hidden) {
    return null;
  }
  const [message, icon] = BANNER[banner.kind];
  const text = intl.formatMessage(message, {
    n: banner.n ?? 0,
    course: (0, _i18n.localized)(banner.course, intl.locale)
  });
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
    className: `cls-banner cls-banner--${banner.kind}`,
    role: "status",
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
      src: icon,
      size: 22,
      className: "cls-banner__icon"
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("p", {
      children: [lead && /*#__PURE__*/(0, _jsxRuntime.jsxs)("b", {
        children: [lead, " "]
      }), text]
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
      type: "button",
      className: "cls-banner__x",
      "aria-label": intl.formatMessage(_i18n.messages.dismiss),
      onClick: () => {
        writeDismissed(key);
        setHidden(true);
        onDismiss?.();
      },
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
        src: _icons.Close,
        size: 20
      })
    })]
  });
};
exports.EncouragementBanner = EncouragementBanner;
EncouragementBanner.propTypes = {
  banner: _propTypes.default.shape({
    kind: _propTypes.default.oneOf(BANNER_KINDS).isRequired,
    n: _propTypes.default.number,
    course: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.shape({})])
  }),
  lead: _propTypes.default.string,
  now: _propTypes.default.instanceOf(Date),
  onDismiss: _propTypes.default.func
};

// red ≤ 2 days (or late), amber ≤ 7, calm otherwise (doc 04-design §4).
const urgency = daysLeft => {
  if (daysLeft == null) {
    return 'calm';
  }
  if (daysLeft <= 2) {
    return 'late';
  }
  if (daysLeft <= 7) {
    return 'soon';
  }
  return 'calm';
};
exports.urgency = urgency;
const DeadlineList = ({
  items = []
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const Link = (0, _LinkContext.useLinkComponent)();
  if (!items.length) {
    return /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
      className: "cls-dempty",
      children: intl.formatMessage(_i18n.messages.deadlinesEmpty)
    });
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("ul", {
    className: "cls-deadlines",
    children: items.map(d => {
      const title = (0, _i18n.localized)(d.title, intl.locale);
      const roadmap = (0, _i18n.localized)(d.roadmap, intl.locale);
      const level = urgency(d.days_left);
      const late = d.days_left < 0;
      const action = intl.formatMessage(d.action === 'start' ? _i18n.messages.start : _i18n.messages.continue);
      return /*#__PURE__*/(0, _jsxRuntime.jsxs)("li", {
        className: `cls-deadline cls-deadline--${level}`,
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_CourseCover.default, {
          className: "cls-deadline__thumb",
          category: d.category,
          code: d.code,
          imageUrl: d.image_url
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
          className: "cls-deadline__text",
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
            children: title
          }), roadmap && /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
            className: "cls-rpill",
            children: intl.formatMessage(_i18n.messages.requiredPill, {
              roadmap
            })
          })]
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
          className: "cls-datechip cls-num",
          children: (0, _i18n.formatDate)(d.due_at, intl.locale)
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("span", {
          className: "cls-left",
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("i", {
            "aria-hidden": "true"
          }), late ? intl.formatMessage(_i18n.messages.daysLate, {
            n: -d.days_left
          }) : intl.formatMessage(_i18n.messages.daysLeft, {
            n: d.days_left ?? 0
          })]
        }), d.href && /*#__PURE__*/(0, _jsxRuntime.jsxs)(Link, {
          className: `cls-btn cls-btn--sm ${d.action === 'start' ? 'cls-btn--secondary' : 'cls-btn--primary'}`,
          href: d.href,
          "aria-label": intl.formatMessage(_i18n.messages.actionLabel, {
            action,
            title
          }),
          children: [d.action !== 'start' && /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
            src: _icons.PlayArrow,
            size: 18
          }), action]
        })]
      }, `${d.assignment_id}-${d.course_key}`);
    })
  });
};
exports.DeadlineList = DeadlineList;
DeadlineList.propTypes = {
  items: _propTypes.default.arrayOf(_propTypes.default.shape({
    assignment_id: _propTypes.default.oneOfType([_propTypes.default.number, _propTypes.default.string]),
    course_key: _propTypes.default.string,
    code: _propTypes.default.string,
    category: _propTypes.default.string,
    image_url: _propTypes.default.string,
    title: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.shape({})]).isRequired,
    roadmap: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.shape({})]),
    due_at: _propTypes.default.string,
    days_left: _propTypes.default.number,
    action: _propTypes.default.oneOf(['continue', 'start']),
    href: _propTypes.default.string
  }))
};

// Short weekday names for the 7 days ending on `today` (Bangkok), oldest first.
const weekdayLabels = (today = new Date(), locale = 'en') => {
  const fmt = new Intl.DateTimeFormat((0, _i18n.kitLanguage)(locale) === 'th' ? 'th-TH' : 'en-GB', {
    weekday: 'short',
    timeZone: _i18n.TIME_ZONE
  });
  return [6, 5, 4, 3, 2, 1, 0].map(back => fmt.format(new Date(today.getTime() - back * 86400000)));
};

// 7 flames, filled = learned that day; "4 days in a row" (D-70).
exports.weekdayLabels = weekdayLabels;
const StreakWeek = ({
  days = [],
  current = 0,
  best,
  today
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const labels = weekdayLabels(today, intl.locale);
  const week = labels.map((label, i) => ({
    label,
    on: Boolean(days[i])
  }));
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
    className: "cls-streak",
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("ol", {
      className: "cls-streak__week",
      "aria-label": intl.formatMessage(_i18n.messages.streakWeek),
      children: week.map(({
        label,
        on
      }, i) =>
      /*#__PURE__*/
      // eslint-disable-next-line react/no-array-index-key
      (0, _jsxRuntime.jsxs)("li", {
        className: on ? 'is-on' : undefined,
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
          src: _icons.LocalFireDepartment,
          size: 24,
          className: "cls-streak__flame"
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
          "aria-hidden": "true",
          children: label
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
          className: "cls-sr",
          children: `${label}: ${intl.formatMessage(on ? _i18n.messages.streakActive : _i18n.messages.streakInactive)}`
        })]
      }, i))
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
      className: "cls-streak__line",
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
        children: intl.formatMessage(_i18n.messages.streakDays, {
          n: current
        })
      })
    }), best > 0 && /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
      className: "cls-streak__best",
      children: intl.formatMessage(_i18n.messages.streakBest, {
        n: best
      })
    })]
  });
};
exports.StreakWeek = StreakWeek;
StreakWeek.propTypes = {
  days: _propTypes.default.arrayOf(_propTypes.default.bool),
  current: _propTypes.default.number,
  best: _propTypes.default.number,
  today: _propTypes.default.instanceOf(Date)
};

// Next graded parts not passed yet (CA-11 `next_quizzes`).
const NextQuizList = ({
  items = []
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const Link = (0, _LinkContext.useLinkComponent)();
  if (!items.length) {
    return /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
      className: "cls-dempty",
      children: intl.formatMessage(_i18n.messages.quizzesEmpty)
    });
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("ul", {
    className: "cls-quizzes",
    children: items.map(q => {
      const title = [(0, _i18n.localized)(q.title, intl.locale), q.code].filter(Boolean).join(' · ');
      const start = intl.formatMessage(_i18n.messages.start);
      return /*#__PURE__*/(0, _jsxRuntime.jsxs)("li", {
        className: "cls-quiz",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
          className: "cls-tile cls-tile--violet",
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
            src: _icons.Quiz,
            size: 22
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("span", {
          className: "cls-quiz__text",
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
            children: title
          }), q.questions > 0 && /*#__PURE__*/(0, _jsxRuntime.jsx)("small", {
            children: intl.formatMessage(_i18n.messages.quizMeta, {
              q: q.questions,
              m: q.minutes ?? q.questions * 2
            })
          })]
        }), q.href && /*#__PURE__*/(0, _jsxRuntime.jsx)(Link, {
          className: "cls-btn cls-btn--secondary cls-btn--sm",
          href: q.href,
          "aria-label": intl.formatMessage(_i18n.messages.actionLabel, {
            action: start,
            title
          }),
          children: start
        })]
      }, q.block_id || title);
    })
  });
};
exports.NextQuizList = NextQuizList;
NextQuizList.propTypes = {
  items: _propTypes.default.arrayOf(_propTypes.default.shape({
    block_id: _propTypes.default.string,
    course_key: _propTypes.default.string,
    code: _propTypes.default.string,
    title: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.shape({})]).isRequired,
    questions: _propTypes.default.number,
    minutes: _propTypes.default.number,
    href: _propTypes.default.string
  }))
};