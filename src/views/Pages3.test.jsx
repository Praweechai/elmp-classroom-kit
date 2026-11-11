import { fireEvent, screen, within } from '@testing-library/react';
import { axe } from 'jest-axe';

import {
  catalogue, compliance, grades, learningTime,
} from '../__fixtures__/classroom2';
import { certificates, dashboard } from '../__fixtures__/portal';
import { BANNED_WORDS, renderKit, visibleWords } from '../testUtils';
import CoursesView, { entryToCard, statusGroup } from './CoursesView';
import GradesView, { gradeRows } from './GradesView';
import ProgressView, { fallbackGroups } from './ProgressView';
import CertificatesView2 from './CertificatesView2';

// Plan 5 P5-2.03 — S-101 Courses, S-102 Grades, S-103 Progress, S-104 Certificates.
// Kit 2.1 (Learner v2 V-1.03): tone chips, Grades rows, Progress 'Am I up to date?'.
const now = new Date('2026-11-10T09:00:00+07:00');
const cardTitles = () => screen.getAllByRole('article').map((a) => within(a).getByRole('heading').textContent);

describe('CoursesView (S-101)', () => {
  const view = (props = {}, locale = 'en') => renderKit(<CoursesView dashboard={dashboard.data} now={now} {...props} />, { locale });

  it('Part 1: page strip, all CA-11 courses (required first), count; axe clean', async () => {
    const { container } = view();
    expect(screen.getByRole('heading', { name: 'Courses', level: 2 })).toBeInTheDocument();
    expect(screen.getByText('Your required training and every course you can take.')).toBeInTheDocument();
    expect(cardTitles()).toEqual([
      'Infection Control & Hand Hygiene', 'Patient Safety Basics', 'Fire Safety on the Ward', 'Hospital Regulations',
    ]);
    expect(screen.getByRole('status')).toHaveTextContent('4 courses');
    expect(await axe(container)).toHaveNoViolations();
  });

  it('status chips in the four D-92 tones; Required / Optional', () => {
    view();
    fireEvent.click(screen.getByRole('button', { name: 'In progress' }));
    expect(cardTitles()).toEqual(['Infection Control & Hand Hygiene']);
    expect(screen.getByRole('button', { name: 'In progress' })).toHaveClass('cls3-tone--progress');
    fireEvent.click(screen.getByRole('button', { name: 'Overdue' }));
    expect(cardTitles()).toEqual(['Patient Safety Basics']);
    fireEvent.click(screen.getByRole('button', { name: 'Completed' }));
    expect(cardTitles()).toEqual(['Hospital Regulations']);
    fireEvent.click(screen.getByRole('button', { name: 'To do' }));
    expect(cardTitles()).toEqual(['Fire Safety on the Ward']);
    fireEvent.click(screen.getAllByRole('button', { name: 'All' })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Required' }));
    expect(cardTitles()).toEqual(['Infection Control & Hand Hygiene', 'Patient Safety Basics']);
    fireEvent.click(screen.getByRole('button', { name: 'Optional' }));
    expect(cardTitles()).toEqual(['Fire Safety on the Ward', 'Hospital Regulations']);
  });

  it('name filter (title or code), empty state with Clear filters', () => {
    view({ initialQuery: 'psb' });
    expect(cardTitles()).toEqual(['Patient Safety Basics']);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Filter courses by name' }), { target: { value: 'zzz' } });
    expect(screen.getByText('No courses found.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getAllByRole('article')).toHaveLength(4);
  });

  it('Part 2 catalogue: open course shown, category from Explore, list view', () => {
    view({ catalogue: catalogue.data, initialCategory: 'emergency' });
    expect(cardTitles()).toEqual(['Fire Safety & Evacuation']);
    fireEvent.click(screen.getAllByRole('button', { name: 'All' })[2]); // category pills
    expect(screen.getAllByRole('article')).toHaveLength(4);
    fireEvent.click(screen.getByRole('button', { name: 'List view' }));
    expect(screen.getAllByRole('article')[0]).toHaveClass('cls3-course--list');
  });

  it('entryToCard: in_progress due within 7 days → due_soon; statusGroup', () => {
    const e = { ...catalogue.data[0], learner_status: 'in_progress', due_at: '2026-11-14T23:59:59+07:00' };
    expect(entryToCard(e, { locale: 'en', now }).status).toBe('due_soon');
    expect(entryToCard(catalogue.data[3], { locale: 'th', now }).title).toBe('ความปลอดภัยจากอัคคีภัยและการอพยพ');
    expect(['overdue', 'almost', 'due_soon', 'completed', 'not_started'].map(statusGroup))
      .toEqual(['in_progress', 'in_progress', 'in_progress', 'completed', 'not_started']);
  });

  it('Thai, no platform words', () => {
    const { container } = view({}, 'th');
    expect(screen.getByRole('button', { name: 'ยังไม่เริ่ม' })).toBeInTheDocument();
    expect(visibleWords(container)).not.toMatch(BANNED_WORDS);
  });
});

describe('GradesView 2.1 (S-102)', () => {
  const rows = () => screen.getAllByRole('listitem').filter((li) => li.classList.contains('cls3-row'));
  const rowOf = (name) => rows().find((li) => li.textContent.includes(name));
  const titles = () => rows().map((li) => li.querySelector('.cls3-row__title').textContent);

  it('Part 1 (CA-11 only): one row per course with due, best score, pass mark, tone chip; axe clean', async () => {
    const { container } = renderKit(<GradesView dashboard={dashboard.data} />);
    expect(screen.getByRole('heading', { name: 'Grades', level: 2 })).toBeInTheDocument();
    expect(screen.getByText('Every course you were given, with dates and your best final-quiz score.')).toBeInTheDocument();
    expect(rows()).toHaveLength(4);
    const inf = rowOf('Infection Control');
    expect(inf).toHaveClass('cls3-tone--progress');
    expect(within(inf).getByText('100%')).toBeInTheDocument();
    expect(within(inf).getByText('/ 60% to pass')).toBeInTheDocument();
    expect(within(inf).getByText('Required')).toBeInTheDocument();
    expect(within(inf).getByRole('link', { name: 'Infection Control & Hand Hygiene' })).toHaveAttribute('href', '#inf101');
    const psb = rowOf('Patient Safety');
    expect(psb).toHaveClass('cls3-tone--overdue');
    expect(within(psb).getByText('10 Oct 2026')).toHaveClass('is-late');
    expect(within(rowOf('Fire Safety')).getByText('Optional')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Details' })).toBeNull(); // no parts before CA-16
    expect(await axe(container)).toHaveNoViolations();
  });

  it('CA-16: dates + best score from grades; Details opens the graded parts', () => {
    renderKit(<GradesView dashboard={dashboard.data} grades={grades.data} />);
    const inf = rowOf('Infection Control');
    expect(within(inf).getByText('2 Oct 2026')).toBeInTheDocument(); // started
    expect(within(inf).getByText('93%')).toBeInTheDocument();
    expect(within(rowOf('Hospital Regulations')).getByText('27 Oct 2026')).toBeInTheDocument(); // completed
    const btn = within(inf).getByRole('button', { name: 'Details' });
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(btn);
    const final = within(inf).getByRole('row', { name: /Final quiz/ });
    expect(within(final).getByText('Pending')).toBeInTheDocument();
    expect(within(final).getByText('Exam')).toBeInTheDocument();
    fireEvent.click(within(inf).getByRole('button', { name: 'Hide details' }));
    expect(within(inf).queryByRole('table')).toBeNull();
  });

  it('search, status filter and sort', () => {
    renderKit(<GradesView dashboard={dashboard.data} grades={grades.data} />);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search courses' }), { target: { value: 'reg1' } });
    expect(titles()).toEqual(['Hospital Regulations']);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search courses' }), { target: { value: '' } });
    fireEvent.change(screen.getByRole('combobox', { name: 'Status' }), { target: { value: 'overdue' } });
    expect(titles()).toEqual(['Patient Safety Basics']);
    fireEvent.change(screen.getByRole('combobox', { name: 'Status' }), { target: { value: 'all' } });
    fireEvent.change(screen.getByRole('combobox', { name: 'Sort' }), { target: { value: 'name' } });
    expect(titles()[0]).toBe('Fire Safety on the Ward');
    fireEvent.change(screen.getByRole('combobox', { name: 'Sort' }), { target: { value: 'due' } });
    expect(titles()[0]).toBe('Patient Safety Basics');
  });

  it('gradeRows keeps CA-16-only courses', () => {
    const old = {
      course_key: 'course-v1:MHB+X+1', code: 'X1', title: 'Old', grade_pct: 70, passed: true, parts: [],
    };
    const list = gradeRows({ dashboard: dashboard.data, grades: { ...grades.data, courses: [...grades.data.courses, old] }, locale: 'en' });
    expect(list).toHaveLength(5);
    expect(list[4]).toMatchObject({ code: 'X1', status: 'completed', score: 70 });
  });

  it('error shows notice only', () => {
    const onRetry = jest.fn();
    renderKit(<GradesView status="error" onRetry={onRetry} />);
    expect(screen.queryByRole('searchbox')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(onRetry).toHaveBeenCalled();
  });
});

describe('ProgressView 2.1 — Am I up to date? (S-103)', () => {
  const v2 = { ...dashboard.data, learning_time: learningTime };
  const wed = new Date('2026-11-11T09:00:00+07:00');

  it('CA-17: status line, Everyone + For my job groups, states, licence, this week; axe clean', async () => {
    const { container } = renderKit(
      <ProgressView dashboard={v2} compliance={compliance.data} now={wed} jobTitle="Registered Nurse · ICU" />,
    );
    expect(screen.getByRole('heading', { name: 'Am I up to date?', level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('4 items need action');
    const everyone = screen.getByRole('region', { name: 'Everyone' });
    expect(within(everyone).getByText('1 / 4 up to date')).toBeInTheDocument();
    const inf = within(everyone).getAllByRole('listitem')[0];
    expect(within(inf).getByText('Overdue')).toHaveClass('cls-sr');
    expect(within(inf).getByText('Due 29 Oct 2026')).toHaveClass('is-late');
    expect(within(inf).getByRole('link', { name: 'Continue: Infection Control & Hand Hygiene' })).toHaveClass('cls-btn--primary');
    const pdpa = within(everyone).getAllByRole('listitem')[3];
    expect(within(pdpa).getByText(/^Valid until 14 Sept? 2027$/)).toBeInTheDocument();
    const job = screen.getByRole('region', { name: 'For my job · Registered Nurse · ICU' });
    expect(within(job).getByText('Renew by 10 Dec 2026')).toHaveClass('is-soon');
    expect(within(job).getByText(/Every 2 years/)).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'My licence' })).toBeInTheDocument();
    const week = screen.getByRole('region', { name: 'This week' });
    expect(within(week).getByText('20 minutes')).toBeInTheDocument();
    expect(within(week).getAllByRole('listitem')).toHaveLength(7);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('before CA-17: one Required training group from CA-11 required courses; no licence', () => {
    renderKit(<ProgressView dashboard={dashboard.data} now={now} />);
    const req = screen.getByRole('region', { name: 'Required training' });
    expect(within(req).getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByRole('status')).toHaveTextContent('1 item needs action');
    expect(screen.queryByRole('region', { name: 'My licence' })).toBeNull();
    expect(fallbackGroups(dashboard.data)[0].items.map((i) => i.state)).toEqual(['in_progress', 'overdue']);
  });

  it('compliance switched off → fallback; CA-16 8-week bars when no learning_time', () => {
    renderKit(
      <ProgressView
        dashboard={dashboard.data}
        grades={grades.data}
        compliance={compliance.data}
        features={{ compliance: false }}
        now={now}
      />,
    );
    expect(screen.getByRole('region', { name: 'Required training' })).toBeInTheDocument();
    const weekly = screen.getByRole('region', { name: 'Hours per week' });
    expect(within(weekly).getAllByRole('listitem')).toHaveLength(8);
    expect(within(weekly).getByText('Week of 9 Nov: 1.6 h')).toBeInTheDocument();
  });

  it('all up to date', () => {
    const ok = { groups: [{ key: 'everyone', items: [{ ...compliance.data.groups[0].items[3] }] }], licence: null };
    renderKit(<ProgressView dashboard={dashboard.data} compliance={ok} now={now} />);
    expect(screen.getByRole('status')).toHaveTextContent('You are up to date. Nice work!');
  });

  it('Thai, no platform words', () => {
    const { container } = renderKit(<ProgressView dashboard={v2} compliance={compliance.data} now={now} />, { locale: 'th' });
    expect(screen.getByRole('heading', { name: 'ฉันทำครบตามกำหนดหรือยัง?' })).toBeInTheDocument();
    expect(visibleWords(container)).not.toMatch(BANNED_WORDS);
  });
});

describe('CertificatesView2 (S-104)', () => {
  const view = (props = {}) => renderKit(
    <CertificatesView2
      items={certificates.data}
      courses={dashboard.data.courses}
      learnerName="Nok Srisuk"
      verifyUrl="/certificates/verify"
      {...props}
    />,
  );

  it('earned, revoked and locked cards; verify link; axe clean', async () => {
    const { container } = view();
    expect(cardTitles()).toEqual([
      'Records & PDPA 2026', 'Hand Hygiene Basics', 'Fire Safety 2025',
      'Infection Control & Hand Hygiene', 'Patient Safety Basics', 'Fire Safety on the Ward',
    ]);
    expect(screen.getAllByText('Complete the course to unlock.')).toHaveLength(3);
    expect(screen.getByRole('link', { name: 'Verify' })).toHaveAttribute('href', '/certificates/verify?code=ELMP-2026-7KQ4-9XTD');
    expect(screen.getByText('Revoked on 15 Jan 2026')).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('View opens the certificate paper; Esc closes and focus returns', () => {
    view();
    const btn = screen.getByRole('button', { name: 'View: Records & PDPA 2026' });
    btn.focus();
    fireEvent.click(btn);
    const dialog = screen.getByRole('dialog', { name: 'Certificate: Records & PDPA 2026' });
    expect(within(dialog).getByText('Nok Srisuk')).toBeInTheDocument();
    expect(within(dialog).getByText('Issued 2 Nov 2026 · ID ELMP-2026-7KQ4-9XTD')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Close' })).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(btn).toHaveFocus();
  });

  it('download from the card; filter Roadmap hides locked cards', async () => {
    const onDownload = jest.fn();
    view({ onDownload });
    fireEvent.click(screen.getByRole('button', { name: 'Download PDF: Records & PDPA 2026' }));
    expect(onDownload).toHaveBeenCalledWith(certificates.data[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Roadmap' }));
    expect(cardTitles()).toEqual(['Records & PDPA 2026', 'Fire Safety 2025']);
    expect(await screen.findByRole('button', { name: 'View: Records & PDPA 2026' })).toBeEnabled();
  });

  it('empty: no certificates and nothing to unlock', () => {
    view({ items: [], courses: [] });
    expect(screen.getByText('Finish a course to earn your first certificate.')).toBeInTheDocument();
  });
});
