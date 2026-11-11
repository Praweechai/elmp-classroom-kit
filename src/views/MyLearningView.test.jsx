import { fireEvent, screen, within } from '@testing-library/react';
import { axe } from 'jest-axe';

import {
  achievements, catalogue, compliance, learningTime,
} from '../__fixtures__/classroom2';
import { dashboard } from '../__fixtures__/portal';
import { BANNED_WORDS, renderKit, visibleWords } from '../testUtils';
import MyLearningView, { pickResume, toCard } from './MyLearningView';
import { statusTone } from '../components/Learner21';

// Learner v2 · kit 2.1 (V-1.02) — S-100 My Learning 2.1.
const now = new Date('2026-11-11T09:00:00+07:00');
const v2 = { ...dashboard.data, learning_time: learningTime };
const view = (props = {}, locale = 'en') => renderKit(
  <MyLearningView dashboard={v2} firstName="Nok" now={now} {...props} />,
  { locale },
);
const cardTitles = () => screen.getAllByRole('article').map((a) => within(a).getByRole('heading').textContent);
const tile = (name) => screen.getByRole('button', { name: new RegExp(`^\\d+ ${name}$`) });

describe('MyLearningView 2.1', () => {
  it('greeting + overdue alert, resume hero, Today card, 4 tiles, all cards, deadlines; axe clean', async () => {
    const { container } = view();
    expect(screen.getByRole('heading', { name: 'Good morning, Nok' })).toBeInTheDocument();
    expect(screen.getByText('1 course needs your attention')).toBeInTheDocument();
    // hero = the overdue course first, with days late
    const hero = screen.getAllByRole('link', { name: /Patient Safety Basics/ }).find((l) => l.classList.contains('cls3-resume'));
    expect(hero).toBeTruthy();
    expect(within(hero).getByText('27 days late')).toBeInTheDocument();
    expect(within(hero).getByText('Pick up where you left off')).toBeInTheDocument();
    // Today card (D-93)
    expect(screen.getByRole('img', { name: 'Today: 0 of 15 minutes' })).toBeInTheDocument();
    expect(screen.getByText('15 more minutes to reach today’s goal')).toBeInTheDocument();
    expect(screen.getByText('4 week streak')).toBeInTheDocument();
    expect(screen.getByText('Learn on any 3 days a week to keep it — made for shift work.')).toBeInTheDocument();
    // tiles: one per tone, counts
    expect(tile('To do')).toHaveClass('cls3-tone--todo');
    expect(tile('In progress')).toHaveClass('cls3-tone--progress');
    expect(tile('Completed')).toHaveClass('cls3-tone--done');
    expect(tile('Overdue')).toHaveClass('cls3-tone--overdue', 'has-items');
    expect(cardTitles()).toHaveLength(4);
    expect(screen.getByRole('heading', { name: 'Upcoming deadlines' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Next quizzes' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Learning streak' })).toBeNull(); // replaced by the week streak
    expect(screen.queryByRole('heading', { name: 'My licence' })).toBeNull(); // no CA-17 yet
    expect(await axe(container)).toHaveNoViolations();
  });

  it('a tile filters the cards; pressing it again or "Show all" brings all back', () => {
    view();
    fireEvent.click(tile('Overdue'));
    expect(tile('Overdue')).toHaveAttribute('aria-pressed', 'true');
    expect(cardTitles()).toEqual(['Patient Safety Basics']);
    expect(screen.getByRole('heading', { name: /^Overdue/, level: 2 })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Show all' }));
    expect(cardTitles()).toHaveLength(4);
    fireEvent.click(tile('Completed'));
    expect(cardTitles()).toEqual(['Hospital Regulations']);
    fireEvent.click(tile('Completed'));
    expect(cardTitles()).toHaveLength(4);
  });

  it('cards carry the status tone + progress strip; chips say To do / In progress / Completed / Overdue', () => {
    view();
    const [fire] = screen.getAllByRole('article').filter((a) => /Fire Safety/.test(a.textContent));
    expect(fire).toHaveClass('cls3-tone--todo');
    expect(within(fire).getByText('To do')).toHaveClass('cls3-chip', 'cls3-tone--todo');
    const inf = screen.getAllByRole('article').find((a) => /Infection/.test(a.textContent));
    expect(inf).toHaveClass('cls3-tone--progress');
    expect(inf.style.getPropertyValue('--p')).toBe('0.71');
    expect(within(inf).getByText('Almost done')).toHaveClass('cls3-tone--progress');
  });

  it('sort (default due date) and grid/list toggle', () => {
    view();
    expect(cardTitles()[0]).toBe('Patient Safety Basics');
    fireEvent.change(screen.getByRole('combobox', { name: 'Sort' }), { target: { value: 'progress' } });
    expect(cardTitles()[0]).toBe('Hospital Regulations');
    fireEvent.change(screen.getByRole('combobox', { name: 'Sort' }), { target: { value: 'title' } });
    expect(cardTitles()[0]).toBe('Fire Safety on the Ward');
    fireEvent.click(screen.getByRole('button', { name: 'List view' }));
    expect(screen.getAllByRole('article')[0]).toHaveClass('cls3-course--list');
  });

  it('deadlines as date boxes: overdue box marked, days late text', () => {
    view();
    const dl = screen.getByRole('region', { name: 'Upcoming deadlines' });
    const items = within(dl).getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('Patient Safety Basics');
    expect(items[0].querySelector('.cls3-date--overdue')).not.toBeNull();
    expect(within(items[0]).getByText(/27 days late/)).toHaveClass('is-late');
  });

  it('licence card from CA-17 (D-94)', () => {
    view({ compliance: compliance.data });
    const lic = screen.getByRole('region', { name: 'My licence' });
    expect(within(lic).getByText('32')).toBeInTheDocument();
    expect(within(lic).getByRole('progressbar', { name: '32 of 50 CNEU credits' })).toHaveAttribute('aria-valuenow', '64');
    expect(within(lic).getByText('Renew by 31 May 2028 · 18 more needed')).toBeInTheDocument();
  });

  it('before CA-11 learning_time: the old daily streak card still shows (Part 1); off when switched off', () => {
    const { unmount } = view({ dashboard: dashboard.data });
    expect(screen.getByRole('heading', { name: 'Learning streak' })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: /Today:/ })).toBeNull();
    unmount();
    view({ features: { streak: false } });
    expect(screen.queryByRole('heading', { name: 'Learning streak' })).toBeNull();
    expect(screen.queryByRole('img', { name: /Today:/ })).toBeNull();
  });

  it('Part 2 data: catalogue adds hours + last active, achievements earned first then locked', () => {
    view({ catalogue: catalogue.data, achievements: achievements.data, achievementsHref: '/achievements' });
    const inf = screen.getAllByRole('article').find((a) => /Infection/.test(a.textContent));
    expect(within(inf).getByText(/2 h/)).toBeInTheDocument();
    expect(within(inf).getByText(/Last active/)).toBeInTheDocument();
    const ach = screen.getByRole('region', { name: 'Latest achievements' });
    expect(within(ach).getAllByRole('listitem').map((li) => li.querySelector('b').textContent))
      .toEqual(['Course Complete', 'Quiz Streak', 'First Steps']);
  });

  it('error: notice with retry, no tiles', () => {
    const onRetry = jest.fn();
    view({ status: 'error', onRetry });
    expect(screen.queryByRole('list', { name: 'Courses by status' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('all done: "up to date" line, no alert', () => {
    const done = { ...v2, courses: v2.courses.map((c) => ({ ...c, status: 'completed' })), deadlines: [] };
    view({ dashboard: done });
    expect(screen.getByText('You are up to date. Nice work!')).toBeInTheDocument();
  });

  it('Thai, no platform words', () => {
    const { container } = view({}, 'th');
    expect(screen.getByRole('heading', { name: /^หลักสูตรของฉัน/ })).toBeInTheDocument();
    expect(screen.getByText('ต่อเนื่อง 4 สัปดาห์')).toBeInTheDocument();
    expect(visibleWords(container)).not.toMatch(BANNED_WORDS);
  });
});

describe('toCard / pickResume / statusTone', () => {
  const course = dashboard.data.courses[0];
  it('progress from units, due from deadline, in_progress within 7 days → due_soon', () => {
    const c = toCard({ ...course, status: 'in_progress' }, { deadline: { due_at: '2026-11-12T23:59:59+07:00', days_left: 2 }, locale: 'en' });
    expect(c.progress).toBe(71);
    expect(c.status).toBe('due_soon');
    expect(c.daysLeft).toBe(2);
  });
  it('statusTone maps every status to the four D-92 tones', () => {
    expect(['not_started', 'in_progress', 'almost', 'due_soon', 'completed', 'passed', 'overdue', undefined].map(statusTone))
      .toEqual(['todo', 'progress', 'progress', 'progress', 'done', 'done', 'overdue', 'todo']);
  });
  it('pickResume: overdue first, then most recent in progress, then soonest to do', () => {
    const c = (status, extra) => ({ status, title: status, ...extra });
    expect(pickResume([c('in_progress'), c('overdue', { dueAt: '2026-11-02' })]).status).toBe('overdue');
    expect(pickResume([c('not_started'), c('in_progress', { lastActivityAt: '1' }), c('almost', { lastActivityAt: '2' })]).status).toBe('almost');
    expect(pickResume([c('completed')])).toBeNull();
  });
});
