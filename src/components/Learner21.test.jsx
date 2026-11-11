import { act, fireEvent, screen } from '@testing-library/react';

import { learningTime } from '../__fixtures__/classroom2';
import { renderKit } from '../testUtils';
import { DISPLAY_KEY } from '../player/useDisplaySettings';
import { ClassroomShell3 } from './Shell3';
import {
  StatusTiles, TodayCard, WeekColumns, motionAllowed,
} from './Learner21';

// Kit 2.1 motion rules (doc 10 V-1.01): no motion without matchMedia, with the OS setting, or with "Reduce motion";
// numbers count up only when motion is allowed; dark mode button on the shell (same store as the player).

const setMotion = (reduce) => {
  window.matchMedia = jest.fn().mockImplementation((q) => ({
    matches: q.includes('reduce') ? reduce : false, media: q, addEventListener: jest.fn(), removeEventListener: jest.fn(),
  }));
};

afterEach(() => {
  delete window.matchMedia;
  window.localStorage.clear();
  jest.useRealTimers();
});

describe('motion rules', () => {
  it('motionAllowed: false without matchMedia, false with OS reduce, false inside data-motion=reduce, true otherwise', () => {
    expect(motionAllowed(document.body)).toBe(false);
    setMotion(true);
    expect(motionAllowed(document.body)).toBe(false);
    setMotion(false);
    expect(motionAllowed(document.body)).toBe(true);
    const wrap = document.createElement('div');
    wrap.setAttribute('data-motion', 'reduce');
    const inner = document.createElement('span');
    wrap.appendChild(inner);
    expect(motionAllowed(inner)).toBe(false);
  });

  it('tile numbers count up when motion is allowed, and show the final value without motion', () => {
    const counts = {
      todo: 2, progress: 5, done: 1, overdue: 3,
    };
    const { unmount } = renderKit(<StatusTiles counts={counts} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: '5 In progress' }).querySelector('.cls3-tile__n').textContent).toBe('5');
    unmount();

    setMotion(false);
    let now = 0;
    jest.spyOn(performance, 'now').mockImplementation(() => now);
    const frames = [];
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => { frames.push(cb); return frames.length; });
    renderKit(<StatusTiles counts={counts} onChange={() => {}} />);
    const n = () => screen.getByRole('button', { name: '5 In progress' }).querySelector('.cls3-tile__n').textContent;
    expect(n()).toBe('0');
    act(() => { now = 800; frames.splice(0).forEach((cb) => cb(now)); });
    expect(n()).toBe('5');
    window.requestAnimationFrame.mockRestore();
    performance.now.mockRestore();
  });

  it('tiles toggle the filter; overdue with items is marked', () => {
    const onChange = jest.fn();
    renderKit(<StatusTiles counts={{ overdue: 1 }} value="overdue" onChange={onChange} />);
    const over = screen.getByRole('button', { name: '1 Overdue' });
    expect(over).toHaveClass('has-items');
    fireEvent.click(over);
    expect(onChange).toHaveBeenCalledWith('all');
    fireEvent.click(screen.getByRole('button', { name: '0 To do' }));
    expect(onChange).toHaveBeenCalledWith('todo');
  });
});

describe('Today card + week columns (D-93)', () => {
  const wed = new Date('2026-11-11T09:00:00+07:00');
  it('marks learning days and today; future days have no minutes', () => {
    const { container } = renderKit(<TodayCard learningTime={learningTime} now={wed} />);
    const days = container.querySelectorAll('.cls3-days li');
    expect(days).toHaveLength(7);
    expect(days[0]).toHaveClass('is-on');
    expect(days[0]).toHaveAttribute('aria-label', 'Mon: 12 min');
    expect(days[2]).toHaveClass('is-today');
    expect(days[2]).not.toHaveClass('is-on');
    expect(days[4]).toHaveAttribute('aria-label', 'Fri');
  });

  it('goal reached text', () => {
    renderKit(<TodayCard learningTime={{ ...learningTime, today_minutes: 20 }} now={wed} />);
    expect(screen.getByText('Goal reached — well done!')).toBeInTheDocument();
  });

  it('week columns: today and future days styled', () => {
    const { container } = renderKit(<WeekColumns days={learningTime.week_days} now={wed} />);
    const cols = container.querySelectorAll('.cls3-week li');
    expect(cols[2]).toHaveClass('is-today');
    expect(cols[6]).toHaveClass('is-future');
  });
});

describe('Shell 3 dark mode (kit 2.1)', () => {
  const links = { home: '#h', courses: '#c', signOut: '#o' };
  it('button toggles data-theme on the shell and saves it in elmp.display', () => {
    const { container } = renderKit(<ClassroomShell3 current="home" title="My Learning" links={links}><p>x</p></ClassroomShell3>);
    const shell = container.querySelector('.cls3-shell');
    expect(shell).toHaveAttribute('data-theme', 'light');
    const btn = screen.getByRole('button', { name: 'Dark mode' });
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(btn);
    expect(shell).toHaveAttribute('data-theme', 'dark');
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    expect(JSON.parse(window.localStorage.getItem(DISPLAY_KEY)).theme).toBe('dark');
  });

  it('starts from the saved player setting (one choice for player and pages); reduce motion carried over', () => {
    window.localStorage.setItem(DISPLAY_KEY, JSON.stringify({ theme: 'dark', reduceMotion: true }));
    const { container } = renderKit(<ClassroomShell3 current="home" title="My Learning" links={links}><p>x</p></ClassroomShell3>);
    const shell = container.querySelector('.cls3-shell');
    expect(shell).toHaveAttribute('data-theme', 'dark');
    expect(shell).toHaveAttribute('data-motion', 'reduce');
  });

  it('hidden tab pauses loops (class on <html>)', () => {
    renderKit(<ClassroomShell3 current="home" title="My Learning" links={links}><p>x</p></ClassroomShell3>);
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    act(() => { document.dispatchEvent(new Event('visibilitychange')); });
    expect(document.documentElement).toHaveClass('cls-tab-hidden');
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
    act(() => { document.dispatchEvent(new Event('visibilitychange')); });
    expect(document.documentElement).not.toHaveClass('cls-tab-hidden');
  });
});
