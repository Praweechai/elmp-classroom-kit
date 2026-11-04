import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';

import * as fx from '../__fixtures__/portal';
import { timeAgo } from '../i18n';
import { BANNED_WORDS, renderKit, visibleWords } from '../testUtils';
import NotificationPanel from '../components/NotificationPanel';
import CertificatesView from './CertificatesView';
import HomeView from './HomeView';
import HoursView from './HoursView';

const now = new Date('2026-11-04T02:00:00Z');
const courses = [
  {
    key: 'course-v1:MHB+INF101+2026', title: 'Isolation Precautions', code: 'INF101', href: '/c/inf/home', resumeHref: '/c/inf/resume', state: 'in_progress', progress: 41, units: 8, unitsDone: 3,
  },
  {
    key: 'course-v1:MHB+PSB101+2026', title: 'Patient Safety Basics', code: 'PSB101', href: '/c/psb/home', state: 'not_started', progress: 0, units: 6,
  },
  {
    key: 'course-v1:MHB+REG101+2026', title: 'Medical Records and PDPA', code: 'REG101', href: '/c/reg/home', state: 'passed', progress: 100, certificateUrl: '/cert/reg',
  },
];
const links = { courseHome: (c) => `/learning/course/${c.course_key}/home`, hours: '/learner-dashboard/hours' };

const home = (props = {}) => renderKit(
  <HomeView firstName="Nok" courses={courses} training={fx.training.data} trainingStatus="ready" links={links} latestCertificate={fx.roadmapCertificate} now={now} {...props} />,
  props.locale ? { locale: props.locale } : undefined,
);

describe('HomeView S-70 (F-90)', () => {
  it('shows greeting, continue card, required groups in Portal order, side cards', () => {
    home();
    expect(screen.getByRole('heading', { level: 1, name: 'Good morning, Nok' })).toBeInTheDocument();
    expect(within(document.querySelector('.cls-continue')).getByRole('link', { name: 'Continue: Isolation Precautions' })).toHaveAttribute('href', '/c/inf/resume');
    expect(screen.getByText('Unit 4 of 8')).toBeInTheDocument();
    const groups = screen.getAllByRole('region').filter((r) => r.id?.startsWith('required-'));
    expect(groups.map((g) => g.id)).toEqual(['required-41', 'required-42', 'required-43']);
    expect(screen.getByText('16 hours to go before 31 Dec 2026')).toBeInTheDocument();
    expect(screen.getByText('Latest certificate')).toBeInTheDocument();
  });

  it('puts the required strip on cards of open assignments only', () => {
    home();
    expect(screen.getByText('Required · Annual Infection Control 2026 · due 31 Oct 2026')).toBeInTheDocument();
  });

  it('filters courses with the chips', async () => {
    home();
    const all = screen.getByRole('region', { name: 'All my courses' });
    await userEvent.click(within(all).getByRole('button', { name: 'Not started' }));
    expect(within(all).getAllByRole('article')).toHaveLength(1);
    expect(within(all).getByRole('heading', { name: 'Patient Safety Basics' })).toBeInTheDocument();
    await userEvent.click(within(all).getByRole('button', { name: 'Not started' }));
    expect(within(all).getAllByRole('article')).toHaveLength(3);
  });

  it('keeps courses and shows a quiet notice when the Portal is down (BR-3, AC-3)', async () => {
    const onRetry = jest.fn();
    home({
      training: undefined, trainingStatus: 'error', trainingError: { code: 'unavailable' }, onRetry,
    });
    expect(screen.getByText('Deadlines are not available right now.')).toBeInTheDocument();
    expect(screen.getAllByRole('article').length).toBeGreaterThan(0);
    expect(screen.queryByText('Required training')).toBeNull();
    expect(document.querySelector('.cls-continue')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('shows the HR message when the training record is missing (403 unmapped)', () => {
    home({ training: undefined, trainingStatus: 'error', trainingError: { code: 'unmapped' } });
    expect(screen.getByRole('heading', { name: 'Your training record is missing' })).toBeInTheDocument();
    expect(screen.queryByText('Deadlines are not available right now.')).toBeNull();
  });

  it('shows "All done" instead of Continue when everything is passed (BR-2)', () => {
    const done = { ...fx.training.data, continue: null, assignments: [fx.completedAssignment] };
    home({ training: done, courses: [courses[2]] });
    expect(screen.queryByRole('link', { name: /Continue:/ })).toBeNull();
    expect(screen.getByRole('heading', { name: 'All done' })).toBeInTheDocument();
    expect(screen.getByText('Nothing due. Well done.')).toBeInTheDocument();
  });

  it('shows the empty state when nothing is assigned', () => {
    home({ courses: [], training: { ...fx.training.data, assignments: [], continue: null } });
    expect(screen.getByText('No training assigned yet. HR will add your courses.')).toBeInTheDocument();
  });

  it('shows skeletons while both sources load (S-79)', () => {
    const { container } = home({ coursesLoading: true, trainingStatus: 'loading', training: undefined });
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it('highlights the deep-linked group (J-4)', () => {
    const { container } = home({ highlightId: '42' });
    expect(container.querySelector('#required-42')).toHaveClass('is-highlighted');
  });

  it.each(['en', 'th'])('has no axe violations and no platform words in %s', async (locale) => {
    const { container } = home({ locale });
    expect(visibleWords(container)).not.toMatch(BANNED_WORDS);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('CertificatesView S-72 (F-96)', () => {
  it('filters roadmap and course certificates', async () => {
    renderKit(<CertificatesView items={fx.certificates.data} status="ready" />);
    expect(screen.getAllByRole('article')).toHaveLength(3);
    await userEvent.click(screen.getByRole('button', { name: 'Course' }));
    expect(screen.getAllByRole('article')).toHaveLength(1);
  });

  it('shows the empty state and the error states', () => {
    const { unmount } = renderKit(<CertificatesView items={[]} status="ready" />);
    expect(screen.getByText('Finish a course to earn your first certificate.')).toBeInTheDocument();
    unmount();
    renderKit(<CertificatesView status="error" error={{ code: 'unavailable' }} />);
    expect(screen.getByText('Deadlines are not available right now.')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = renderKit(<CertificatesView items={fx.certificates.data} status="ready" />, { locale: 'th' });
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('HoursView S-73 (F-97)', () => {
  it('shows the ring, the list and switches year', async () => {
    const onYearChange = jest.fn();
    renderKit(<HoursView data={fx.hours.data} status="ready" onYearChange={onYearChange} />);
    expect(screen.getAllByText('24 of 40 hours').length).toBeGreaterThan(0);
    expect(screen.getByRole('cell', { name: 'Medical Records and PDPA' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '2025' }));
    expect(onYearChange).toHaveBeenCalledWith(2025);
  });

  it('uses Buddhist years in Thai and says when no course counts yet', () => {
    renderKit(<HoursView data={{ ...fx.hours.data, items: [] }} status="ready" />, { locale: 'th' });
    expect(screen.getByRole('button', { name: '2569' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('ยังไม่มีหลักสูตรที่ผ่านในปี 2569')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = renderKit(<HoursView data={fx.hours.data} status="ready" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('NotificationPanel S-74 (F-100)', () => {
  const items = [
    {
      id: 'a', type: 'deadline_passed', title: { en: 'Deadline passed', th: 'เลยกำหนดแล้ว' }, body: { en: '1 course left.', th: 'เหลือ 1 หลักสูตร' }, read_at: null, created_at: new Date(Date.now() - 5 * 60000).toISOString(),
    },
    {
      id: 'b', type: 'certificate_ready', title: { en: 'Certificate ready', th: 'ใบประกาศพร้อมแล้ว' }, body: 'Records & PDPA 2026', read_at: '2026-11-02T10:00:00+07:00', created_at: '2026-11-02T09:00:00+07:00',
    },
  ];

  it('lists messages, opens one, marks all read, closes on Escape', async () => {
    const onOpenItem = jest.fn();
    const onMarkAllRead = jest.fn();
    const onClose = jest.fn();
    renderKit(
      <NotificationPanel open items={items} onOpenItem={onOpenItem} onMarkAllRead={onMarkAllRead} onClose={onClose} />,
    );
    const dialog = screen.getByRole('dialog', { name: 'Messages' });
    expect(within(dialog).getByRole('button', { name: 'Close' })).toHaveFocus();
    expect(within(dialog).getByText('5 min ago')).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: /Deadline passed/ }));
    expect(onOpenItem).toHaveBeenCalledWith(items[0]);
    await userEvent.click(within(dialog).getByRole('button', { name: 'Mark all as read' }));
    expect(onMarkAllRead).toHaveBeenCalled();
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('keeps Tab inside the panel (focus trap)', async () => {
    renderKit(<NotificationPanel open items={items} onMarkAllRead={() => {}} />);
    const dialog = screen.getByRole('dialog');
    const buttons = within(dialog).getAllByRole('button');
    buttons[buttons.length - 1].focus();
    await userEvent.tab();
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('says when there is nothing new, and renders nothing when closed', () => {
    renderKit(<NotificationPanel open items={[]} />);
    expect(screen.getByText("You're all caught up.")).toBeInTheDocument();
    const { container } = renderKit(<NotificationPanel open={false} />);
    expect(container.querySelector('.cls-npanel')).toBeNull();
  });

  it('has no axe violations in Thai', async () => {
    const { container } = renderKit(<NotificationPanel open items={items} onMarkAllRead={() => {}} />, { locale: 'th' });
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('timeAgo', () => {
  const at = Date.parse('2026-11-04T10:00:00Z');
  it.each([
    ['2026-11-04T09:59:30Z', 'en', '30 sec ago'],
    ['2026-11-04T09:55:00Z', 'en', '5 min ago'],
    ['2026-11-04T07:00:00Z', 'en', '3 hr ago'],
    ['2026-11-02T10:00:00Z', 'en', '2 days ago'],
  ])('%s → %s %s', (value, locale, expected) => {
    expect(timeAgo(value, locale, at)).toBe(expected);
  });
  it('falls back to the date after a month', () => {
    expect(timeAgo('2026-09-01T10:00:00Z', 'en', at)).toBe('1 Sept 2026');
  });
});
