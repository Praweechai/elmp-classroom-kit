import PropTypes from 'prop-types';
import { ArrowBack, Event } from '@openedx/paragon/icons';

import {
  formatDate, localized, messages, useClassroomIntl,
} from '../i18n';
import KeyFacts from './KeyFacts';
import KitIcon from './KitIcon';
import { useLinkComponent } from './LinkContext';
import { ProgressBar } from './Progress';
import StatusPill from './StatusPill';

const ACTION = { start: messages.start, resume: messages.resume, review: messages.review };

// "Required for …" banner from CA-04 `required_by[]` (F-93). Completed assignments are not shown.
const RequiredBanner = ({ item }) => {
  const intl = useClassroomIntl();
  const { locale } = intl;
  const date = formatDate(item.due_at, locale);
  const overdue = item.status === 'overdue';
  const due = overdue
    ? intl.formatMessage(messages.late, { date, n: Math.abs(item.days_left ?? 0) })
    : intl.formatMessage(messages.due, { date, n: Math.max(0, item.days_left ?? 0) });
  return (
    <div className={`cls-hero__required${overdue ? ' is-late' : ''}`}>
      <KitIcon src={Event} size={20} />
      <p>
        <b>{intl.formatMessage(messages.requiredFor, { roadmap: localized(item.roadmap_title, locale) })}</b>
        <span>{due}</span>
      </p>
      <StatusPill status={item.status} />
    </div>
  );
};

RequiredBanner.propTypes = {
  item: PropTypes.shape({
    roadmap_title: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})]),
    due_at: PropTypes.string,
    days_left: PropTypes.number,
    status: PropTypes.string,
  }).isRequired,
};

// S-75 top of the course home (doc 04 §6.5): back link, code chip, title, description, key facts,
// required banner(s) and the progress block with the main action.
const CourseHero = ({
  title, code, description, backHref, facts = [], requiredBy = [], progress,
}) => {
  const intl = useClassroomIntl();
  const Link = useLinkComponent();
  const open = requiredBy.filter((item) => item.status !== 'completed');
  return (
    <section className="cls-hero" aria-labelledby="cls-hero-title">
      {backHref && (
        <Link className="cls-hero__back" href={backHref}>
          <KitIcon src={ArrowBack} size={18} />
          {intl.formatMessage(messages.navHome)}
        </Link>
      )}
      {code && <span className="cls-hero__code">{code}</span>}
      <h1 id="cls-hero-title" className="cls-hero__title">{title}</h1>
      {description && <p className="cls-hero__desc">{description}</p>}
      {facts.length > 0 && <KeyFacts facts={facts} />}
      {open.map((item) => <RequiredBanner key={item.assignment_id ?? localized(item.roadmap_title, 'en')} item={item} />)}
      {progress && (
        <div className="cls-hero__progress">
          <div className="cls-hero__progress-text">
            <h2>{intl.formatMessage(messages.yourProgress)}</h2>
            <ProgressBar value={progress.percent} size="lg" />
            {progress.total > 0 && (
              <p className="cls-num">{intl.formatMessage(messages.unitsDone, { done: progress.done, total: progress.total })}</p>
            )}
          </div>
          {progress.href && (
            <Link className="cls-btn cls-btn--primary cls-btn--lg" href={progress.href}>
              {intl.formatMessage(ACTION[progress.action] || messages.resume)}
            </Link>
          )}
        </div>
      )}
    </section>
  );
};

CourseHero.propTypes = {
  title: PropTypes.string.isRequired,
  code: PropTypes.string,
  description: PropTypes.string,
  backHref: PropTypes.string,
  facts: KeyFacts.propTypes.facts,
  requiredBy: PropTypes.arrayOf(PropTypes.shape({})),
  progress: PropTypes.shape({
    percent: PropTypes.number,
    done: PropTypes.number,
    total: PropTypes.number,
    href: PropTypes.string,
    action: PropTypes.oneOf(['start', 'resume', 'review']),
  }),
};

export default CourseHero;
