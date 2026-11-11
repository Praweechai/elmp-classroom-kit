"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.gradeRows = exports.default = void 0;
var _react = require("react");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _icons = require("@openedx/paragon/icons");
var _i18n = require("../i18n");
var _Dashboard = require("../components/Dashboard");
var _CourseCover = _interopRequireWildcard(require("../components/CourseCover"));
var _CourseCard = require("../components/CourseCard2");
var _Feedback = require("../components/Feedback");
var _KitIcon = _interopRequireDefault(require("../components/KitIcon"));
var _Learner = require("../components/Learner21");
var _LinkContext = require("../components/LinkContext");
var _PageStrip = _interopRequireDefault(require("../components/PageStrip"));
var _jsxRuntime = require("react/jsx-runtime");
var cache;
function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var r, c, a = Object.defineProperty, n = { __proto__: null, default: e }; if (Object(e) !== e) return n; if (cache || "function" != typeof WeakMap || (cache = new WeakMap()), cache) { if (cache.has(e)) return cache.get(e); cache.set(e, n); } for (c in e) "default" !== c && {}.hasOwnProperty.call(e, c) && ((r = a && Object.getOwnPropertyDescriptor(e, c)) && (r.get || r.set) ? a(n, c, r) : n[c] = e[c]); return n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// S-102 Grades 2.1 (Learner v2, doc 10 V-1.03): NetAcad "learning history" rows — one row per course with
// started / due / completed / best score / status, search, status filter and sort. CA-16 (`grades`) gives the
// dates, best score and the graded parts ("Details" opens them); without CA-16 the rows come from CA-11 only
// (score + status + due date; dates the Portal does not know show "—").
const KIND = {
  quiz: _i18n.messages.grKindQuiz,
  activity: _i18n.messages.grKindActivity,
  exam: _i18n.messages.grKindExam
};
const SORTS = {
  recent: _i18n.messages.mlSortRecent,
  due: _i18n.messages.mlSortDue,
  name: _i18n.messages.mlSortTitle
};
const pct = (score, max) => Math.round(score / max * 100);

// CA-11 courses + CA-11 deadlines + CA-16 rows → one list (CA-16-only courses are kept too).
const gradeRows = ({
  dashboard,
  grades,
  locale
}) => {
  const d = dashboard || {};
  const byKey = Object.fromEntries((grades?.courses || []).map(g => [g.course_key, g]));
  const due = Object.fromEntries((d.deadlines || []).map(x => [x.course_key, x.due_at]));
  const rows = (d.courses || []).map(c => {
    const g = byKey[c.course_key] || {};
    delete byKey[c.course_key];
    return {
      key: c.course_key,
      code: c.code,
      title: (0, _i18n.localized)(g.title || c.title, locale),
      category: c.category,
      required: Boolean(c.required),
      status: c.status === 'passed' ? 'completed' : c.status || 'not_started',
      progress: c.status === 'completed' ? 100 : (0, _Dashboard.pctOf)(c.units_done, c.units_total),
      href: c.resume_href || c.href,
      score: g.grade_pct ?? c.score_pct ?? null,
      startedAt: g.started_at || null,
      dueAt: g.due_at || due[c.course_key] || null,
      completedAt: g.completed_at || null,
      lastActivityAt: c.last_activity_at || null,
      parts: g.parts || []
    };
  });
  Object.values(byKey).forEach(g => rows.push({
    key: g.course_key,
    code: g.code,
    title: (0, _i18n.localized)(g.title, locale),
    required: false,
    status: g.passed && 'completed' || (g.started_at ? 'in_progress' : 'not_started'),
    progress: g.passed ? 100 : 0,
    score: g.grade_pct ?? null,
    startedAt: g.started_at || null,
    dueAt: g.due_at || null,
    completedAt: g.completed_at || null,
    parts: g.parts || []
  }));
  return rows;
};
exports.gradeRows = gradeRows;
const sorters = {
  recent: (a, b) => (b.completedAt || b.startedAt || b.lastActivityAt || '').localeCompare(a.completedAt || a.startedAt || a.lastActivityAt || ''),
  due: (a, b) => (a.dueAt || '9999').localeCompare(b.dueAt || '9999'),
  name: (a, b) => a.title.localeCompare(b.title)
};
const PartsTable = ({
  row,
  passMark
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const t = (m, v) => intl.formatMessage(m, v);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
    className: "cls3-table-wrap",
    children: /*#__PURE__*/(0, _jsxRuntime.jsxs)("table", {
      className: "cls3-table",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("caption", {
        className: "cls-sr",
        children: row.title
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("thead", {
        children: /*#__PURE__*/(0, _jsxRuntime.jsxs)("tr", {
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("th", {
            scope: "col",
            children: t(_i18n.messages.grColAssessment)
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)("th", {
            scope: "col",
            children: t(_i18n.messages.grColType)
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)("th", {
            scope: "col",
            children: t(_i18n.messages.colScore)
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)("th", {
            scope: "col",
            children: t(_i18n.messages.grColAttempts)
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)("th", {
            scope: "col",
            children: t(_i18n.messages.grColPercent)
          })]
        })
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("tbody", {
        children: row.parts.map(p => {
          const graded = p.score != null;
          const percent = graded ? pct(p.score, p.max) : null;
          const ok = p.passed ?? percent >= passMark;
          return /*#__PURE__*/(0, _jsxRuntime.jsxs)("tr", {
            children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("th", {
              scope: "row",
              children: (0, _i18n.localized)(p.name, intl.locale)
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)("td", {
              children: KIND[p.kind] ? t(KIND[p.kind]) : p.kind
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)("td", {
              className: "cls-num",
              children: graded ? `${p.score} / ${p.max}` : t(_i18n.messages.grPending)
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)("td", {
              className: "cls-num",
              children: p.attempts ?? 0
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)("td", {
              children: graded ? /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
                className: `cls3-chip cls3-tone--${ok ? 'done' : 'overdue'}`,
                children: `${percent}%`
              }) : '—'
            })]
          }, p.block_id);
        })
      })]
    })
  });
};
PartsTable.propTypes = {
  row: _propTypes.default.shape({
    title: _propTypes.default.string,
    parts: _propTypes.default.arrayOf(_propTypes.default.shape({}))
  }).isRequired,
  passMark: _propTypes.default.number.isRequired
};
const GradeRow = ({
  row,
  passMark,
  index
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const Link = (0, _LinkContext.useLinkComponent)();
  const t = (m, v) => intl.formatMessage(m, v);
  const [open, setOpen] = (0, _react.useState)(false);
  const tone = (0, _Learner.statusTone)(row.status);
  const date = v => v ? (0, _i18n.formatDate)(v, intl.locale) : '—';
  const late = tone === 'overdue';
  const detailsId = `cls3-gr-more-${row.code || index}`;
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("li", {
    className: `cls3-row cls3-tone--${tone} cls3-lift cls3-rise`,
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      className: "cls3-row__thumb",
      "aria-hidden": "true",
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_CourseCover.default, {
        category: _CourseCover.CATEGORIES.includes(row.category) ? row.category : 'general',
        code: row.code
      })
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls3-row__main",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        className: "cls3-row__kind",
        children: [row.code && /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
          className: "cls3-code",
          children: row.code
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
          className: `cls3-req-tag${row.required ? '' : ' cls3-req-tag--opt'}`,
          children: t(row.required ? _i18n.messages.cardRequired : _i18n.messages.v2Optional)
        })]
      }), row.href ? /*#__PURE__*/(0, _jsxRuntime.jsx)(Link, {
        className: "cls3-row__title",
        href: row.href,
        children: row.title
      }) : /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        className: "cls3-row__title",
        children: row.title
      }), row.progress > 0 && /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
        className: "cls-bar",
        role: "progressbar",
        "aria-valuemin": 0,
        "aria-valuemax": 100,
        "aria-valuenow": row.progress,
        "aria-label": row.title,
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)("i", {
          style: {
            width: `${row.progress}%`
          }
        })
      }), row.parts.length > 0 && /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
        type: "button",
        className: "cls3-linkbtn",
        "aria-expanded": open,
        "aria-controls": detailsId,
        onClick: () => setOpen(!open),
        children: t(open ? _i18n.messages.v2HideDetails : _i18n.messages.v2Details)
      })]
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls3-row__col cls3-col-start",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        children: t(_i18n.messages.v2Started)
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
        children: date(row.startedAt)
      })]
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls3-row__col cls3-col-due",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        children: t(_i18n.messages.v2Due)
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
        className: late ? 'is-late' : undefined,
        children: date(row.dueAt)
      })]
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls3-row__col cls3-col-done",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        children: t(_i18n.messages.v2Completed)
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
        children: date(row.completedAt)
      })]
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls3-row__col cls3-col-score",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        children: t(_i18n.messages.v2BestScore)
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
        className: "cls3-row__score",
        children: row.score == null ? '—' : /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
          children: [`${row.score}%`, /*#__PURE__*/(0, _jsxRuntime.jsx)("small", {
            children: t(_i18n.messages.v2PassMark, {
              pct: passMark
            })
          })]
        })
      })]
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls3-row__col cls3-col-status",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        children: t(_i18n.messages.v2Status)
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_CourseCard.StatusChip, {
        status: row.status
      })]
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls3-row__mobile",
      "aria-hidden": "true",
      children: [row.dueAt && /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        children: `${t(_i18n.messages.v2Due)}: ${date(row.dueAt)}`
      }), row.completedAt && /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        children: `${t(_i18n.messages.v2Completed)}: ${date(row.completedAt)}`
      }), row.score != null && /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        children: `${t(_i18n.messages.v2BestScore)}: ${row.score}%`
      })]
    }), open && /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      className: "cls3-row__more",
      id: detailsId,
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(PartsTable, {
        row: row,
        passMark: passMark
      })
    })]
  });
};
GradeRow.propTypes = {
  row: _propTypes.default.shape({
    code: _propTypes.default.string,
    title: _propTypes.default.string,
    category: _propTypes.default.string,
    required: _propTypes.default.bool,
    status: _propTypes.default.string,
    progress: _propTypes.default.number,
    href: _propTypes.default.string,
    score: _propTypes.default.number,
    startedAt: _propTypes.default.string,
    dueAt: _propTypes.default.string,
    completedAt: _propTypes.default.string,
    parts: _propTypes.default.arrayOf(_propTypes.default.shape({}))
  }).isRequired,
  passMark: _propTypes.default.number.isRequired,
  index: _propTypes.default.number.isRequired
};
const GradesView = ({
  dashboard,
  grades,
  status = 'ready',
  passMark = 60,
  onRetry
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const t = (m, v) => intl.formatMessage(m, v);
  const [q, setQ] = (0, _react.useState)('');
  const [tone, setTone] = (0, _react.useState)('all');
  const [sort, setSort] = (0, _react.useState)('recent');
  const pageRef = (0, _Learner.usePageEnter)([status]);
  const rows = (0, _react.useMemo)(() => gradeRows({
    dashboard,
    grades,
    locale: intl.locale
  }), [dashboard, grades, intl.locale]);
  const intro = /*#__PURE__*/(0, _jsxRuntime.jsx)(_PageStrip.default, {
    id: "cls3-grades-strip",
    title: t(_i18n.messages.shell3Grades),
    children: t(_i18n.messages.v2GradesSub)
  });
  if (status === 'loading') {
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls3-v2",
      "aria-busy": "true",
      children: [intro, [0, 1, 2].map(i => /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Skeleton, {
        height: 118,
        radius: 16
      }, i))]
    });
  }
  const needle = q.trim().toLowerCase();
  const shown = rows.filter(r => tone === 'all' || (0, _Learner.statusTone)(r.status) === tone).filter(r => !needle || `${r.title} ${r.code || ''}`.toLowerCase().includes(needle)).sort(sorters[sort]);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
    className: "cls3-v2",
    ref: pageRef,
    children: [intro, status === 'error' && /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Notice, {
      onRetry: onRetry,
      children: t(_i18n.messages.notAvailable)
    }), status !== 'error' && /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
      children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        className: "cls3-filters",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("label", {
          className: "cls3-field",
          htmlFor: "cls3-gr-q",
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
            src: _icons.Search,
            size: 18
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
            className: "cls-sr",
            children: t(_i18n.messages.v2Search)
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)("input", {
            id: "cls3-gr-q",
            type: "search",
            value: q,
            placeholder: t(_i18n.messages.v2Search),
            onChange: e => setQ(e.target.value)
          })]
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
          className: "cls3-filters__end",
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("label", {
            className: "cls3-sel-label",
            htmlFor: "cls3-gr-status",
            children: t(_i18n.messages.v2Status)
          }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("select", {
            id: "cls3-gr-status",
            className: "cls3-sel",
            value: tone,
            onChange: e => setTone(e.target.value),
            children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("option", {
              value: "all",
              children: t(_i18n.messages.mlAll)
            }), _Learner.STATUS_TONES.map(k => /*#__PURE__*/(0, _jsxRuntime.jsx)("option", {
              value: k,
              children: t(_Learner.TONE_LABEL[k])
            }, k))]
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)("label", {
            className: "cls-sr",
            htmlFor: "cls3-gr-sort",
            children: t(_i18n.messages.mlSort)
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)("select", {
            id: "cls3-gr-sort",
            className: "cls3-sel",
            value: sort,
            onChange: e => setSort(e.target.value),
            children: Object.entries(SORTS).map(([k, m]) => /*#__PURE__*/(0, _jsxRuntime.jsx)("option", {
              value: k,
              children: t(m)
            }, k))
          })]
        })]
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
        className: "cls3-count",
        role: "status",
        children: t(_i18n.messages.coursesCount, {
          n: shown.length
        })
      }), shown.length > 0 ? /*#__PURE__*/(0, _jsxRuntime.jsx)("ul", {
        className: "cls3-rows",
        children: shown.map((r, i) => /*#__PURE__*/(0, _jsxRuntime.jsx)(GradeRow, {
          row: r,
          passMark: passMark,
          index: i
        }, r.key))
      }) : /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
        className: "cls3-empty",
        children: t(rows.length ? _i18n.messages.coursesEmpty : _i18n.messages.grEmpty)
      })]
    })]
  });
};
GradesView.propTypes = {
  dashboard: _propTypes.default.shape({
    // CA-11
    courses: _propTypes.default.arrayOf(_propTypes.default.shape({})),
    deadlines: _propTypes.default.arrayOf(_propTypes.default.shape({}))
  }),
  grades: _propTypes.default.shape({
    // CA-16: course rows with dates + parts
    courses: _propTypes.default.arrayOf(_propTypes.default.shape({}))
  }),
  status: _propTypes.default.oneOf(['loading', 'ready', 'error']),
  passMark: _propTypes.default.number,
  onRetry: _propTypes.default.func
};
var _default = exports.default = GradesView;