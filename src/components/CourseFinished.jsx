import PropTypes from 'prop-types';
import { ArrowForward, Check, WorkspacePremium } from '@openedx/paragon/icons';

import {
  formatDate, formatHours, localized, messages, useClassroomIntl,
} from '../i18n';
import KitIcon from './KitIcon';
import { useLinkComponent } from './LinkContext';

const DONE = ['passed', 'completed'];

// CA-03 training → the next required course to take (not this one, not finished), most urgent first.
export const nextRequiredCourse = (training, currentKey) => {
  const rank = {
    overdue: 0, due_soon: 1, on_track: 2, not_started: 3,
  };
  const open = (training?.assignments || [])
    .filter((a) => a.status !== 'completed')
    .sort((a, b) => (rank[a.status] ?? 9) - (rank[b.status] ?? 9) || String(a.due_at).localeCompare(String(b.due_at)));
  for (let i = 0; i < open.length; i += 1) {
    const course = open[i].courses.find((c) => c.course_key !== currentKey && !DONE.includes(c.status));
    if (course) { return { course, assignment: open[i] }; }
  }
  return null;
};

// S-77 course finished (doc 04 §6.7): check mark, course title, stats, certificate, up next, back link.
// `record` reports the Portal refresh (CA-05) in a polite live region.
const CourseFinished = ({
  courseTitle, grade, ceHours, finishedAt, certificateHref, upNext, backHref, record,
}) => {
  const intl = useClassroomIntl();
  const { locale } = intl;
  const Link = useLinkComponent();
  const stats = [];
  if (grade != null) { stats.push([messages.statGrade, `${Math.round(grade)}%`]); }
  if (ceHours > 0) {
    stats.push([messages.statHours, intl.formatMessage(messages.duration, { hours: formatHours(ceHours, locale) })]);
  }
  if (finishedAt) { stats.push([messages.statDate, formatDate(finishedAt, locale)]); }
  const recordText = {
    updating: messages.recordUpdating, updated: messages.recordUpdated, later: messages.recordLater,
  }[record];
  return (
    <section className="cls-finished" aria-labelledby="cls-finished-title">
      <span className="cls-finished__check" aria-hidden="true"><KitIcon src={Check} size={48} /></span>
      <p className="cls-finished__lead">{intl.formatMessage(messages.finishedLead)}</p>
      <h1 id="cls-finished-title" className="cls-finished__title">{courseTitle}</h1>
      {stats.length > 0 && (
        <dl className="cls-finished__stats">
          {stats.map(([label, value]) => (
            <div key={label.id}><dt>{intl.formatMessage(label)}</dt><dd className="cls-num">{value}</dd></div>
          ))}
        </dl>
      )}
      <p className="cls-finished__record" role="status">{recordText ? intl.formatMessage(recordText) : ''}</p>
      {certificateHref && (
        <div className="cls-finished__cert">
          <span className="cls-cert__seal" aria-hidden="true"><KitIcon src={WorkspacePremium} size={22} /></span>
          <p>{intl.formatMessage(messages.certificateReady)}</p>
          <Link className="cls-btn cls-btn--secondary cls-btn--sm" href={certificateHref}>{intl.formatMessage(messages.viewCertificate)}</Link>
        </div>
      )}
      {upNext && (
        <>
          <hr className="cls-finished__rule" />
          <h2 className="cls-finished__next-title">{intl.formatMessage(messages.upNext)}</h2>
          <div className="cls-finished__next">
            <div>
              <p className="cls-finished__next-course">{localized(upNext.course.title, locale)}</p>
              <p className="cls-finished__next-meta">
                {localized(upNext.assignment.roadmap?.title, locale)}
                {' · '}
                {intl.formatMessage(messages.dueShort, { date: formatDate(upNext.assignment.due_at, locale) })}
              </p>
            </div>
            {upNext.href && (
              <Link className="cls-btn cls-btn--primary" href={upNext.href}>
                {intl.formatMessage(messages.start)}
                <KitIcon src={ArrowForward} size={18} />
              </Link>
            )}
          </div>
        </>
      )}
      {backHref && <Link className="cls-finished__back" href={backHref}>{intl.formatMessage(messages.backToLearning)}</Link>}
    </section>
  );
};

CourseFinished.propTypes = {
  courseTitle: PropTypes.string.isRequired,
  grade: PropTypes.number,
  ceHours: PropTypes.number,
  finishedAt: PropTypes.string,
  certificateHref: PropTypes.string,
  upNext: PropTypes.shape({
    course: PropTypes.shape({ title: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})]) }).isRequired,
    assignment: PropTypes.shape({
      roadmap: PropTypes.shape({ title: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})]) }),
      due_at: PropTypes.string,
    }).isRequired,
    href: PropTypes.string,
  }),
  backHref: PropTypes.string,
  record: PropTypes.oneOf(['updating', 'updated', 'later']),
};

export default CourseFinished;
