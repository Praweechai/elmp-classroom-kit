import PropTypes from 'prop-types';
import { Event, Schedule, ViewList } from '@openedx/paragon/icons';

import {
  formatDate, formatHours, messages, useClassroomIntl,
} from '../i18n';
import CourseCover from './CourseCover';
import KitIcon from './KitIcon';
import { useLinkComponent } from './LinkContext';
import { ProgressBar } from './Progress';

export const COURSE_STATES = ['not_started', 'in_progress', 'passed'];

const actionFor = (state, hasCertificate) => {
  if (state === 'passed') { return hasCertificate ? messages.viewCertificate : messages.review; }
  return state === 'in_progress' ? messages.continue : messages.start;
};

// Course card (doc 04 §5.4, F-92). The whole card links to the course home; the button resumes.
const CourseCard = ({
  title, code, imageUrl, category, href, resumeHref, durationHours, ceHours, units,
  progress = 0, state = 'not_started', certificateUrl, required, completedAt, enrolled = true,
}) => {
  const intl = useClassroomIntl();
  const Link = useLinkComponent();
  const { locale } = intl;
  const passed = state === 'passed';

  let strip = { cls: '', text: intl.formatMessage(messages.course) };
  if (passed && completedAt) {
    strip = { cls: '', text: intl.formatMessage(messages.completedStrip, { date: formatDate(completedAt, locale) }) };
  } else if (required) {
    const date = formatDate(required.dueAt, locale);
    strip = {
      cls: required.overdue ? 'cls-strip--overdue' : 'cls-strip--required',
      text: intl.formatMessage(messages.requiredStrip, { roadmap: required.roadmap, date }),
    };
  }

  const action = actionFor(state, Boolean(certificateUrl));
  const actionHref = passed && certificateUrl ? certificateUrl : (resumeHref || href);
  const meta = [
    durationHours != null
      && [Schedule, intl.formatMessage(messages.duration, { hours: formatHours(durationHours, locale) })],
    ceHours != null && [Event, intl.formatMessage(messages.ceHours, { hours: formatHours(ceHours, locale) })],
    units != null && [ViewList, intl.formatMessage(messages.units, { n: units })],
  ].filter(Boolean);

  return (
    <article className="cls-card">
      <div className={`cls-strip ${strip.cls}`.trim()}><span>{strip.text}</span></div>
      <CourseCover
        imageUrl={imageUrl}
        category={category}
        code={code}
        certificate={passed && Boolean(certificateUrl)}
      />
      <div className="cls-card__body">
        <h3 className="cls-card__title" title={title}>
          {enrolled ? <Link className="cls-card__link" href={href}>{title}</Link> : title}
        </h3>
        <div className="cls-meta">
          {meta.map(([icon, text]) => <div key={text}><KitIcon src={icon} size={18} />{text}</div>)}
        </div>
        {enrolled && state !== 'not_started' && <ProgressBar value={passed ? 100 : progress} label={title} />}
      </div>
      <div className="cls-card__foot">
        {enrolled ? (
          <Link
            className={`cls-btn cls-btn--block ${passed ? 'cls-btn--secondary' : 'cls-btn--primary'}`}
            href={actionHref}
            aria-label={`${intl.formatMessage(action)}: ${title}`}
          >
            {intl.formatMessage(action)}
          </Link>
        ) : (
          <p className="cls-preparing" role="status"><span className="cls-live" aria-hidden="true" />{intl.formatMessage(messages.preparing)}</p>
        )}
      </div>
    </article>
  );
};

CourseCard.propTypes = {
  title: PropTypes.string.isRequired,
  code: PropTypes.string,
  imageUrl: PropTypes.string,
  category: PropTypes.string,
  href: PropTypes.string,
  resumeHref: PropTypes.string,
  durationHours: PropTypes.number,
  ceHours: PropTypes.number,
  units: PropTypes.number,
  progress: PropTypes.number,
  state: PropTypes.oneOf(COURSE_STATES),
  certificateUrl: PropTypes.string,
  required: PropTypes.shape({ roadmap: PropTypes.string, dueAt: PropTypes.string, overdue: PropTypes.bool }),
  completedAt: PropTypes.string,
  enrolled: PropTypes.bool,
};

export default CourseCard;
