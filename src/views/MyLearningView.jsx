import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  AccessTime, Bedtime, Bolt, CheckCircle, GridView, Lock, Quiz, Shield, Star, ViewList,
} from '@openedx/paragon/icons';

import {
  formatDate, formatHours, localized, messages, useClassroomIntl,
} from '../i18n';
import CourseCard2, { categoryLabel } from '../components/CourseCard2';
import {
  DashCard, DeadlineList, NextQuizList, StatRing, StreakWeek, pctOf,
} from '../components/Dashboard';
import { Notice, Skeleton } from '../components/Feedback';
import KitIcon from '../components/KitIcon';
import { useLinkComponent } from '../components/LinkContext';

// S-100 My Learning (Plan 5, D-73/D-78): NetAcad arrangement — welcome strip, stat rings (old dashboard),
// "In progress" cards with sort / grid-list / category filter; right column = deadlines, latest achievements,
// next quizzes, streak. Pure view: the dashboard fork passes CA-11 (`dashboard`), and in Part 2 CA-15
// (`catalogue`, adds covers/hours/last active) and CA-13 (`achievements`). Missing Part 2 data = hidden.

const HOURS_RING_SCALE = 10;
const IN_PROGRESS = ['in_progress', 'almost', 'overdue', 'due_soon'];
const SORTS = {
  recent: messages.mlSortRecent,
  due: messages.mlSortDue,
  progress: messages.mlSortProgress,
  title: messages.mlSortTitle,
};
const BADGE = {
  first_steps: Star, quiz_streak: Bolt, course_complete: CheckCircle, night_owl: Bedtime,
};
const pair = (v) => (Array.isArray(v) ? v : [0, 0]);

// CA-11 course (+ CA-11 deadline, + CA-15 entry when Part 2 is on) → CourseCard2 props.
export const toCard = (course, { deadline, entry, locale }) => {
  const progress = entry?.progress_pct ?? pctOf(course.units_done, course.units_total);
  let status = course.status === 'passed' ? 'completed' : course.status;
  const soon = deadline && deadline.days_left >= 0 && deadline.days_left <= 7;
  if (soon && status === 'in_progress') { status = 'due_soon'; }
  return {
    code: course.code,
    title: localized(course.title, locale),
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
  };
};

const sorters = {
  recent: (a, b) => (b.lastActivityAt || '').localeCompare(a.lastActivityAt || ''),
  due: (a, b) => (a.dueAt || '9999').localeCompare(b.dueAt || '9999'),
  progress: (a, b) => b.progress - a.progress,
  title: (a, b) => a.title.localeCompare(b.title),
};

export const AchievementList = ({ items, limit = 3, allHref }) => {
  const intl = useClassroomIntl();
  const Link = useLinkComponent();
  const earned = items.filter((a) => a.earned_at).sort((a, b) => b.earned_at.localeCompare(a.earned_at));
  const locked = items.filter((a) => !a.earned_at);
  const shown = [...earned, ...locked].slice(0, limit);
  return (
    <>
      <ul className="cls3-ach">
        {shown.map((a) => (
          <li key={a.code} className={a.earned_at ? '' : 'cls3-ach--locked'}>
            <span className="cls3-ach__badge" aria-hidden="true">
              <KitIcon src={a.earned_at ? (BADGE[a.code] || Star) : Lock} size={20} />
            </span>
            <div>
              <b>{localized(a.title, intl.locale)}</b>
              <p>{localized(a.text, intl.locale)}</p>
              <small>
                {a.earned_at
                  ? formatDate(a.earned_at, intl.locale)
                  : a.progress && intl.formatMessage(
                    messages.mlAchievementProgress,
                    { n: a.progress[0], max: a.progress[1] },
                  )}
              </small>
            </div>
          </li>
        ))}
      </ul>
      {allHref && <Link className="cls3-link" href={allHref}>{intl.formatMessage(messages.mlAchievementsAll)}</Link>}
    </>
  );
};

AchievementList.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    code: PropTypes.string.isRequired, earned_at: PropTypes.string,
  })).isRequired,
  limit: PropTypes.number,
  allHref: PropTypes.string,
};

export const MyLearningSkeleton = () => (
  <div className="cls3-ml" aria-busy="true">
    <Skeleton width="50%" height={30} />
    <div className="cls3-stats">
      {[0, 1, 2, 3].map((i) => <Skeleton key={i} height={88} radius={16} />)}
    </div>
    <div className="cls3-two">
      <div className="cls3-cards cls3-cards--grid">{[0, 1].map((i) => <Skeleton key={i} height={320} radius={16} />)}</div>
      <Skeleton height={420} radius={16} />
    </div>
  </div>
);

const MyLearningView = ({
  dashboard, catalogue, achievements, status = 'ready', firstName, now, features = {}, onRetry, achievementsHref,
}) => {
  const intl = useClassroomIntl();
  const t = (m, v) => intl.formatMessage(m, v);
  const [sort, setSort] = useState('recent');
  const [layout, setLayout] = useState('grid');
  const [filter, setFilter] = useState('all');
  const d = dashboard || {};

  const cards = useMemo(() => {
    const deadlines = d.deadlines || [];
    const entries = Object.fromEntries((catalogue || []).map((e) => [e.course_key, e]));
    return (d.courses || []).map((c) => toCard(c, {
      deadline: deadlines.find((x) => x.course_key === c.course_key),
      entry: entries[c.course_key],
      locale: intl.locale,
    }));
  }, [d.courses, d.deadlines, catalogue, intl.locale]);

  if (status === 'loading') { return <MyLearningSkeleton />; }
  const down = status === 'error';

  const active = cards.filter((c) => IN_PROGRESS.includes(c.status));
  const catOf = (c) => (typeof c.category === 'object' ? c.category?.key : c.category) || 'general';
  const categories = [...new Map(active.map((c) => [catOf(c), categoryLabel(c.category, intl)])).entries()];
  const shown = active.filter((c) => filter === 'all' || catOf(c) === filter).sort(sorters[sort]);

  const rings = d.rings || {};
  const [reqDone, reqTotal] = pair(rings.required_done);
  const [quizDone, quizTotal] = pair(rings.quizzes_passed);
  const hours = rings.hours_learned;
  const dash = down ? '—' : null;

  return (
    <div className="cls3-ml">
      <section className="cls3-hero" aria-label={t(messages.shell3MyLearning)}>
        <p>{firstName ? t(messages.mlWelcome, { name: firstName, n: active.length }) : null}</p>
      </section>
      {down && <Notice onRetry={onRetry}>{t(messages.notAvailable)}</Notice>}

      <ul className="cls3-stats">
        <StatRing
          icon={Shield}
          tone={d.gauge?.label === 'needs_attention' ? 'late' : 'green'}
          label={t(messages.statRequiredDone)}
          value={dash || `${reqDone}/${reqTotal}`}
          pct={pctOf(reqDone, reqTotal)}
        />
        <StatRing
          icon={Quiz}
          tone="violet"
          label={t(messages.statQuizzes)}
          value={dash || `${quizDone}/${quizTotal}`}
          pct={pctOf(quizDone, quizTotal)}
        />
        <StatRing
          icon={CheckCircle}
          tone="blue"
          label={t(messages.statCompleted)}
          value={dash || `${rings.completed ?? 0}/${rings.enrolled ?? 0}`}
          pct={pctOf(rings.completed, rings.enrolled)}
        />
        <StatRing
          icon={AccessTime}
          tone="pink"
          label={t(messages.statHoursLearned)}
          value={dash || (hours == null ? '—' : t(messages.hoursShort, { hours: formatHours(hours, intl.locale) }))}
          pct={hours ? Math.min(100, (hours / HOURS_RING_SCALE) * 100) : 0}
        />
      </ul>

      <div className="cls3-two">
        <section className="cls3-main" aria-labelledby="cls3-inprog">
          <div className="cls3-head">
            <h2 id="cls3-inprog">{t(messages.mlInProgress)}</h2>
            <div className="cls3-controls">
              <label className="cls3-select" htmlFor="cls3-sort">
                <span className="cls-sr">{t(messages.mlSort)}</span>
                <select id="cls3-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
                  {Object.entries(SORTS).map(([k, m]) => <option key={k} value={k}>{t(m)}</option>)}
                </select>
              </label>
              <div className="cls3-toggle" role="group" aria-label={t(messages.mlView)}>
                {[['grid', GridView, messages.mlGrid], ['list', ViewList, messages.mlList]].map(([k, icon, m]) => (
                  <button key={k} type="button" aria-pressed={layout === k} aria-label={t(m)} onClick={() => setLayout(k)}>
                    <KitIcon src={icon} size={18} />
                  </button>
                ))}
              </div>
            </div>
          </div>
          {categories.length > 1 && (
            <div className="cls3-pills" role="group" aria-label={t(messages.mlFilters)}>
              {[['all', t(messages.mlAll)], ...categories].map(([k, label]) => (
                <button key={k} type="button" className="cls3-pill" aria-pressed={filter === k} onClick={() => setFilter(k)}>
                  {label}
                </button>
              ))}
            </div>
          )}
          {!down && shown.length === 0 && <p className="cls3-empty">{t(messages.mlEmpty)}</p>}
          {shown.length > 0 && (
            <div className={`cls3-cards cls3-cards--${layout}`}>
              {shown.map((c) => <CourseCard2 key={c.href || c.code} {...c} layout={layout} now={now} />)}
            </div>
          )}
        </section>

        <aside className="cls3-side-col">
          <DashCard title={t(messages.dashDeadlines)} titleId="cls3-dl">
            {down ? <p className="cls-dempty">{t(messages.notAvailable)}</p> : <DeadlineList items={d.deadlines} />}
          </DashCard>
          {achievements && achievements.length > 0 && (
            <DashCard title={t(messages.mlAchievements)} titleId="cls3-ach">
              <AchievementList items={achievements} allHref={achievementsHref} />
            </DashCard>
          )}
          <DashCard title={t(messages.dashQuizzes)} titleId="cls3-quiz">
            {down ? <p className="cls-dempty">{t(messages.notAvailable)}</p> : <NextQuizList items={d.next_quizzes} />}
          </DashCard>
          {features.streak !== false && !down && d.streak && (
            <DashCard title={t(messages.dashStreak)} titleId="cls3-streak">
              <StreakWeek days={d.streak.days} current={d.streak.current} best={d.streak.best} today={now} />
            </DashCard>
          )}
        </aside>
      </div>
    </div>
  );
};

MyLearningView.propTypes = {
  dashboard: PropTypes.shape({
    gauge: PropTypes.shape({ label: PropTypes.string }),
    rings: PropTypes.shape({}),
    deadlines: PropTypes.arrayOf(PropTypes.shape({})),
    streak: PropTypes.shape({
      days: PropTypes.arrayOf(PropTypes.bool), current: PropTypes.number, best: PropTypes.number,
    }),
    courses: PropTypes.arrayOf(PropTypes.shape({})),
    next_quizzes: PropTypes.arrayOf(PropTypes.shape({})),
  }),
  catalogue: PropTypes.arrayOf(PropTypes.shape({ course_key: PropTypes.string })), // CA-15 data (Part 2)
  achievements: PropTypes.arrayOf(PropTypes.shape({ code: PropTypes.string })), // CA-13 data (Part 2)
  status: PropTypes.oneOf(['loading', 'ready', 'error']),
  firstName: PropTypes.string,
  now: PropTypes.instanceOf(Date),
  features: PropTypes.shape({ streak: PropTypes.bool }),
  onRetry: PropTypes.func,
  achievementsHref: PropTypes.string,
};

export default MyLearningView;
