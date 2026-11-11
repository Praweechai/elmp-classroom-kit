import PropTypes from 'prop-types';
import {
  AssignmentInd, Check, PlayArrow, Schedule, Shield, VerifiedUser, Warning,
} from '@openedx/paragon/icons';

import {
  formatDate, formatHours, localized, messages, useClassroomIntl,
} from '../i18n';
import { Notice, Skeleton } from '../components/Feedback';
import KitIcon from '../components/KitIcon';
import {
  LicenceCard, WeekColumns, learningTimeShape, usePageEnter,
} from '../components/Learner21';
import { useLinkComponent } from '../components/LinkContext';
import PageStrip from '../components/PageStrip';

// S-103 Progress 2.1 — "Am I up to date?" (Learner v2, doc 10 V-1.03, D-94): status line, requirement groups
// (Everyone / For my job) with one row per requirement, licence CNEU card, this week's minutes.
// Data: CA-17 `compliance` (groups + licence). Before CA-17 is switched on the page builds one "Required training"
// group from CA-11 required courses. Week bars: CA-11 `learning_time` (Mon–Sun), else CA-16 8 weeks.

const R = 54;
const C = 2 * Math.PI * R;

// Kept for other screens and the Plan 5 stories (kit 2.0 API).
export const Donut = ({ pct, label }) => (
  <svg className="cls3-donut" width="140" height="140" viewBox="0 0 140 140" role="img" aria-label={label}>
    <circle cx="70" cy="70" r={R} fill="none" className="cls3-donut__track" strokeWidth="14" />
    {pct > 0 && (
      <circle
        cx="70"
        cy="70"
        r={R}
        fill="none"
        className="cls3-donut__fill"
        strokeWidth="14"
        strokeDasharray={`${(C * pct) / 100} ${C}`}
        strokeLinecap="round"
        transform="rotate(-90 70 70)"
      />
    )}
    <text x="70" y="78" textAnchor="middle" className="cls3-donut__num">{`${pct}%`}</text>
  </svg>
);
Donut.propTypes = { pct: PropTypes.number.isRequired, label: PropTypes.string.isRequired };

// Weekly minutes (CA-16, oldest first) as bars. Each bar has its own screen-reader line.
export const WeekBars = ({ weeks }) => {
  const intl = useClassroomIntl();
  const max = Math.max(60, ...weeks.map((w) => w.minutes));
  return (
    <ul className="cls3-bars">
      {weeks.map((w) => {
        const hours = formatHours(w.minutes / 60, intl.locale);
        const date = formatDate(w.week_start, intl.locale, { year: undefined });
        return (
          <li key={w.week_start}>
            <span className="cls3-bars__val" aria-hidden="true">{w.minutes ? hours : ''}</span>
            <span className="cls3-bars__col" aria-hidden="true">
              <i style={{ height: `${(w.minutes / max) * 100}%` }} />
            </span>
            <span className="cls3-bars__lbl" aria-hidden="true">{date}</span>
            <span className="cls-sr">{intl.formatMessage(messages.prWeekBar, { date, hours })}</span>
          </li>
        );
      })}
    </ul>
  );
};
WeekBars.propTypes = {
  weeks: PropTypes.arrayOf(PropTypes.shape({ week_start: PropTypes.string, minutes: PropTypes.number })).isRequired,
};

const STATE = {
  ok: [Check, messages.v2StateOk],
  soon: [Schedule, messages.v2StateSoon],
  due: [Schedule, messages.v2StateDue],
  overdue: [Warning, messages.v2StateOverdue],
  in_progress: [PlayArrow, messages.v2StateInProgress],
};
const NEEDS_ACTION = ['overdue', 'due', 'soon'];

// Before CA-17: CA-11 required courses → one group.
export const fallbackGroups = (dashboard) => {
  const d = dashboard || {};
  const due = Object.fromEntries((d.deadlines || []).map((x) => [x.course_key, x.due_at]));
  const items = (d.courses || []).filter((c) => c.required).map((c) => {
    const state = ({
      completed: 'ok', passed: 'ok', overdue: 'overdue', not_started: 'due',
    })[c.status] || 'in_progress';
    return {
      name: c.title, course_key: c.course_key, every_months: undefined, state, date: due[c.course_key] || null,
    };
  });
  return items.length ? [{ key: 'required', items }] : [];
};

const GROUP = {
  everyone: [Shield, messages.v2GroupEveryone],
  job: [AssignmentInd, messages.v2GroupJob],
  required: [Shield, messages.v2GroupRequired],
};

const ReqRow = ({ item, course }) => {
  const intl = useClassroomIntl();
  const Link = useLinkComponent();
  const t = (m, v) => intl.formatMessage(m, v);
  const [icon, stateLabel] = STATE[item.state] || STATE.due;
  const name = localized(item.name, intl.locale);
  const date = item.date ? formatDate(item.date, intl.locale) : null;
  let when = null;
  if (item.state === 'ok') {
    when = date && <b>{t(messages.v2ValidUntil, { date })}</b>;
  } else if (item.state === 'soon') {
    when = date && <b className="is-soon">{t(messages.v2RenewBy, { date })}</b>;
  } else if (item.state === 'overdue') {
    when = date && <b className="is-late">{t(messages.cardDue, { date })}</b>;
  } else if (date) {
    when = <b>{t(messages.cardDue, { date })}</b>;
  }
  let action = messages.start;
  if (item.state === 'ok') { action = messages.review; } else if (item.state === 'soon') {
    action = messages.v2Renew;
  } else if (item.state === 'in_progress' || ['in_progress', 'almost', 'due_soon', 'overdue'].includes(course?.status)) {
    action = messages.continue;
  }
  let every = null;
  if (item.every_months) { every = t(messages.v2Every, { n: item.every_months }); }
  if (item.every_months === null) { every = t(messages.v2Once); }
  const courseTitle = course ? localized(course.title, intl.locale) : null;
  const sub = [course?.code, courseTitle !== name ? courseTitle : null, every].filter(Boolean).join(' · ');
  const href = course?.resume_href || course?.href;
  return (
    <li className="cls3-req">
      <span className={`cls3-req__st cls3-req__st--${item.state === 'in_progress' ? 'progress' : item.state}`}>
        <KitIcon src={icon} size={16} />
        <span className="cls-sr">{t(stateLabel)}</span>
      </span>
      <div>
        <div className="cls3-req__name">{name}</div>
        {sub && <div className="cls3-req__sub">{sub}</div>}
      </div>
      <div className="cls3-req__when">{when}</div>
      {href ? (
        <Link
          className={`cls-btn cls-btn--sm ${NEEDS_ACTION.includes(item.state) ? 'cls-btn--primary' : 'cls-btn--secondary'}`}
          href={href}
          aria-label={t(messages.actionLabel, { action: t(action), title: name })}
        >
          {t(action)}
        </Link>
      ) : <span />}
    </li>
  );
};
ReqRow.propTypes = {
  item: PropTypes.shape({
    name: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})]),
    course_key: PropTypes.string,
    every_months: PropTypes.number,
    state: PropTypes.string,
    date: PropTypes.string,
  }).isRequired,
  course: PropTypes.shape({
    code: PropTypes.string,
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})]),
    status: PropTypes.string,
    href: PropTypes.string,
    resume_href: PropTypes.string,
  }),
};

const ProgressView = ({
  dashboard, grades, compliance, status = 'ready', now, onRetry, features = {}, jobTitle,
}) => {
  const intl = useClassroomIntl();
  const t = (m, v) => intl.formatMessage(m, v);
  const pageRef = usePageEnter([status]);
  const intro = <PageStrip id="cls3-progress-strip" title={t(messages.v2UpToDate)}>{t(messages.v2ProgSub)}</PageStrip>;
  if (status === 'loading') {
    return (
      <div className="cls3-v2" aria-busy="true">
        {intro}
        <Skeleton height={84} radius={16} />
        <div className="cls3-prog2"><Skeleton height={360} radius={16} /><Skeleton height={240} radius={16} /></div>
      </div>
    );
  }
  if (status === 'error') {
    return <div className="cls3-v2">{intro}<Notice onRetry={onRetry}>{t(messages.notAvailable)}</Notice></div>;
  }

  const d = dashboard || {};
  const courses = Object.fromEntries((d.courses || []).map((c) => [c.course_key, c]));
  const groups = (features.compliance !== false && compliance?.groups) || fallbackGroups(d);
  const all = groups.flatMap((g) => g.items);
  const need = all.filter((i) => NEEDS_ACTION.includes(i.state)).length;
  const week = features.streak !== false ? d.learning_time?.week_days : null;
  const weeks = grades?.weekly_minutes;
  const weekTotal = (week || []).reduce((s, x) => s + (x.minutes || 0), 0);

  return (
    <div className="cls3-v2" ref={pageRef}>
      {intro}
      <section className={`cls3-statusbar cls3-rise${need ? ' cls3-statusbar--warn' : ''}`} role="status">
        <span className="cls3-statusbar__ic" aria-hidden="true"><KitIcon src={need ? Warning : VerifiedUser} size={26} /></span>
        <div>
          <h2>{need ? t(messages.v2ActionN, { n: need }) : t(messages.v2AllGood)}</h2>
          {need > 0 && <p>{t(messages.v2ActionHint)}</p>}
        </div>
      </section>

      <div className="cls3-prog2">
        <div>
          {groups.length === 0 && <p className="cls3-empty">{t(messages.coursesEmpty)}</p>}
          {groups.map((g) => {
            const [icon, label] = GROUP[g.key] || GROUP.required;
            const ok = g.items.filter((i) => i.state === 'ok').length;
            return (
              <section key={g.key} className="cls3-card2 cls3-group cls3-rise" aria-labelledby={`cls3-grp-${g.key}`}>
                <div className="cls3-group__head">
                  <h2 id={`cls3-grp-${g.key}`}>
                    <span className="cls3-group__ic" aria-hidden="true"><KitIcon src={icon} size={20} /></span>
                    {t(label)}
                    {g.key === 'job' && jobTitle ? ` · ${jobTitle}` : ''}
                  </h2>
                  <span className="cls3-group__count">{t(messages.v2GroupCount, { ok, n: g.items.length })}</span>
                </div>
                <ul>
                  {g.items.map((i) => <ReqRow key={`${g.key}-${i.course_key}`} item={i} course={courses[i.course_key]} />)}
                </ul>
              </section>
            );
          })}
        </div>
        <aside>
          <LicenceCard licence={features.compliance !== false ? compliance?.licence : null} />
          {week && week.length > 0 && (
            <section className="cls3-card2 cls3-side2 cls3-rise" aria-labelledby="cls3-pr-week">
              <h2 id="cls3-pr-week" className="cls3-card2__title">{t(messages.v2ThisWeek)}</h2>
              <p className="cls3-note">{t(messages.v2Minutes, { n: weekTotal })}</p>
              <WeekColumns days={week} now={now} />
            </section>
          )}
          {(!week || week.length === 0) && weeks && weeks.length > 0 && (
            <section className="cls3-card2 cls3-side2 cls3-rise" aria-labelledby="cls3-pr-weekly">
              <h2 id="cls3-pr-weekly" className="cls3-card2__title">{t(messages.prWeekly)}</h2>
              <WeekBars weeks={weeks} />
            </section>
          )}
        </aside>
      </div>
    </div>
  );
};

ProgressView.propTypes = {
  dashboard: PropTypes.shape({ // CA-11
    courses: PropTypes.arrayOf(PropTypes.shape({})),
    deadlines: PropTypes.arrayOf(PropTypes.shape({})),
    learning_time: learningTimeShape,
  }),
  grades: PropTypes.shape({ // CA-16: 8-week bars when CA-11 learning_time is not there
    weekly_minutes: PropTypes.arrayOf(PropTypes.shape({})),
  }),
  compliance: PropTypes.shape({ // CA-17 (D-94)
    groups: PropTypes.arrayOf(PropTypes.shape({
      key: PropTypes.string, items: PropTypes.arrayOf(PropTypes.shape({})),
    })),
    licence: LicenceCard.propTypes.licence,
  }),
  status: PropTypes.oneOf(['loading', 'ready', 'error']),
  now: PropTypes.instanceOf(Date),
  onRetry: PropTypes.func,
  features: PropTypes.shape({ streak: PropTypes.bool, compliance: PropTypes.bool }),
  jobTitle: PropTypes.string, // shown after "For my job", e.g. "Registered Nurse · ICU"
};

export default ProgressView;
