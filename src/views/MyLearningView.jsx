import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Bedtime, Bolt, CheckCircle, Close, GridView, Lock, Star, ViewList, Warning,
} from '@openedx/paragon/icons';

import {
  formatDate, greetingKey, localized, messages, useClassroomIntl,
} from '../i18n';
import CourseCard2 from '../components/CourseCard2';
import {
  DashCard, NextQuizList, StreakWeek, pctOf,
} from '../components/Dashboard';
import { Notice, Skeleton } from '../components/Feedback';
import KitIcon from '../components/KitIcon';
import {
  DateDeadlines, LicenceCard, ResumeHero, STATUS_TONES, StatusTiles, TONE_LABEL, TodayCard, learningTimeShape,
  statusTone, usePageEnter,
} from '../components/Learner21';
import { useLinkComponent } from '../components/LinkContext';

// S-100 My Learning 2.1 (Learner v2, doc 10 V-1.02, D-86/D-92/D-93): greeting + overdue alert, "Pick up where
// you left off" hero, Today card (daily goal + week streak, CA-11 `learning_time`), 4 status tiles that filter the
// cards (To do / In progress / Completed / Overdue), course cards (sort, grid/list), side column: deadlines,
// licence (CA-17), achievements (CA-13), next quizzes. Pure view: the dashboard fork passes the data.
// Missing data = that part hidden (Part 1 has no `learning_time` / compliance yet → the old streak card shows).

const SORTS = {
  due: messages.mlSortDue,
  recent: messages.mlSortRecent,
  progress: messages.mlSortProgress,
  title: messages.mlSortTitle,
};
const BADGE = {
  first_steps: Star, quiz_streak: Bolt, course_complete: CheckCircle, night_owl: Bedtime,
};

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
    daysLeft: deadline?.days_left,
    nextTitle: localized(course.next_title, locale) || undefined,
  };
};

const sorters = {
  recent: (a, b) => (b.lastActivityAt || '').localeCompare(a.lastActivityAt || ''),
  due: (a, b) => (a.dueAt || '9999').localeCompare(b.dueAt || '9999'),
  progress: (a, b) => b.progress - a.progress,
  title: (a, b) => a.title.localeCompare(b.title),
};

// The course to continue now: overdue first (most late), then in progress (most recent), then to do (soonest due).
export const pickResume = (cards) => {
  const by = (tone) => cards.filter((c) => statusTone(c.status) === tone);
  return by('overdue').sort(sorters.due)[0]
    || by('progress').sort(sorters.recent)[0]
    || by('todo').sort(sorters.due)[0]
    || null;
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
  <div className="cls3-v2" aria-busy="true">
    <Skeleton width="40%" height={34} />
    <div className="cls3-top2">
      <Skeleton height={236} radius={24} />
      <Skeleton height={236} radius={16} />
    </div>
    <div className="cls3-tiles">{[0, 1, 2, 3].map((i) => <Skeleton key={i} height={84} radius={16} />)}</div>
    <div className="cls3-home2">
      <div className="cls3-cards cls3-cards--grid">{[0, 1].map((i) => <Skeleton key={i} height={320} radius={16} />)}</div>
      <Skeleton height={420} radius={16} />
    </div>
  </div>
);

const MyLearningView = ({
  dashboard, catalogue, achievements, compliance, status = 'ready', firstName, now, features = {}, onRetry,
  achievementsHref,
}) => {
  const intl = useClassroomIntl();
  const t = (m, v) => intl.formatMessage(m, v);
  const [sort, setSort] = useState('due');
  const [layout, setLayout] = useState('grid');
  const [filter, setFilter] = useState('all');
  const d = dashboard || {};
  const pageRef = usePageEnter([status]);

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

  const countOf = (tone) => cards.filter((c) => statusTone(c.status) === tone).length;
  const counts = Object.fromEntries(STATUS_TONES.map((tone) => [tone, countOf(tone)]));
  const shown = cards.filter((c) => filter === 'all' || statusTone(c.status) === filter).sort(sorters[sort]);
  const hero = pickResume(cards);
  const heroLeft = hero?.hours ? Math.max(1, Math.round(hero.hours * 60 * (1 - hero.progress / 100))) : undefined;
  const showToday = !down && features.streak !== false && d.learning_time;
  const oldStreak = !down && features.streak !== false && !d.learning_time && d.streak;
  const licence = compliance?.licence;
  const listTitle = t(filter === 'all' ? messages.v2MyCourses : TONE_LABEL[filter]);

  return (
    <div className="cls3-v2" ref={pageRef}>
      <section className="cls3-hello" aria-label={t(messages.shell3MyLearning)}>
        {firstName && <h2>{t(messages[greetingKey(now || new Date())], { name: firstName })}</h2>}
        {!down && (
          <p>
            {counts.overdue > 0 ? (
              <span className="cls3-hello__alert">
                <KitIcon src={Warning} size={18} />
                {t(messages.v2NeedsAttention, { n: counts.overdue })}
              </span>
            ) : t(messages.v2AllGood)}
          </p>
        )}
      </section>
      {down && <Notice onRetry={onRetry}>{t(messages.notAvailable)}</Notice>}

      {(hero || showToday) && (
        <div className={`cls3-top2${hero && showToday ? '' : ' cls3-top2--solo'}`}>
          {hero && (
            <ResumeHero
              title={hero.title}
              href={hero.resumeHref || hero.href}
              progress={statusTone(hero.status) === 'done' ? 100 : Math.round(hero.progress)}
              tone={statusTone(hero.status)}
              nextTitle={hero.nextTitle}
              minutesLeft={heroLeft}
              daysLate={hero.daysLeft < 0 ? -hero.daysLeft : 0}
            />
          )}
          {showToday && <TodayCard learningTime={d.learning_time} now={now} className="cls3-rise" />}
        </div>
      )}

      {!down && <StatusTiles counts={counts} value={filter} onChange={setFilter} />}

      <div className="cls3-home2">
        <section aria-labelledby="cls3-mycourses">
          <div className="cls3-head2">
            <h2 id="cls3-mycourses">{listTitle}<small>{shown.length}</small></h2>
            <div>
              {filter !== 'all' && (
                <button type="button" className="cls-btn cls-btn--sm cls-btn--secondary" onClick={() => setFilter('all')}>
                  <KitIcon src={Close} size={16} />{t(messages.v2ShowAll)}
                </button>
              )}
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
          {!down && shown.length === 0 && <p className="cls3-empty">{t(messages.mlEmpty)}</p>}
          {shown.length > 0 && (
            <div className={`cls3-cards cls3-cards--${layout}`}>
              {shown.map((c) => <CourseCard2 key={c.href || c.code} {...c} layout={layout} now={now} />)}
            </div>
          )}
        </section>

        <aside>
          <section className="cls3-card2 cls3-side2 cls3-rise" aria-labelledby="cls3-dl">
            <h2 id="cls3-dl" className="cls3-card2__title">{t(messages.dashDeadlines)}</h2>
            {down ? <p className="cls-dempty">{t(messages.notAvailable)}</p> : <DateDeadlines items={d.deadlines} />}
          </section>
          {!down && <LicenceCard licence={licence} />}
          {oldStreak && (
            <DashCard title={t(messages.dashStreak)} titleId="cls3-streak">
              <StreakWeek days={d.streak.days} current={d.streak.current} best={d.streak.best} today={now} />
            </DashCard>
          )}
          {achievements && achievements.length > 0 && (
            <DashCard title={t(messages.mlAchievements)} titleId="cls3-ach">
              <AchievementList items={achievements} allHref={achievementsHref} />
            </DashCard>
          )}
          {!down && d.next_quizzes && d.next_quizzes.length > 0 && (
            <DashCard title={t(messages.dashQuizzes)} titleId="cls3-quiz">
              <NextQuizList items={d.next_quizzes} />
            </DashCard>
          )}
        </aside>
      </div>
    </div>
  );
};

MyLearningView.propTypes = {
  dashboard: PropTypes.shape({
    deadlines: PropTypes.arrayOf(PropTypes.shape({})),
    streak: PropTypes.shape({
      days: PropTypes.arrayOf(PropTypes.bool), current: PropTypes.number, best: PropTypes.number,
    }),
    learning_time: learningTimeShape, // CA-11 (D-93); null while switched off
    courses: PropTypes.arrayOf(PropTypes.shape({})),
    next_quizzes: PropTypes.arrayOf(PropTypes.shape({})),
  }),
  catalogue: PropTypes.arrayOf(PropTypes.shape({ course_key: PropTypes.string })), // CA-15 data (Part 2)
  achievements: PropTypes.arrayOf(PropTypes.shape({ code: PropTypes.string })), // CA-13 data (Part 2)
  compliance: PropTypes.shape({ licence: LicenceCard.propTypes.licence }), // CA-17 data (D-94)
  status: PropTypes.oneOf(['loading', 'ready', 'error']),
  firstName: PropTypes.string,
  now: PropTypes.instanceOf(Date),
  features: PropTypes.shape({ streak: PropTypes.bool }),
  onRetry: PropTypes.func,
  achievementsHref: PropTypes.string,
};

export default MyLearningView;
