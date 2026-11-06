import { useEffect, useId, useRef } from 'react';
import PropTypes from 'prop-types';
import { PauseCircle } from '@openedx/paragon/icons';

import { messages, useClassroomIntl } from '../i18n';
import KitIcon from './KitIcon';

// F-117 "Are you still there?" (warning, 60 s countdown) → "Paused — continue when ready".
// Modal: focus on the one button, Tab stays inside, announced as an alert dialog.
const IdleDialog = ({ state, secondsLeft = 0, onResume }) => {
  const intl = useClassroomIntl();
  const titleId = useId();
  const bodyId = useId();
  const button = useRef(null);
  const open = state === 'warning' || state === 'paused';

  useEffect(() => {
    if (!open) { return undefined; }
    const back = document.activeElement;
    button.current?.focus();
    const onKey = (event) => {
      if (event.key === 'Tab') { event.preventDefault(); button.current?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (back && document.contains(back) && back.focus) { back.focus(); }
    };
  }, [open, state]);

  if (!open) { return null; }
  const paused = state === 'paused';
  return (
    <div className="cls-idle" role="presentation">
      <div className="cls-idle__box" role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={bodyId}>
        {paused && <KitIcon src={PauseCircle} size={40} className="cls-idle__icon" />}
        <h2 id={titleId} className="cls-idle__title">{intl.formatMessage(paused ? messages.pausedTitle : messages.idleTitle)}</h2>
        <p id={bodyId} className="cls-idle__body">
          {paused
            ? intl.formatMessage(messages.pausedBody)
            : intl.formatMessage(messages.idleBody, { n: secondsLeft })}
        </p>
        <button ref={button} type="button" className="cls-btn cls-btn--primary" onClick={onResume}>
          {intl.formatMessage(paused ? messages.pausedContinue : messages.idleHere)}
        </button>
      </div>
    </div>
  );
};

IdleDialog.propTypes = {
  state: PropTypes.oneOf(['active', 'warning', 'paused']).isRequired,
  secondsLeft: PropTypes.number,
  onResume: PropTypes.func.isRequired,
};

export default IdleDialog;
