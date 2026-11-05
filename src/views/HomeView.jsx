import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { CheckCircle } from '@openedx/paragon/icons';

import {
  formatDate, localized, messages, useClassroomIntl,
} from '../i18n';
import CertificateCard from '../components/CertificateCard';
import ContinueCard from '../components/ContinueCard';
import CourseCard from '../components/CourseCard';
import { EmptyState, Notice, Skeleton } from '../components/Feedback';
import GreetingBand from '../components/GreetingBand';
import HoursCard from '../components/HoursCard';
import KitIcon from '../components/KitIcon';
import RequiredGroup from '../components/RequiredGroup';

export const NO_ACCESS = ['unmapped', 'inactive', 'forbidden'];
const SILENT = ['disabled', 'unauthenticated'];
const FILTERS = [
  ['in_progress', messages.statusInProgress],
  ['not_started', messages.statusNotStarted],
  ['passed', messages.statusCompleted],
];

export const courseShape = PropTypes.shape({
  key: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  code: PropTypes.string,
  imageUrl: PropTypes.string,
  href: PropTypes.string,
  resumeHref: PropTypes.string,
  state: PropTypes.oneOf(['not_started', 'in_progress', 'almost', 'passed']),
  progress: PropTypes.number,
  units: PropTypes.number,
  certificateUrl: PropTypes.string,
});

// Course key → first open assignment that requires it (strip on the card, F-92).
const requiredIndex = (assignments, locale) => {
  const out = {};
  assignments.filter((a) => a.status !== 'completed').forEach((a) => a.courses.forEach((c) => {
    out[c.course_key] ??= {
      roadmap: localized(a.roadmap?.title, locale), dueAt: a.due_at, overdue: a.status === 'overdue', ceHours: c.ce_hours,
    };
  }));
  assignments.forEach((a) => a.courses.forEach((c) => {
    if (out[c.course_key]) {
      out[c.course_key].ceHours ??= c.ce_hours;
    } else {
      out[c.course_key] = { ceHours: c.ce_hours, notRequired: true };
    }
  }));
  return out;
};

const HomeSkeleton = () => (
  <div className="cls-stack" aria-busy="true">
    <Skeleton width="45%" height={32} />
    <Skeleton width="60%" />
    <Skeleton height={136} radius={16} />
    <Skeleton height={120} radius={14} />
    <Skeleton height={120} radius={14} />
  </div>
);

// S-70 Classroom home (doc 04 §6.1, F-90…F-92). Data: Open edX courses (view models) + Portal CA-03.
// Renders inside the app's own <main> landmark.
const HomeView = ({
  firstName, courses = [], coursesLoading = false, training, trainingStatus = 'loading', trainingError,
  latestCertificate, onDownloadCertificate, links = {}, highlightId, onRetry, now = new Date(),
}) => {
  const intl = useClassroomIntl();
  const { locale } = intl;
  const [filter, setFilter] = useState(null);
  const errorCode = trainingStatus === 'error' ? (trainingError?.code || 'unavailable') : null;
  const portal = trainingStatus === 'ready' || (trainingStatus === 'refreshing' && training) ? training : null;
  const assignments = useMemo(() => portal?.assignments || [], [portal]);
  const required = useMemo(() => requiredIndex(assignments, locale), [assignments, locale]);

  if (coursesLoading && trainingStatus === 'loading') { return <div className="cls-page cls-root"><HomeSkeleton /></div>; }

  const continueKey = portal?.continue?.course_key;
  const continueCourse = courses.find((c) => c.key === continueKey && c.state !== 'passed')
    || (!portal ? courses.find((c) => c.state === 'in_progress') : undefined);
  const continueRoadmap = portal?.continue
    ? localized(assignments.find((a) => a.id === portal.continue.assignment_id)?.roadmap?.title, locale) : undefined;
  const allPassed = courses.length > 0 && courses.every((c) => c.state === 'passed') && !assignments.some((a) => a.status !== 'completed');
  const nextOpen = assignments.find((a) => a.status !== 'completed');
  const inFilter = (c) => c.state === filter || (filter === 'in_progress' && c.state === 'almost');
  const shown = filter ? courses.filter(inFilter) : courses;
  const year = Number(new Intl.DateTimeFormat('en-GB', { year: 'numeric', timeZone: 'Asia/Bangkok' }).format(now));
  const summary = portal?.summary;
  const nothingAtAll = !coursesLoading && !courses.length && !assignments.length;

  return (
    <div className="cls-page cls-root">
      <div className="cls-home-grid">
        <div className="cls-main-col">
          <GreetingBand firstName={firstName} summary={summary} now={now} />

          {errorCode && NO_ACCESS.includes(errorCode) && (
            <section className="cls-panel cls-noaccess" role="status">
              <h2>{intl.formatMessage(messages.noAccessTitle)}</h2>
              <p>{intl.formatMessage(messages.noAccess)}</p>
            </section>
          )}
          {errorCode && !NO_ACCESS.includes(errorCode) && !SILENT.includes(errorCode) && (
            <Notice onRetry={onRetry}>{intl.formatMessage(messages.unavailable)}</Notice>
          )}

          {continueCourse && (
            <ContinueCard
              title={continueCourse.title}
              code={continueCourse.code}
              imageUrl={continueCourse.imageUrl}
              href={continueCourse.resumeHref || continueCourse.href}
              roadmap={continueRoadmap}
              unitIndex={continueCourse.unitsDone != null && continueCourse.units
                ? Math.min(continueCourse.unitsDone + 1, continueCourse.units) : undefined}
              unitCount={continueCourse.units}
              progress={continueCourse.progress}
            />
          )}
          {allPassed && (
            <section className="cls-panel cls-alldone">
              <span className="cls-alldone__icon"><KitIcon src={CheckCircle} size={28} /></span>
              <div>
                <h2>{intl.formatMessage(messages.allDoneTitle)}</h2>
                <p>
                  {nextOpen
                    ? intl.formatMessage(messages.nextDue, {
                      title: localized(nextOpen.roadmap?.title, locale), date: formatDate(nextOpen.due_at, locale),
                    })
                    : intl.formatMessage(messages.summaryAllDone)}
                </p>
              </div>
            </section>
          )}

          {trainingStatus === 'loading' && <Skeleton height={120} radius={14} />}
          {assignments.length > 0 && (
            <section aria-labelledby="cls-required-title">
              <div className="cls-section-title"><h2 id="cls-required-title">{intl.formatMessage(messages.required)}</h2></div>
              <div className="cls-stack">
                {assignments.map((a) => (
                  <RequiredGroup
                    key={a.id}
                    assignment={a}
                    courseHref={links.courseHome}
                    highlighted={String(highlightId) === String(a.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {nothingAtAll && !errorCode && trainingStatus !== 'loading' && (
            <div className="cls-panel"><EmptyState title={intl.formatMessage(messages.emptyTitle)}>{intl.formatMessage(messages.empty)}</EmptyState></div>
          )}

          {(courses.length > 0 || coursesLoading) && (
            <section aria-labelledby="cls-all-title">
              <div className="cls-section-title"><h2 id="cls-all-title">{intl.formatMessage(messages.allCourses)}</h2></div>
              <div className="cls-chips" role="group" aria-label={intl.formatMessage(messages.filterLabel)}>
                {FILTERS.map(([key, label]) => (
                  <button key={key} type="button" className="cls-chip" aria-pressed={filter === key} onClick={() => setFilter(filter === key ? null : key)}>
                    {intl.formatMessage(label)}
                  </button>
                ))}
              </div>
              {coursesLoading ? <Skeleton height={300} radius={12} /> : (
                <div className="cls-cards">
                  {shown.map((c) => {
                    const req = required[c.key];
                    return (
                      <CourseCard
                        key={c.key}
                        {...c}
                        ceHours={req?.ceHours ?? c.ceHours}
                        required={req && !req.notRequired && c.state !== 'passed' ? req : undefined}
                      />
                    );
                  })}
                  {!shown.length && <p className="cls-muted">{intl.formatMessage(messages.noCoursesInFilter)}</p>}
                </div>
              )}
            </section>
          )}
        </div>

        {portal && (
          <aside className="cls-side-col" aria-label={intl.formatMessage(messages.navHours)}>
            {summary?.ce_target_hours != null && (
              <HoursCard year={year} earned={summary.ce_hours || 0} target={summary.ce_target_hours} yearEnds={`${year}-12-31`} href={links.hours} />
            )}
            {latestCertificate && (
              <div>
                <p className="cls-kicker cls-side-title">{intl.formatMessage(messages.certificateLatest)}</p>
                <CertificateCard certificate={latestCertificate} onDownload={onDownloadCertificate} />
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
};

HomeView.propTypes = {
  firstName: PropTypes.string.isRequired,
  courses: PropTypes.arrayOf(courseShape),
  coursesLoading: PropTypes.bool,
  training: PropTypes.shape({
    summary: PropTypes.shape({}),
    continue: PropTypes.shape({ course_key: PropTypes.string, assignment_id: PropTypes.number }),
    assignments: PropTypes.arrayOf(PropTypes.shape({})),
  }),
  trainingStatus: PropTypes.oneOf(['loading', 'ready', 'refreshing', 'error']),
  trainingError: PropTypes.shape({ code: PropTypes.string }),
  latestCertificate: PropTypes.shape({}),
  onDownloadCertificate: PropTypes.func,
  links: PropTypes.shape({ courseHome: PropTypes.func, hours: PropTypes.string, certificates: PropTypes.string }),
  highlightId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onRetry: PropTypes.func,
  now: PropTypes.instanceOf(Date),
};

export default HomeView;
