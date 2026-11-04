import PropTypes from 'prop-types';

import { useClassroomIntl, messages } from '../i18n';

const LABELS = {
  on_track: messages.statusOnTrack,
  due_soon: messages.statusDueSoon,
  overdue: messages.statusOverdue,
  completed: messages.statusCompleted,
  not_started: messages.statusNotStarted,
};

export const STATUSES = Object.keys(LABELS);

// Always text + colour, never colour only (doc 04 §5.7).
const StatusPill = ({ status }) => {
  const intl = useClassroomIntl();
  const key = LABELS[status] ? status : 'not_started';
  return <span className={`cls-pill cls-pill--${key}`}>{intl.formatMessage(LABELS[key])}</span>;
};

StatusPill.propTypes = { status: PropTypes.oneOf(STATUSES).isRequired };

export default StatusPill;
