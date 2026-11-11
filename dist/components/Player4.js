"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.leftText = exports.clockText = exports.SessionTimer = exports.ReadingLine = exports.KnowledgeCard = exports.FocusBreakDialog = exports.FOCUS_CHOICES = exports.EndCard = exports.CertificateRow = void 0;
exports.scrollFraction = scrollFraction;
exports.useSession = useSession;
var _react = require("react");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _icons = require("@openedx/paragon/icons");
var _i18n = require("../i18n");
var _KitIcon = _interopRequireDefault(require("./KitIcon"));
var _LinkContext = require("./LinkContext");
var _Shell = require("./Shell3");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// Player 4 (doc 10 V-4.01, Learner v2 prototype): the parts the NetAcad-style player adds on top of Player 3.
// - SessionTimer + useSession: "This session" clock in the top bar, focus block (15/25/45/off) → break dialog
// - KnowledgeCard / CertificateRow: top and bottom of the Course outline
// - ReadingLine: thin line under the page bar that fills while the page scrolls
// - EndCard: end of every page — "Page complete" or what is still left (from the lesson blocks) + Next

const FOCUS_CHOICES = exports.FOCUS_CHOICES = [15, 25, 45, 0];
const FOCUS_KEY = 'elmp.focusMin';
const BREAK_SECONDS = 5 * 60;
const clockText = s => {
  const v = Math.max(0, Math.floor(Number(s) || 0));
  const h = Math.floor(v / 3600);
  const m = Math.floor(v % 3600 / 60);
  const sec = String(v % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
};
exports.clockText = clockText;
const readFocus = () => {
  try {
    const v = Number(window.localStorage.getItem(FOCUS_KEY));
    return FOCUS_CHOICES.includes(v) && window.localStorage.getItem(FOCUS_KEY) !== null ? v : 25;
  } catch (e) {
    return 25;
  }
};

// One clock for the session. Counts only while `running` (the idle timer is active and no break) and the page is
// visible. phase: learning → ask (focus block reached) → break (5 min, timer stopped) → learning.
function useSession({
  running = true
} = {}) {
  const [seconds, setSeconds] = (0, _react.useState)(0);
  const [focusSeconds, setFocusSeconds] = (0, _react.useState)(0);
  const [focusMin, setFocusMinState] = (0, _react.useState)(readFocus);
  const [phase, setPhase] = (0, _react.useState)('learning');
  const [breakLeft, setBreakLeft] = (0, _react.useState)(BREAK_SECONDS);
  const phaseRef = (0, _react.useRef)(phase);
  phaseRef.current = phase;
  (0, _react.useEffect)(() => {
    const id = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) {
        return;
      }
      if (phaseRef.current === 'break') {
        setBreakLeft(b => {
          if (b <= 1) {
            setPhase('learning');
            setFocusSeconds(0);
            return BREAK_SECONDS;
          }
          return b - 1;
        });
        return;
      }
      if (!running || phaseRef.current !== 'learning') {
        return;
      }
      setSeconds(s => s + 1);
      setFocusSeconds(f => f + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [running]);
  (0, _react.useEffect)(() => {
    if (focusMin && phase === 'learning' && focusSeconds >= focusMin * 60) {
      setPhase('ask');
    }
  }, [focusMin, focusSeconds, phase]);
  const setFocusMin = (0, _react.useCallback)(m => {
    setFocusMinState(m);
    setFocusSeconds(0);
    try {
      window.localStorage.setItem(FOCUS_KEY, String(m));
    } catch (e) {/* private window */}
  }, []);
  const takeBreak = (0, _react.useCallback)(() => {
    setBreakLeft(BREAK_SECONDS);
    setPhase('break');
  }, []);
  const keepGoing = (0, _react.useCallback)(() => {
    setFocusSeconds(0);
    setPhase('learning');
  }, []);
  const back = (0, _react.useCallback)(() => {
    setFocusSeconds(0);
    setBreakLeft(BREAK_SECONDS);
    setPhase('learning');
  }, []);
  return {
    seconds,
    focusSeconds,
    focusMin,
    setFocusMin,
    phase,
    breakLeft,
    takeBreak,
    keepGoing,
    back
  };
}
const MiniRing = ({
  value
}) => {
  const r = 9;
  const c = 2 * Math.PI * r;
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("svg", {
    className: "cls4-mini",
    viewBox: "0 0 24 24",
    "aria-hidden": "true",
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("circle", {
      cx: "12",
      cy: "12",
      r: r,
      className: "cls4-mini__track"
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("circle", {
      cx: "12",
      cy: "12",
      r: r,
      className: "cls4-mini__val",
      strokeDasharray: c,
      strokeDashoffset: c * (1 - Math.min(1, value))
    })]
  });
};
MiniRing.propTypes = {
  value: _propTypes.default.number.isRequired
};

// ---- top bar: session clock + focus block chooser ----
const SessionTimer = ({
  session,
  paused = false
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const t = (m, v) => intl.formatMessage(m, v);
  const dd = (0, _Shell.useDropdown)();
  const panelId = (0, _react.useId)();
  const time = clockText(session.seconds);
  const fill = session.focusMin ? session.focusSeconds / (session.focusMin * 60) : 0;
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
    className: "cls3-dd cls4-timer-wrap",
    ref: dd.ref,
    children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("button", {
      type: "button",
      className: `cls4-timer${paused ? ' is-paused' : ''}`,
      "data-dd": "session",
      "aria-expanded": dd.open === 'session',
      "aria-controls": dd.open === 'session' ? panelId : undefined,
      "aria-label": t(_i18n.messages.p4SessionAria, {
        time
      }),
      onClick: () => dd.toggle('session'),
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(MiniRing, {
        value: fill
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
        className: "cls-num",
        children: time
      })]
    }), dd.open === 'session' && /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls3-pop cls4-timer-pop",
      id: panelId,
      role: "group",
      "aria-label": t(_i18n.messages.p4Session),
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("h4", {
        children: t(_i18n.messages.p4Session)
      }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        className: "cls3-pop__row",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("span", {
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
            src: _icons.Schedule,
            size: 18
          }), " ", t(_i18n.messages.p4LearningTime)]
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
          className: "cls-num",
          children: time
        })]
      }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        className: "cls3-pop__row cls4-focus",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
          id: `${panelId}-focus`,
          children: t(_i18n.messages.p4Focus)
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
          className: "cls4-seg",
          role: "group",
          "aria-labelledby": `${panelId}-focus`,
          children: FOCUS_CHOICES.map(m => /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
            type: "button",
            "aria-pressed": session.focusMin === m,
            onClick: () => session.setFocusMin(m),
            children: m ? `${m}'` : t(_i18n.messages.p4FocusOff)
          }, m))
        })]
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
        className: "cls4-hint",
        children: t(_i18n.messages.p4FocusHint)
      })]
    })]
  });
};
exports.SessionTimer = SessionTimer;
SessionTimer.propTypes = {
  session: _propTypes.default.shape({
    seconds: _propTypes.default.number.isRequired,
    focusSeconds: _propTypes.default.number.isRequired,
    focusMin: _propTypes.default.number.isRequired,
    setFocusMin: _propTypes.default.func.isRequired
  }).isRequired,
  paused: _propTypes.default.bool
};

// ---- focus break dialogs ----
const FocusBreakDialog = ({
  session
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const t = (m, v) => intl.formatMessage(m, v);
  const titleId = (0, _react.useId)();
  const first = (0, _react.useRef)(null);
  (0, _react.useEffect)(() => {
    first.current?.focus();
  }, [session.phase]);
  if (session.phase !== 'ask' && session.phase !== 'break') {
    return null;
  }
  const ask = session.phase === 'ask';
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
    className: "cls-root cls4-overlay",
    children: /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls4-dialog",
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": titleId,
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        className: "cls4-dialog__ic",
        "aria-hidden": "true",
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
          src: _icons.Schedule,
          size: 28
        })
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("h2", {
        id: titleId,
        children: t(ask ? _i18n.messages.p4BreakTitle : _i18n.messages.p4OnBreak)
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
        children: ask ? t(_i18n.messages.p4BreakBody, {
          n: session.focusMin
        }) : t(_i18n.messages.p4OnBreakBody)
      }), !ask && /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
        className: "cls4-dialog__clock cls-num",
        "aria-live": "off",
        children: clockText(session.breakLeft)
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
        className: "cls4-dialog__acts",
        children: ask ? /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
            ref: first,
            type: "button",
            className: "cls-btn cls-btn--primary",
            onClick: session.takeBreak,
            children: t(_i18n.messages.p4TakeBreak)
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
            type: "button",
            className: "cls-btn cls-btn--secondary",
            onClick: session.keepGoing,
            children: t(_i18n.messages.p4KeepGoing)
          })]
        }) : /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
          ref: first,
          type: "button",
          className: "cls-btn cls-btn--primary",
          onClick: session.back,
          children: t(_i18n.messages.p4BackNow)
        })
      })]
    })
  });
};
exports.FocusBreakDialog = FocusBreakDialog;
FocusBreakDialog.propTypes = {
  session: _propTypes.default.shape({
    phase: _propTypes.default.string.isRequired,
    focusMin: _propTypes.default.number,
    breakLeft: _propTypes.default.number,
    takeBreak: _propTypes.default.func.isRequired,
    keepGoing: _propTypes.default.func.isRequired,
    back: _propTypes.default.func.isRequired
  }).isRequired
};

// ---- outline: knowledge check card (top) + certificate row (bottom) ----
const KnowledgeCard = ({
  correct,
  total
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const t = (m, v) => intl.formatMessage(m, v);
  if (!total) {
    return null;
  }
  const pct = Math.round(Math.min(correct, total) / total * 100);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
    className: "cls4-kc",
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
      className: "cls4-kc__ic",
      "aria-hidden": "true",
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
        src: _icons.Insights,
        size: 20
      })
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
        children: t(_i18n.messages.p4Knowledge)
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("small", {
        children: t(_i18n.messages.p4KnowledgeLine, {
          ok: correct,
          n: total
        })
      })]
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      className: "cls4-kc__bar",
      role: "progressbar",
      "aria-label": t(_i18n.messages.p4Knowledge),
      "aria-valuemin": 0,
      "aria-valuemax": 100,
      "aria-valuenow": pct,
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)("i", {
        style: {
          width: `${pct}%`
        }
      })
    })]
  });
};
exports.KnowledgeCard = KnowledgeCard;
KnowledgeCard.propTypes = {
  correct: _propTypes.default.number.isRequired,
  total: _propTypes.default.number.isRequired
};
const CertificateRow = ({
  href,
  unlocked
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const Link = (0, _LinkContext.useLinkComponent)();
  const t = m => intl.formatMessage(m);
  const body = /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
      src: _icons.EmojiEvents,
      size: 20
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("span", {
      children: [t(_i18n.messages.p4Certificate), !unlocked && /*#__PURE__*/(0, _jsxRuntime.jsx)("small", {
        children: t(_i18n.messages.p4CertLocked)
      })]
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
      src: unlocked ? _icons.CheckCircle : _icons.Lock,
      size: 18
    })]
  });
  if (!unlocked || !href) {
    return /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
      className: "cls4-cert",
      children: body
    });
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(Link, {
    className: "cls4-cert is-on",
    href: href,
    children: body
  });
};
exports.CertificateRow = CertificateRow;
CertificateRow.propTypes = {
  href: _propTypes.default.string,
  unlocked: _propTypes.default.bool
};

// ---- reading line: fills while the page (window or a scroll box) scrolls ----
function scrollFraction(el) {
  if (el) {
    const max = el.scrollHeight - el.clientHeight;
    return max > 0 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 1;
  }
  const doc = document.documentElement;
  const max = doc.scrollHeight - window.innerHeight;
  return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 1;
}
const ReadingLine = ({
  getScroller
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const bar = (0, _react.useRef)(null);
  (0, _react.useEffect)(() => {
    const scroller = getScroller?.() || null;
    const target = scroller || window;
    let frame = 0;
    const paint = () => {
      frame = 0;
      if (bar.current) {
        bar.current.style.transform = `scaleX(${scrollFraction(scroller)})`;
      }
    };
    const onScroll = () => {
      if (!frame) {
        frame = requestAnimationFrame(paint);
      }
    };
    paint();
    target.addEventListener('scroll', onScroll, {
      passive: true
    });
    window.addEventListener('resize', onScroll);
    return () => {
      target.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) {
        cancelAnimationFrame(frame);
      }
    };
  }, [getScroller]);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
    className: "cls4-read",
    "aria-hidden": "true",
    title: intl.formatMessage(_i18n.messages.p4Reading),
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)("i", {
      ref: bar
    })
  });
};
exports.ReadingLine = ReadingLine;
ReadingLine.propTypes = {
  getScroller: _propTypes.default.func
};

// ---- end of page: what is left (from the lesson blocks, bridge v2) + Next ----
const LEFT_TEXT = {
  video: _i18n.messages.p4LeftVideo,
  'quiz-check': _i18n.messages.p4LeftCheck,
  'quiz-exam': _i18n.messages.p4LeftQuiz
};
const leftText = (intl, left = []) => [...new Set(left.map(k => LEFT_TEXT[k] || _i18n.messages.p4LeftActivity))].map(m => intl.formatMessage(m));
exports.leftText = leftText;
const unitShape = _propTypes.default.shape({
  id: _propTypes.default.string,
  title: _propTypes.default.string,
  href: _propTypes.default.string,
  number: _propTypes.default.string,
  locked: _propTypes.default.bool
});
const EndCard = ({
  left,
  complete = false,
  next,
  prev,
  onNavigate
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const Link = (0, _LinkContext.useLinkComponent)();
  const t = (m, v) => intl.formatMessage(m, v);
  // left === null: the page has no ELMP blocks (or the frame did not say) → nothing to wait for
  const items = left ? leftText(intl, left) : [];
  const ok = items.length === 0;
  const go = u => () => onNavigate?.(u);
  const nextOpen = next && !next.locked && next.href;
  const savedLine = complete ? t(_i18n.messages.p4PageSaved) : '';
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("section", {
    className: `cls-root cls4-end${ok ? ' is-ok' : ''}`,
    "aria-live": "polite",
    children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls4-end__st",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
        src: ok ? _icons.CheckCircle : _icons.Schedule,
        size: 24
      }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
          children: t(ok ? _i18n.messages.p4PageDone : _i18n.messages.p4AlmostThere)
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("small", {
          children: ok ? savedLine : items.join(' · ')
        })]
      })]
    }), nextOpen && /*#__PURE__*/(0, _jsxRuntime.jsxs)(Link, {
      className: `cls4-next${ok ? '' : ' is-soft'}`,
      href: next.href,
      onClick: go(next),
      children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("span", {
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("small", {
          children: t(_i18n.messages.p4NextPage, {
            n: next.number || ''
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
          children: next.title
        })]
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
        src: _icons.ArrowForward,
        size: 22
      })]
    }), prev && !prev.locked && prev.href && /*#__PURE__*/(0, _jsxRuntime.jsxs)(Link, {
      className: "cls4-prev",
      href: prev.href,
      onClick: go(prev),
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
        src: _icons.ChevronLeft,
        size: 18
      }), `${prev.number ? `${prev.number} ` : ''}${prev.title}`]
    })]
  });
};
exports.EndCard = EndCard;
EndCard.propTypes = {
  left: _propTypes.default.arrayOf(_propTypes.default.string),
  // block kinds still open on this page; null = unknown / none
  complete: _propTypes.default.bool,
  // Open edX completion of the unit (the truth for ticks)
  next: unitShape,
  prev: unitShape,
  onNavigate: _propTypes.default.func
};