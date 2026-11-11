"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fallbackGroups = exports.default = exports.WeekBars = exports.Donut = void 0;
var _propTypes = _interopRequireDefault(require("prop-types"));
var _icons = require("@openedx/paragon/icons");
var _i18n = require("../i18n");
var _Feedback = require("../components/Feedback");
var _KitIcon = _interopRequireDefault(require("../components/KitIcon"));
var _Learner = require("../components/Learner21");
var _LinkContext = require("../components/LinkContext");
var _PageStrip = _interopRequireDefault(require("../components/PageStrip"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// S-103 Progress 2.1 — "Am I up to date?" (Learner v2, doc 10 V-1.03, D-94): status line, requirement groups
// (Everyone / For my job) with one row per requirement, licence CNEU card, this week's minutes.
// Data: CA-17 `compliance` (groups + licence). Before CA-17 is switched on the page builds one "Required training"
// group from CA-11 required courses. Week bars: CA-11 `learning_time` (Mon–Sun), else CA-16 8 weeks.
const R = 54;
const C = 2 * Math.PI * R;

// Kept for other screens and the Plan 5 stories (kit 2.0 API).
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
const STATE = {
  ok: [_icons.Check, _i18n.messages.v2StateOk],
  soon: [_icons.Schedule, _i18n.messages.v2StateSoon],
  due: [_icons.Schedule, _i18n.messages.v2StateDue],
  overdue: [_icons.Warning, _i18n.messages.v2StateOverdue],
  in_progress: [_icons.PlayArrow, _i18n.messages.v2StateInProgress]
};
const NEEDS_ACTION = ['overdue', 'due', 'soon'];

// Before CA-17: CA-11 required courses → one group.
const fallbackGroups = dashboard => {
  const d = dashboard || {};
  const due = Object.fromEntries((d.deadlines || []).map(x => [x.course_key, x.due_at]));
  const items = (d.courses || []).filter(c => c.required).map(c => {
    const state = {
      completed: 'ok',
      passed: 'ok',
      overdue: 'overdue',
      not_started: 'due'
    }[c.status] || 'in_progress';
    return {
      name: c.title,
      course_key: c.course_key,
      every_months: undefined,
      state,
      date: due[c.course_key] || null
    };
  });
  return items.length ? [{
    key: 'required',
    items
  }] : [];
};
exports.fallbackGroups = fallbackGroups;
const GROUP = {
  everyone: [_icons.Shield, _i18n.messages.v2GroupEveryone],
  job: [_icons.AssignmentInd, _i18n.messages.v2GroupJob],
  required: [_icons.Shield, _i18n.messages.v2GroupRequired]
};
const ReqRow = ({
  item,
  course
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const Link = (0, _LinkContext.useLinkComponent)();
  const t = (m, v) => intl.formatMessage(m, v);
  const [icon, stateLabel] = STATE[item.state] || STATE.due;
  const name = (0, _i18n.localized)(item.name, intl.locale);
  const date = item.date ? (0, _i18n.formatDate)(item.date, intl.locale) : null;
  let when = null;
  if (item.state === 'ok') {
    when = date && /*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
      children: t(_i18n.messages.v2ValidUntil, {
        date
      })
    });
  } else if (item.state === 'soon') {
    when = date && /*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
      className: "is-soon",
      children: t(_i18n.messages.v2RenewBy, {
        date
      })
    });
  } else if (item.state === 'overdue') {
    when = date && /*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
      className: "is-late",
      children: t(_i18n.messages.cardDue, {
        date
      })
    });
  } else if (date) {
    when = /*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
      children: t(_i18n.messages.cardDue, {
        date
      })
    });
  }
  let action = _i18n.messages.start;
  if (item.state === 'ok') {
    action = _i18n.messages.review;
  } else if (item.state === 'soon') {
    action = _i18n.messages.v2Renew;
  } else if (item.state === 'in_progress' || ['in_progress', 'almost', 'due_soon', 'overdue'].includes(course?.status)) {
    action = _i18n.messages.continue;
  }
  let every = null;
  if (item.every_months) {
    every = t(_i18n.messages.v2Every, {
      n: item.every_months
    });
  }
  if (item.every_months === null) {
    every = t(_i18n.messages.v2Once);
  }
  const courseTitle = course ? (0, _i18n.localized)(course.title, intl.locale) : null;
  const sub = [course?.code, courseTitle !== name ? courseTitle : null, every].filter(Boolean).join(' · ');
  const href = course?.resume_href || course?.href;
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("li", {
    className: "cls3-req",
    children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("span", {
      className: `cls3-req__st cls3-req__st--${item.state === 'in_progress' ? 'progress' : item.state}`,
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
        src: icon,
        size: 16
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        className: "cls-sr",
        children: t(stateLabel)
      })]
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
        className: "cls3-req__name",
        children: name
      }), sub && /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
        className: "cls3-req__sub",
        children: sub
      })]
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      className: "cls3-req__when",
      children: when
    }), href ? /*#__PURE__*/(0, _jsxRuntime.jsx)(Link, {
      className: `cls-btn cls-btn--sm ${NEEDS_ACTION.includes(item.state) ? 'cls-btn--primary' : 'cls-btn--secondary'}`,
      href: href,
      "aria-label": t(_i18n.messages.actionLabel, {
        action: t(action),
        title: name
      }),
      children: t(action)
    }) : /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {})]
  });
};
ReqRow.propTypes = {
  item: _propTypes.default.shape({
    name: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.shape({})]),
    course_key: _propTypes.default.string,
    every_months: _propTypes.default.number,
    state: _propTypes.default.string,
    date: _propTypes.default.string
  }).isRequired,
  course: _propTypes.default.shape({
    code: _propTypes.default.string,
    title: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.shape({})]),
    status: _propTypes.default.string,
    href: _propTypes.default.string,
    resume_href: _propTypes.default.string
  })
};
const ProgressView = ({
  dashboard,
  grades,
  compliance,
  status = 'ready',
  now,
  onRetry,
  features = {},
  jobTitle
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const t = (m, v) => intl.formatMessage(m, v);
  const pageRef = (0, _Learner.usePageEnter)([status]);
  const intro = /*#__PURE__*/(0, _jsxRuntime.jsx)(_PageStrip.default, {
    id: "cls3-progress-strip",
    title: t(_i18n.messages.v2UpToDate),
    children: t(_i18n.messages.v2ProgSub)
  });
  if (status === 'loading') {
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls3-v2",
      "aria-busy": "true",
      children: [intro, /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Skeleton, {
        height: 84,
        radius: 16
      }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        className: "cls3-prog2",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Skeleton, {
          height: 360,
          radius: 16
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Skeleton, {
          height: 240,
          radius: 16
        })]
      })]
    });
  }
  if (status === 'error') {
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls3-v2",
      children: [intro, /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Notice, {
        onRetry: onRetry,
        children: t(_i18n.messages.notAvailable)
      })]
    });
  }
  const d = dashboard || {};
  const courses = Object.fromEntries((d.courses || []).map(c => [c.course_key, c]));
  const groups = features.compliance !== false && compliance?.groups || fallbackGroups(d);
  const all = groups.flatMap(g => g.items);
  const need = all.filter(i => NEEDS_ACTION.includes(i.state)).length;
  const week = features.streak !== false ? d.learning_time?.week_days : null;
  const weeks = grades?.weekly_minutes;
  const weekTotal = (week || []).reduce((s, x) => s + (x.minutes || 0), 0);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
    className: "cls3-v2",
    ref: pageRef,
    children: [intro, /*#__PURE__*/(0, _jsxRuntime.jsxs)("section", {
      className: `cls3-statusbar cls3-rise${need ? ' cls3-statusbar--warn' : ''}`,
      role: "status",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        className: "cls3-statusbar__ic",
        "aria-hidden": "true",
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
          src: need ? _icons.Warning : _icons.VerifiedUser,
          size: 26
        })
      }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("h2", {
          children: need ? t(_i18n.messages.v2ActionN, {
            n: need
          }) : t(_i18n.messages.v2AllGood)
        }), need > 0 && /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          children: t(_i18n.messages.v2ActionHint)
        })]
      })]
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls3-prog2",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        children: [groups.length === 0 && /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          className: "cls3-empty",
          children: t(_i18n.messages.coursesEmpty)
        }), groups.map(g => {
          const [icon, label] = GROUP[g.key] || GROUP.required;
          const ok = g.items.filter(i => i.state === 'ok').length;
          return /*#__PURE__*/(0, _jsxRuntime.jsxs)("section", {
            className: "cls3-card2 cls3-group cls3-rise",
            "aria-labelledby": `cls3-grp-${g.key}`,
            children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
              className: "cls3-group__head",
              children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("h2", {
                id: `cls3-grp-${g.key}`,
                children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
                  className: "cls3-group__ic",
                  "aria-hidden": "true",
                  children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
                    src: icon,
                    size: 20
                  })
                }), t(label), g.key === 'job' && jobTitle ? ` · ${jobTitle}` : '']
              }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
                className: "cls3-group__count",
                children: t(_i18n.messages.v2GroupCount, {
                  ok,
                  n: g.items.length
                })
              })]
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)("ul", {
              children: g.items.map(i => /*#__PURE__*/(0, _jsxRuntime.jsx)(ReqRow, {
                item: i,
                course: courses[i.course_key]
              }, `${g.key}-${i.course_key}`))
            })]
          }, g.key);
        })]
      }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("aside", {
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Learner.LicenceCard, {
          licence: features.compliance !== false ? compliance?.licence : null
        }), week && week.length > 0 && /*#__PURE__*/(0, _jsxRuntime.jsxs)("section", {
          className: "cls3-card2 cls3-side2 cls3-rise",
          "aria-labelledby": "cls3-pr-week",
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("h2", {
            id: "cls3-pr-week",
            className: "cls3-card2__title",
            children: t(_i18n.messages.v2ThisWeek)
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
            className: "cls3-note",
            children: t(_i18n.messages.v2Minutes, {
              n: weekTotal
            })
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Learner.WeekColumns, {
            days: week,
            now: now
          })]
        }), (!week || week.length === 0) && weeks && weeks.length > 0 && /*#__PURE__*/(0, _jsxRuntime.jsxs)("section", {
          className: "cls3-card2 cls3-side2 cls3-rise",
          "aria-labelledby": "cls3-pr-weekly",
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("h2", {
            id: "cls3-pr-weekly",
            className: "cls3-card2__title",
            children: t(_i18n.messages.prWeekly)
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)(WeekBars, {
            weeks: weeks
          })]
        })]
      })]
    })]
  });
};
ProgressView.propTypes = {
  dashboard: _propTypes.default.shape({
    // CA-11
    courses: _propTypes.default.arrayOf(_propTypes.default.shape({})),
    deadlines: _propTypes.default.arrayOf(_propTypes.default.shape({})),
    learning_time: _Learner.learningTimeShape
  }),
  grades: _propTypes.default.shape({
    // CA-16: 8-week bars when CA-11 learning_time is not there
    weekly_minutes: _propTypes.default.arrayOf(_propTypes.default.shape({}))
  }),
  compliance: _propTypes.default.shape({
    // CA-17 (D-94)
    groups: _propTypes.default.arrayOf(_propTypes.default.shape({
      key: _propTypes.default.string,
      items: _propTypes.default.arrayOf(_propTypes.default.shape({}))
    })),
    licence: _Learner.LicenceCard.propTypes.licence
  }),
  status: _propTypes.default.oneOf(['loading', 'ready', 'error']),
  now: _propTypes.default.instanceOf(Date),
  onRetry: _propTypes.default.func,
  features: _propTypes.default.shape({
    streak: _propTypes.default.bool,
    compliance: _propTypes.default.bool
  }),
  jobTitle: _propTypes.default.string // shown after "For my job", e.g. "Registered Nurse · ICU"
};
var _default = exports.default = ProgressView;