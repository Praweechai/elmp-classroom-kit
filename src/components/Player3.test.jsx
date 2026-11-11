import { useRef } from 'react';
import {
  fireEvent, render, screen, within,
} from '@testing-library/react';
import { axe } from 'jest-axe';

import { outline } from '../__fixtures__/portal';
import { BANNED_WORDS, renderKit, visibleWords } from '../testUtils';
import PlayerLayout3, { flattenOutline } from './Player3';
import {
  DEFAULT_DISPLAY, DISPLAY_KEY, displayMessage, postDisplay, sanitizeDisplay, useLessonDisplay,
} from '../player/useDisplaySettings';

// Plan 5 P5-3.01 — S-105 course player 3.
const resources = [{ title: 'WHO poster', href: '/static/poster.pdf', type: 'PDF' }];
const player = (props = {}, locale = 'en') => renderKit(
  <PlayerLayout3
    courseTitle="Infection Control & Hand Hygiene"
    backHref="/learner-dashboard/"
    sections={outline}
    resources={resources}
    progress={43}
    locale={locale}
    onLocaleChange={() => {}}
    {...props}
  >
    <p>Lesson here</p>
  </PlayerLayout3>,
  { locale },
);
const root = () => document.querySelector('.cls3-player');

beforeEach(() => { window.localStorage.clear(); });

describe('PlayerLayout3', () => {
  it('top bar, breadcrumb + unit title, lesson, pager with n / N; axe clean', async () => {
    const { container } = player();
    expect(screen.getByRole('link', { name: 'Back to My Learning' })).toHaveAttribute('href', '/learner-dashboard/');
    expect(screen.getByText('Infection Control & Hand Hygiene')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Video: Contact precautions' })).toBeInTheDocument();
    expect(screen.getByText('2. Isolation precautions', { selector: '.cls3-lesson__crumb' })).toBeInTheDocument();
    expect(screen.getByText('Lesson here')).toBeInTheDocument();
    expect(screen.getByText('Unit 4 of 7')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Previous: Video: Standard precautions' })[0]).toHaveAttribute('href', '#q3');
    expect(screen.getAllByRole('link', { name: 'Next: Quiz: Choose the right PPE' })).toHaveLength(2); // arrow + footer
    expect(await axe(container)).toHaveNoViolations();
  });

  it('outline: current module open, numbered units, current marked, locked not a link, toggle module', () => {
    player();
    const nav = screen.getByRole('complementary', { name: 'Course navigation' });
    expect(within(nav).getByRole('progressbar', { name: 'Course progress' })).toHaveAttribute('aria-valuenow', '43');
    const mod1 = within(nav).getByRole('button', { name: /Why hand hygiene matters/ });
    expect(mod1).toHaveAttribute('aria-expanded', 'false');
    expect(within(nav).getByRole('link', { name: /Video: Contact precautions \(you are here/ })).toHaveAttribute('aria-current', 'page');
    fireEvent.click(mod1);
    expect(within(nav).getByRole('link', { name: /Video: The 5 moments \(completed\)/ })).toBeInTheDocument();
    fireEvent.click(within(nav).getByRole('button', { name: /Cleaning and waste/ }));
    expect(within(nav).queryByRole('link', { name: /Final quiz/ })).toBeNull();
    expect(within(nav).getByText('Final quiz')).toBeInTheDocument();
    expect(within(nav).getByText('3.2')).toBeInTheDocument();
  });

  it('outline search and Resources tab (keyboard between tabs)', () => {
    player();
    const nav = screen.getByRole('complementary', { name: 'Course navigation' });
    fireEvent.change(within(nav).getByRole('searchbox', { name: 'Search outline' }), { target: { value: 'spill' } });
    expect(within(nav).getAllByRole('link')).toHaveLength(1);
    expect(within(nav).getByRole('link', { name: /Spill kit steps/ })).toBeInTheDocument();
    const tab = within(nav).getByRole('tab', { name: 'Course outline' });
    fireEvent.keyDown(tab, { key: 'ArrowRight' });
    expect(within(nav).getByRole('tab', { name: 'Resources' })).toHaveAttribute('aria-selected', 'true');
    expect(within(nav).getByRole('link', { name: /WHO poster/ })).toHaveAttribute('href', '/static/poster.pdf');
  });

  it('no Resources tab when the course has none', () => {
    player({ resources: [] });
    expect(screen.queryByRole('tab', { name: 'Resources' })).toBeNull();
  });

  it('outline toggle hides and shows the panel', () => {
    player();
    const toggle = screen.getByRole('button', { name: 'Course outline' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(toggle);
    expect(screen.queryByRole('complementary')).toBeNull();
    fireEvent.click(toggle);
    expect(screen.getByRole('complementary')).toBeInTheDocument();
  });

  it('dark mode + accessibility panel set the root, persist, and are reported for the lesson', () => {
    const onDisplayChange = jest.fn();
    player({ onDisplayChange });
    fireEvent.click(screen.getByRole('button', { name: 'Dark mode' }));
    expect(root()).toHaveAttribute('data-theme', 'dark');
    fireEvent.click(screen.getByRole('button', { name: 'Accessibility options' }));
    fireEvent.click(screen.getByRole('button', { name: 'Larger text' }));
    expect(root().style.getPropertyValue('--cls3-text-scale')).toBe('1.1');
    fireEvent.click(screen.getByRole('switch', { name: 'High contrast' }));
    expect(root()).toHaveAttribute('data-contrast', 'high');
    expect(JSON.parse(window.localStorage.getItem(DISPLAY_KEY))).toMatchObject({ theme: 'dark', textScale: 110, contrast: true });
    expect(onDisplayChange).toHaveBeenLastCalledWith(expect.objectContaining({ theme: 'dark', textScale: 110, contrast: true }));
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(root()).toHaveAttribute('data-theme', 'light');
    expect(root()).not.toHaveAttribute('data-contrast');
  });

  it('search in course finds open units only and reports the choice', () => {
    const onNavigate = jest.fn();
    player({ onNavigate });
    fireEvent.click(screen.getByRole('button', { name: 'Search in this course' }));
    const box = screen.getByRole('search');
    fireEvent.change(within(box).getByRole('searchbox'), { target: { value: 'quiz' } });
    const hits = within(box).getAllByRole('link');
    expect(hits).toHaveLength(1); // "Final quiz" is locked
    fireEvent.click(hits[0]);
    expect(onNavigate).toHaveBeenCalledWith(expect.objectContaining({ id: 'q5' }));
    expect(screen.queryByRole('search')).toBeNull();
  });

  it('← / → press the side arrows; ignored while typing', () => {
    const onNavigate = jest.fn();
    player({ onNavigate });
    fireEvent.keyDown(document.body, { key: 'ArrowRight' });
    expect(onNavigate).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'q5' }));
    fireEvent.keyDown(document.body, { key: 'ArrowLeft' });
    expect(onNavigate).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'q3' }));
    onNavigate.mockClear();
    fireEvent.keyDown(screen.getByRole('searchbox', { name: 'Search outline' }), { key: 'ArrowRight' });
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('first unit: previous disabled', () => {
    const first = outline.map((s, i) => ({
      ...s, items: s.items.map((it, j) => ({ ...it, current: i === 0 && j === 0 })),
    }));
    player({ sections: first });
    screen.getAllByRole('button', { name: 'Previous' }).forEach((b) => expect(b).toBeDisabled());
  });

  it('Thai, no platform words', () => {
    const { container } = player({}, 'th');
    expect(screen.getByRole('link', { name: 'กลับไปที่การเรียนของฉัน' })).toBeInTheDocument();
    expect(visibleWords(container)).not.toMatch(BANNED_WORDS);
  });
});

describe('display settings', () => {
  it('sanitizes values and builds the lesson message', () => {
    expect(sanitizeDisplay({ theme: 'neon', textScale: 999, contrast: 'yes' })).toEqual({ ...DEFAULT_DISPLAY, textScale: 160 });
    expect(sanitizeDisplay({ textScale: 74 })).toMatchObject({ textScale: 80 });
    expect(displayMessage({ theme: 'dark' })).toEqual({ type: 'elmp.display', ...DEFAULT_DISPLAY, theme: 'dark' });
  });

  it('postDisplay sends to the frame with the given origin and never throws', () => {
    const frame = { postMessage: jest.fn() };
    postDisplay(frame, { spacing: true }, 'http://local.openedx.io');
    expect(frame.postMessage).toHaveBeenCalledWith(expect.objectContaining({ type: 'elmp.display', spacing: true }), 'http://local.openedx.io');
    expect(() => postDisplay({ postMessage: () => { throw new Error('gone'); } }, {})).not.toThrow();
    expect(() => postDisplay(null, {})).not.toThrow();
  });

  it('flattenOutline numbers units and keeps the section title', () => {
    const units = flattenOutline(outline);
    expect(units).toHaveLength(7);
    expect(units[3]).toMatchObject({ id: 'q4', number: '2.2', sectionTitle: '2. Isolation precautions' });
  });

  it('flattenOutline: no second number when the title already has one (V-7.01, "1.1 0.1 Welcome")', () => {
    const units = flattenOutline([{ id: 's', title: '0.1 Welcome', items: [{ id: 'u', title: '0.1 Welcome', href: '/u' }] },
      { id: 't', title: '2. Two', items: [{ id: 'v', title: '2. Plain', href: '/v' }] }]);
    expect(units.map((u) => u.number)).toEqual(['', '2.1']);
  });
});

describe('useLessonDisplay', () => {
  const LESSON = 'http://local.openedx.io';
  const Frame = ({ settings }) => { // eslint-disable-line react/prop-types
    const ref = useRef(null);
    useLessonDisplay(ref, settings, LESSON);
    return <iframe ref={ref} title="lesson" />;
  };

  it('posts on mount, on change, and when the lesson says ready (from its own frame and origin only)', () => {
    const settings = { ...DEFAULT_DISPLAY, theme: 'dark' };
    const { rerender } = render(<Frame settings={settings} />);
    const win = document.querySelector('iframe').contentWindow;
    const post = jest.spyOn(win, 'postMessage');
    rerender(<Frame settings={{ ...settings, spacing: true }} />);
    expect(post).toHaveBeenLastCalledWith(expect.objectContaining({ type: 'elmp.display', spacing: true }), LESSON);
    post.mockClear();
    const ready = { type: 'elmp.activity', kind: 'ready' };
    window.dispatchEvent(new MessageEvent('message', { data: ready, origin: 'http://evil.example', source: win }));
    window.dispatchEvent(new MessageEvent('message', { data: { ...ready, kind: 'input' }, origin: LESSON, source: win }));
    expect(post).not.toHaveBeenCalled();
    window.dispatchEvent(new MessageEvent('message', { data: ready, origin: LESSON, source: win }));
    expect(post).toHaveBeenCalledWith(expect.objectContaining({ theme: 'dark', spacing: true }), LESSON);
  });
});
