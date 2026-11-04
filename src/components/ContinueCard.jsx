import PropTypes from 'prop-types';
import { PlayCircle } from '@openedx/paragon/icons';

import { messages, useClassroomIntl } from '../i18n';
import CourseCover from './CourseCover';
import KitIcon from './KitIcon';
import { useLinkComponent } from './LinkContext';
import { ProgressBar } from './Progress';

// "Continue where you left off" (doc 04 §5.5, F-90 §3).
const ContinueCard = ({
  title, code, imageUrl, category, href, roadmap, unitIndex, unitCount, unitTitle, progress = 0,
}) => {
  const intl = useClassroomIntl();
  const Link = useLinkComponent();
  const unitLine = [
    unitIndex && unitCount ? intl.formatMessage(messages.unitOf, { i: unitIndex, n: unitCount }) : null,
    unitTitle,
  ].filter(Boolean).join(' · ');
  return (
    <article className="cls-continue">
      <CourseCover imageUrl={imageUrl} category={category} code={code} />
      <div>
        <p className="cls-continue__k">
          <KitIcon src={PlayCircle} size={16} />
          {roadmap ? intl.formatMessage(messages.continueLabel, { roadmap }) : intl.formatMessage(messages.continue)}
        </p>
        <h3 className="cls-continue__title">{title}</h3>
        {unitLine && <p className="cls-continue__unit">{unitLine}</p>}
        <ProgressBar value={progress} label={title} />
      </div>
      <Link className="cls-btn cls-btn--primary" href={href} aria-label={`${intl.formatMessage(messages.continue)}: ${title}`}>
        {intl.formatMessage(messages.continue)}
      </Link>
    </article>
  );
};

ContinueCard.propTypes = {
  title: PropTypes.string.isRequired,
  code: PropTypes.string,
  imageUrl: PropTypes.string,
  category: PropTypes.string,
  href: PropTypes.string.isRequired,
  roadmap: PropTypes.string,
  unitIndex: PropTypes.number,
  unitCount: PropTypes.number,
  unitTitle: PropTypes.string,
  progress: PropTypes.number,
};

export default ContinueCard;
