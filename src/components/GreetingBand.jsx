import PropTypes from 'prop-types';

import {
  formatHours, greetingKey, messages, useClassroomIntl,
} from '../i18n';

// "Good morning, Nok" + one summary line (doc 04 §5.3, F-90 §2). Summary = CA-03 `summary`.
const GreetingBand = ({ firstName, summary, now }) => {
  const intl = useClassroomIntl();
  const { locale } = intl;
  const parts = [];
  if (summary?.overdue > 0) {
    parts.push(<b key="late" className="cls-greet__late">{intl.formatMessage(messages.summaryOverdue, { n: summary.overdue })}</b>);
  }
  if (summary?.due_this_month > 0) {
    parts.push(<span key="month">{intl.formatMessage(messages.summaryDueMonth, { n: summary.due_this_month })}</span>);
  }
  if (summary && summary.ce_target_hours != null) {
    parts.push(
      <span key="hours" className="cls-num">
        {intl.formatMessage(messages.summaryHours, {
          earned: formatHours(summary.ce_hours, locale), target: formatHours(summary.ce_target_hours, locale),
        })}
      </span>,
    );
  }
  if (summary && !summary.overdue && !summary.due_this_month && !summary.due_soon) {
    parts.unshift(<span key="done">{intl.formatMessage(messages.summaryAllDone)}</span>);
  }
  return (
    <div className="cls-greet">
      <h1>{intl.formatMessage(messages[greetingKey(now)], { name: firstName })}</h1>
      {parts.length > 0 && <p>{parts}</p>}
    </div>
  );
};

GreetingBand.propTypes = {
  firstName: PropTypes.string.isRequired,
  summary: PropTypes.shape({
    overdue: PropTypes.number,
    due_soon: PropTypes.number,
    due_this_month: PropTypes.number,
    ce_hours: PropTypes.number,
    ce_target_hours: PropTypes.number,
  }),
  now: PropTypes.instanceOf(Date),
};

export default GreetingBand;
