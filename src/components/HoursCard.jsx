import PropTypes from 'prop-types';

import {
  formatDate, formatHours, kitLanguage, messages, useClassroomIntl,
} from '../i18n';
import { useLinkComponent } from './LinkContext';
import { ProgressRing } from './Progress';

// CE hours this year (doc 04 §6.1 side card, F-97). Takes CA-06 fields.
const HoursCard = ({
  year, earned, target, yearEnds, href,
}) => {
  const intl = useClassroomIntl();
  const Link = useLinkComponent();
  const { locale } = intl;
  const pct = target > 0 ? (earned / target) * 100 : 100;
  const reached = earned >= target;
  const remaining = Math.max(0, target - earned);
  const shownYear = kitLanguage(locale) === 'th' ? year + 543 : year;
  const [earnedText, targetText] = [formatHours(earned, locale), formatHours(target, locale)];
  const value = intl.formatMessage(messages.hoursValue, { earned: earnedText, target: targetText });
  const title = intl.formatMessage(messages.hoursTitle, { year: shownYear });
  const note = reached
    ? intl.formatMessage(messages.hoursReached)
    : intl.formatMessage(messages.hoursToGo, { n: formatHours(remaining, locale), date: formatDate(yearEnds, locale) });

  return (
    <section className="cls-panel cls-hours-card" aria-label={title}>
      <p className="cls-kicker">{href ? <Link href={href}>{title}</Link> : title}</p>
      <div className="cls-hours">
        <ProgressRing value={pct} size={56} gold={reached} label={value}>
          {`${Math.min(100, Math.round(pct))}%`}
        </ProgressRing>
        <div>
          <p className="cls-hours__big cls-num">{earnedText} <small>/ {targetText} h</small></p>
          <p className="cls-hours__note">{note}</p>
        </div>
      </div>
    </section>
  );
};

HoursCard.propTypes = {
  year: PropTypes.number.isRequired,
  earned: PropTypes.number.isRequired,
  target: PropTypes.number.isRequired,
  yearEnds: PropTypes.string,
  href: PropTypes.string,
};

export default HoursCard;
