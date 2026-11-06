import { fireEvent, screen, within } from '@testing-library/react';
import { axe } from 'jest-axe';

import * as fx from '../__fixtures__/portal';
import { createPortalClient } from '../portal/PortalClient';
import { BANNED_WORDS, renderKit, visibleWords } from '../testUtils';
import DashboardView from '../views/DashboardView';
import MyCoursesView from '../views/MyCoursesView';
import CourseTable, { coursePercent } from './CourseTable';
import {
  DeadlineList, EncouragementBanner, Gauge, NextQuizList, StatRing, StreakWeek, bangkokDay, urgency, weekdayLabels,
} from './Dashboard';
import { ClassroomShell, SidebarNav, TopBar } from './Shell';

// Plan 4 · P4-3 kit 1.0: shell (F-115) + home dashboard widgets (F-114).

const d = fx.dashboard.data;
const now = new Date('2026-11-06T01:00:00Z'); // 08:00 Bangkok, Friday
const links = {
  home: '#home', courses: '#courses', certificates: '#certificates', account: '#account', help: '#help', signOut: '#out',
};

beforeEach(() => window.localStorage.clear());

describe('Gauge', () => {
  it('shows the value and the status as text, also for screen readers (NFR-D3)', () => {
    renderKit(<Gauge pct={50} label="needs_attention" />);
    expect(screen.getByRole('img', { name: 'Overall progress: 50%, Needs attention' })).toBeInTheDocument();
  });

  it('on track in Thai; no data shows a dash', () => {
    const { unmount } = renderKit(<Gauge pct={100} label="on_track" />, { locale: 'th' });
    expect(screen.getByRole('img', { name: 'ความคืบหน้าโดยรวม: 100%, ตามแผน' })).toBeInTheDocument();
    unmount();
    renderKit(<Gauge pct={null} />);
    expect(screen.getByRole('img', { name: 'Overall progress: No required training yet' })).toBeInTheDocument();
  });
});

describe('StatRing', () => {
  it('has the value as text next to the label', () => {
    renderKit(<ul><StatRing label="Quizzes passed" value="12/20" pct={60} tone="violet" /></ul>);
    const item = screen.getByRole('listitem');
    expect(item).toHaveTextContent('Quizzes passed');
    expect(item).toHaveTextContent('12/20');
  });
});

describe('EncouragementBanner', () => {
  const { banner } = d;

  it('says what is overdue and stays dismissed for the rest of the Bangkok day', () => {
    const { unmount } = renderKit(<EncouragementBanner banner={banner} lead="Good morning, Boonmee!" now={now} />);
    expect(screen.getByRole('status')).toHaveTextContent("1 required training is overdue — start with Patient Safety Basics. Let's finish it today.");
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    unmount();
    renderKit(<EncouragementBanner banner={banner} now={now} />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('comes back the next day', () => {
    window.localStorage.setItem('elmp.banner.dismissed', `overdue:${bangkokDay(new Date('2026-11-05T01:00:00Z'))}`);
    renderKit(<EncouragementBanner banner={banner} now={now} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('Thai text keeps the course name', () => {
    renderKit(<EncouragementBanner banner={banner} now={now} />, { locale: 'th' });
    expect(screen.getByRole('status')).toHaveTextContent('การอบรมภาคบังคับเลยกำหนด 1 รายการ — เริ่มจาก พื้นฐานความปลอดภัยของผู้ป่วย');
  });

  it('works without browser storage (private mode)', () => {
    const spy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    renderKit(<EncouragementBanner banner={{ kind: 'all_done' }} now={now} />);
    expect(screen.getByRole('status')).toHaveTextContent('All required training is done. Well done!');
    spy.mockRestore();
  });

  it('renders nothing without a banner', () => {
    const { container } = renderKit(<EncouragementBanner banner={null} />);
    expect(container.querySelector('.cls-banner')).toBeNull();
  });
});

describe('DeadlineList', () => {
  it('late and soon rows with dot + text and labelled buttons', () => {
    renderKit(<DeadlineList items={d.deadlines} />);
    expect(screen.getByText('27 days late')).toBeInTheDocument();
    expect(screen.getByText('6 days left')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Continue: Patient Safety Basics' })).toHaveAttribute('href', '#psb101');
    expect(screen.getByRole('link', { name: 'Start: Hospital Regulations' })).toHaveAttribute('href', '#reg101');
    expect(screen.getByText('Required · New-hire Onboarding')).toBeInTheDocument();
    expect(screen.getByText('10 Oct 2026')).toBeInTheDocument();
  });

  it('Thai: Buddhist year and "late" wording', () => {
    renderKit(<DeadlineList items={d.deadlines} />, { locale: 'th' });
    expect(screen.getByText('เลยกำหนด 27 วัน')).toBeInTheDocument();
    expect(screen.getByText('อีก 6 วัน')).toBeInTheDocument();
    expect(screen.getByText('10 ต.ค. 2569')).toBeInTheDocument();
  });

  it('urgency colours: red ≤ 2 days or late, amber ≤ 7', () => {
    expect([urgency(-1), urgency(0), urgency(2), urgency(3), urgency(7), urgency(8), urgency(null)])
      .toEqual(['late', 'late', 'late', 'soon', 'soon', 'calm', 'calm']);
  });

  it('empty list', () => {
    renderKit(<DeadlineList items={[]} />);
    expect(screen.getByText('No deadlines coming up.')).toBeInTheDocument();
  });
});

describe('StreakWeek', () => {
  it('7 days ending today, active days named for screen readers', () => {
    renderKit(<StreakWeek days={d.streak.days} current={3} best={6} today={now} />);
    const days = within(screen.getByRole('list', { name: 'Last 7 days' })).getAllByRole('listitem');
    expect(days).toHaveLength(7);
    expect(days[6]).toHaveTextContent('Fri: no learning');
    expect(days[5]).toHaveTextContent('Thu: learned');
    expect(screen.getByText('3 days in a row')).toBeInTheDocument();
    expect(screen.getByText('Your best is 6 days in a row')).toBeInTheDocument();
  });

  it('weekday labels follow Bangkok time and the language', () => {
    expect(weekdayLabels(now, 'en')[6]).toBe('Fri');
    expect(weekdayLabels(new Date('2026-11-05T18:00:00Z'), 'en')[6]).toBe('Fri'); // 01:00 Fri in Bangkok
    expect(weekdayLabels(now, 'th')[6]).toMatch(/^ศ/); // ศ. or ศุกร์ depending on the ICU data
  });
});

describe('CourseTable', () => {
  it('shows progress by units, score and the honest status (F-111)', () => {
    renderKit(<CourseTable courses={d.courses} />);
    const row = screen.getByRole('link', { name: 'Infection Control & Hand Hygiene' }).closest('tr');
    expect(within(row).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '71');
    expect(row).toHaveTextContent('100%');
    expect(row).toHaveTextContent('Almost done — 2 units left');
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('sorts by status first (overdue on top), then by a clicked column', () => {
    renderKit(<CourseTable courses={d.courses} />);
    const titles = () => screen.getAllByRole('link').map((a) => a.textContent);
    expect(titles()[0]).toBe('Patient Safety Basics');
    fireEvent.click(screen.getByRole('button', { name: 'Sort by Score' }));
    expect(titles()[3]).toBe('Infection Control & Hand Hygiene');
    expect(screen.getByRole('button', { name: 'Sort by Score' }).closest('th')).toHaveAttribute('aria-sort', 'ascending');
    fireEvent.click(screen.getByRole('button', { name: 'Sort by Score' }));
    expect(titles()[0]).toBe('Infection Control & Hand Hygiene');
  });

  it('filters and searches', () => {
    const check = (props, assert) => {
      const { unmount } = renderKit(<CourseTable courses={d.courses} {...props} />);
      assert();
      unmount();
    };
    check({ filter: 'completed' }, () => expect(screen.getAllByRole('link')).toHaveLength(1));
    // "Almost done" and "Overdue" count as in progress
    check({ filter: 'in_progress' }, () => expect(screen.getAllByRole('link')).toHaveLength(2));
    check({ search: 'fire' }, () => expect(screen.getAllByRole('link').map((a) => a.textContent)).toEqual(['Fire Safety on the Ward']));
    check({ search: 'zzz' }, () => expect(screen.getByText('No courses here.')).toBeInTheDocument());
  });

  it('percent falls back to progress_percent when units are unknown', () => {
    expect(coursePercent({ units_done: 5, units_total: 7 })).toBe(71);
    expect(coursePercent({ progress_percent: 40 })).toBe(40);
    expect(coursePercent({})).toBe(0);
  });
});

describe('NextQuizList', () => {
  it('question count and minutes', () => {
    renderKit(<NextQuizList items={d.next_quizzes} />);
    expect(screen.getByText('8 questions · 15 min')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Start: Final quiz · PSB101' })).toHaveAttribute('href', '#q1');
  });

  it('Thai, and the empty line', () => {
    const { unmount } = renderKit(<NextQuizList items={d.next_quizzes} />, { locale: 'th' });
    expect(screen.getByText('8 ข้อ · 15 นาที')).toBeInTheDocument();
    unmount();
    renderKit(<NextQuizList items={[]} />);
    expect(screen.getByText('No quizzes waiting. Nice work.')).toBeInTheDocument();
  });
});

describe('SidebarNav + TopBar (F-115)', () => {
  it('MAIN and OTHER items, current page, no CE hours while switched off', () => {
    renderKit(<SidebarNav current="courses" links={links} unread={2} />);
    const nav = screen.getByRole('navigation', { name: 'Main menu' });
    expect(within(nav).getByRole('link', { name: 'My courses' })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).queryByRole('link', { name: 'CE hours' })).not.toBeInTheDocument();
    expect(within(nav).getByRole('link', { name: 'Settings' })).toHaveAttribute('href', '#account');
    expect(within(nav).getByRole('button', { name: 'Messages, 2 unread' })).toBeInTheDocument();
  });

  it('shows CE hours when the link is given', () => {
    renderKit(<SidebarNav current="home" links={{ ...links, hours: '#hours' }} />);
    expect(screen.getByRole('link', { name: 'CE hours' })).toBeInTheDocument();
  });

  it('collapse choice is remembered in the browser', () => {
    window.matchMedia = jest.fn(() => ({ matches: true }));
    const { unmount } = renderKit(<ClassroomShell current="home" title="Home" links={links} user={{ name: 'Boonmee Sukjai' }} />);
    const toggle = screen.getByRole('button', { name: 'Collapse menu' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(toggle);
    expect(window.localStorage.getItem('elmp.sidebar')).toBe('collapsed');
    unmount();
    renderKit(<ClassroomShell current="home" title="Home" links={links} user={{ name: 'Boonmee Sukjai' }} />);
    expect(screen.getByRole('navigation', { name: 'Main menu' })).toHaveAttribute('data-state', 'collapsed');
  });

  it('shell: pageAs="div" leaves the main landmark to the app', () => {
    const { container, unmount } = renderKit(<ClassroomShell current="home" title="Home" links={links} pageAs="div"><p>x</p></ClassroomShell>);
    expect(container.querySelector('main')).toBeNull();
    expect(container.querySelector('.cls-shell__page')).toHaveTextContent('x');
    unmount();
    renderKit(<ClassroomShell current="home" title="Home" links={links}><p>y</p></ClassroomShell>);
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main');
  });

  it('top bar: page title as heading, account menu with the name', () => {
    renderKit(<TopBar title="Home" links={links} user={{ name: 'Boonmee Sukjai' }} unread={1} locale="en" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Home' })).toBeInTheDocument();
    const account = screen.getByRole('button', { name: 'Account menu for Boonmee Sukjai' });
    expect(account).toHaveTextContent('Boonmee Sukjai');
    fireEvent.click(account);
    expect(screen.getByRole('menuitem', { name: 'Sign out' })).toHaveAttribute('href', '#out');
  });
});

describe('DashboardView (S-90)', () => {
  const view = (props = {}, locale = 'en') => renderKit(
    <DashboardView dashboard={d} firstName="Boonmee" now={now} coursesHref="#courses" certificatesHref="#certificates" {...props} />,
    { locale },
  );

  it('has every widget with its numbers as text', () => {
    view();
    expect(screen.getByRole('status')).toHaveTextContent('Good morning, Boonmee!');
    expect(screen.getByRole('img', { name: 'Overall progress: 50%, Needs attention' })).toBeInTheDocument();
    ['Enrolled courses', 'Hours learned', 'Required done', 'Quizzes passed', 'Upcoming deadlines', 'Learning streak', 'Next quizzes']
      .forEach((text) => expect(screen.getAllByText(text).length).toBeGreaterThan(0));
    expect(screen.getAllByText('1.4h').length).toBeGreaterThan(0);
    expect(screen.getAllByText('12/20').length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: 'My courses (4)' })).toBeInTheDocument();
    expect(screen.getByText('ELMP-2026-Q563-7KQ4')).toBeInTheDocument();
  });

  it('no axe violations and no platform words, EN and TH (A3-6)', async () => {
    const { container, unmount } = view();
    expect(await axe(container)).toHaveNoViolations();
    expect(visibleWords(container)).not.toMatch(BANNED_WORDS);
    unmount();
    const th = view({}, 'th');
    expect(await axe(th.container)).toHaveNoViolations();
    expect(screen.getAllByText('1.4 ชม.').length).toBeGreaterThan(0);
  });

  it('filter chips change the table', () => {
    view();
    fireEvent.click(screen.getByRole('button', { name: /^Completed/ }));
    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('link')).toHaveLength(1);
  });

  it('Portal down: quiet "not available" lines and a retry', () => {
    const onRetry = jest.fn();
    view({ status: 'error', onRetry, dashboard: null });
    expect(screen.getAllByText('Not available right now.').length).toBeGreaterThan(3);
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('loading skeleton; streak hidden when the feature is off; hours "—" without data', () => {
    const { container, unmount } = view({ status: 'loading' });
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
    unmount();
    view({ features: { streak: false }, dashboard: { ...d, rings: { ...d.rings, hours_learned: null } } });
    expect(screen.queryByText('Learning streak')).not.toBeInTheDocument();
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });
});

describe('MyCoursesView (S-91)', () => {
  it('search box and filters', () => {
    renderKit(<MyCoursesView courses={d.courses} />);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search courses' }), { target: { value: 'PSB' } });
    expect(within(screen.getByRole('table')).getAllByRole('link').map((a) => a.textContent)).toEqual(['Patient Safety Basics']);
  });
});

describe('PortalClient Plan 4 calls', () => {
  const BASE = 'http://portal.local.openedx.io/api/classroom/v1';

  it('dashboard is cached; activity posts course key, seconds and day (CA-11, CA-12)', async () => {
    const http = {
      get: jest.fn(() => Promise.resolve({ data: fx.dashboard })),
      post: jest.fn(() => Promise.resolve({ data: { data: { stored: 60 } } })),
    };
    const client = createPortalClient({ baseUrl: BASE, httpClient: () => http });
    await expect(client.dashboard()).resolves.toEqual(fx.dashboard);
    await client.dashboard();
    expect(http.get).toHaveBeenCalledTimes(1);
    await client.activity({ courseKey: 'course-v1:MHB+INF101+2026', seconds: 60, day: '2026-11-06' });
    expect(http.post).toHaveBeenCalledWith(`${BASE}/activity`, { course_key: 'course-v1:MHB+INF101+2026', seconds: 60, day: '2026-11-06' }, expect.objectContaining({ isCsrfExempt: true }));
    expect(client.activityUrl()).toBe(`${BASE}/activity`);
  });
});
