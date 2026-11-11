import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Search } from '@openedx/paragon/icons';

import {
  formatDate, localized, messages, useClassroomIntl,
} from '../i18n';
import { pctOf } from '../components/Dashboard';
import CourseCover, { CATEGORIES } from '../components/CourseCover';
import { StatusChip } from '../components/CourseCard2';
import { Notice, Skeleton } from '../components/Feedback';
import KitIcon from '../components/KitIcon';
import {
  STATUS_TONES, TONE_LABEL, statusTone, usePageEnter,
} from '../components/Learner21';
import { useLinkComponent } from '../components/LinkContext';
import PageStrip from '../components/PageStrip';

// S-102 Grades 2.1 (Learner v2, doc 10 V-1.03): NetAcad "learning history" rows — one row per course with
// started / due / completed / best score / status, search, status filter and sort. CA-16 (`grades`) gives the
// dates, best score and the graded parts ("Details" opens them); without CA-16 the rows come from CA-11 only
// (score + status + due date; dates the Portal does not know show "—").

const KIND = { quiz: messages.grKindQuiz, activity: messages.grKindActivity, exam: messages.grKindExam };
const SORTS = { recent: messages.mlSortRecent, due: messages.mlSortDue, name: messages.mlSortTitle };
const pct = (score, max) => Math.round((score / max) * 100);

// CA-11 courses + CA-11 deadlines + CA-16 rows → one list (CA-16-only courses are kept too).
export const gradeRows = ({ dashboard, grades, locale }) => {
  const d = dashboard || {};
  const byKey = Object.fromEntries((grades?.courses || []).map((g) => [g.course_key, g]));
  const due = Object.fromEntries((d.deadlines || []).map((x) => [x.course_key, x.due_at]));
  const rows = (d.courses || []).map((c) => {
    const g = byKey[c.course_key] || {};
    delete byKey[c.course_key];
    return {
      key: c.course_key,
      code: c.code,
      title: localized(g.title || c.title, locale),
      category: c.category,
      required: Boolean(c.required),
      status: c.status === 'passed' ? 'completed' : (c.status || 'not_started'),
      progress: c.status === 'completed' ? 100 : pctOf(c.units_done, c.units_total),
      href: c.resume_href || c.href,
      score: g.grade_pct ?? c.score_pct ?? null,
      startedAt: g.started_at || null,
      dueAt: g.due_at || due[c.course_key] || null,
      completedAt: g.completed_at || null,
      lastActivityAt: c.last_activity_at || null,
      parts: g.parts || [],
    };
  });
  Object.values(byKey).forEach((g) => rows.push({
    key: g.course_key,
    code: g.code,
    title: localized(g.title, locale),
    required: false,
    status: (g.passed && 'completed') || (g.started_at ? 'in_progress' : 'not_started'),
    progress: g.passed ? 100 : 0,
    score: g.grade_pct ?? null,
    startedAt: g.started_at || null,
    dueAt: g.due_at || null,
    completedAt: g.completed_at || null,
    parts: g.parts || [],
  }));
  return rows;
};

const sorters = {
  recent: (a, b) => (b.completedAt || b.startedAt || b.lastActivityAt || '').localeCompare(a.completedAt || a.startedAt || a.lastActivityAt || ''),
  due: (a, b) => (a.dueAt || '9999').localeCompare(b.dueAt || '9999'),
  name: (a, b) => a.title.localeCompare(b.title),
};

const PartsTable = ({ row, passMark }) => {
  const intl = useClassroomIntl();
  const t = (m, v) => intl.formatMessage(m, v);
  return (
    <div className="cls3-table-wrap">
      <table className="cls3-table">
        <caption className="cls-sr">{row.title}</caption>
        <thead>
          <tr>
            <th scope="col">{t(messages.grColAssessment)}</th>
            <th scope="col">{t(messages.grColType)}</th>
            <th scope="col">{t(messages.colScore)}</th>
            <th scope="col">{t(messages.grColAttempts)}</th>
            <th scope="col">{t(messages.grColPercent)}</th>
          </tr>
        </thead>
        <tbody>
          {row.parts.map((p) => {
            const graded = p.score != null;
            const percent = graded ? pct(p.score, p.max) : null;
            const ok = p.passed ?? percent >= passMark;
            return (
              <tr key={p.block_id}>
                <th scope="row">{localized(p.name, intl.locale)}</th>
                <td>{KIND[p.kind] ? t(KIND[p.kind]) : p.kind}</td>
                <td className="cls-num">{graded ? `${p.score} / ${p.max}` : t(messages.grPending)}</td>
                <td className="cls-num">{p.attempts ?? 0}</td>
                <td>{graded ? <span className={`cls3-chip cls3-tone--${ok ? 'done' : 'overdue'}`}>{`${percent}%`}</span> : '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
PartsTable.propTypes = {
  row: PropTypes.shape({ title: PropTypes.string, parts: PropTypes.arrayOf(PropTypes.shape({})) }).isRequired,
  passMark: PropTypes.number.isRequired,
};

const GradeRow = ({ row, passMark, index }) => {
  const intl = useClassroomIntl();
  const Link = useLinkComponent();
  const t = (m, v) => intl.formatMessage(m, v);
  const [open, setOpen] = useState(false);
  const tone = statusTone(row.status);
  const date = (v) => (v ? formatDate(v, intl.locale) : '—');
  const late = tone === 'overdue';
  const detailsId = `cls3-gr-more-${row.code || index}`;
  return (
    <li className={`cls3-row cls3-tone--${tone} cls3-lift cls3-rise`}>
      <div className="cls3-row__thumb" aria-hidden="true">
        <CourseCover category={CATEGORIES.includes(row.category) ? row.category : 'general'} code={row.code} />
      </div>
      <div className="cls3-row__main">
        <div className="cls3-row__kind">
          {row.code && <span className="cls3-code">{row.code}</span>}
          <span className={`cls3-req-tag${row.required ? '' : ' cls3-req-tag--opt'}`}>
            {t(row.required ? messages.cardRequired : messages.v2Optional)}
          </span>
        </div>
        {row.href ? <Link className="cls3-row__title" href={row.href}>{row.title}</Link> : <span className="cls3-row__title">{row.title}</span>}
        {row.progress > 0 && (
          <div className="cls-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={row.progress} aria-label={row.title}>
            <i style={{ width: `${row.progress}%` }} />
          </div>
        )}
        {row.parts.length > 0 && (
          <button type="button" className="cls3-linkbtn" aria-expanded={open} aria-controls={detailsId} onClick={() => setOpen(!open)}>
            {t(open ? messages.v2HideDetails : messages.v2Details)}
          </button>
        )}
      </div>
      <div className="cls3-row__col cls3-col-start"><span>{t(messages.v2Started)}</span><b>{date(row.startedAt)}</b></div>
      <div className="cls3-row__col cls3-col-due"><span>{t(messages.v2Due)}</span><b className={late ? 'is-late' : undefined}>{date(row.dueAt)}</b></div>
      <div className="cls3-row__col cls3-col-done"><span>{t(messages.v2Completed)}</span><b>{date(row.completedAt)}</b></div>
      <div className="cls3-row__col cls3-col-score">
        <span>{t(messages.v2BestScore)}</span>
        <b className="cls3-row__score">
          {row.score == null ? '—' : <>{`${row.score}%`}<small>{t(messages.v2PassMark, { pct: passMark })}</small></>}
        </b>
      </div>
      <div className="cls3-row__col cls3-col-status"><span>{t(messages.v2Status)}</span><StatusChip status={row.status} /></div>
      <div className="cls3-row__mobile" aria-hidden="true">
        {row.dueAt && <span>{`${t(messages.v2Due)}: ${date(row.dueAt)}`}</span>}
        {row.completedAt && <span>{`${t(messages.v2Completed)}: ${date(row.completedAt)}`}</span>}
        {row.score != null && <span>{`${t(messages.v2BestScore)}: ${row.score}%`}</span>}
      </div>
      {open && <div className="cls3-row__more" id={detailsId}><PartsTable row={row} passMark={passMark} /></div>}
    </li>
  );
};
GradeRow.propTypes = {
  row: PropTypes.shape({
    code: PropTypes.string,
    title: PropTypes.string,
    category: PropTypes.string,
    required: PropTypes.bool,
    status: PropTypes.string,
    progress: PropTypes.number,
    href: PropTypes.string,
    score: PropTypes.number,
    startedAt: PropTypes.string,
    dueAt: PropTypes.string,
    completedAt: PropTypes.string,
    parts: PropTypes.arrayOf(PropTypes.shape({})),
  }).isRequired,
  passMark: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired,
};

const GradesView = ({
  dashboard, grades, status = 'ready', passMark = 60, onRetry,
}) => {
  const intl = useClassroomIntl();
  const t = (m, v) => intl.formatMessage(m, v);
  const [q, setQ] = useState('');
  const [tone, setTone] = useState('all');
  const [sort, setSort] = useState('recent');
  const pageRef = usePageEnter([status]);
  const rows = useMemo(() => gradeRows({ dashboard, grades, locale: intl.locale }), [dashboard, grades, intl.locale]);

  const intro = <PageStrip id="cls3-grades-strip" title={t(messages.shell3Grades)}>{t(messages.v2GradesSub)}</PageStrip>;
  if (status === 'loading') {
    return (
      <div className="cls3-v2" aria-busy="true">
        {intro}
        {[0, 1, 2].map((i) => <Skeleton key={i} height={118} radius={16} />)}
      </div>
    );
  }
  const needle = q.trim().toLowerCase();
  const shown = rows
    .filter((r) => tone === 'all' || statusTone(r.status) === tone)
    .filter((r) => !needle || `${r.title} ${r.code || ''}`.toLowerCase().includes(needle))
    .sort(sorters[sort]);

  return (
    <div className="cls3-v2" ref={pageRef}>
      {intro}
      {status === 'error' && <Notice onRetry={onRetry}>{t(messages.notAvailable)}</Notice>}
      {status !== 'error' && (
        <>
          <div className="cls3-filters">
            <label className="cls3-field" htmlFor="cls3-gr-q">
              <KitIcon src={Search} size={18} />
              <span className="cls-sr">{t(messages.v2Search)}</span>
              <input id="cls3-gr-q" type="search" value={q} placeholder={t(messages.v2Search)} onChange={(e) => setQ(e.target.value)} />
            </label>
            <div className="cls3-filters__end">
              <label className="cls3-sel-label" htmlFor="cls3-gr-status">{t(messages.v2Status)}</label>
              <select id="cls3-gr-status" className="cls3-sel" value={tone} onChange={(e) => setTone(e.target.value)}>
                <option value="all">{t(messages.mlAll)}</option>
                {STATUS_TONES.map((k) => <option key={k} value={k}>{t(TONE_LABEL[k])}</option>)}
              </select>
              <label className="cls-sr" htmlFor="cls3-gr-sort">{t(messages.mlSort)}</label>
              <select id="cls3-gr-sort" className="cls3-sel" value={sort} onChange={(e) => setSort(e.target.value)}>
                {Object.entries(SORTS).map(([k, m]) => <option key={k} value={k}>{t(m)}</option>)}
              </select>
            </div>
          </div>
          <p className="cls3-count" role="status">{t(messages.coursesCount, { n: shown.length })}</p>
          {shown.length > 0 ? (
            <ul className="cls3-rows">
              {shown.map((r, i) => <GradeRow key={r.key} row={r} passMark={passMark} index={i} />)}
            </ul>
          ) : <p className="cls3-empty">{t(rows.length ? messages.coursesEmpty : messages.grEmpty)}</p>}
        </>
      )}
    </div>
  );
};

GradesView.propTypes = {
  dashboard: PropTypes.shape({ // CA-11
    courses: PropTypes.arrayOf(PropTypes.shape({})),
    deadlines: PropTypes.arrayOf(PropTypes.shape({})),
  }),
  grades: PropTypes.shape({ // CA-16: course rows with dates + parts
    courses: PropTypes.arrayOf(PropTypes.shape({})),
  }),
  status: PropTypes.oneOf(['loading', 'ready', 'error']),
  passMark: PropTypes.number,
  onRetry: PropTypes.func,
};

export default GradesView;
