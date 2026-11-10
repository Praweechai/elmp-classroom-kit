import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { GridView, Search, ViewList } from '@openedx/paragon/icons';

import { localized, messages, useClassroomIntl } from '../i18n';
import CourseCard2, { categoryLabel } from '../components/CourseCard2';
import { Notice, Skeleton } from '../components/Feedback';
import KitIcon from '../components/KitIcon';
import PageStrip from '../components/PageStrip';
import { toCard } from './MyLearningView';

// S-101 Courses (F-132): page strip, status chips (All / Not started / In progress / Completed), name filter,
// category pills, grid/list. Part 1 = CA-11 courses (enrolled + required). Part 2 = CA-15 `catalogue`
// (adds open courses, covers, hours). `initialQuery` / `initialCategory` come from the top-bar search and
// the Explore menu (the fork reads ?q= and ?category=).

const DAY = 86400000;
const STATUS_FILTERS = [
  ['all', messages.mlAll],
  ['not_started', messages.statusNotStarted],
  ['in_progress', messages.statusInProgress],
  ['completed', messages.statusCompleted],
];
// overdue / due soon / almost done all count as "In progress" for the status filter.
export const statusGroup = (status) => (['completed', 'not_started'].includes(status) ? status : 'in_progress');

// CA-15 entry → CourseCard2 props.
export const entryToCard = (e, { locale, now = new Date() }) => {
  let status = e.learner_status || 'not_started';
  const left = e.due_at ? (new Date(e.due_at).getTime() - now.getTime()) / DAY : null;
  if (status === 'in_progress' && left !== null && left >= 0 && left <= 7) { status = 'due_soon'; }
  return {
    code: e.code,
    title: localized(e.title, locale),
    category: e.category,
    coverUrl: e.cover_url || undefined,
    colour: e.colour || undefined,
    required: Boolean(e.required),
    status,
    progress: e.progress_pct || 0,
    units: e.units_total,
    hours: e.hours,
    dueAt: e.due_at || undefined,
    lastActivityAt: e.last_activity_at || undefined,
    href: e.href,
  };
};

const catKey = (c) => (typeof c.category === 'object' ? c.category?.key : c.category) || 'general';

const CoursesView = ({
  dashboard, catalogue, status = 'ready', now, onRetry, initialQuery = '', initialCategory = 'all',
}) => {
  const intl = useClassroomIntl();
  const t = (m, v) => intl.formatMessage(m, v);
  const [group, setGroup] = useState('all');
  const [q, setQ] = useState(initialQuery);
  const [cat, setCat] = useState(initialCategory || 'all');
  const [layout, setLayout] = useState('grid');

  const cards = useMemo(() => {
    if (catalogue) { return catalogue.map((e) => entryToCard(e, { locale: intl.locale, now })); }
    const d = dashboard || {};
    return (d.courses || []).map((c) => toCard(c, {
      deadline: (d.deadlines || []).find((x) => x.course_key === c.course_key),
      locale: intl.locale,
    }));
  }, [dashboard, catalogue, intl.locale, now]);

  const strip = (
    <PageStrip id="cls3-courses-strip" title={t(messages.shell3Courses)}>{t(messages.pageCoursesIntro)}</PageStrip>
  );
  if (status === 'loading') {
    return (
      <div className="cls3-page" aria-busy="true">
        {strip}
        <div className="cls3-cards cls3-cards--grid">{[0, 1, 2, 3].map((i) => <Skeleton key={i} height={300} radius={16} />)}</div>
      </div>
    );
  }

  const categories = [...new Map(cards.map((c) => [catKey(c), categoryLabel(c.category, intl)])).entries()];
  const needle = q.trim().toLowerCase();
  const shown = cards
    .filter((c) => group === 'all' || statusGroup(c.status) === group)
    .filter((c) => cat === 'all' || catKey(c) === cat)
    .filter((c) => !needle || `${c.title} ${c.code || ''}`.toLowerCase().includes(needle))
    // required first, then A–Z: the training HR asked for stays on top
    .sort((a, b) => (Number(b.required) - Number(a.required)) || a.title.localeCompare(b.title));
  const filtered = group !== 'all' || cat !== 'all' || needle;

  return (
    <div className="cls3-page">
      {strip}
      {status === 'error' && <Notice onRetry={onRetry}>{t(messages.notAvailable)}</Notice>}

      <div className="cls3-toolbar">
        <div className="cls3-pills" role="group" aria-label={t(messages.coursesFilterStatus)}>
          {STATUS_FILTERS.map(([k, m]) => (
            <button key={k} type="button" className="cls3-pill" aria-pressed={group === k} onClick={() => setGroup(k)}>
              {t(m)}
            </button>
          ))}
        </div>
        <div className="cls3-controls">
          <label className="cls3-filter" htmlFor="cls3-courses-q">
            <KitIcon src={Search} size={18} />
            <span className="cls-sr">{t(messages.coursesFilterLabel)}</span>
            <input
              id="cls3-courses-q"
              type="search"
              value={q}
              placeholder={t(messages.coursesFilter)}
              onChange={(e) => setQ(e.target.value)}
            />
          </label>
          <div className="cls3-toggle" role="group" aria-label={t(messages.mlView)}>
            {[['grid', GridView, messages.mlGrid], ['list', ViewList, messages.mlList]].map(([k, icon, m]) => (
              <button key={k} type="button" aria-pressed={layout === k} aria-label={t(m)} onClick={() => setLayout(k)}>
                <KitIcon src={icon} size={18} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {categories.length > 1 && (
        <div className="cls3-pills cls3-pills--quiet" role="group" aria-label={t(messages.mlFilters)}>
          {[['all', t(messages.mlAll)], ...categories].map(([k, label]) => (
            <button key={k} type="button" className="cls3-pill" aria-pressed={cat === k} onClick={() => setCat(k)}>
              {label}
            </button>
          ))}
        </div>
      )}

      <p className="cls3-count" role="status">{t(messages.coursesCount, { n: shown.length })}</p>
      {shown.length > 0 ? (
        <div className={`cls3-cards cls3-cards--${layout} cls3-cards--wide`}>
          {shown.map((c) => <CourseCard2 key={c.href || c.code} {...c} layout={layout} now={now} />)}
        </div>
      ) : (
        <div className="cls3-empty">
          <p>{t(messages.coursesEmpty)}</p>
          {filtered && (
            <button
              type="button"
              className="cls-btn cls-btn--secondary cls-btn--sm"
              onClick={() => { setGroup('all'); setCat('all'); setQ(''); }}
            >
              {t(messages.coursesClear)}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

CoursesView.propTypes = {
  dashboard: PropTypes.shape({
    courses: PropTypes.arrayOf(PropTypes.shape({})),
    deadlines: PropTypes.arrayOf(PropTypes.shape({})),
  }),
  catalogue: PropTypes.arrayOf(PropTypes.shape({ course_key: PropTypes.string })), // CA-15 (Part 2)
  status: PropTypes.oneOf(['loading', 'ready', 'error']),
  now: PropTypes.instanceOf(Date),
  onRetry: PropTypes.func,
  initialQuery: PropTypes.string,
  initialCategory: PropTypes.string,
};

export default CoursesView;
