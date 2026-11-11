import {
  useEffect, useLayoutEffect, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import {
  ArrowForward, Check, LocalFireDepartment, PlayArrow, Warning, List as ListIcon,
} from '@openedx/paragon/icons';

import {
  TIME_ZONE, formatDate, kitLanguage, localized, messages, useClassroomIntl,
} from '../i18n';
import KitIcon from './KitIcon';
import { useLinkComponent } from './LinkContext';

// Kit 2.1 — Learner v2 building blocks (doc 10 V-1.02, prototype 04-design/learner-v2).

// D-92: one colour per status. Every kit status maps to one of four tones.
export const STATUS_TONES = ['todo', 'progress', 'done', 'overdue'];
export const statusTone = (status) => {
  if (status === 'completed' || status === 'passed') { return 'done'; }
  if (status === 'overdue') { return 'overdue'; }
  if (!status || status === 'not_started') { return 'todo'; }
  return 'progress'; // in_progress, almost, due_soon
};
export const TONE_LABEL = {
  todo: messages.v2StTodo,
  progress: messages.statusInProgress,
  done: messages.statusCompleted,
  overdue: messages.statusOverdue,
};

// Motion is off when the OS asks for it, or when the learner turned on "Reduce motion" (data-motion on the shell).
// No matchMedia (tests, very old browsers) → no motion.
export const motionAllowed = (el) => {
  if (typeof window === 'undefined' || !window.matchMedia) { return false; }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { return false; }
  return !el?.closest?.('[data-motion="reduce"]');
};

// Page entrance once per mount: the first items rise in turn (only what is on screen — keeps phones at 60 fps).
export const usePageEnter = (deps = []) => {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || !motionAllowed(root)) { return undefined; }
    const cap = window.innerWidth < 768 ? 5 : 8;
    root.querySelectorAll('.cls3-rise').forEach((el, i) => {
      if (i < cap) { el.style.setProperty('--i', i); } else { el.classList.add('cls3-no-enter'); }
    });
    root.classList.add('cls3-enter');
    const timer = window.setTimeout(() => root.classList.remove('cls3-enter'), 1800);
    return () => window.clearTimeout(timer);
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return ref;
};

// Numbers count up once (700 ms, ease-out). Without motion they show the final value straight away.
export const useCountUp = (value, ref) => {
  const [shown, setShown] = useState(value);
  useEffect(() => {
    if (!value || !motionAllowed(ref?.current)) { setShown(value); return undefined; }
    let frame;
    const t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - t0) / 700);
      setShown(Math.round(value * (1 - (1 - k) ** 3)));
      if (k < 1) { frame = requestAnimationFrame(step); }
    };
    setShown(0);
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, ref]);
  return shown;
};

const R = 40;
const CIRC = 2 * Math.PI * R;

export const GoalRing = ({ minutes, goal, label }) => {
  const intl = useClassroomIntl();
  const pct = goal > 0 ? Math.min(1, minutes / goal) : 0;
  return (
    <div className="cls3-ring2" role="img" aria-label={label}>
      <svg viewBox="0 0 92 92" aria-hidden="true">
        <circle className="cls3-ring2__track" cx="46" cy="46" r={R} />
        <circle
          className="cls3-ring2__val"
          cx="46"
          cy="46"
          r={R}
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - pct)}
        />
      </svg>
      <div className="cls3-ring2__txt" aria-hidden="true">
        <b>{minutes}</b>
        <span>{intl.formatMessage(messages.v2GoalUnit, { goal })}</span>
      </div>
    </div>
  );
};
GoalRing.propTypes = {
  minutes: PropTypes.number.isRequired, goal: PropTypes.number.isRequired, label: PropTypes.string.isRequired,
};

const dayLabel = (date, locale) => new Intl.DateTimeFormat(kitLanguage(locale) === 'th' ? 'th-TH' : 'en-GB', {
  weekday: 'short', timeZone: TIME_ZONE,
}).format(new Date(`${date}T12:00:00+07:00`));

const bangkokDate = (now) => new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
}).format(now);

// CA-11 `learning_time` (D-93): today's minutes vs goal + Mon–Sun + week streak (3 learning days a week).
export const TodayCard = ({ learningTime, now = new Date(), className = '' }) => {
  const intl = useClassroomIntl();
  const t = (m, v) => intl.formatMessage(m, v);
  const {
    today_minutes: mins = 0, goal_minutes: goal = 15, week_days: days = [], week_streak: streak = {},
  } = learningTime;
  const today = bangkokDate(now);
  return (
    <section className={`cls3-card2 cls3-today ${className}`} aria-labelledby="cls3-today-title">
      <h2 id="cls3-today-title" className="cls-sr">{t(messages.v2Today)}</h2>
      <div className="cls3-goal">
        <GoalRing minutes={mins} goal={goal} label={t(messages.v2GoalAria, { n: mins, goal })} />
        <div>
          <h3>{t(messages.v2Goal)}</h3>
          <p>{mins >= goal ? t(messages.v2GoalDone) : t(messages.v2GoalLeft, { n: goal - mins })}</p>
        </div>
      </div>
      <div className="cls3-streak2">
        <div className="cls3-streak2__head">
          <b><KitIcon src={LocalFireDepartment} size={20} />{t(messages.v2WeekStreak, { n: streak.current || 0 })}</b>
          <span>{t(messages.v2ThisWeek)}</span>
        </div>
        <ul className="cls3-days">
          {days.map((d) => {
            const label = dayLabel(d.date, intl.locale);
            const on = (d.minutes || 0) > 0;
            const cls = [on && 'is-on', d.date === today && 'is-today'].filter(Boolean).join(' ');
            return (
              <li
                key={d.date}
                className={cls || undefined}
                aria-label={d.minutes == null ? label : t(messages.v2DayAria, { day: label, n: d.minutes })}
              >
                <i aria-hidden="true">{on && <KitIcon src={Check} size={16} />}</i>
                <span aria-hidden="true">{label}</span>
              </li>
            );
          })}
        </ul>
        <p>{t(messages.v2StreakHint, { n: streak.days_needed || 3 })}</p>
      </div>
    </section>
  );
};
export const learningTimeShape = PropTypes.shape({
  today_minutes: PropTypes.number,
  goal_minutes: PropTypes.number,
  week_days: PropTypes.arrayOf(PropTypes.shape({ date: PropTypes.string, minutes: PropTypes.number })),
  week_streak: PropTypes.shape({ current: PropTypes.number, best: PropTypes.number, days_needed: PropTypes.number }),
});
TodayCard.propTypes = {
  learningTime: learningTimeShape.isRequired,
  now: PropTypes.instanceOf(Date),
  className: PropTypes.string,
};

const TILE_ICON = {
  todo: ListIcon, progress: PlayArrow, done: Check, overdue: Warning,
};

const Tile = ({
  tone, count, pressed, onClick, index,
}) => {
  const intl = useClassroomIntl();
  const ref = useRef(null);
  const shown = useCountUp(count, ref);
  return (
    <li className="cls3-rise" style={{ '--i': index }}>
      <button
        ref={ref}
        type="button"
        className={`cls3-tile cls3-tone--${tone}${count ? ' has-items' : ''}`}
        aria-pressed={pressed}
        onClick={onClick}
      >
        <span className="cls3-tile__n" aria-hidden="true">{shown}</span>
        <span className="cls3-tile__l">
          <span className="cls-sr">{`${count} `}</span>
          {intl.formatMessage(TONE_LABEL[tone])}
        </span>
        <span className="cls3-tile__ic" aria-hidden="true"><KitIcon src={TILE_ICON[tone]} size={22} /></span>
      </button>
    </li>
  );
};
Tile.propTypes = {
  tone: PropTypes.oneOf(STATUS_TONES).isRequired,
  count: PropTypes.number.isRequired,
  pressed: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
};

// 4 status tiles; a tile is a filter (press again = all).
export const StatusTiles = ({ counts, value = 'all', onChange }) => {
  const intl = useClassroomIntl();
  return (
    <ul className="cls3-tiles" aria-label={intl.formatMessage(messages.v2Tiles)}>
      {STATUS_TONES.map((tone, i) => (
        <Tile
          key={tone}
          tone={tone}
          index={i}
          count={counts[tone] || 0}
          pressed={value === tone}
          onClick={() => onChange(value === tone ? 'all' : tone)}
        />
      ))}
    </ul>
  );
};
StatusTiles.propTypes = {
  counts: PropTypes.objectOf(PropTypes.number).isRequired,
  value: PropTypes.oneOf(['all', ...STATUS_TONES]),
  onChange: PropTypes.func.isRequired,
};

// "Pick up where you left off" — the course to continue now (overdue first, then in progress, then to do).
export const ResumeHero = ({
  title, href, progress = 0, tone, nextTitle, minutesLeft, daysLate,
}) => {
  const intl = useClassroomIntl();
  const Link = useLinkComponent();
  const t = (m, v) => intl.formatMessage(m, v);
  const started = progress > 0;
  return (
    <Link className="cls3-resume cls3-rise" href={href}>
      <div>
        <span className="cls3-resume__eyebrow">
          <KitIcon src={PlayArrow} size={18} />
          {t(started ? messages.v2PickUp : messages.v2UpNext)}
        </span>
        <h2>{title}</h2>
        {(nextTitle || daysLate > 0) && (
          <div className="cls3-resume__next">
            {nextTitle && <span>{nextTitle}</span>}
            {tone === 'overdue' && daysLate > 0 && (
              <span className="cls3-resume__late"><KitIcon src={Warning} size={16} />{t(messages.daysLate, { n: daysLate })}</span>
            )}
          </div>
        )}
      </div>
      <div className="cls3-resume__row">
        <div className="cls3-resume__prog">
          <div className="cls3-resume__bar" aria-hidden="true"><i style={{ width: `${progress}%` }} /></div>
          <div className="cls3-resume__meta">
            <span>{t(messages.v2PctDone, { pct: progress })}</span>
            {minutesLeft > 0 && <span>{t(messages.v2MinLeft, { n: minutesLeft })}</span>}
          </div>
        </div>
        <span className="cls3-resume__btn">
          {t(started ? messages.continue : messages.start)}
          <KitIcon src={ArrowForward} size={20} />
        </span>
      </div>
    </Link>
  );
};
ResumeHero.propTypes = {
  title: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
  progress: PropTypes.number,
  tone: PropTypes.oneOf(STATUS_TONES),
  nextTitle: PropTypes.string,
  minutesLeft: PropTypes.number,
  daysLate: PropTypes.number,
};

// CA-11 deadlines as date boxes (overdue box pings softly).
export const DateDeadlines = ({ items = [], limit = 5 }) => {
  const intl = useClassroomIntl();
  const Link = useLinkComponent();
  const t = (m, v) => intl.formatMessage(m, v);
  if (!items.length) { return <p className="cls-dempty">{t(messages.deadlinesEmpty)}</p>; }
  return (
    <ul className="cls3-dates">
      {[...items].sort((a, b) => (a.days_left ?? 0) - (b.days_left ?? 0)).slice(0, limit).map((d) => {
        const title = localized(d.title, intl.locale);
        const left = d.days_left ?? 0;
        const kind = (left < 0 && 'overdue') || (left === 0 && 'today') || '';
        const action = t(d.action === 'start' ? messages.start : messages.continue);
        return (
          <li key={`${d.assignment_id}-${d.course_key}`} className="cls3-dl">
            <span className={`cls3-date${kind ? ` cls3-date--${kind}` : ''}`} aria-hidden="true">
              <b>{formatDate(d.due_at, intl.locale, { month: undefined, year: undefined })}</b>
              <span>{formatDate(d.due_at, intl.locale, { day: undefined, year: undefined })}</span>
            </span>
            <div>
              <div className="cls3-dl__t">{title}</div>
              <div className={`cls3-dl__s${(left < 0 && ' is-late') || (left === 0 && ' is-today') || ''}`}>
                <span className="cls-sr">{`${formatDate(d.due_at, intl.locale)} · `}</span>
                {left < 0 ? t(messages.daysLate, { n: -left }) : t(messages.daysLeft, { n: left })}
              </div>
            </div>
            {d.href && (
              <Link className="cls-btn cls-btn--sm cls-btn--secondary" href={d.href} aria-label={t(messages.actionLabel, { action, title })}>
                {action}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
};
DateDeadlines.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({ due_at: PropTypes.string, days_left: PropTypes.number })),
  limit: PropTypes.number,
};

// CA-17 licence: CNEU credits have / need, renew by (D-94). Nothing for staff without a licence.
export const LicenceCard = ({ licence, className = '' }) => {
  const intl = useClassroomIntl();
  const t = (m, v) => intl.formatMessage(m, v);
  if (!licence) { return null; }
  const pct = licence.need > 0 ? Math.min(100, Math.round((licence.have / licence.need) * 100)) : 0;
  return (
    <section className={`cls3-card2 cls3-lic cls3-rise ${className}`} aria-labelledby="cls3-lic-title">
      <h2 id="cls3-lic-title" className="cls3-card2__title">{t(messages.v2Licence)}</h2>
      <p>{localized(licence.name, intl.locale)}</p>
      <div className="cls3-lic__big">
        <b>{licence.have}</b>
        <span>{`/ ${licence.need} ${t(messages.v2Credits)}`}</span>
      </div>
      <div
        className="cls-bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={t(messages.v2LicenceAria, { have: licence.have, need: licence.need })}
      >
        <i style={{ width: `${pct}%` }} />
      </div>
      <p>
        {t(messages.v2LicenceLine, {
          date: formatDate(licence.renew_by, intl.locale), n: Math.max(0, licence.need - licence.have),
        })}
      </p>
    </section>
  );
};
LicenceCard.propTypes = {
  licence: PropTypes.shape({
    name: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})]),
    have: PropTypes.number.isRequired,
    need: PropTypes.number.isRequired,
    renew_by: PropTypes.string,
  }),
  className: PropTypes.string,
};

// Mon–Sun minutes as bars (Progress page "This week").
export const WeekColumns = ({ days = [], now = new Date() }) => {
  const intl = useClassroomIntl();
  const today = bangkokDate(now);
  const max = Math.max(15, ...days.map((d) => d.minutes || 0));
  return (
    <ul className="cls3-week">
      {days.map((d) => {
        const label = dayLabel(d.date, intl.locale);
        const cls = [d.date === today && 'is-today', d.minutes == null && 'is-future'].filter(Boolean).join(' ');
        const aria = d.minutes == null ? label : intl.formatMessage(messages.v2DayAria, { day: label, n: d.minutes });
        return (
          <li key={d.date} className={cls || undefined} aria-label={aria}>
            <i aria-hidden="true" style={{ height: `${Math.max(4, ((d.minutes || 0) / max) * 90)}px` }} />
            <span aria-hidden="true">{label}</span>
          </li>
        );
      })}
    </ul>
  );
};
WeekColumns.propTypes = {
  days: PropTypes.arrayOf(PropTypes.shape({ date: PropTypes.string, minutes: PropTypes.number })),
  now: PropTypes.instanceOf(Date),
};
