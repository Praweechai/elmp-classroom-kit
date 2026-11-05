import PropTypes from 'prop-types';
import { ArrowBack, MenuBook } from '@openedx/paragon/icons';

import { messages, useClassroomIntl } from '../i18n';
import KitIcon from './KitIcon';
import { useLinkComponent } from './LinkContext';

const clamp = (v) => Math.max(0, Math.min(100, Math.round(Number(v) || 0)));

// S-76 top bar (doc 04 §5.12): back to the course page, outline toggle, course title, "Unit 3 of 8",
// and a 3 px line for the whole course's progress. Replaces the Open edX header inside the player.
export const PlayerTopBar = ({
  courseTitle, courseHref, unitIndex, unitCount, progress, outlineOpen, onToggleOutline,
}) => {
  const intl = useClassroomIntl();
  const Link = useLinkComponent();
  const pct = progress == null ? null : clamp(progress);
  return (
    <header className="cls-player-bar" aria-label={intl.formatMessage(messages.playerLabel)}>
      <div className="cls-player-bar__row">
        <Link className="cls-player-bar__back" href={courseHref} aria-label={intl.formatMessage(messages.playerBackLabel)}>
          <KitIcon src={ArrowBack} />
          <span className="cls-player-bar__back-text">{intl.formatMessage(messages.playerBack)}</span>
        </Link>
        {onToggleOutline && (
          <button
            type="button"
            className="cls-icon-btn cls-player-bar__outline"
            aria-label={intl.formatMessage(messages.playerOutline)}
            aria-expanded={Boolean(outlineOpen)}
            onClick={onToggleOutline}
          >
            <KitIcon src={MenuBook} />
          </button>
        )}
        <p className="cls-player-bar__title" title={courseTitle}>{courseTitle}</p>
        {unitCount > 0 && unitIndex > 0 && (
          <p className="cls-player-bar__count cls-num">{intl.formatMessage(messages.unitOf, { i: unitIndex, n: unitCount })}</p>
        )}
      </div>
      {pct != null && (
        <div
          className="cls-player-bar__progress"
          role="progressbar"
          aria-label={intl.formatMessage(messages.playerProgress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
        >
          <span style={{ width: `${pct}%` }} />
        </div>
      )}
    </header>
  );
};

PlayerTopBar.propTypes = {
  courseTitle: PropTypes.string.isRequired,
  courseHref: PropTypes.string.isRequired,
  unitIndex: PropTypes.number,
  unitCount: PropTypes.number,
  progress: PropTypes.number,
  outlineOpen: PropTypes.bool,
  onToggleOutline: PropTypes.func,
};

// S-76 unit heading: small section name above the unit title (H1 30, doc 04 §6.6).
export const UnitTitle = ({ title, section }) => (
  <div className="cls-unit-title">
    {section && <p className="cls-unit-title__section">{section}</p>}
    <h1>{title}</h1>
  </div>
);

UnitTitle.propTypes = { title: PropTypes.string.isRequired, section: PropTypes.string };
