import {
  useCallback, useEffect, useId, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import {
  ArrowForward, CheckCircle, ChevronLeft, EmojiEvents, Insights, Lock, Schedule,
} from '@openedx/paragon/icons';

import { messages, useClassroomIntl } from '../i18n';
import KitIcon from './KitIcon';
import { useLinkComponent } from './LinkContext';
import { useDropdown } from './Shell3';

// Player 4 (doc 10 V-4.01, Learner v2 prototype): the parts the NetAcad-style player adds on top of Player 3.
// - SessionTimer + useSession: "This session" clock in the top bar, focus block (15/25/45/off) → break dialog
// - KnowledgeCard / CertificateRow: top and bottom of the Course outline
// - ReadingLine: thin line under the page bar that fills while the page scrolls
// - EndCard: end of every page — "Page complete" or what is still left (from the lesson blocks) + Next

export const FOCUS_CHOICES = [15, 25, 45, 0];
const FOCUS_KEY = 'elmp.focusMin';
const BREAK_SECONDS = 5 * 60;

export const clockText = (s) => {
  const v = Math.max(0, Math.floor(Number(s) || 0));
  const h = Math.floor(v / 3600);
  const m = Math.floor((v % 3600) / 60);
  const sec = String(v % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
};

const readFocus = () => {
  try {
    const v = Number(window.localStorage.getItem(FOCUS_KEY));
    return FOCUS_CHOICES.includes(v) && window.localStorage.getItem(FOCUS_KEY) !== null ? v : 25;
  } catch (e) { return 25; }
};

// One clock for the session. Counts only while `running` (the idle timer is active and no break) and the page is
// visible. phase: learning → ask (focus block reached) → break (5 min, timer stopped) → learning.
export function useSession({ running = true } = {}) {
  const [seconds, setSeconds] = useState(0);
  const [focusSeconds, setFocusSeconds] = useState(0);
  const [focusMin, setFocusMinState] = useState(readFocus);
  const [phase, setPhase] = useState('learning');
  const [breakLeft, setBreakLeft] = useState(BREAK_SECONDS);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  useEffect(() => {
    const id = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) { return; }
      if (phaseRef.current === 'break') {
        setBreakLeft((b) => {
          if (b <= 1) { setPhase('learning'); setFocusSeconds(0); return BREAK_SECONDS; }
          return b - 1;
        });
        return;
      }
      if (!running || phaseRef.current !== 'learning') { return; }
      setSeconds((s) => s + 1);
      setFocusSeconds((f) => f + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (focusMin && phase === 'learning' && focusSeconds >= focusMin * 60) { setPhase('ask'); }
  }, [focusMin, focusSeconds, phase]);

  const setFocusMin = useCallback((m) => {
    setFocusMinState(m);
    setFocusSeconds(0);
    try { window.localStorage.setItem(FOCUS_KEY, String(m)); } catch (e) { /* private window */ }
  }, []);
  const takeBreak = useCallback(() => { setBreakLeft(BREAK_SECONDS); setPhase('break'); }, []);
  const keepGoing = useCallback(() => { setFocusSeconds(0); setPhase('learning'); }, []);
  const back = useCallback(() => { setFocusSeconds(0); setBreakLeft(BREAK_SECONDS); setPhase('learning'); }, []);

  return {
    seconds, focusSeconds, focusMin, setFocusMin, phase, breakLeft, takeBreak, keepGoing, back,
  };
}

const MiniRing = ({ value }) => {
  const r = 9;
  const c = 2 * Math.PI * r;
  return (
    <svg className="cls4-mini" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r={r} className="cls4-mini__track" />
      <circle cx="12" cy="12" r={r} className="cls4-mini__val" strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, value))} />
    </svg>
  );
};
MiniRing.propTypes = { value: PropTypes.number.isRequired };

// ---- top bar: session clock + focus block chooser ----
export const SessionTimer = ({ session, paused = false }) => {
  const intl = useClassroomIntl();
  const t = (m, v) => intl.formatMessage(m, v);
  const dd = useDropdown();
  const panelId = useId();
  const time = clockText(session.seconds);
  const fill = session.focusMin ? session.focusSeconds / (session.focusMin * 60) : 0;
  return (
    <div className="cls3-dd cls4-timer-wrap" ref={dd.ref}>
      <button
        type="button"
        className={`cls4-timer${paused ? ' is-paused' : ''}`}
        data-dd="session"
        aria-expanded={dd.open === 'session'}
        aria-controls={dd.open === 'session' ? panelId : undefined}
        aria-label={t(messages.p4SessionAria, { time })}
        onClick={() => dd.toggle('session')}
      >
        <MiniRing value={fill} />
        <b className="cls-num">{time}</b>
      </button>
      {dd.open === 'session' && (
        <div className="cls3-pop cls4-timer-pop" id={panelId} role="group" aria-label={t(messages.p4Session)}>
          <h4>{t(messages.p4Session)}</h4>
          <div className="cls3-pop__row">
            <span><KitIcon src={Schedule} size={18} /> {t(messages.p4LearningTime)}</span>
            <b className="cls-num">{time}</b>
          </div>
          <div className="cls3-pop__row cls4-focus">
            <span id={`${panelId}-focus`}>{t(messages.p4Focus)}</span>
            <div className="cls4-seg" role="group" aria-labelledby={`${panelId}-focus`}>
              {FOCUS_CHOICES.map((m) => (
                <button key={m} type="button" aria-pressed={session.focusMin === m} onClick={() => session.setFocusMin(m)}>
                  {m ? `${m}'` : t(messages.p4FocusOff)}
                </button>
              ))}
            </div>
          </div>
          <p className="cls4-hint">{t(messages.p4FocusHint)}</p>
        </div>
      )}
    </div>
  );
};
SessionTimer.propTypes = {
  session: PropTypes.shape({
    seconds: PropTypes.number.isRequired,
    focusSeconds: PropTypes.number.isRequired,
    focusMin: PropTypes.number.isRequired,
    setFocusMin: PropTypes.func.isRequired,
  }).isRequired,
  paused: PropTypes.bool,
};

// ---- focus break dialogs ----
export const FocusBreakDialog = ({ session }) => {
  const intl = useClassroomIntl();
  const t = (m, v) => intl.formatMessage(m, v);
  const titleId = useId();
  const first = useRef(null);
  useEffect(() => { first.current?.focus(); }, [session.phase]);
  if (session.phase !== 'ask' && session.phase !== 'break') { return null; }
  const ask = session.phase === 'ask';
  return (
    <div className="cls-root cls4-overlay">
      <div className="cls4-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <span className="cls4-dialog__ic" aria-hidden="true"><KitIcon src={Schedule} size={28} /></span>
        <h2 id={titleId}>{t(ask ? messages.p4BreakTitle : messages.p4OnBreak)}</h2>
        <p>{ask ? t(messages.p4BreakBody, { n: session.focusMin }) : t(messages.p4OnBreakBody)}</p>
        {!ask && <p className="cls4-dialog__clock cls-num" aria-live="off">{clockText(session.breakLeft)}</p>}
        <div className="cls4-dialog__acts">
          {ask ? (
            <>
              <button ref={first} type="button" className="cls-btn cls-btn--primary" onClick={session.takeBreak}>{t(messages.p4TakeBreak)}</button>
              <button type="button" className="cls-btn cls-btn--secondary" onClick={session.keepGoing}>{t(messages.p4KeepGoing)}</button>
            </>
          ) : (
            <button ref={first} type="button" className="cls-btn cls-btn--primary" onClick={session.back}>{t(messages.p4BackNow)}</button>
          )}
        </div>
      </div>
    </div>
  );
};
FocusBreakDialog.propTypes = {
  session: PropTypes.shape({
    phase: PropTypes.string.isRequired,
    focusMin: PropTypes.number,
    breakLeft: PropTypes.number,
    takeBreak: PropTypes.func.isRequired,
    keepGoing: PropTypes.func.isRequired,
    back: PropTypes.func.isRequired,
  }).isRequired,
};

// ---- outline: knowledge check card (top) + certificate row (bottom) ----
export const KnowledgeCard = ({ correct, total }) => {
  const intl = useClassroomIntl();
  const t = (m, v) => intl.formatMessage(m, v);
  if (!total) { return null; }
  const pct = Math.round((Math.min(correct, total) / total) * 100);
  return (
    <div className="cls4-kc">
      <span className="cls4-kc__ic" aria-hidden="true"><KitIcon src={Insights} size={20} /></span>
      <div>
        <b>{t(messages.p4Knowledge)}</b>
        <small>{t(messages.p4KnowledgeLine, { ok: correct, n: total })}</small>
      </div>
      <div className="cls4-kc__bar" role="progressbar" aria-label={t(messages.p4Knowledge)} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
        <i style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};
KnowledgeCard.propTypes = { correct: PropTypes.number.isRequired, total: PropTypes.number.isRequired };

export const CertificateRow = ({ href, unlocked }) => {
  const intl = useClassroomIntl();
  const Link = useLinkComponent();
  const t = (m) => intl.formatMessage(m);
  const body = (
    <>
      <KitIcon src={EmojiEvents} size={20} />
      <span>
        {t(messages.p4Certificate)}
        {!unlocked && <small>{t(messages.p4CertLocked)}</small>}
      </span>
      <KitIcon src={unlocked ? CheckCircle : Lock} size={18} />
    </>
  );
  if (!unlocked || !href) { return <p className="cls4-cert">{body}</p>; }
  return <Link className="cls4-cert is-on" href={href}>{body}</Link>;
};
CertificateRow.propTypes = { href: PropTypes.string, unlocked: PropTypes.bool };

// ---- reading line: fills while the page (window or a scroll box) scrolls ----
export function scrollFraction(el) {
  if (el) {
    const max = el.scrollHeight - el.clientHeight;
    return max > 0 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 1;
  }
  const doc = document.documentElement;
  const max = doc.scrollHeight - window.innerHeight;
  return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 1;
}

export const ReadingLine = ({ getScroller }) => {
  const intl = useClassroomIntl();
  const bar = useRef(null);
  useEffect(() => {
    const scroller = getScroller?.() || null;
    const target = scroller || window;
    let frame = 0;
    const paint = () => {
      frame = 0;
      if (bar.current) { bar.current.style.transform = `scaleX(${scrollFraction(scroller)})`; }
    };
    const onScroll = () => { if (!frame) { frame = requestAnimationFrame(paint); } };
    paint();
    target.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      target.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) { cancelAnimationFrame(frame); }
    };
  }, [getScroller]);
  return (
    <div className="cls4-read" aria-hidden="true" title={intl.formatMessage(messages.p4Reading)}>
      <i ref={bar} />
    </div>
  );
};
ReadingLine.propTypes = { getScroller: PropTypes.func };

// ---- end of page: what is left (from the lesson blocks, bridge v2) + Next ----
const LEFT_TEXT = {
  video: messages.p4LeftVideo,
  'quiz-check': messages.p4LeftCheck,
  'quiz-exam': messages.p4LeftQuiz,
};
export const leftText = (intl, left = []) => [...new Set(left.map((k) => LEFT_TEXT[k] || messages.p4LeftActivity))]
  .map((m) => intl.formatMessage(m));

const unitShape = PropTypes.shape({
  id: PropTypes.string,
  title: PropTypes.string,
  href: PropTypes.string,
  number: PropTypes.string,
  locked: PropTypes.bool,
});

export const EndCard = ({
  left, complete = false, next, prev, onNavigate,
}) => {
  const intl = useClassroomIntl();
  const Link = useLinkComponent();
  const t = (m, v) => intl.formatMessage(m, v);
  // left === null: the page has no ELMP blocks (or the frame did not say) → nothing to wait for
  const items = left ? leftText(intl, left) : [];
  const ok = items.length === 0;
  const go = (u) => () => onNavigate?.(u);
  const nextOpen = next && !next.locked && next.href;
  const savedLine = complete ? t(messages.p4PageSaved) : '';
  return (
    <section className={`cls-root cls4-end${ok ? ' is-ok' : ''}`} aria-live="polite">
      <div className="cls4-end__st">
        <KitIcon src={ok ? CheckCircle : Schedule} size={24} />
        <div>
          <b>{t(ok ? messages.p4PageDone : messages.p4AlmostThere)}</b>
          <small>{ok ? savedLine : items.join(' · ')}</small>
        </div>
      </div>
      {nextOpen && (
        <Link className={`cls4-next${ok ? '' : ' is-soft'}`} href={next.href} onClick={go(next)}>
          <span>
            <small>{next.number ? t(messages.p4NextPage, { n: next.number }) : t(messages.p4NextPlain)}</small>
            <b>{next.title}</b>
          </span>
          <KitIcon src={ArrowForward} size={22} />
        </Link>
      )}
      {prev && !prev.locked && prev.href && (
        <Link className="cls4-prev" href={prev.href} onClick={go(prev)}>
          <KitIcon src={ChevronLeft} size={18} />
          {`${prev.number ? `${prev.number} ` : ''}${prev.title}`}
        </Link>
      )}
    </section>
  );
};
EndCard.propTypes = {
  left: PropTypes.arrayOf(PropTypes.string), // block kinds still open on this page; null = unknown / none
  complete: PropTypes.bool, // Open edX completion of the unit (the truth for ticks)
  next: unitShape,
  prev: unitShape,
  onNavigate: PropTypes.func,
};
