import PropTypes from 'prop-types';

import {
  formatDate, formatHours, kitLanguage, localized, messages, useClassroomIntl,
} from '../i18n';
import { Notice, Skeleton } from '../components/Feedback';
import { ProgressRing } from '../components/Progress';
import { NO_ACCESS } from './HomeView';

// S-73 CE hours (doc 04 §6.4, F-97). Data = CA-06 `data`.
const HoursView = ({
  data, status = 'loading', error, year, onYearChange, onRetry,
}) => {
  const intl = useClassroomIntl();
  const { locale } = intl;
  const be = (y) => (kitLanguage(locale) === 'th' ? y + 543 : y);
  const code = status === 'error' ? (error?.code || 'unavailable') : null;
  const shownYear = data?.year ?? year;
  const years = data?.years_available?.length ? data.years_available : [shownYear].filter(Boolean);

  let body = null;
  if (status === 'loading' && !data) {
    body = <div className="cls-stack" aria-busy="true"><Skeleton height={140} radius={14} /><Skeleton height={200} radius={14} /></div>;
  } else if (data) {
    const reached = data.earned >= data.target;
    const [earned, target] = [formatHours(data.earned, locale), formatHours(data.target, locale)];
    const value = intl.formatMessage(messages.hoursValue, { earned, target });
    const pct = data.target > 0 ? (data.earned / data.target) * 100 : 100;
    const left = formatHours(data.remaining ?? data.target - data.earned, locale);
    const note = reached
      ? intl.formatMessage(messages.hoursReached)
      : intl.formatMessage(messages.hoursToGo, { n: left, date: formatDate(data.year_ends, locale) });
    body = (
      <>
        <section className="cls-panel cls-hours-hero">
          <ProgressRing value={pct} size={120} gold={reached} label={value}>{`${earned} / ${target}`}</ProgressRing>
          <div>
            <p className="cls-hours__big cls-num">{value}</p>
            <p className="cls-hours__note">{note}</p>
          </div>
        </section>
        <section className="cls-panel" aria-labelledby="cls-hours-list">
          <h2 id="cls-hours-list" className="cls-panel-title">{intl.formatMessage(messages.hoursListTitle)}</h2>
          {data.items.length ? (
            <table className="cls-table">
              <thead>
                <tr>
                  <th scope="col">{intl.formatMessage(messages.hoursColDate)}</th>
                  <th scope="col">{intl.formatMessage(messages.hoursColCourse)}</th>
                  <th scope="col" className="cls-num-col">{intl.formatMessage(messages.hoursColHours)}</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((i) => (
                  <tr key={i.course_key}>
                    <td className="cls-num">{formatDate(i.passed_on, locale)}</td>
                    <td>{localized(i.title, locale)}</td>
                    <td className="cls-num cls-num-col">{formatHours(i.hours, locale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="cls-muted">{intl.formatMessage(messages.hoursNone, { year: be(data.year) })}</p>}
          <p className="cls-footnote">{intl.formatMessage(messages.hoursFootnote)}</p>
        </section>
      </>
    );
  }

  return (
    <main className="cls-page cls-root" id="main-content">
      <header className="cls-page-head cls-page-head--row">
        <h1>{intl.formatMessage(messages.hoursPageTitle)}</h1>
        {years.length > 1 && (
          <span className="cls-seg cls-seg--lg" role="group" aria-label={intl.formatMessage(messages.hoursYearGroup)}>
            {years.map((y) => (
              <button key={y} type="button" aria-pressed={y === shownYear} onClick={() => y !== shownYear && onYearChange?.(y)}>
                {be(y)}
              </button>
            ))}
          </span>
        )}
      </header>
      {code && NO_ACCESS.includes(code) && (
        <section className="cls-panel cls-noaccess" role="status">
          <h2>{intl.formatMessage(messages.noAccessTitle)}</h2>
          <p>{intl.formatMessage(messages.noAccess)}</p>
        </section>
      )}
      {code && !NO_ACCESS.includes(code) && (
        <Notice onRetry={onRetry}>{intl.formatMessage(messages.unavailable)}</Notice>
      )}
      <div className="cls-stack cls-stack--lg">{body}</div>
    </main>
  );
};

HoursView.propTypes = {
  data: PropTypes.shape({
    year: PropTypes.number,
    earned: PropTypes.number,
    target: PropTypes.number,
    remaining: PropTypes.number,
    year_ends: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.shape({})),
    years_available: PropTypes.arrayOf(PropTypes.number),
  }),
  status: PropTypes.oneOf(['loading', 'ready', 'refreshing', 'error']),
  error: PropTypes.shape({ code: PropTypes.string }),
  year: PropTypes.number,
  onYearChange: PropTypes.func,
  onRetry: PropTypes.func,
};

export default HoursView;
