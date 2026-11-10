import { fireEvent, screen, within } from '@testing-library/react';
import { axe } from 'jest-axe';

import { catalogue, grades } from '../__fixtures__/classroom2';
import { certificates, dashboard } from '../__fixtures__/portal';
import { BANNED_WORDS, renderKit, visibleWords } from '../testUtils';
import CoursesView, { entryToCard, statusGroup } from './CoursesView';
import GradesView from './GradesView';
import ProgressView from './ProgressView';
import CertificatesView2 from './CertificatesView2';

// Plan 5 P5-2.03 — S-101 Courses, S-102 Grades, S-103 Progress, S-104 Certificates.
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

  it('status chips: In progress includes overdue + almost; Completed; Not started', () => {
    view();
    fireEvent.click(screen.getByRole('button', { name: 'In progress' }));
    expect(cardTitles()).toEqual(['Infection Control & Hand Hygiene', 'Patient Safety Basics']);
    fireEvent.click(screen.getByRole('button', { name: 'Completed' }));
    expect(cardTitles()).toEqual(['Hospital Regulations']);
    fireEvent.click(screen.getByRole('button', { name: 'Not started' }));
    expect(cardTitles()).toEqual(['Fire Safety on the Ward']);
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
    fireEvent.click(screen.getAllByRole('button', { name: 'All' })[1]); // category pills
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

describe('GradesView (S-102)', () => {
  it('Part 1: stat cards from CA-11 scores, one course table with pass mark + status + details link; axe clean', async () => {
    const { container } = renderKit(<GradesView dashboard={dashboard.data} />);
    expect(screen.getByText('Your scores in every course. Pass mark 60%.')).toBeInTheDocument();
    expect(screen.getAllByText('95%').length).toBeGreaterThan(0); // average of 100 and 90
    const table = screen.getByRole('table');
    const rows = within(table).getAllByRole('row');
    expect(rows).toHaveLength(5);
    expect(within(rows[1]).getByText('Almost done')).toBeInTheDocument();
    expect(within(rows[3]).getByText('Passed')).toBeInTheDocument();
    expect(within(rows[1]).getByRole('link', { name: 'See details: Infection Control & Hand Hygiene' })).toHaveAttribute('href', '#inf101');
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Part 2: one table card per course, every part with score / pending', () => {
    renderKit(<GradesView dashboard={dashboard.data} grades={grades.data} />);
    expect(screen.getAllByRole('table')).toHaveLength(2);
    expect(screen.getAllByText('91%').length).toBeGreaterThan(0);
    const inf = screen.getByRole('region', { name: /Infection Control/ });
    expect(within(inf).getByText('In progress')).toBeInTheDocument();
    expect(within(inf).getByText('Grade 93%')).toBeInTheDocument();
    const final = within(inf).getByRole('row', { name: /Final quiz/ });
    expect(within(final).getByText('Pending')).toBeInTheDocument();
    expect(within(final).getByText('Exam')).toBeInTheDocument();
    const reg = screen.getByRole('region', { name: /Hospital Regulations/ });
    expect(within(reg).getByText('Passed')).toBeInTheDocument();
    expect(within(reg).getByText('80%')).toHaveClass('cls3-chip--done');
  });

  it('error shows notice only', () => {
    const onRetry = jest.fn();
    renderKit(<GradesView status="error" onRetry={onRetry} />);
    expect(screen.queryByRole('table')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(onRetry).toHaveBeenCalled();
  });
});

describe('ProgressView (S-103)', () => {
  it('Part 1: stat cards, donut, streak in place of weekly bars, course list, deadlines; axe clean', async () => {
    const { container } = renderKit(<ProgressView dashboard={dashboard.data} now={now} />);
    expect(screen.getByText('Courses completed')).toBeInTheDocument();
    // overall = (71 + 14 + 100 + 0) / 4 = 46
    expect(screen.getByRole('img', { name: '46% overall completion' })).toBeInTheDocument();
    expect(screen.getByText('13 of 26 units')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Hours per week' })).toBeNull();
    expect(screen.getByRole('heading', { name: 'Learning streak' })).toBeInTheDocument();
    const list = screen.getByRole('region', { name: 'Course progress' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(4);
    expect(screen.getByRole('heading', { name: 'Upcoming deadlines' })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Part 2: 8 weekly bars with screen-reader text, this-week line, hours goal', () => {
    renderKit(<ProgressView dashboard={dashboard.data} grades={grades.data} hoursGoal={20} now={now} />);
    const weekly = screen.getByRole('region', { name: 'Hours per week' });
    expect(within(weekly).getAllByRole('listitem')).toHaveLength(8);
    expect(within(weekly).getByText('Week of 9 Nov: 1.6 h')).toBeInTheDocument();
    expect(within(weekly).getByText('1.6 h this week · 9 days active this month')).toBeInTheDocument();
    expect(screen.getByText('Goal 20 h')).toBeInTheDocument();
  });

  it('Thai, no platform words', () => {
    const { container } = renderKit(<ProgressView dashboard={dashboard.data} grades={grades.data} now={now} />, { locale: 'th' });
    expect(screen.getByRole('heading', { name: 'ชั่วโมงต่อสัปดาห์' })).toBeInTheDocument();
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
