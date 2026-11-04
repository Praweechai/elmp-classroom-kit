import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Check, ChevronRight, Event } from '@openedx/paragon/icons';

import {
  formatDate, formatHours, localized, messages, useClassroomIntl,
} from '../i18n';
import KitIcon from './KitIcon';
import { useLinkComponent } from './LinkContext';
import { ProgressRing } from './Progress';
import StatusPill from './StatusPill';

const COURSE_STATUS = {
  passed: messages.statusPassed,
  in_progress: messages.statusInProgress,
  not_started: messages.statusNotStarted,
};

const CourseRow = ({ course, href }) => {
  const intl = useClassroomIntl();
  const Link = useLinkComponent();
  const title = localized(course.title, intl.locale);
  const ready = course.enrolled !== false;
  const state = COURSE_STATUS[course.status] ? course.status : 'not_started';
  const content = (
    <>
      <span
        className={`cls-st cls-st--${ready ? state : 'pending'}`}
        style={{ '--cls-st-pct': `${course.grade_percent || 50}%` }}
        aria-hidden="true"
      >
        {state === 'passed' && <KitIcon src={Check} size={16} />}
      </span>
      <span className="cls-row__title">{title}</span>
      {course.ce_hours != null && (
        <span className="cls-row__hours cls-num">
          {intl.formatMessage(messages.ceHours, { hours: formatHours(course.ce_hours, intl.locale) })}
        </span>
      )}
      <span className="cls-row__status">
        {ready ? intl.formatMessage(COURSE_STATUS[state]) : intl.formatMessage(messages.preparing)}
      </span>
      {ready && href ? <KitIcon src={ChevronRight} size={20} className="cls-row__chev" /> : <span className="cls-row__chev" />}
    </>
  );
  return (
    <li>
      {ready && href ? <Link className="cls-row" href={href}>{content}</Link> : <div className="cls-row">{content}</div>}
    </li>
  );
};

CourseRow.propTypes = {
  course: PropTypes.shape({
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})]),
    status: PropTypes.string,
    enrolled: PropTypes.bool,
    ce_hours: PropTypes.number,
    grade_percent: PropTypes.number,
  }).isRequired,
  href: PropTypes.string,
};

// One card per assignment (doc 04 §5.6, F-91). Takes a CA-03 `assignments[]` item.
const RequiredGroup = ({ assignment, courseHref, highlighted = false }) => {
  const intl = useClassroomIntl();
  const { locale } = intl;
  const completed = assignment.status === 'completed';
  const [open, setOpen] = useState(!completed);
  const [flash, setFlash] = useState(highlighted);
  const ref = useRef(null);
  const listId = `required-${assignment.id}-courses`;

  useEffect(() => {
    if (!highlighted) { return undefined; }
    ref.current?.scrollIntoView?.({ block: 'start' });
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 1200);
    return () => clearTimeout(t);
  }, [highlighted]);

  const date = formatDate(assignment.due_at, locale);
  let dueLine = intl.formatMessage(messages.due, { date, n: Math.max(0, assignment.days_left ?? 0) });
  if (completed) {
    dueLine = intl.formatMessage(messages.completedOn, { date: formatDate(assignment.completed_at, locale) });
  } else if (assignment.status === 'overdue') {
    dueLine = intl.formatMessage(messages.late, { date, n: Math.abs(assignment.days_left ?? 0) });
  }
  const roadmap = localized(assignment.roadmap?.title, locale);
  const overdue = assignment.status === 'overdue';

  return (
    <section
      ref={ref}
      id={`required-${assignment.id}`}
      className={`cls-group${overdue ? ' cls-group--overdue' : ''}${flash ? ' is-highlighted' : ''}`}
      aria-labelledby={`required-${assignment.id}-title`}
    >
      <div className="cls-group__head">
        <div>
          <h3 className="cls-group__title" id={`required-${assignment.id}-title`}>
            {roadmap}
            <StatusPill status={assignment.status} />
          </h3>
          <p className={`cls-group__due${overdue ? ' cls-group__due--late' : ''}`}>
            <KitIcon src={Event} size={16} />
            {dueLine}
          </p>
        </div>
        <div className="cls-group__pct cls-num">
          <ProgressRing value={assignment.progress_percent || 0} size={32} label={roadmap} />
          <span aria-hidden="true">{assignment.progress_percent || 0}%</span>
        </div>
      </div>
      {completed && (
        <button
          type="button"
          className="cls-btn cls-btn--ghost cls-btn--sm cls-group__toggle"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen(!open)}
        >
          {intl.formatMessage(open ? messages.hideCourses : messages.showCourses)}
        </button>
      )}
      {open && (
        <ul id={listId}>
          {assignment.courses.map((course) => (
            <CourseRow key={course.course_key} course={course} href={courseHref?.(course)} />
          ))}
        </ul>
      )}
    </section>
  );
};

RequiredGroup.propTypes = {
  assignment: PropTypes.shape({
    id: PropTypes.number.isRequired,
    roadmap: PropTypes.shape({ title: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})]) }),
    status: PropTypes.oneOf(['on_track', 'due_soon', 'overdue', 'completed']).isRequired,
    due_at: PropTypes.string,
    days_left: PropTypes.number,
    progress_percent: PropTypes.number,
    completed_at: PropTypes.string,
    courses: PropTypes.arrayOf(PropTypes.shape({ course_key: PropTypes.string.isRequired })).isRequired,
  }).isRequired,
  courseHref: PropTypes.func,
  highlighted: PropTypes.bool,
};

export default RequiredGroup;
