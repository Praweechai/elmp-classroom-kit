import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  ArrowDownward, ArrowUpward, CheckCircle, ChevronRight, UnfoldMore,
} from '@openedx/paragon/icons';

import { localized, messages, useClassroomIntl } from '../i18n';
import KitIcon from './KitIcon';
import { useLinkComponent } from './LinkContext';

// Course status after the Plan 4 completion rule (F-111): completed only when every unit is done AND passed.
export const COURSE_STATUSES = ['completed', 'almost', 'in_progress', 'overdue', 'not_started'];

const STATUS_LABEL = {
  completed: messages.statusCompleted,
  almost: messages.statusAlmost,
  in_progress: messages.statusInProgress,
  overdue: messages.statusOverdue,
  not_started: messages.statusNotStarted,
};

export const coursePercent = (c) => {
  if (c.units_total > 0) { return Math.max(0, Math.min(100, Math.round((c.units_done / c.units_total) * 100))); }
  return Math.max(0, Math.min(100, Math.round(Number(c.progress_percent) || 0)));
};

export const CourseStatus = ({ status, unitsLeft }) => {
  const intl = useClassroomIntl();
  const key = STATUS_LABEL[status] ? status : 'not_started';
  const text = key === 'almost' && unitsLeft > 0
    ? intl.formatMessage(messages.almostLeft, { n: unitsLeft })
    : intl.formatMessage(STATUS_LABEL[key]);
  return (
    <span className={`cls-cstatus cls-cstatus--${key}`}>
      {key === 'completed' && <KitIcon src={CheckCircle} size={14} />}
      {text}
    </span>
  );
};

CourseStatus.propTypes = { status: PropTypes.oneOf(COURSE_STATUSES).isRequired, unitsLeft: PropTypes.number };

// Filter chips (F-114 §7): In progress also holds "Almost done" and "Overdue".
export const COURSE_FILTERS = {
  all: () => true,
  in_progress: (c) => ['in_progress', 'almost', 'overdue'].includes(c.status),
  not_started: (c) => c.status === 'not_started',
  completed: (c) => c.status === 'completed',
};

const FILTER_LABEL = {
  all: messages.filterAll,
  in_progress: messages.statusInProgress,
  not_started: messages.statusNotStarted,
  completed: messages.statusCompleted,
};

export const CourseFilters = ({ value, onChange, counts }) => {
  const intl = useClassroomIntl();
  return (
    <div className="cls-chips" role="group" aria-label={intl.formatMessage(messages.filterLabel)}>
      {Object.keys(COURSE_FILTERS).map((key) => (
        <button key={key} type="button" className="cls-chip" aria-pressed={value === key} onClick={() => onChange(key)}>
          {intl.formatMessage(FILTER_LABEL[key])}
          {counts && <span className="cls-chip__n cls-num">{counts[key]}</span>}
        </button>
      ))}
    </div>
  );
};

CourseFilters.propTypes = {
  value: PropTypes.oneOf(Object.keys(COURSE_FILTERS)).isRequired,
  onChange: PropTypes.func.isRequired,
  counts: PropTypes.objectOf(PropTypes.number),
};

const STATUS_ORDER = {
  overdue: 0, almost: 1, in_progress: 2, not_started: 3, completed: 4,
};

const SORTERS = {
  course: (a, b, lang) => a.titleText.localeCompare(b.titleText, lang),
  progress: (a, b) => a.pct - b.pct,
  score: (a, b) => (a.score_pct ?? -1) - (b.score_pct ?? -1),
  status: (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status],
};

const SortHeader = ({
  column, label, sort, onSort, className,
}) => {
  const intl = useClassroomIntl();
  const active = sort.key === column;
  let icon = UnfoldMore;
  if (active) { icon = sort.dir === 'asc' ? ArrowUpward : ArrowDownward; }
  return (
    <th scope="col" className={className} aria-sort={active ? `${sort.dir}ending` : undefined}>
      <button type="button" className="cls-sort" onClick={() => onSort(column)} aria-label={intl.formatMessage(messages.sortBy, { column: label })}>
        {label}<KitIcon src={icon} size={16} />
      </button>
    </th>
  );
};

SortHeader.propTypes = {
  column: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  sort: PropTypes.shape({ key: PropTypes.string, dir: PropTypes.string }).isRequired,
  onSort: PropTypes.func.isRequired,
  className: PropTypes.string,
};

// "My courses" table (doc 04-design §4): Course · Progress · Score · Status · ›. Phone: each row becomes a card (CSS).
const CourseTable = ({
  courses = [], filter = 'all', search = '', limit, caption,
}) => {
  const intl = useClassroomIntl();
  const Link = useLinkComponent();
  const [sort, setSort] = useState({ key: 'status', dir: 'asc' });
  const lang = intl.locale;

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = courses
      .map((c) => ({ ...c, titleText: localized(c.title, lang), pct: coursePercent(c) }))
      .filter(COURSE_FILTERS[filter] || COURSE_FILTERS.all)
      .filter((c) => !q || c.titleText.toLowerCase().includes(q) || (c.code || '').toLowerCase().includes(q));
    const by = SORTERS[sort.key];
    list.sort((a, b) => (sort.dir === 'asc' ? 1 : -1) * by(a, b, lang) || a.titleText.localeCompare(b.titleText, lang));
    return limit ? list.slice(0, limit) : list;
  }, [courses, filter, search, sort, lang, limit]);

  const onSort = (key) => setSort((s) => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }));

  if (!rows.length) { return <p className="cls-dempty">{intl.formatMessage(messages.noCoursesInFilter)}</p>; }

  return (
    <table className="cls-ctable">
      {caption && <caption className="cls-sr">{caption}</caption>}
      <thead>
        <tr>
          <SortHeader column="course" label={intl.formatMessage(messages.course)} sort={sort} onSort={onSort} />
          <SortHeader column="progress" label={intl.formatMessage(messages.progressLabel)} sort={sort} onSort={onSort} />
          <SortHeader column="score" label={intl.formatMessage(messages.colScore)} sort={sort} onSort={onSort} className="cls-ctable__score" />
          <SortHeader column="status" label={intl.formatMessage(messages.colStatus)} sort={sort} onSort={onSort} />
          <th scope="col"><span className="cls-sr">{intl.formatMessage(messages.openCourse, { title: '' }).trim()}</span></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((c) => {
          const unitsLeft = c.units_total > 0 ? Math.max(0, c.units_total - c.units_done) : 0;
          const meta = [
            c.units_total > 0 ? intl.formatMessage(messages.units, { n: c.units_total }) : null,
            c.required ? intl.formatMessage(messages.requiredShort) : null,
          ].filter(Boolean).join(' · ');
          return (
            <tr key={c.course_key} className={`cls-ctable__row cls-ctable__row--${c.status}`}>
              <td className="cls-ctable__course">
                <div className="cls-ctable__cell">
                  <span className={`cls-codechip cls-codechip--${c.category || 'general'}`} aria-hidden="true">{(c.code || c.titleText).slice(0, 2).toUpperCase()}</span>
                  <span className="cls-ctable__name">
                    {c.href ? <Link href={c.href} className="cls-ctable__title">{c.titleText}</Link> : <b className="cls-ctable__title">{c.titleText}</b>}
                    {meta && <small>{meta}</small>}
                  </span>
                </div>
              </td>
              <td className="cls-ctable__progress">
                <div className="cls-ctable__cell">
                  <span
                    className="cls-bar"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={c.pct}
                    aria-label={`${intl.formatMessage(messages.progressLabel)}: ${c.titleText}`}
                  >
                    <i style={{ width: `${c.pct}%` }} />
                  </span>
                  <span className="cls-num">{c.pct}%</span>
                </div>
              </td>
              <td className="cls-ctable__score cls-num">
                <span className="cls-ctable__label">{intl.formatMessage(messages.colScore)} </span>
                {c.score_pct == null ? '—' : <b>{Math.round(c.score_pct)}%</b>}
              </td>
              <td className="cls-ctable__status"><CourseStatus status={STATUS_LABEL[c.status] ? c.status : 'not_started'} unitsLeft={unitsLeft} /></td>
              <td className="cls-ctable__go" aria-hidden="true">{c.href && <KitIcon src={ChevronRight} size={20} />}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

CourseTable.propTypes = {
  courses: PropTypes.arrayOf(PropTypes.shape({
    course_key: PropTypes.string.isRequired,
    code: PropTypes.string,
    category: PropTypes.string,
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})]).isRequired,
    units_done: PropTypes.number,
    units_total: PropTypes.number,
    progress_percent: PropTypes.number,
    score_pct: PropTypes.number,
    status: PropTypes.string,
    required: PropTypes.bool,
    href: PropTypes.string,
  })),
  filter: PropTypes.oneOf(Object.keys(COURSE_FILTERS)),
  search: PropTypes.string,
  limit: PropTypes.number,
  caption: PropTypes.string,
};

export default CourseTable;
