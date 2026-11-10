import PropTypes from 'prop-types';
import { AccessTime, CheckCircle, PlayCircle } from '@openedx/paragon/icons';

import {
  formatDate, formatHours, localized, messages, useClassroomIntl,
} from '../i18n';
import {
  DashCard, DeadlineList, StatRing, StreakWeek, pctOf,
} from '../components/Dashboard';
import { Notice, Skeleton } from '../components/Feedback';
import { useLinkComponent } from '../components/LinkContext';
import PageStrip from '../components/PageStrip';
import { ProgressBar } from '../components/Progress';

// S-103 Progress (F-134): page strip, three stat cards (completed, in progress, hours), overall completion
// donut + hours-per-week bars (8 weeks), course progress list, required training deadlines.
// Part 1 = CA-11 only: the weekly bars need CA-16, so the 7-day streak takes their place until then.

const ACTIVE = ['in_progress', 'almost', 'overdue', 'due_soon'];
const R = 54;
const C = 2 * Math.PI * R;

const coursePct = (c) => (c.status === 'completed' ? 100 : Math.round(pctOf(c.units_done, c.units_total)));

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

const ProgressView = ({
  dashboard, grades, status = 'ready', now, hoursGoal, onRetry, features = {},
}) => {
  const intl = useClassroomIntl();
  const Link = useLinkComponent();
  const t = (m, v) => intl.formatMessage(m, v);
  const strip = (
    <PageStrip id="cls3-progress-strip" title={t(messages.shell3Progress)}>{t(messages.pageProgressIntro)}</PageStrip>
  );
  if (status === 'loading') {
    return (
      <div className="cls3-page" aria-busy="true">
        {strip}
        <div className="cls3-stats cls3-stats--3">{[0, 1, 2].map((i) => <Skeleton key={i} height={88} radius={16} />)}</div>
        <div className="cls3-even">{[0, 1].map((i) => <Skeleton key={i} height={240} radius={16} />)}</div>
      </div>
    );
  }
  if (status === 'error') {
    return <div className="cls3-page">{strip}<Notice onRetry={onRetry}>{t(messages.notAvailable)}</Notice></div>;
  }

  const d = dashboard || {};
  const courses = d.courses || [];
  const rings = d.rings || {};
  const enrolled = rings.enrolled ?? courses.length;
  const done = rings.completed ?? courses.filter((c) => c.status === 'completed').length;
  const active = courses.filter((c) => ACTIVE.includes(c.status)).length;
  const hours = rings.hours_learned;
  const scale = hoursGoal || 10;
  const overall = courses.length ? Math.round(courses.reduce((s, c) => s + coursePct(c), 0) / courses.length) : 0;
  const unitsDone = courses.reduce((s, c) => s + (c.units_done || 0), 0);
  const unitsTotal = courses.reduce((s, c) => s + (c.units_total || 0), 0);
  const weeks = grades?.weekly_minutes;
  const summary = grades?.summary;

  return (
    <div className="cls3-page">
      {strip}
      <ul className="cls3-stats cls3-stats--3">
        <StatRing icon={CheckCircle} tone="green" label={t(messages.prCompleted)} value={`${done}/${enrolled}`} pct={pctOf(done, enrolled)} />
        <StatRing icon={PlayCircle} tone="blue" label={t(messages.statusInProgress)} value={`${active}/${enrolled}`} pct={pctOf(active, enrolled)} />
        <StatRing
          icon={AccessTime}
          tone="gold"
          label={t(messages.prHours)}
          sub={hoursGoal ? t(messages.prHoursGoal, { hours: formatHours(hoursGoal, intl.locale) }) : undefined}
          value={hours == null ? '—' : t(messages.hoursShort, { hours: formatHours(hours, intl.locale) })}
          pct={hours ? Math.min(100, (hours / scale) * 100) : 0}
        />
      </ul>

      <div className="cls3-even">
        <DashCard title={t(messages.prOverall)} titleId="cls3-pr-overall" className="cls3-center">
          <Donut pct={overall} label={t(messages.prOverallAria, { pct: overall })} />
          {unitsTotal > 0 && <p className="cls3-note">{t(messages.unitsOf, { done: unitsDone, total: unitsTotal })}</p>}
        </DashCard>
        {weeks && weeks.length > 0 ? (
          <DashCard
            title={t(messages.prWeekly)}
            sub={t(messages.prWeeklySub)}
            titleId="cls3-pr-weekly"
          >
            <WeekBars weeks={weeks} />
            {summary && (
              <p className="cls3-note">
                {t(messages.prThisWeek, {
                  hours: formatHours((summary.minutes_week || 0) / 60, intl.locale), n: summary.days_active_month || 0,
                })}
              </p>
            )}
          </DashCard>
        ) : (features.streak !== false && d.streak && (
          <DashCard title={t(messages.dashStreak)} titleId="cls3-pr-streak">
            <StreakWeek days={d.streak.days} current={d.streak.current} best={d.streak.best} today={now} />
          </DashCard>
        ))}
      </div>

      <div className="cls3-two">
        <DashCard title={t(messages.prCourses)} titleId="cls3-pr-courses">
          {courses.length === 0 ? <p className="cls-dempty">{t(messages.coursesEmpty)}</p> : (
            <ul className="cls3-plist">
              {courses.map((c) => {
                const title = localized(c.title, intl.locale);
                const p = coursePct(c);
                return (
                  <li key={c.course_key}>
                    <div className="cls3-plist__name">
                      <Link href={c.href}>{title}</Link>
                      <small>{t(messages.unitsOf, { done: c.units_done ?? 0, total: c.units_total ?? 0 })}</small>
                    </div>
                    <ProgressBar value={p} label={title} />
                    <b className="cls-num">{`${p}%`}</b>
                  </li>
                );
              })}
            </ul>
          )}
        </DashCard>
        <aside className="cls3-side-col">
          <DashCard title={t(messages.dashDeadlines)} titleId="cls3-pr-dl">
            <DeadlineList items={d.deadlines} />
          </DashCard>
        </aside>
      </div>
    </div>
  );
};

ProgressView.propTypes = {
  dashboard: PropTypes.shape({ // CA-11
    rings: PropTypes.shape({}),
    courses: PropTypes.arrayOf(PropTypes.shape({})),
    deadlines: PropTypes.arrayOf(PropTypes.shape({})),
    streak: PropTypes.shape({
      days: PropTypes.arrayOf(PropTypes.bool), current: PropTypes.number, best: PropTypes.number,
    }),
  }),
  grades: PropTypes.shape({ // CA-16 (Part 2): weekly bars + this-week line
    summary: PropTypes.shape({ minutes_week: PropTypes.number, days_active_month: PropTypes.number }),
    weekly_minutes: PropTypes.arrayOf(PropTypes.shape({})),
  }),
  status: PropTypes.oneOf(['loading', 'ready', 'error']),
  now: PropTypes.instanceOf(Date),
  hoursGoal: PropTypes.number,
  onRetry: PropTypes.func,
  features: PropTypes.shape({ streak: PropTypes.bool }),
};

export default ProgressView;
