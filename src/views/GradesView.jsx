import PropTypes from 'prop-types';
import { HourglassEmpty, Grading, TrendingUp } from '@openedx/paragon/icons';

import { localized, messages, useClassroomIntl } from '../i18n';
import { StatRing, pctOf } from '../components/Dashboard';
import { Notice, Skeleton } from '../components/Feedback';
import { useLinkComponent } from '../components/LinkContext';
import PageStrip from '../components/PageStrip';

// S-102 Grades (F-133): page strip, three stat cards (average, graded items, pending), then tables.
// Part 2 (CA-16 `grades`): one table card per course with every graded part (NetAcad arrangement).
// Part 1 (CA-11 only): one table of courses — grade, pass mark, status — and a "See details" link to the
// course's own progress page (the per-part scores live there until CA-16).

const KIND = { quiz: messages.grKindQuiz, activity: messages.grKindActivity, exam: messages.grKindExam };
const avg = (list) => (list.length ? Math.round(list.reduce((s, v) => s + v, 0) / list.length) : null);
const pct = (score, max) => Math.round((score / max) * 100);

const ResultChip = ({ ok, children }) => (
  <span className={`cls3-chip cls3-chip--${ok ? 'done' : 'late'}`}>{children}</span>
);
ResultChip.propTypes = { ok: PropTypes.bool, children: PropTypes.node };

// Course status in words: Passed / Almost done / In progress / Not yet.
const CourseResult = ({ passed, status }) => {
  const intl = useClassroomIntl();
  if (passed === true || status === 'completed' || status === 'passed') {
    return <span className="cls3-chip cls3-chip--done">{intl.formatMessage(messages.statusPassed)}</span>;
  }
  if (status === 'almost') {
    return <span className="cls3-chip cls3-chip--gold">{intl.formatMessage(messages.statusAlmost)}</span>;
  }
  if (passed === null) {
    return <span className="cls3-chip cls3-chip--ok">{intl.formatMessage(messages.statusInProgress)}</span>;
  }
  return <span className="cls3-chip cls3-chip--plain">{intl.formatMessage(messages.grNotYet)}</span>;
};
CourseResult.propTypes = { passed: PropTypes.bool, status: PropTypes.string };

const StatCards = ({ average, graded, pending }) => {
  const intl = useClassroomIntl();
  const t = (m, v) => intl.formatMessage(m, v);
  const total = graded + pending;
  return (
    <ul className="cls3-stats cls3-stats--3">
      <StatRing icon={TrendingUp} tone="green" label={t(messages.grAverage)} value={average == null ? '—' : `${average}%`} pct={average || 0} />
      <StatRing icon={Grading} tone="violet" label={t(messages.grGraded)} value={String(graded)} pct={pctOf(graded, total)} />
      <StatRing icon={HourglassEmpty} tone="gold" label={t(messages.grPending)} value={String(pending)} pct={pctOf(pending, total)} />
    </ul>
  );
};
StatCards.propTypes = {
  average: PropTypes.number, graded: PropTypes.number.isRequired, pending: PropTypes.number.isRequired,
};

const CourseTableCard = ({ course, passMark }) => {
  const intl = useClassroomIntl();
  const t = (m, v) => intl.formatMessage(m, v);
  const title = localized(course.title, intl.locale);
  const id = `cls3-gr-${course.code || course.course_key}`;
  return (
    <section className="cls-dcard cls3-table-card" aria-labelledby={id}>
      <div className="cls3-table-card__head">
        <h2 id={id}>{course.code && <span className="cls3-code">{course.code}</span>}{title}</h2>
        <div className="cls3-table-card__result">
          {course.grade_pct != null && <b>{t(messages.grCourseGrade, { pct: course.grade_pct })}</b>}
          <CourseResult passed={course.passed} />
        </div>
      </div>
      <div className="cls3-table-wrap">
        <table className="cls3-table">
          <caption className="cls-sr">{title}</caption>
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
            {(course.parts || []).map((p) => {
              const graded = p.score != null;
              const percent = graded ? pct(p.score, p.max) : null;
              return (
                <tr key={p.block_id}>
                  <th scope="row">{localized(p.name, intl.locale)}</th>
                  <td>{KIND[p.kind] ? t(KIND[p.kind]) : p.kind}</td>
                  <td className="cls-num">{graded ? `${p.score} / ${p.max}` : t(messages.grPending)}</td>
                  <td className="cls-num">{p.attempts ?? 0}</td>
                  <td>{graded ? <ResultChip ok={p.passed ?? percent >= passMark}>{`${percent}%`}</ResultChip> : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
CourseTableCard.propTypes = {
  course: PropTypes.shape({
    course_key: PropTypes.string,
    code: PropTypes.string,
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})]),
    grade_pct: PropTypes.number,
    passed: PropTypes.bool,
    parts: PropTypes.arrayOf(PropTypes.shape({})),
  }).isRequired,
  passMark: PropTypes.number.isRequired,
};

// Part 1: one row per CA-11 course.
const SummaryTable = ({ courses, passMark }) => {
  const intl = useClassroomIntl();
  const Link = useLinkComponent();
  const t = (m, v) => intl.formatMessage(m, v);
  return (
    <section className="cls-dcard cls3-table-card" aria-labelledby="cls3-gr-courses">
      <div className="cls3-table-card__head">
        <h2 id="cls3-gr-courses">{t(messages.grCourses)}</h2>
      </div>
      <div className="cls3-table-wrap">
        <table className="cls3-table">
          <thead>
            <tr>
              <th scope="col">{t(messages.course)}</th>
              <th scope="col">{t(messages.grColGrade)}</th>
              <th scope="col">{t(messages.grColPass)}</th>
              <th scope="col">{t(messages.colStatus)}</th>
              <th scope="col"><span className="cls-sr">{t(messages.grDetail)}</span></th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => {
              const title = localized(c.title, intl.locale);
              const detail = c.progress_href || c.href;
              return (
                <tr key={c.course_key}>
                  <th scope="row">{c.code && <span className="cls3-code">{c.code}</span>}{title}</th>
                  <td className="cls-num">{c.score_pct == null ? '—' : `${c.score_pct}%`}</td>
                  <td className="cls-num">{`${passMark}%`}</td>
                  <td><CourseResult status={c.status} passed={c.status === 'not_started' ? false : undefined} /></td>
                  <td>
                    {detail && (
                      <Link className="cls3-link" href={detail} aria-label={t(messages.actionLabel, { action: t(messages.grDetail), title })}>
                        {t(messages.grDetail)}
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="cls3-note">{t(messages.grPartOneNote)}</p>
    </section>
  );
};
SummaryTable.propTypes = {
  courses: PropTypes.arrayOf(PropTypes.shape({ course_key: PropTypes.string })).isRequired,
  passMark: PropTypes.number.isRequired,
};

const GradesView = ({
  dashboard, grades, status = 'ready', passMark = 60, onRetry,
}) => {
  const intl = useClassroomIntl();
  const t = (m, v) => intl.formatMessage(m, v);
  const strip = (
    <PageStrip id="cls3-grades-strip" title={t(messages.shell3Grades)}>{t(messages.pageGradesIntro, { pct: passMark })}</PageStrip>
  );
  if (status === 'loading') {
    return (
      <div className="cls3-page" aria-busy="true">
        {strip}
        <div className="cls3-stats cls3-stats--3">{[0, 1, 2].map((i) => <Skeleton key={i} height={88} radius={16} />)}</div>
        <Skeleton height={260} radius={16} />
      </div>
    );
  }

  let body;
  if (grades) {
    const parts = (grades.courses || []).flatMap((c) => c.parts || []);
    const graded = parts.filter((p) => p.score != null).length;
    body = (
      <>
        <StatCards average={grades.summary?.average_pct ?? null} graded={graded} pending={parts.length - graded} />
        {(grades.courses || []).length === 0 && <p className="cls3-empty">{t(messages.grEmpty)}</p>}
        {(grades.courses || []).map((c) => <CourseTableCard key={c.course_key} course={c} passMark={passMark} />)}
      </>
    );
  } else {
    const courses = (dashboard?.courses || []);
    const scored = courses.filter((c) => c.score_pct != null);
    body = (
      <>
        <StatCards
          average={avg(scored.map((c) => c.score_pct))}
          graded={scored.length}
          pending={courses.length - scored.length}
        />
        {courses.length === 0
          ? <p className="cls3-empty">{t(messages.grEmpty)}</p>
          : <SummaryTable courses={courses} passMark={passMark} />}
      </>
    );
  }

  return (
    <div className="cls3-page">
      {strip}
      {status === 'error' && <Notice onRetry={onRetry}>{t(messages.notAvailable)}</Notice>}
      {status !== 'error' && body}
    </div>
  );
};

GradesView.propTypes = {
  dashboard: PropTypes.shape({ courses: PropTypes.arrayOf(PropTypes.shape({})) }), // CA-11
  grades: PropTypes.shape({ // CA-16 data (Part 2)
    summary: PropTypes.shape({ average_pct: PropTypes.number }),
    courses: PropTypes.arrayOf(PropTypes.shape({})),
  }),
  status: PropTypes.oneOf(['loading', 'ready', 'error']),
  passMark: PropTypes.number,
  onRetry: PropTypes.func,
};

export default GradesView;
