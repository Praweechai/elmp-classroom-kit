"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _propTypes = _interopRequireDefault(require("prop-types"));
var _icons = require("@openedx/paragon/icons");
var _i18n = require("../i18n");
var _Dashboard = require("../components/Dashboard");
var _Feedback = require("../components/Feedback");
var _LinkContext = require("../components/LinkContext");
var _PageStrip = _interopRequireDefault(require("../components/PageStrip"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// S-102 Grades (F-133): page strip, three stat cards (average, graded items, pending), then tables.
// Part 2 (CA-16 `grades`): one table card per course with every graded part (NetAcad arrangement).
// Part 1 (CA-11 only): one table of courses — grade, pass mark, status — and a "See details" link to the
// course's own progress page (the per-part scores live there until CA-16).
const KIND = {
  quiz: _i18n.messages.grKindQuiz,
  activity: _i18n.messages.grKindActivity,
  exam: _i18n.messages.grKindExam
};
const avg = list => list.length ? Math.round(list.reduce((s, v) => s + v, 0) / list.length) : null;
const pct = (score, max) => Math.round(score / max * 100);
const ResultChip = ({
  ok,
  children
}) => /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
  className: `cls3-chip cls3-chip--${ok ? 'done' : 'late'}`,
  children: children
});
ResultChip.propTypes = {
  ok: _propTypes.default.bool,
  children: _propTypes.default.node
};

// Course status in words: Passed / Almost done / In progress / Not yet.
const CourseResult = ({
  passed,
  status
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  if (passed === true || status === 'completed' || status === 'passed') {
    return /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
      className: "cls3-chip cls3-chip--done",
      children: intl.formatMessage(_i18n.messages.statusPassed)
    });
  }
  if (status === 'almost') {
    return /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
      className: "cls3-chip cls3-chip--gold",
      children: intl.formatMessage(_i18n.messages.statusAlmost)
    });
  }
  if (passed === null) {
    return /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
      className: "cls3-chip cls3-chip--ok",
      children: intl.formatMessage(_i18n.messages.statusInProgress)
    });
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
    className: "cls3-chip cls3-chip--plain",
    children: intl.formatMessage(_i18n.messages.grNotYet)
  });
};
CourseResult.propTypes = {
  passed: _propTypes.default.bool,
  status: _propTypes.default.string
};
const StatCards = ({
  average,
  graded,
  pending
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const t = (m, v) => intl.formatMessage(m, v);
  const total = graded + pending;
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("ul", {
    className: "cls3-stats cls3-stats--3",
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.StatRing, {
      icon: _icons.TrendingUp,
      tone: "green",
      label: t(_i18n.messages.grAverage),
      value: average == null ? '—' : `${average}%`,
      pct: average || 0
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.StatRing, {
      icon: _icons.Grading,
      tone: "violet",
      label: t(_i18n.messages.grGraded),
      value: String(graded),
      pct: (0, _Dashboard.pctOf)(graded, total)
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Dashboard.StatRing, {
      icon: _icons.HourglassEmpty,
      tone: "gold",
      label: t(_i18n.messages.grPending),
      value: String(pending),
      pct: (0, _Dashboard.pctOf)(pending, total)
    })]
  });
};
StatCards.propTypes = {
  average: _propTypes.default.number,
  graded: _propTypes.default.number.isRequired,
  pending: _propTypes.default.number.isRequired
};
const CourseTableCard = ({
  course,
  passMark
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const t = (m, v) => intl.formatMessage(m, v);
  const title = (0, _i18n.localized)(course.title, intl.locale);
  const id = `cls3-gr-${course.code || course.course_key}`;
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("section", {
    className: "cls-dcard cls3-table-card",
    "aria-labelledby": id,
    children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls3-table-card__head",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("h2", {
        id: id,
        children: [course.code && /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
          className: "cls3-code",
          children: course.code
        }), title]
      }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        className: "cls3-table-card__result",
        children: [course.grade_pct != null && /*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
          children: t(_i18n.messages.grCourseGrade, {
            pct: course.grade_pct
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(CourseResult, {
          passed: course.passed
        })]
      })]
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      className: "cls3-table-wrap",
      children: /*#__PURE__*/(0, _jsxRuntime.jsxs)("table", {
        className: "cls3-table",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("caption", {
          className: "cls-sr",
          children: title
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
          children: (course.parts || []).map(p => {
            const graded = p.score != null;
            const percent = graded ? pct(p.score, p.max) : null;
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
                children: graded ? /*#__PURE__*/(0, _jsxRuntime.jsx)(ResultChip, {
                  ok: p.passed ?? percent >= passMark,
                  children: `${percent}%`
                }) : '—'
              })]
            }, p.block_id);
          })
        })]
      })
    })]
  });
};
CourseTableCard.propTypes = {
  course: _propTypes.default.shape({
    course_key: _propTypes.default.string,
    code: _propTypes.default.string,
    title: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.shape({})]),
    grade_pct: _propTypes.default.number,
    passed: _propTypes.default.bool,
    parts: _propTypes.default.arrayOf(_propTypes.default.shape({}))
  }).isRequired,
  passMark: _propTypes.default.number.isRequired
};

// Part 1: one row per CA-11 course.
const SummaryTable = ({
  courses,
  passMark
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const Link = (0, _LinkContext.useLinkComponent)();
  const t = (m, v) => intl.formatMessage(m, v);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("section", {
    className: "cls-dcard cls3-table-card",
    "aria-labelledby": "cls3-gr-courses",
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      className: "cls3-table-card__head",
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)("h2", {
        id: "cls3-gr-courses",
        children: t(_i18n.messages.grCourses)
      })
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      className: "cls3-table-wrap",
      children: /*#__PURE__*/(0, _jsxRuntime.jsxs)("table", {
        className: "cls3-table",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("thead", {
          children: /*#__PURE__*/(0, _jsxRuntime.jsxs)("tr", {
            children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("th", {
              scope: "col",
              children: t(_i18n.messages.course)
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)("th", {
              scope: "col",
              children: t(_i18n.messages.grColGrade)
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)("th", {
              scope: "col",
              children: t(_i18n.messages.grColPass)
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)("th", {
              scope: "col",
              children: t(_i18n.messages.colStatus)
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)("th", {
              scope: "col",
              children: /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
                className: "cls-sr",
                children: t(_i18n.messages.grDetail)
              })
            })]
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("tbody", {
          children: courses.map(c => {
            const title = (0, _i18n.localized)(c.title, intl.locale);
            const detail = c.progress_href || c.href;
            return /*#__PURE__*/(0, _jsxRuntime.jsxs)("tr", {
              children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("th", {
                scope: "row",
                children: [c.code && /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
                  className: "cls3-code",
                  children: c.code
                }), title]
              }), /*#__PURE__*/(0, _jsxRuntime.jsx)("td", {
                className: "cls-num",
                children: c.score_pct == null ? '—' : `${c.score_pct}%`
              }), /*#__PURE__*/(0, _jsxRuntime.jsx)("td", {
                className: "cls-num",
                children: `${passMark}%`
              }), /*#__PURE__*/(0, _jsxRuntime.jsx)("td", {
                children: /*#__PURE__*/(0, _jsxRuntime.jsx)(CourseResult, {
                  status: c.status,
                  passed: c.status === 'not_started' ? false : undefined
                })
              }), /*#__PURE__*/(0, _jsxRuntime.jsx)("td", {
                children: detail && /*#__PURE__*/(0, _jsxRuntime.jsx)(Link, {
                  className: "cls3-link",
                  href: detail,
                  "aria-label": t(_i18n.messages.actionLabel, {
                    action: t(_i18n.messages.grDetail),
                    title
                  }),
                  children: t(_i18n.messages.grDetail)
                })
              })]
            }, c.course_key);
          })
        })]
      })
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
      className: "cls3-note",
      children: t(_i18n.messages.grPartOneNote)
    })]
  });
};
SummaryTable.propTypes = {
  courses: _propTypes.default.arrayOf(_propTypes.default.shape({
    course_key: _propTypes.default.string
  })).isRequired,
  passMark: _propTypes.default.number.isRequired
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
  const strip = /*#__PURE__*/(0, _jsxRuntime.jsx)(_PageStrip.default, {
    id: "cls3-grades-strip",
    title: t(_i18n.messages.shell3Grades),
    children: t(_i18n.messages.pageGradesIntro, {
      pct: passMark
    })
  });
  if (status === 'loading') {
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls3-page",
      "aria-busy": "true",
      children: [strip, /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
        className: "cls3-stats cls3-stats--3",
        children: [0, 1, 2].map(i => /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Skeleton, {
          height: 88,
          radius: 16
        }, i))
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Skeleton, {
        height: 260,
        radius: 16
      })]
    });
  }
  let body;
  if (grades) {
    const parts = (grades.courses || []).flatMap(c => c.parts || []);
    const graded = parts.filter(p => p.score != null).length;
    body = /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(StatCards, {
        average: grades.summary?.average_pct ?? null,
        graded: graded,
        pending: parts.length - graded
      }), (grades.courses || []).length === 0 && /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
        className: "cls3-empty",
        children: t(_i18n.messages.grEmpty)
      }), (grades.courses || []).map(c => /*#__PURE__*/(0, _jsxRuntime.jsx)(CourseTableCard, {
        course: c,
        passMark: passMark
      }, c.course_key))]
    });
  } else {
    const courses = dashboard?.courses || [];
    const scored = courses.filter(c => c.score_pct != null);
    body = /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(StatCards, {
        average: avg(scored.map(c => c.score_pct)),
        graded: scored.length,
        pending: courses.length - scored.length
      }), courses.length === 0 ? /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
        className: "cls3-empty",
        children: t(_i18n.messages.grEmpty)
      }) : /*#__PURE__*/(0, _jsxRuntime.jsx)(SummaryTable, {
        courses: courses,
        passMark: passMark
      })]
    });
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
    className: "cls3-page",
    children: [strip, status === 'error' && /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Notice, {
      onRetry: onRetry,
      children: t(_i18n.messages.notAvailable)
    }), status !== 'error' && body]
  });
};
GradesView.propTypes = {
  dashboard: _propTypes.default.shape({
    courses: _propTypes.default.arrayOf(_propTypes.default.shape({}))
  }),
  // CA-11
  grades: _propTypes.default.shape({
    // CA-16 data (Part 2)
    summary: _propTypes.default.shape({
      average_pct: _propTypes.default.number
    }),
    courses: _propTypes.default.arrayOf(_propTypes.default.shape({}))
  }),
  status: _propTypes.default.oneOf(['loading', 'ready', 'error']),
  passMark: _propTypes.default.number,
  onRetry: _propTypes.default.func
};
var _default = exports.default = GradesView;