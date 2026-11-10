import PropTypes from 'prop-types';

import {
  formatDate, formatHours, localized, messages, timeAgo, useClassroomIntl,
} from '../i18n';
import CourseCover, { CATEGORIES } from './CourseCover';
import { useLinkComponent } from './LinkContext';
import { ProgressBar } from './Progress';

// Plan 5 course card (S-100/S-101, NetAcad arrangement): cover with code + Required chip, category + status chip,
// title, meta (self-paced · units · hours · due), progress bar, last active + action. Grid or list layout.

export const CARD_STATUSES = ['not_started', 'in_progress', 'almost', 'due_soon', 'overdue', 'completed'];

const CHIP = {
  overdue: ['late', messages.statusOverdue],
  due_soon: ['soon', messages.statusDueSoon],
  almost: ['gold', messages.statusAlmost],
  completed: ['done', messages.statusCompleted],
  not_started: ['plain', messages.statusNotStarted],
  in_progress: ['ok', messages.statusInProgress],
};

const CATEGORY_LABEL = {
  clinical: messages.catClinical,
  safety: messages.catSafety,
  compliance: messages.catCompliance,
  soft: messages.catSoft,
  general: messages.catGeneral,
};

export const StatusChip = ({ status }) => {
  const intl = useClassroomIntl();
  const [tone, label] = CHIP[status] || CHIP.in_progress;
  return <span className={`cls3-chip cls3-chip--${tone}`}>{intl.formatMessage(label)}</span>;
};

StatusChip.propTypes = { status: PropTypes.oneOf(CARD_STATUSES).isRequired };

// Category: CA-15 gives {key, en, th}; CA-11 gives only the key → kit label.
export const categoryLabel = (category, intl) => {
  if (!category) { return ''; }
  if (typeof category === 'object') { return localized(category, intl.locale); }
  return CATEGORY_LABEL[category] ? intl.formatMessage(CATEGORY_LABEL[category]) : category;
};

const CourseCard2 = ({
  code, title, category, coverUrl, colour, required = false, status = 'not_started', progress = 0, units,
  hours, dueAt, lastActivityAt, href, resumeHref, layout = 'grid', now,
}) => {
  const intl = useClassroomIntl();
  const Link = useLinkComponent();
  const t = (m, v) => intl.formatMessage(m, v);
  const done = status === 'completed';
  const action = (done && messages.review) || (status === 'not_started' && messages.start) || messages.continue;
  const catKey = typeof category === 'string' ? category : category?.key;
  const coverStyle = !coverUrl && colour ? { background: `linear-gradient(135deg, ${colour}, ${colour}CC)` } : undefined;
  const meta = [
    t(messages.cardSelfPaced),
    units != null && t(messages.units, { n: units }),
    hours != null && t(messages.duration, { hours: formatHours(hours, intl.locale) }),
    dueAt && !done && t(messages.cardDue, { date: formatDate(dueAt, intl.locale) }),
  ].filter(Boolean).join(' · ');
  const pct = done ? 100 : Math.min(Math.round(progress), status === 'almost' ? 99 : 100);

  return (
    <article className={`cls3-course cls3-course--${layout}`}>
      <div className="cls3-course__cover">
        <CourseCover
          imageUrl={coverUrl}
          category={CATEGORIES.includes(catKey) ? catKey : 'general'}
          code={code}
          style={coverStyle}
        />
        {required && <span className="cls3-course__req">{t(messages.cardRequired)}</span>}
      </div>
      <div className="cls3-course__body">
        <div className="cls3-course__eyebrow">
          <span>{categoryLabel(category, intl)}</span>
          <StatusChip status={status} />
        </div>
        <h3 className="cls3-course__title"><Link href={href}>{title}</Link></h3>
        <p className="cls3-course__meta">{meta}</p>
        {status !== 'not_started' && <ProgressBar value={pct} label={title} />}
        <div className="cls3-course__foot">
          <small>{lastActivityAt ? t(messages.mlLastActive, { when: timeAgo(lastActivityAt, intl.locale, now?.getTime()) }) : ''}</small>
          <Link
            className={`cls-btn cls-btn--sm ${done ? 'cls-btn--secondary' : 'cls-btn--primary'}`}
            href={resumeHref || href}
            aria-label={`${t(action)}: ${title}`}
          >
            {t(action)}
          </Link>
        </div>
      </div>
    </article>
  );
};

CourseCard2.propTypes = {
  code: PropTypes.string,
  title: PropTypes.string.isRequired,
  category: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ key: PropTypes.string, en: PropTypes.string, th: PropTypes.string }),
  ]),
  coverUrl: PropTypes.string,
  colour: PropTypes.string,
  required: PropTypes.bool,
  status: PropTypes.oneOf(CARD_STATUSES),
  progress: PropTypes.number,
  units: PropTypes.number,
  hours: PropTypes.number,
  dueAt: PropTypes.string,
  lastActivityAt: PropTypes.string,
  href: PropTypes.string.isRequired,
  resumeHref: PropTypes.string,
  layout: PropTypes.oneOf(['grid', 'list']),
  now: PropTypes.instanceOf(Date),
};

export default CourseCard2;
