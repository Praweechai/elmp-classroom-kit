import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Celebration, Close, LocalFireDepartment, PlayArrow, Quiz, Schedule, Warning,
} from '@openedx/paragon/icons';

import {
  TIME_ZONE, formatDate, kitLanguage, localized, messages, useClassroomIntl,
} from '../i18n';
import CourseCover from './CourseCover';
import KitIcon from './KitIcon';
import { useLinkComponent } from './LinkContext';

// Plan 4 home dashboard widgets (F-114, doc 04-design §4). Charts are plain SVG (NFR-D2) and
// always show their value as text (NFR-D3).

const clamp = (v) => Math.max(0, Math.min(100, Math.round(Number(v) || 0)));
const pctOf = (done, total) => (total > 0 ? clamp((done / total) * 100) : 0);

// Card frame used by every widget: title, optional sub line, optional action on the right.
export const DashCard = ({
  title, sub, action, className = '', children, as: Tag = 'section', titleId,
}) => (
  <Tag className={`cls-dcard ${className}`.trim()} aria-labelledby={titleId}>
    {(title || action) && (
      <div className="cls-dcard__head">
        <div>
          {title && <h2 id={titleId}>{title}</h2>}
          {sub && <p>{sub}</p>}
        </div>
        {action}
      </div>
    )}
    {children}
  </Tag>
);

DashCard.propTypes = {
  title: PropTypes.node,
  sub: PropTypes.node,
  action: PropTypes.node,
  className: PropTypes.string,
  children: PropTypes.node,
  as: PropTypes.elementType,
  titleId: PropTypes.string,
};

// "Required training done on time" semicircle, 220×130, stroke 18 (doc 04-design §4).
export const Gauge = ({ pct, label, title }) => {
  const intl = useClassroomIntl();
  const none = pct == null;
  const value = clamp(pct);
  const status = none ? intl.formatMessage(messages.gaugeNone)
    : intl.formatMessage(label === 'on_track' ? messages.gaugeOnTrack : messages.gaugeAttention);
  const heading = title || intl.formatMessage(messages.dashOverall);
  return (
    <div
      className={`cls-gauge cls-gauge--${none ? 'none' : label}`}
      role="img"
      aria-label={none ? `${heading}: ${status}` : intl.formatMessage(messages.gaugeAria, { title: heading, pct: value, status })}
    >
      <svg width="220" height="130" viewBox="0 0 220 130" aria-hidden="true" focusable="false">
        <path className="cls-gauge__track" d="M20 120a90 90 0 0 1 180 0" pathLength="100" />
        {!none && value > 0 && (
          <path
            className="cls-gauge__fill cls-draw"
            d="M20 120a90 90 0 0 1 180 0"
            pathLength="100"
            strokeDasharray={`${value} 100`}
            style={{ '--cls-dash': value }}
          />
        )}
      </svg>
      <div className="cls-gauge__value" aria-hidden="true">
        <b className="cls-num">{none ? '—' : `${value}%`}</b>
        <span>{status}</span>
      </div>
    </div>
  );
};

Gauge.propTypes = {
  pct: PropTypes.number,
  label: PropTypes.oneOf(['on_track', 'needs_attention']),
  title: PropTypes.string,
};

export const TONES = ['green', 'blue', 'gold', 'violet', 'pink', 'late'];

// 56 px ring, stroke 6, value inside; icon tile left, label right (doc 04-design §4).
export const StatRing = ({
  icon, tone = 'green', label, sub, value, pct,
}) => {
  const size = 56;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const fill = clamp(pct);
  const t = TONES.includes(tone) ? tone : 'green';
  return (
    <li className={`cls-stat cls-stat--${t}`}>
      {icon && <span className={`cls-tile cls-tile--${t}`}><KitIcon src={icon} size={22} /></span>}
      <span className="cls-stat__text">
        <b>{label}</b>
        {sub && <small>{sub}</small>}
        <span className="cls-sr">{value}</span>
      </span>
      <span className="cls-stat__ring" aria-hidden="true">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} focusable="false">
          <circle className="cls-stat__track" cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} />
          {fill > 0 && (
            <circle
              className="cls-stat__fill cls-draw"
              cx={size / 2}
              cy={size / 2}
              r={r}
              strokeWidth={stroke}
              strokeDasharray={c}
              strokeDashoffset={c * (1 - fill / 100)}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              style={{ '--cls-dash': c }}
            />
          )}
        </svg>
        <b className="cls-num">{value}</b>
      </span>
    </li>
  );
};

StatRing.propTypes = {
  icon: PropTypes.elementType,
  tone: PropTypes.oneOf(TONES),
  label: PropTypes.string.isRequired,
  sub: PropTypes.string,
  value: PropTypes.string.isRequired,
  pct: PropTypes.number,
};

export const StatGroup = ({
  title, sub, children, titleId,
}) => (
  <DashCard title={title} sub={sub} titleId={titleId} className="cls-dcard--stats">
    <ul className="cls-stats">{children}</ul>
  </DashCard>
);

StatGroup.propTypes = {
  title: PropTypes.string.isRequired, sub: PropTypes.string, children: PropTypes.node, titleId: PropTypes.string,
};

// Bangkok calendar day, used for "dismissed today" (doc 04-design §4: dismiss × per day).
export const bangkokDay = (now = new Date()) => new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
}).format(now);

const BANNER_KEY = 'elmp.banner.dismissed';
const readDismissed = () => {
  try { return window.localStorage.getItem(BANNER_KEY); } catch (e) { return null; }
};
const writeDismissed = (value) => {
  try { window.localStorage.setItem(BANNER_KEY, value); } catch (e) { /* private mode: dismiss for this visit only */ }
};

const BANNER = {
  overdue: [messages.bannerOverdue, Warning],
  due_soon: [messages.bannerDueSoon, Schedule],
  streak: [messages.bannerStreak, LocalFireDepartment],
  all_done: [messages.bannerAllDone, Celebration],
};
export const BANNER_KINDS = Object.keys(BANNER);

// One sentence chosen by state (CA-11 `banner`), tinted by kind; dismissed until tomorrow.
export const EncouragementBanner = ({
  banner, lead, now, onDismiss,
}) => {
  const intl = useClassroomIntl();
  const today = bangkokDay(now);
  const key = banner ? `${banner.kind}:${today}` : '';
  const [hidden, setHidden] = useState(() => readDismissed() === key);
  if (!banner || !BANNER[banner.kind] || hidden) { return null; }
  const [message, icon] = BANNER[banner.kind];
  const text = intl.formatMessage(message, { n: banner.n ?? 0, course: localized(banner.course, intl.locale) });
  return (
    <div className={`cls-banner cls-banner--${banner.kind}`} role="status">
      <KitIcon src={icon} size={22} className="cls-banner__icon" />
      <p>{lead && <b>{lead} </b>}{text}</p>
      <button
        type="button"
        className="cls-banner__x"
        aria-label={intl.formatMessage(messages.dismiss)}
        onClick={() => { writeDismissed(key); setHidden(true); onDismiss?.(); }}
      >
        <KitIcon src={Close} size={20} />
      </button>
    </div>
  );
};

EncouragementBanner.propTypes = {
  banner: PropTypes.shape({
    kind: PropTypes.oneOf(BANNER_KINDS).isRequired,
    n: PropTypes.number,
    course: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})]),
  }),
  lead: PropTypes.string,
  now: PropTypes.instanceOf(Date),
  onDismiss: PropTypes.func,
};

// red ≤ 2 days (or late), amber ≤ 7, calm otherwise (doc 04-design §4).
export const urgency = (daysLeft) => {
  if (daysLeft == null) { return 'calm'; }
  if (daysLeft <= 2) { return 'late'; }
  if (daysLeft <= 7) { return 'soon'; }
  return 'calm';
};

export const DeadlineList = ({ items = [] }) => {
  const intl = useClassroomIntl();
  const Link = useLinkComponent();
  if (!items.length) { return <p className="cls-dempty">{intl.formatMessage(messages.deadlinesEmpty)}</p>; }
  return (
    <ul className="cls-deadlines">
      {items.map((d) => {
        const title = localized(d.title, intl.locale);
        const roadmap = localized(d.roadmap, intl.locale);
        const level = urgency(d.days_left);
        const late = d.days_left < 0;
        const action = intl.formatMessage(d.action === 'start' ? messages.start : messages.continue);
        return (
          <li key={`${d.assignment_id}-${d.course_key}`} className={`cls-deadline cls-deadline--${level}`}>
            <CourseCover className="cls-deadline__thumb" category={d.category} code={d.code} imageUrl={d.image_url} />
            <div className="cls-deadline__text">
              <b>{title}</b>
              {roadmap && <span className="cls-rpill">{intl.formatMessage(messages.requiredPill, { roadmap })}</span>}
            </div>
            <span className="cls-datechip cls-num">{formatDate(d.due_at, intl.locale)}</span>
            <span className="cls-left">
              <i aria-hidden="true" />
              {late
                ? intl.formatMessage(messages.daysLate, { n: -d.days_left })
                : intl.formatMessage(messages.daysLeft, { n: d.days_left ?? 0 })}
            </span>
            {d.href && (
              <Link
                className={`cls-btn cls-btn--sm ${d.action === 'start' ? 'cls-btn--secondary' : 'cls-btn--primary'}`}
                href={d.href}
                aria-label={intl.formatMessage(messages.actionLabel, { action, title })}
              >
                {d.action !== 'start' && <KitIcon src={PlayArrow} size={18} />}
                {action}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
};

DeadlineList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    assignment_id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    course_key: PropTypes.string,
    code: PropTypes.string,
    category: PropTypes.string,
    image_url: PropTypes.string,
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})]).isRequired,
    roadmap: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})]),
    due_at: PropTypes.string,
    days_left: PropTypes.number,
    action: PropTypes.oneOf(['continue', 'start']),
    href: PropTypes.string,
  })),
};

// Short weekday names for the 7 days ending on `today` (Bangkok), oldest first.
export const weekdayLabels = (today = new Date(), locale = 'en') => {
  const fmt = new Intl.DateTimeFormat(kitLanguage(locale) === 'th' ? 'th-TH' : 'en-GB', { weekday: 'short', timeZone: TIME_ZONE });
  return [6, 5, 4, 3, 2, 1, 0].map((back) => fmt.format(new Date(today.getTime() - back * 86400000)));
};

// 7 flames, filled = learned that day; "4 days in a row" (D-70).
export const StreakWeek = ({
  days = [], current = 0, best, today,
}) => {
  const intl = useClassroomIntl();
  const labels = weekdayLabels(today, intl.locale);
  const week = labels.map((label, i) => ({ label, on: Boolean(days[i]) }));
  return (
    <div className="cls-streak">
      <ol className="cls-streak__week" aria-label={intl.formatMessage(messages.streakWeek)}>
        {week.map(({ label, on }, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <li key={i} className={on ? 'is-on' : undefined}>
            <KitIcon src={LocalFireDepartment} size={24} className="cls-streak__flame" />
            <span aria-hidden="true">{label}</span>
            <span className="cls-sr">{`${label}: ${intl.formatMessage(on ? messages.streakActive : messages.streakInactive)}`}</span>
          </li>
        ))}
      </ol>
      <p className="cls-streak__line"><b>{intl.formatMessage(messages.streakDays, { n: current })}</b></p>
      {best > 0 && <p className="cls-streak__best">{intl.formatMessage(messages.streakBest, { n: best })}</p>}
    </div>
  );
};

StreakWeek.propTypes = {
  days: PropTypes.arrayOf(PropTypes.bool),
  current: PropTypes.number,
  best: PropTypes.number,
  today: PropTypes.instanceOf(Date),
};

// Next graded parts not passed yet (CA-11 `next_quizzes`).
export const NextQuizList = ({ items = [] }) => {
  const intl = useClassroomIntl();
  const Link = useLinkComponent();
  if (!items.length) { return <p className="cls-dempty">{intl.formatMessage(messages.quizzesEmpty)}</p>; }
  return (
    <ul className="cls-quizzes">
      {items.map((q) => {
        const title = [localized(q.title, intl.locale), q.code].filter(Boolean).join(' · ');
        const start = intl.formatMessage(messages.start);
        return (
          <li key={q.block_id || title} className="cls-quiz">
            <span className="cls-tile cls-tile--violet"><KitIcon src={Quiz} size={22} /></span>
            <span className="cls-quiz__text">
              <b>{title}</b>
              {q.questions > 0 && (
                <small>
                  {intl.formatMessage(messages.quizMeta, { q: q.questions, m: q.minutes ?? q.questions * 2 })}
                </small>
              )}
            </span>
            {q.href && (
              <Link className="cls-btn cls-btn--secondary cls-btn--sm" href={q.href} aria-label={intl.formatMessage(messages.actionLabel, { action: start, title })}>
                {start}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
};

NextQuizList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    block_id: PropTypes.string,
    course_key: PropTypes.string,
    code: PropTypes.string,
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})]).isRequired,
    questions: PropTypes.number,
    minutes: PropTypes.number,
    href: PropTypes.string,
  })),
};

export { pctOf };
