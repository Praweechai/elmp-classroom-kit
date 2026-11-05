import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  AccessTime, CheckCircle, MenuBook, Quiz, Shield, WorkspacePremium,
} from '@openedx/paragon/icons';

import {
  formatHours, greetingKey, localized, messages, useClassroomIntl,
} from '../i18n';
import CertificateCard from '../components/CertificateCard';
import CourseTable, { COURSE_FILTERS, CourseFilters } from '../components/CourseTable';
import {
  DashCard, DeadlineList, EncouragementBanner, Gauge, NextQuizList, StatGroup, StatRing, StreakWeek, pctOf,
} from '../components/Dashboard';
import { Notice, Skeleton } from '../components/Feedback';
import { useLinkComponent } from '../components/LinkContext';

// S-90 Home 2.0 (F-114). Pure view: the dashboard fork loads CA-11 `GET /dashboard` and passes it in.
// Grid (doc 04-design §3): banner · gauge | my learning | required · deadlines (2) | streak ·
// courses (2) | quizzes + certificate.

const HOURS_RING_SCALE = 10; // the "Hours learned" ring is full at 10 h; the number is always shown as text

const pair = (v) => (Array.isArray(v) ? v : [0, 0]);

export const DashboardSkeleton = () => (
  <div className="cls-dash" aria-busy="true">
    <Skeleton className="cls-dash__full" height={52} radius={12} />
    {[0, 1, 2].map((i) => <Skeleton key={i} height={236} radius={16} />)}
    <Skeleton className="cls-dash__two" height={220} radius={16} />
    <Skeleton height={220} radius={16} />
  </div>
);

const DashboardView = ({
  dashboard, status = 'ready', firstName, now, features = {}, onRetry, onDownloadCertificate,
  coursesHref, certificatesHref, courseLimit = 5,
}) => {
  const intl = useClassroomIntl();
  const Link = useLinkComponent();
  const [filter, setFilter] = useState('all');
  if (status === 'loading') { return <DashboardSkeleton />; }

  const d = dashboard || {};
  const down = status === 'error';
  const rings = d.rings || {};
  const [reqDone, reqTotal] = pair(rings.required_done);
  const [quizDone, quizTotal] = pair(rings.quizzes_passed);
  const hours = rings.hours_learned;
  const courses = d.courses || [];
  const counts = Object.fromEntries(Object.entries(COURSE_FILTERS).map(([k, f]) => [k, courses.filter(f).length]));
  const lead = firstName ? `${intl.formatMessage(messages[greetingKey(now)], { name: firstName })}!` : undefined;
  const t = (m, v) => intl.formatMessage(m, v);
  const unavailable = <p className="cls-dempty">{t(messages.notAvailable)}</p>;

  return (
    <div className="cls-dash">
      {down && <div className="cls-dash__full"><Notice onRetry={onRetry}>{t(messages.unavailable)}</Notice></div>}
      {!down && <div className="cls-dash__full"><EncouragementBanner banner={d.banner} lead={lead} now={now} /></div>}

      <DashCard title={t(messages.dashOverall)} sub={t(messages.dashOverallSub)} titleId="cls-d-gauge" className="cls-dcard--gauge">
        {down ? unavailable : <Gauge pct={d.gauge?.required_done_on_time_pct ?? null} label={d.gauge?.label} />}
      </DashCard>

      <StatGroup title={t(messages.dashMyLearning)} sub={t(messages.dashThisYear)} titleId="cls-d-mine">
        <StatRing icon={MenuBook} tone="green" label={t(messages.statEnrolled)} value={down ? '—' : String(rings.enrolled ?? 0)} pct={rings.enrolled > 0 ? 100 : 0} />
        <StatRing icon={CheckCircle} tone="blue" label={t(messages.statCompleted)} value={down ? '—' : String(rings.completed ?? 0)} pct={pctOf(rings.completed, rings.enrolled)} />
        <StatRing
          icon={AccessTime}
          tone="pink"
          label={t(messages.statHoursLearned)}
          sub={t(messages.statHoursLearnedSub)}
          value={down || hours == null ? '—' : t(messages.hoursShort, { hours: formatHours(hours, intl.locale) })}
          pct={hours ? Math.min(100, (hours / HOURS_RING_SCALE) * 100) : 0}
        />
      </StatGroup>

      <StatGroup title={t(messages.required)} sub={localized(d.required_title, intl.locale) || undefined} titleId="cls-d-req">
        <StatRing
          icon={Shield}
          tone={d.gauge?.label === 'needs_attention' ? 'late' : 'green'}
          label={t(messages.statRequiredDone)}
          value={down ? '—' : `${reqDone}/${reqTotal}`}
          pct={pctOf(reqDone, reqTotal)}
        />
        <StatRing icon={Quiz} tone="violet" label={t(messages.statQuizzes)} value={down ? '—' : `${quizDone}/${quizTotal}`} pct={pctOf(quizDone, quizTotal)} />
        <StatRing icon={WorkspacePremium} tone="gold" label={t(messages.statCertificates)} value={down ? '—' : String(rings.certificates ?? 0)} pct={rings.certificates > 0 ? 100 : 0} />
      </StatGroup>

      <DashCard title={t(messages.dashDeadlines)} sub={t(messages.dashDeadlinesSub)} titleId="cls-d-dl" className="cls-dash__two">
        {down ? unavailable : <DeadlineList items={d.deadlines} />}
      </DashCard>

      {features.streak !== false && (
        <DashCard title={t(messages.dashStreak)} titleId="cls-d-streak">
          {down || !d.streak ? unavailable : (
            <StreakWeek days={d.streak.days} current={d.streak.current} best={d.streak.best} today={now} />
          )}
        </DashCard>
      )}

      <DashCard
        title={t(messages.dashCourses, { n: courses.length })}
        sub={t(messages.dashCoursesSub)}
        titleId="cls-d-courses"
        className="cls-dash__two cls-dcard--courses"
        action={coursesHref && courses.length > courseLimit ? <Link className="cls-btn cls-btn--secondary cls-btn--sm" href={coursesHref}>{t(messages.seeAll)}</Link> : null}
      >
        {down ? unavailable : (
          <>
            <CourseFilters value={filter} onChange={setFilter} counts={counts} />
            <CourseTable
              courses={courses}
              filter={filter}
              limit={courseLimit}
              caption={t(messages.dashCourses, { n: courses.length })}
            />
          </>
        )}
      </DashCard>

      <div className="cls-dash__side">
        <DashCard title={t(messages.dashQuizzes)} titleId="cls-d-quiz">
          {down ? unavailable : <NextQuizList items={d.next_quizzes} />}
        </DashCard>
        {!down && d.latest_certificate && (
          <div className="cls-dash__cert">
            <CertificateCard certificate={d.latest_certificate} onDownload={onDownloadCertificate} headingLevel={2} />
            {certificatesHref && <Link className="cls-btn cls-btn--ghost cls-btn--sm" href={certificatesHref}>{t(messages.seeAll)}</Link>}
          </div>
        )}
      </div>
    </div>
  );
};

DashboardView.propTypes = {
  dashboard: PropTypes.shape({
    banner: PropTypes.shape({}),
    gauge: PropTypes.shape({ required_done_on_time_pct: PropTypes.number, label: PropTypes.string }),
    rings: PropTypes.shape({}),
    required_title: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})]),
    deadlines: PropTypes.arrayOf(PropTypes.shape({})),
    streak: PropTypes.shape({
      days: PropTypes.arrayOf(PropTypes.bool), current: PropTypes.number, best: PropTypes.number,
    }),
    courses: PropTypes.arrayOf(PropTypes.shape({})),
    next_quizzes: PropTypes.arrayOf(PropTypes.shape({})),
    latest_certificate: PropTypes.shape({}),
  }),
  status: PropTypes.oneOf(['loading', 'ready', 'error']),
  firstName: PropTypes.string,
  now: PropTypes.instanceOf(Date),
  features: PropTypes.shape({ streak: PropTypes.bool }),
  onRetry: PropTypes.func,
  onDownloadCertificate: PropTypes.func,
  coursesHref: PropTypes.string,
  certificatesHref: PropTypes.string,
  courseLimit: PropTypes.number,
};

export default DashboardView;
