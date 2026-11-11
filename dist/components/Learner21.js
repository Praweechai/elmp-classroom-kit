"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.usePageEnter = exports.useCountUp = exports.statusTone = exports.motionAllowed = exports.learningTimeShape = exports.WeekColumns = exports.TodayCard = exports.TONE_LABEL = exports.StatusTiles = exports.STATUS_TONES = exports.ResumeHero = exports.LicenceCard = exports.GoalRing = exports.DateDeadlines = void 0;
var _react = require("react");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _icons = require("@openedx/paragon/icons");
var _i18n = require("../i18n");
var _KitIcon = _interopRequireDefault(require("./KitIcon"));
var _LinkContext = require("./LinkContext");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// Kit 2.1 — Learner v2 building blocks (doc 10 V-1.02, prototype 04-design/learner-v2).

// D-92: one colour per status. Every kit status maps to one of four tones.
const STATUS_TONES = exports.STATUS_TONES = ['todo', 'progress', 'done', 'overdue'];
const statusTone = status => {
  if (status === 'completed' || status === 'passed') {
    return 'done';
  }
  if (status === 'overdue') {
    return 'overdue';
  }
  if (!status || status === 'not_started') {
    return 'todo';
  }
  return 'progress'; // in_progress, almost, due_soon
};
exports.statusTone = statusTone;
const TONE_LABEL = exports.TONE_LABEL = {
  todo: _i18n.messages.v2StTodo,
  progress: _i18n.messages.statusInProgress,
  done: _i18n.messages.statusCompleted,
  overdue: _i18n.messages.statusOverdue
};

// Motion is off when the OS asks for it, or when the learner turned on "Reduce motion" (data-motion on the shell).
// No matchMedia (tests, very old browsers) → no motion.
const motionAllowed = el => {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return false;
  }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return false;
  }
  return !el?.closest?.('[data-motion="reduce"]');
};

// Page entrance once per mount: the first items rise in turn (only what is on screen — keeps phones at 60 fps).
exports.motionAllowed = motionAllowed;
const usePageEnter = (deps = []) => {
  const ref = (0, _react.useRef)(null);
  (0, _react.useLayoutEffect)(() => {
    const root = ref.current;
    if (!root || !motionAllowed(root)) {
      return undefined;
    }
    const cap = window.innerWidth < 768 ? 5 : 8;
    root.querySelectorAll('.cls3-rise').forEach((el, i) => {
      if (i < cap) {
        el.style.setProperty('--i', i);
      } else {
        el.classList.add('cls3-no-enter');
      }
    });
    root.classList.add('cls3-enter');
    const timer = window.setTimeout(() => root.classList.remove('cls3-enter'), 1800);
    return () => window.clearTimeout(timer);
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return ref;
};

// Numbers count up once (700 ms, ease-out). Without motion they show the final value straight away.
exports.usePageEnter = usePageEnter;
const useCountUp = (value, ref) => {
  const [shown, setShown] = (0, _react.useState)(value);
  (0, _react.useEffect)(() => {
    if (!value || !motionAllowed(ref?.current)) {
      setShown(value);
      return undefined;
    }
    let frame;
    const t0 = performance.now();
    const step = now => {
      const k = Math.min(1, (now - t0) / 700);
      setShown(Math.round(value * (1 - (1 - k) ** 3)));
      if (k < 1) {
        frame = requestAnimationFrame(step);
      }
    };
    setShown(0);
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, ref]);
  return shown;
};
exports.useCountUp = useCountUp;
const R = 40;
const CIRC = 2 * Math.PI * R;
const GoalRing = ({
  minutes,
  goal,
  label
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const pct = goal > 0 ? Math.min(1, minutes / goal) : 0;
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
    className: "cls3-ring2",
    role: "img",
    "aria-label": label,
    children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("svg", {
      viewBox: "0 0 92 92",
      "aria-hidden": "true",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("circle", {
        className: "cls3-ring2__track",
        cx: "46",
        cy: "46",
        r: R
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("circle", {
        className: "cls3-ring2__val",
        cx: "46",
        cy: "46",
        r: R,
        strokeDasharray: CIRC,
        strokeDashoffset: CIRC * (1 - pct)
      })]
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls3-ring2__txt",
      "aria-hidden": "true",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
        children: minutes
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        children: intl.formatMessage(_i18n.messages.v2GoalUnit, {
          goal
        })
      })]
    })]
  });
};
exports.GoalRing = GoalRing;
GoalRing.propTypes = {
  minutes: _propTypes.default.number.isRequired,
  goal: _propTypes.default.number.isRequired,
  label: _propTypes.default.string.isRequired
};
const dayLabel = (date, locale) => new Intl.DateTimeFormat((0, _i18n.kitLanguage)(locale) === 'th' ? 'th-TH' : 'en-GB', {
  weekday: 'short',
  timeZone: _i18n.TIME_ZONE
}).format(new Date(`${date}T12:00:00+07:00`));
const bangkokDate = now => new Intl.DateTimeFormat('en-CA', {
  timeZone: _i18n.TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
}).format(now);

// CA-11 `learning_time` (D-93): today's minutes vs goal + Mon–Sun + week streak (3 learning days a week).
const TodayCard = ({
  learningTime,
  now = new Date(),
  className = ''
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const t = (m, v) => intl.formatMessage(m, v);
  const {
    today_minutes: mins = 0,
    goal_minutes: goal = 15,
    week_days: days = [],
    week_streak: streak = {}
  } = learningTime;
  const today = bangkokDate(now);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("section", {
    className: `cls3-card2 cls3-today ${className}`,
    "aria-labelledby": "cls3-today-title",
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("h2", {
      id: "cls3-today-title",
      className: "cls-sr",
      children: t(_i18n.messages.v2Today)
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls3-goal",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(GoalRing, {
        minutes: mins,
        goal: goal,
        label: t(_i18n.messages.v2GoalAria, {
          n: mins,
          goal
        })
      }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("h3", {
          children: t(_i18n.messages.v2Goal)
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          children: mins >= goal ? t(_i18n.messages.v2GoalDone) : t(_i18n.messages.v2GoalLeft, {
            n: goal - mins
          })
        })]
      })]
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls3-streak2",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        className: "cls3-streak2__head",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("b", {
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
            src: _icons.LocalFireDepartment,
            size: 20
          }), t(_i18n.messages.v2WeekStreak, {
            n: streak.current || 0
          })]
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
          children: t(_i18n.messages.v2ThisWeek)
        })]
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("ul", {
        className: "cls3-days",
        children: days.map(d => {
          const label = dayLabel(d.date, intl.locale);
          const on = (d.minutes || 0) > 0;
          const cls = [on && 'is-on', d.date === today && 'is-today'].filter(Boolean).join(' ');
          return /*#__PURE__*/(0, _jsxRuntime.jsxs)("li", {
            className: cls || undefined,
            "aria-label": d.minutes == null ? label : t(_i18n.messages.v2DayAria, {
              day: label,
              n: d.minutes
            }),
            children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("i", {
              "aria-hidden": "true",
              children: on && /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
                src: _icons.Check,
                size: 16
              })
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
              "aria-hidden": "true",
              children: label
            })]
          }, d.date);
        })
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
        children: t(_i18n.messages.v2StreakHint, {
          n: streak.days_needed || 3
        })
      })]
    })]
  });
};
exports.TodayCard = TodayCard;
const learningTimeShape = exports.learningTimeShape = _propTypes.default.shape({
  today_minutes: _propTypes.default.number,
  goal_minutes: _propTypes.default.number,
  week_days: _propTypes.default.arrayOf(_propTypes.default.shape({
    date: _propTypes.default.string,
    minutes: _propTypes.default.number
  })),
  week_streak: _propTypes.default.shape({
    current: _propTypes.default.number,
    best: _propTypes.default.number,
    days_needed: _propTypes.default.number
  })
});
TodayCard.propTypes = {
  learningTime: learningTimeShape.isRequired,
  now: _propTypes.default.instanceOf(Date),
  className: _propTypes.default.string
};
const TILE_ICON = {
  todo: _icons.List,
  progress: _icons.PlayArrow,
  done: _icons.Check,
  overdue: _icons.Warning
};
const Tile = ({
  tone,
  count,
  pressed,
  onClick,
  index
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const ref = (0, _react.useRef)(null);
  const shown = useCountUp(count, ref);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("li", {
    className: "cls3-rise",
    style: {
      '--i': index
    },
    children: /*#__PURE__*/(0, _jsxRuntime.jsxs)("button", {
      ref: ref,
      type: "button",
      className: `cls3-tile cls3-tone--${tone}${count ? ' has-items' : ''}`,
      "aria-pressed": pressed,
      onClick: onClick,
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        className: "cls3-tile__n",
        "aria-hidden": "true",
        children: shown
      }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("span", {
        className: "cls3-tile__l",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
          className: "cls-sr",
          children: `${count} `
        }), intl.formatMessage(TONE_LABEL[tone])]
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        className: "cls3-tile__ic",
        "aria-hidden": "true",
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
          src: TILE_ICON[tone],
          size: 22
        })
      })]
    })
  });
};
Tile.propTypes = {
  tone: _propTypes.default.oneOf(STATUS_TONES).isRequired,
  count: _propTypes.default.number.isRequired,
  pressed: _propTypes.default.bool.isRequired,
  onClick: _propTypes.default.func.isRequired,
  index: _propTypes.default.number.isRequired
};

// 4 status tiles; a tile is a filter (press again = all).
const StatusTiles = ({
  counts,
  value = 'all',
  onChange
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("ul", {
    className: "cls3-tiles",
    "aria-label": intl.formatMessage(_i18n.messages.v2Tiles),
    children: STATUS_TONES.map((tone, i) => /*#__PURE__*/(0, _jsxRuntime.jsx)(Tile, {
      tone: tone,
      index: i,
      count: counts[tone] || 0,
      pressed: value === tone,
      onClick: () => onChange(value === tone ? 'all' : tone)
    }, tone))
  });
};
exports.StatusTiles = StatusTiles;
StatusTiles.propTypes = {
  counts: _propTypes.default.objectOf(_propTypes.default.number).isRequired,
  value: _propTypes.default.oneOf(['all', ...STATUS_TONES]),
  onChange: _propTypes.default.func.isRequired
};

// "Pick up where you left off" — the course to continue now (overdue first, then in progress, then to do).
const ResumeHero = ({
  title,
  href,
  progress = 0,
  tone,
  nextTitle,
  minutesLeft,
  daysLate
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const Link = (0, _LinkContext.useLinkComponent)();
  const t = (m, v) => intl.formatMessage(m, v);
  const started = progress > 0;
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(Link, {
    className: "cls3-resume cls3-rise",
    href: href,
    children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("span", {
        className: "cls3-resume__eyebrow",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
          src: _icons.PlayArrow,
          size: 18
        }), t(started ? _i18n.messages.v2PickUp : _i18n.messages.v2UpNext)]
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("h2", {
        children: title
      }), (nextTitle || daysLate > 0) && /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        className: "cls3-resume__next",
        children: [nextTitle && /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
          children: nextTitle
        }), tone === 'overdue' && daysLate > 0 && /*#__PURE__*/(0, _jsxRuntime.jsxs)("span", {
          className: "cls3-resume__late",
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
            src: _icons.Warning,
            size: 16
          }), t(_i18n.messages.daysLate, {
            n: daysLate
          })]
        })]
      })]
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls3-resume__row",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        className: "cls3-resume__prog",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
          className: "cls3-resume__bar",
          "aria-hidden": "true",
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)("i", {
            style: {
              width: `${progress}%`
            }
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
          className: "cls3-resume__meta",
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
            children: t(_i18n.messages.v2PctDone, {
              pct: progress
            })
          }), minutesLeft > 0 && /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
            children: t(_i18n.messages.v2MinLeft, {
              n: minutesLeft
            })
          })]
        })]
      }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("span", {
        className: "cls3-resume__btn",
        children: [t(started ? _i18n.messages.continue : _i18n.messages.start), /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
          src: _icons.ArrowForward,
          size: 20
        })]
      })]
    })]
  });
};
exports.ResumeHero = ResumeHero;
ResumeHero.propTypes = {
  title: _propTypes.default.string.isRequired,
  href: _propTypes.default.string.isRequired,
  progress: _propTypes.default.number,
  tone: _propTypes.default.oneOf(STATUS_TONES),
  nextTitle: _propTypes.default.string,
  minutesLeft: _propTypes.default.number,
  daysLate: _propTypes.default.number
};

// CA-11 deadlines as date boxes (overdue box pings softly).
const DateDeadlines = ({
  items = [],
  limit = 5
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const Link = (0, _LinkContext.useLinkComponent)();
  const t = (m, v) => intl.formatMessage(m, v);
  if (!items.length) {
    return /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
      className: "cls-dempty",
      children: t(_i18n.messages.deadlinesEmpty)
    });
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("ul", {
    className: "cls3-dates",
    children: [...items].sort((a, b) => (a.days_left ?? 0) - (b.days_left ?? 0)).slice(0, limit).map(d => {
      const title = (0, _i18n.localized)(d.title, intl.locale);
      const left = d.days_left ?? 0;
      const kind = left < 0 && 'overdue' || left === 0 && 'today' || '';
      const action = t(d.action === 'start' ? _i18n.messages.start : _i18n.messages.continue);
      return /*#__PURE__*/(0, _jsxRuntime.jsxs)("li", {
        className: "cls3-dl",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("span", {
          className: `cls3-date${kind ? ` cls3-date--${kind}` : ''}`,
          "aria-hidden": "true",
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
            children: (0, _i18n.formatDate)(d.due_at, intl.locale, {
              month: undefined,
              year: undefined
            })
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
            children: (0, _i18n.formatDate)(d.due_at, intl.locale, {
              day: undefined,
              year: undefined
            })
          })]
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
            className: "cls3-dl__t",
            children: title
          }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
            className: `cls3-dl__s${left < 0 && ' is-late' || left === 0 && ' is-today' || ''}`,
            children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
              className: "cls-sr",
              children: `${(0, _i18n.formatDate)(d.due_at, intl.locale)} · `
            }), left < 0 ? t(_i18n.messages.daysLate, {
              n: -left
            }) : t(_i18n.messages.daysLeft, {
              n: left
            })]
          })]
        }), d.href && /*#__PURE__*/(0, _jsxRuntime.jsx)(Link, {
          className: "cls-btn cls-btn--sm cls-btn--secondary",
          href: d.href,
          "aria-label": t(_i18n.messages.actionLabel, {
            action,
            title
          }),
          children: action
        })]
      }, `${d.assignment_id}-${d.course_key}`);
    })
  });
};
exports.DateDeadlines = DateDeadlines;
DateDeadlines.propTypes = {
  items: _propTypes.default.arrayOf(_propTypes.default.shape({
    due_at: _propTypes.default.string,
    days_left: _propTypes.default.number
  })),
  limit: _propTypes.default.number
};

// CA-17 licence: CNEU credits have / need, renew by (D-94). Nothing for staff without a licence.
const LicenceCard = ({
  licence,
  className = ''
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const t = (m, v) => intl.formatMessage(m, v);
  if (!licence) {
    return null;
  }
  const pct = licence.need > 0 ? Math.min(100, Math.round(licence.have / licence.need * 100)) : 0;
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("section", {
    className: `cls3-card2 cls3-lic cls3-rise ${className}`,
    "aria-labelledby": "cls3-lic-title",
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("h2", {
      id: "cls3-lic-title",
      className: "cls3-card2__title",
      children: t(_i18n.messages.v2Licence)
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
      children: (0, _i18n.localized)(licence.name, intl.locale)
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls3-lic__big",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
        children: licence.have
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        children: `/ ${licence.need} ${t(_i18n.messages.v2Credits)}`
      })]
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      className: "cls-bar",
      role: "progressbar",
      "aria-valuemin": 0,
      "aria-valuemax": 100,
      "aria-valuenow": pct,
      "aria-label": t(_i18n.messages.v2LicenceAria, {
        have: licence.have,
        need: licence.need
      }),
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)("i", {
        style: {
          width: `${pct}%`
        }
      })
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
      children: t(_i18n.messages.v2LicenceLine, {
        date: (0, _i18n.formatDate)(licence.renew_by, intl.locale),
        n: Math.max(0, licence.need - licence.have)
      })
    })]
  });
};
exports.LicenceCard = LicenceCard;
LicenceCard.propTypes = {
  licence: _propTypes.default.shape({
    name: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.shape({})]),
    have: _propTypes.default.number.isRequired,
    need: _propTypes.default.number.isRequired,
    renew_by: _propTypes.default.string
  }),
  className: _propTypes.default.string
};

// Mon–Sun minutes as bars (Progress page "This week").
const WeekColumns = ({
  days = [],
  now = new Date()
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const today = bangkokDate(now);
  const max = Math.max(15, ...days.map(d => d.minutes || 0));
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("ul", {
    className: "cls3-week",
    children: days.map(d => {
      const label = dayLabel(d.date, intl.locale);
      const cls = [d.date === today && 'is-today', d.minutes == null && 'is-future'].filter(Boolean).join(' ');
      const aria = d.minutes == null ? label : intl.formatMessage(_i18n.messages.v2DayAria, {
        day: label,
        n: d.minutes
      });
      return /*#__PURE__*/(0, _jsxRuntime.jsxs)("li", {
        className: cls || undefined,
        "aria-label": aria,
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("i", {
          "aria-hidden": "true",
          style: {
            height: `${Math.max(4, (d.minutes || 0) / max * 90)}px`
          }
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
          "aria-hidden": "true",
          children: label
        })]
      }, d.date);
    })
  });
};
exports.WeekColumns = WeekColumns;
WeekColumns.propTypes = {
  days: _propTypes.default.arrayOf(_propTypes.default.shape({
    date: _propTypes.default.string,
    minutes: _propTypes.default.number
  })),
  now: _propTypes.default.instanceOf(Date)
};