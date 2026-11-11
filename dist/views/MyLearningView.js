"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toCard = exports.pickResume = exports.default = exports.MyLearningSkeleton = exports.AchievementList = void 0;
var _react = require("react");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _icons = require("@openedx/paragon/icons");
var _i18n = require("../i18n");
var _CourseCard = _interopRequireDefault(require("../components/CourseCard2"));
var _Dashboard = require("../components/Dashboard");
var _Feedback = require("../components/Feedback");
var _KitIcon = _interopRequireDefault(require("../components/KitIcon"));
var _Learner = require("../components/Learner21");
var _LinkContext = require("../components/LinkContext");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, e) { if ("object" != typeof t || !t) return t; var r; if ("undefined" != typeof Symbol && void 0 !== (r = t[Symbol.toPrimitive])) { var i = r.call(t, e || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === e ? String : Number)(t); } // S-100 My Learning 2.1 (Learner v2, doc 10 V-1.02, D-86/D-92/D-93): greeting + overdue alert, "Pick up where
// you left off" hero, Today card (daily goal + week streak, CA-11 `learning_time`), 4 status tiles that filter the
// cards (To do / In progress / Completed / Overdue), course cards (sort, grid/list), side column: deadlines,
// licence (CA-17), achievements (CA-13), next quizzes. Pure view: the dashboard fork passes the data.
// Missing data = that part hidden (Part 1 has no `learning_time` / compliance yet → the old streak card shows).
const SORTS = {
  due: _i18n.messages.mlSortDue,
  recent: _i18n.messages.mlSortRecent,
  progress: _i18n.messages.mlSortProgress,
  title: _i18n.messages.mlSortTitle
};
const BADGE = {
  first_steps: _icons.Star,
  quiz_streak: _icons.Bolt,
  course_complete: _icons.CheckCircle,
  night_owl: _icons.Bedtime
};

// CA-11 course (+ CA-11 deadline, + CA-15 entry when Part 2 is on) → CourseCard2 props.
const toCard = (course, {
  deadline,
  entry,
  locale
}) => {
  const progress = entry?.progress_pct ?? (0, _Dashboard.pctOf)(course.units_done, course.units_total);
  let status = course.status === 'passed' ? 'completed' : course.status;
  const soon = deadline && deadline.days_left >= 0 && deadline.days_left <= 7;
  if (soon && status === 'in_progress') {
    status = 'due_soon';
  }
  return {
    code: course.code,
    title: (0, _i18n.localized)(course.title, locale),
    category: entry?.category || course.category,
    coverUrl: entry?.cover_url || course.image_url || undefined,
    colour: entry?.colour || undefined,
    required: Boolean(course.required),
    status,
    progress,
    units: course.units_total ?? entry?.units_total,
    hours: entry?.hours,
    dueAt: deadline?.due_at || entry?.due_at || undefined,
    lastActivityAt: entry?.last_activity_at || course.last_activity_at || undefined,
    href: course.href,
    resumeHref: course.resume_href,
    daysLeft: deadline?.days_left,
    nextTitle: (0, _i18n.localized)(course.next_title, locale) || undefined
  };
};
exports.toCard = toCard;
const sorters = {
  recent: (a, b) => (b.lastActivityAt || '').localeCompare(a.lastActivityAt || ''),
  due: (a, b) => (a.dueAt || '9999').localeCompare(b.dueAt || '9999'),
  progress: (a, b) => b.progress - a.progress,
  title: (a, b) => a.title.localeCompare(b.title)
};

// The course to continue now: overdue first (most late), then in progress (most recent), then to do (soonest due).
const pickResume = cards => {
  const by = tone => cards.filter(c => (0, _Learner.statusTone)(c.status) === tone);
  return by('overdue').sort(sorters.due)[0] || by('progress').sort(sorters.recent)[0] || by('todo').sort(sorters.due)[0] || null;
};
exports.pickResume = pickResume;
const AchievementList = ({
  items,
  limit = 3,
  allHref
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const Link = (0, _LinkContext.useLinkComponent)();
  const earned = items.filter(a => a.earned_at).sort((a, b) => b.earned_at.localeCompare(a.earned_at));
  const locked = items.filter(a => !a.earned_at);
  const shown = [...earned, ...locked].slice(0, limit);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("ul", {
      className: "cls3-ach",
      children: shown.map(a => /*#__PURE__*/(0, _jsxRuntime.jsxs)("li", {
        className: a.earned_at ? '' : 'cls3-ach--locked',
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
          className: "cls3-ach__badge",
          "aria-hidden": "true",
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
            src: a.earned_at ? BADGE[a.code] || _icons.Star : _icons.Lock,
            size: 20
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
            children: (0, _i18n.localized)(a.title, intl.locale)
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
            children: (0, _i18n.localized)(a.text, intl.locale)
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)("small", {
            children: a.earned_at ? (0, _i18n.formatDate)(a.earned_at, intl.locale) : a.progress && intl.formatMessage(_i18n.messages.mlAchievementProgress, {
              n: a.progress[0],
              max: a.progress[1]
            })
          })]
        })]
      }, a.code))
    }), allHref && /*#__PURE__*/(0, _jsxRuntime.jsx)(Link, {
      className: "cls3-link",
      href: allHref,
      children: intl.formatMessage(_i18n.messages.mlAchievementsAll)
    })]
  });
};
exports.AchievementList = AchievementList;
AchievementList.propTypes = {
  items: _propTypes.default.arrayOf(_propTypes.default.shape({
    code: _propTypes.default.string.isRequired,
    earned_at: _propTypes.default.string
  })).isRequired,
  limit: _propTypes.default.number,
  allHref: _propTypes.default.string
};
const MyLearningSkeleton = () => /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
  className: "cls3-v2",
  "aria-busy": "true",
  children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Skeleton, {
    width: "40%",
    height: 34
  }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
    className: "cls3-top2",
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Skeleton, {
      height: 236,
      radius: 24
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Skeleton, {
      height: 236,
      radius: 16
    })]
  }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
    className: "cls3-tiles",
    children: [0, 1, 2, 3].map(i => /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Skeleton, {
      height: 84,
      radius: 16
    }, i))
  }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
    className: "cls3-home2",
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      className: "cls3-cards cls3-cards--grid",
      children: [0, 1].map(i => /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Skeleton, {
        height: 320,
        radius: 16
      }, i))
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Skeleton, {
      height: 420,
      radius: 16
    })]
  })]
});
exports.MyLearningSkeleton = MyLearningSkeleton;
const MyLearningView = ({
  dashboard,
  catalogue,
  achievements,
  compliance,
  status = 'ready',
  firstName,
  now,
  features = {},
  onRetry,
  achievementsHref
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const t = (m, v) => intl.formatMessage(m, v);
  const [sort, setSort] = (0, _react.useState)('due');
  const [layout, setLayout] = (0, _react.useState)('grid');
  const [filter, setFilter] = (0, _react.useState)('all');
  const d = dashboard || {};
  const pageRef = (0, _Learner.usePageEnter)([status]);
  const cards = (0, _react.useMemo)(() => {
    const deadlines = d.deadlines || [];
    const entries = Object.fromEntries((catalogue || []).map(e => [e.course_key, e]));
    return (d.courses || []).map(c => toCard(c, {
      deadline: deadlines.find(x => x.course_key === c.course_key),
      entry: entries[c.course_key],
      locale: intl.locale
    }));
  }, [d.courses, d.deadlines, catalogue, intl.locale]);
  if (status === 'loading') {
    return /*#__PURE__*/(0, _jsxRuntime.jsx)(MyLearningSkeleton, {});
  }
  const down = status === 'error';
  const countOf = tone => cards.filter(c => (0, _Learner.statusTone)(c.status) === tone).length;
  const counts = Object.fromEntries(_Learner.STATUS_TONES.map(tone => [tone, countOf(tone)]));
  const shown = cards.filter(c => filter === 'all' || (0, _Learner.statusTone)(c.status) === filter).sort(sorters[sort]);
  const hero = pickResume(cards);
  const heroLeft = hero?.hours ? Math.max(1, Math.round(hero.hours * 60 * (1 - hero.progress / 100))) : undefined;
  const showToday = !down && features.streak !== false && d.learning_time;
  const oldStreak = !down && features.streak !== false && !d.learning_time && d.streak;
  const licence = compliance?.licence;
  const listTitle = t(filter === 'all' ? _i18n.messages.v2MyCourses : _Learner.TONE_LABEL[filter]);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
    className: "cls3-v2",
    ref: pageRef,
    children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("section", {
      className: "cls3-hello",
      "aria-label": t(_i18n.messages.shell3MyLearning),
      children: [firstName && /*#__PURE__*/(0, _jsxRuntime.jsx)("h2", {
        children: t(_i18n.messages[(0, _i18n.greetingKey)(now || new Date())], {
          name: firstName
        })
      }), !down && /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
        children: counts.overdue > 0 ? /*#__PURE__*/(0, _jsxRuntime.jsxs)("span", {
          className: "cls3-hello__alert",
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
            src: _icons.Warning,
            size: 18
          }), t(_i18n.messages.v2NeedsAttention, {
            n: counts.overdue
          })]
        }) : t(_i18n.messages.v2AllGood)
      })]
    }), down && /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Notice, {
      onRetry: onRetry,
      children: t(_i18n.messages.notAvailable)
    }), (hero || showToday) && /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: `cls3-top2${hero && showToday ? '' : ' cls3-top2--solo'}`,
      children: [hero && /*#__PURE__*/(0, _jsxRuntime.jsx)(_Learner.ResumeHero, {
        title: hero.title,
        href: hero.resumeHref || hero.href,
        progress: (0, _Learner.statusTone)(hero.status) === 'done' ? 100 : Math.round(hero.progress),
        tone: (0, _Learner.statusTone)(hero.status),
        nextTitle: hero.nextTitle,
        minutesLeft: heroLeft,
        daysLate: hero.daysLeft < 0 ? -hero.daysLeft : 0
      }), showToday && /*#__PURE__*/(0, _jsxRuntime.jsx)(_Learner.TodayCard, {
        learningTime: d.learning_time,
        now: now,
        className: "cls3-rise"
      })]
    }), !down && /*#__PURE__*/(0, _jsxRuntime.jsx)(_Learner.StatusTiles, {
      counts: counts,
      value: filter,
      onChange: setFilter
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls3-home2",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("section", {
        "aria-labelledby": "cls3-mycourses",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
          className: "cls3-head2",
          children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("h2", {
            id: "cls3-mycourses",
            children: [listTitle, /*#__PURE__*/(0, _jsxRuntime.jsx)("small", {
              children: shown.length
            })]
          }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
            children: [filter !== 'all' && /*#__PURE__*/(0, _jsxRuntime.jsxs)("button", {
              type: "button",
              className: "cls-btn cls-btn--sm cls-btn--secondary",
              onClick: () => setFilter('all'),
              children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
                src: _icons.Close,
                size: 16
              }), t(_i18n.messages.v2ShowAll)]
            }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("label", {
              className: "cls3-select",
              htmlFor: "cls3-sort",
              children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
                className: "cls-sr",
                children: t(_i18n.messages.mlSort)
              }), /*#__PURE__*/(0, _jsxRuntime.jsx)("select", {
                id: "cls3-sort",
                value: sort,
                onChange: e => setSort(e.target.value),
                children: Object.entries(SORTS).map(([k, m]) => /*#__PURE__*/(0, _jsxRuntime.jsx)("option", {
                  value: k,
                  children: t(m)
                }, k))
              })]
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
              className: "cls3-toggle",
              role: "group",
              "aria-label": t(_i18n.messages.mlView),
              children: [['grid', _icons.GridView, _i18n.messages.mlGrid], ['list', _icons.ViewList, _i18n.messages.mlList]].map(([k, icon, m]) => /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
                type: "button",
                "aria-pressed": layout === k,
                "aria-label": t(m),
                onClick: () => setLayout(k),
                children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
                  src: icon,
                  size: 18
                })
              }, k))
            })]
          })]
        }), !down && shown.length === 0 && /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          className: "cls3-empty",
          children: t(_i18n.messages.mlEmpty)
        }), shown.length > 0 && /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
          className: `cls3-cards cls3-cards--${layout}`,
          children: shown.map(c => /*#__PURE__*/(0, _jsxRuntime.jsx)(_CourseCard.default, _objectSpread(_objectSpread({}, c), {}, {
            layout: layout,
            now: now
          }), c.href || c.code))
        })]
      }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("aside", {
        children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("section", {
          className: "cls3-card2 cls3-side2 cls3-rise",
          "aria-labelledby": "cls3-dl",
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("h2", {
            id: "cls3-dl",
            className: "cls3-card2__title",
            children: t(_i18n.messages.dashDeadlines)
          }), down ? /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
            className: "cls-dempty",
            children: t(_i18n.messages.notAvailable)
          }) : /*#__PURE__*/(0, _jsxRuntime.jsx)(_Learner.DateDeadlines, {
            items: d.deadlines
          })]
        }), !down && /*#__PURE__*/(0, _jsxRuntime.jsx)(_Learner.LicenceCard, {
          licence: licence
        }), oldStreak && /*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.DashCard, {
          title: t(_i18n.messages.dashStreak),
          titleId: "cls3-streak",
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.StreakWeek, {
            days: d.streak.days,
            current: d.streak.current,
            best: d.streak.best,
            today: now
          })
        }), achievements && achievements.length > 0 && /*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.DashCard, {
          title: t(_i18n.messages.mlAchievements),
          titleId: "cls3-ach",
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(AchievementList, {
            items: achievements,
            allHref: achievementsHref
          })
        }), !down && d.next_quizzes && d.next_quizzes.length > 0 && /*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.DashCard, {
          title: t(_i18n.messages.dashQuizzes),
          titleId: "cls3-quiz",
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.NextQuizList, {
            items: d.next_quizzes
          })
        })]
      })]
    })]
  });
};
MyLearningView.propTypes = {
  dashboard: _propTypes.default.shape({
    deadlines: _propTypes.default.arrayOf(_propTypes.default.shape({})),
    streak: _propTypes.default.shape({
      days: _propTypes.default.arrayOf(_propTypes.default.bool),
      current: _propTypes.default.number,
      best: _propTypes.default.number
    }),
    learning_time: _Learner.learningTimeShape,
    // CA-11 (D-93); null while switched off
    courses: _propTypes.default.arrayOf(_propTypes.default.shape({})),
    next_quizzes: _propTypes.default.arrayOf(_propTypes.default.shape({}))
  }),
  catalogue: _propTypes.default.arrayOf(_propTypes.default.shape({
    course_key: _propTypes.default.string
  })),
  // CA-15 data (Part 2)
  achievements: _propTypes.default.arrayOf(_propTypes.default.shape({
    code: _propTypes.default.string
  })),
  // CA-13 data (Part 2)
  compliance: _propTypes.default.shape({
    licence: _Learner.LicenceCard.propTypes.licence
  }),
  // CA-17 data (D-94)
  status: _propTypes.default.oneOf(['loading', 'ready', 'error']),
  firstName: _propTypes.default.string,
  now: _propTypes.default.instanceOf(Date),
  features: _propTypes.default.shape({
    streak: _propTypes.default.bool
  }),
  onRetry: _propTypes.default.func,
  achievementsHref: _propTypes.default.string
};
var _default = exports.default = MyLearningView;