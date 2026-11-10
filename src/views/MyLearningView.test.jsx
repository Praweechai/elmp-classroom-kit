import { fireEvent, screen, within } from '@testing-library/react';
import { axe } from 'jest-axe';

import { achievements, catalogue } from '../__fixtures__/classroom2';
import { dashboard } from '../__fixtures__/portal';
import { BANNED_WORDS, renderKit, visibleWords } from '../testUtils';
import MyLearningView, { toCard } from './MyLearningView';

// Plan 5 P5-2.02 — S-100 My Learning.
const now = new Date('2026-11-10T09:00:00+07:00');
const view = (props = {}, locale = 'en') => renderKit(
  <MyLearningView dashboard={dashboard.data} firstName="Nok" now={now} {...props} />,
  { locale },
);
const cardTitles = () => screen.getAllByRole('article').map((a) => within(a).getByRole('heading').textContent);

describe('MyLearningView', () => {
  it('Part 1 data only: welcome, 4 rings, in-progress cards (not completed / not started), right column; axe clean', async () => {
    const { container } = view();
    expect(screen.getByText('Welcome back, Nok. You have 2 courses in progress.')).toBeInTheDocument();
    expect(screen.getByText('Required done')).toBeInTheDocument();
    expect(screen.getAllByText('1/2').length).toBeGreaterThan(0);
    expect(screen.getAllByText('12/20').length).toBeGreaterThan(0);
    expect(cardTitles()).toEqual(['Infection Control & Hand Hygiene', 'Patient Safety Basics']);
    expect(screen.getByText('Almost done')).toBeInTheDocument();
    expect(screen.getAllByText('Overdue').length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: 'Upcoming deadlines' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Next quizzes' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Learning streak' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Latest achievements' })).toBeNull(); // Part 2
    expect(await axe(container)).toHaveNoViolations();
  });

  it('sort by title and progress; grid/list toggle', () => {
    view();
    fireEvent.change(screen.getByRole('combobox', { name: 'Sort' }), { target: { value: 'progress' } });
    expect(cardTitles()[0]).toBe('Infection Control & Hand Hygiene');
    fireEvent.change(screen.getByRole('combobox', { name: 'Sort' }), { target: { value: 'due' } });
    expect(cardTitles()[0]).toBe('Patient Safety Basics');
    fireEvent.click(screen.getByRole('button', { name: 'List view' }));
    expect(screen.getByRole('button', { name: 'List view' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByRole('article')[0]).toHaveClass('cls3-course--list');
  });

  it('category pills filter the cards', () => {
    view();
    fireEvent.click(screen.getByRole('button', { name: 'Patient safety' }));
    expect(cardTitles()).toEqual(['Patient Safety Basics']);
    fireEvent.click(screen.getByRole('button', { name: 'All' }));
    expect(cardTitles()).toHaveLength(2);
  });

  it('Part 2 data: catalogue adds hours + last active, achievements card shows earned first then locked', () => {
    view({ catalogue: catalogue.data, achievements: achievements.data, achievementsHref: '/achievements' });
    const inf = screen.getAllByRole('article')[0];
    expect(within(inf).getByText(/2 h/)).toBeInTheDocument();
    expect(within(inf).getByText(/Last active/)).toBeInTheDocument();
    const ach = screen.getByRole('region', { name: 'Latest achievements' });
    expect(within(ach).getAllByRole('listitem').map((li) => li.querySelector('b').textContent))
      .toEqual(['Course Complete', 'Quiz Streak', 'First Steps']);
    expect(within(ach).getByRole('link', { name: 'View all achievements' })).toHaveAttribute('href', '/achievements');
  });

  it('error: rings show —, notice with retry', () => {
    const onRetry = jest.fn();
    view({ status: 'error', onRetry });
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(4);
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('streak hidden when switched off', () => {
    view({ features: { streak: false } });
    expect(screen.queryByRole('heading', { name: 'Learning streak' })).toBeNull();
  });

  it('Thai, no platform words', () => {
    const { container } = view({}, 'th');
    expect(screen.getByRole('heading', { name: 'กำลังเรียน' })).toBeInTheDocument();
    expect(visibleWords(container)).not.toMatch(BANNED_WORDS);
  });
});

describe('toCard', () => {
  const course = dashboard.data.courses[0];
  it('progress from units, due from deadline, in_progress within 7 days → due_soon', () => {
    const c = toCard({ ...course, status: 'in_progress' }, { deadline: { due_at: '2026-11-12T23:59:59+07:00', days_left: 2 }, locale: 'en' });
    expect(c.progress).toBe(71);
    expect(c.status).toBe('due_soon');
    expect(c.dueAt).toBe('2026-11-12T23:59:59+07:00');
  });
});
