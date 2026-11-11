import {
  act, render, screen, within,
  renderHook,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from 'react-intl';

import th from '../i18n/th.json';
import {
  CertificateRow, EndCard, FocusBreakDialog, KnowledgeCard, ReadingLine, SessionTimer, clockText, scrollFraction,
  useSession,
} from './Player4';
import { OutlinePanel, PlayerTopBar3 } from './Player3';

const wrap = (ui, locale = 'en') => render(<IntlProvider locale={locale} messages={locale === 'th' ? th : {}}>{ui}</IntlProvider>);

beforeEach(() => { window.localStorage.clear(); });

describe('useSession: session clock + focus block → break (V-4.01)', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('counts only while running; focus block reached → ask → break stops the clock → back', () => {
    const { result, rerender } = renderHook(
      ({ running }) => useSession({ running }),
      { initialProps: { running: true } },
    );
    expect(result.current.focusMin).toBe(25);
    act(() => { jest.advanceTimersByTime(3000); });
    expect(result.current.seconds).toBe(3);
    rerender({ running: false });
    act(() => { jest.advanceTimersByTime(5000); });
    expect(result.current.seconds).toBe(3);
    rerender({ running: true });
    act(() => { result.current.setFocusMin(15); });
    expect(window.localStorage.getItem('elmp.focusMin')).toBe('15');
    act(() => { jest.advanceTimersByTime(15 * 60 * 1000); });
    expect(result.current.phase).toBe('ask');
    const at = result.current.seconds;
    act(() => { result.current.takeBreak(); });
    act(() => { jest.advanceTimersByTime(60 * 1000); });
    expect(result.current.phase).toBe('break');
    expect(result.current.seconds).toBe(at);
    expect(result.current.breakLeft).toBe(240);
    act(() => { result.current.back(); });
    expect(result.current.phase).toBe('learning');
    expect(result.current.focusSeconds).toBe(0);
  });

  it('break ends by itself after 5 minutes; Off never asks; remembered focus choice', () => {
    window.localStorage.setItem('elmp.focusMin', '0');
    const { result } = renderHook(() => useSession());
    expect(result.current.focusMin).toBe(0);
    act(() => { jest.advanceTimersByTime(60 * 60 * 1000); });
    expect(result.current.phase).toBe('learning');
    act(() => { result.current.takeBreak(); });
    act(() => { jest.advanceTimersByTime(5 * 60 * 1000); });
    expect(result.current.phase).toBe('learning');
  });

  it('clockText', () => {
    expect([clockText(0), clockText(65), clockText(3725), clockText(-5)]).toEqual(['0:00', '1:05', '1:02:05', '0:00']);
  });
});

const session = (over = {}) => ({
  seconds: 754,
  focusSeconds: 300,
  focusMin: 25,
  setFocusMin: jest.fn(),
  phase: 'learning',
  breakLeft: 300,
  takeBreak: jest.fn(),
  keepGoing: jest.fn(),
  back: jest.fn(),
  ...over,
});

describe('SessionTimer + FocusBreakDialog', () => {
  it('shows the clock, opens the panel and changes the focus block', async () => {
    const s = session();
    wrap(<SessionTimer session={s} />);
    const btn = screen.getByRole('button', { name: 'Learning time this session: 12:34' });
    await userEvent.click(btn);
    const panel = screen.getByRole('group', { name: 'This session' });
    expect(within(panel).getByRole('button', { name: "25'" })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(within(panel).getByRole('button', { name: 'Off' }));
    expect(s.setFocusMin).toHaveBeenCalledWith(0);
  });

  it('asks for a break, then shows the break clock with "I’m back" (Thai too)', async () => {
    const s = session({ phase: 'ask' });
    const { rerender } = wrap(<FocusBreakDialog session={s} />);
    expect(screen.getByRole('dialog', { name: 'Time for a short break' })).toBeInTheDocument();
    expect(screen.getByText(/You focused for 25 minutes/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Take 5 minutes' }));
    expect(s.takeBreak).toHaveBeenCalled();
    rerender(<IntlProvider locale="th" messages={th}><FocusBreakDialog session={session({ phase: 'break', breakLeft: 125 })} /></IntlProvider>);
    expect(screen.getByRole('dialog', { name: 'กำลังพัก' })).toBeInTheDocument();
    expect(screen.getByText('2:05')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'กลับมาเรียน' })).toHaveFocus();
  });

  it('renders nothing while learning', () => {
    const { container } = wrap(<FocusBreakDialog session={session()} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('outline additions', () => {
  const sections = [{
    id: 's1',
    title: 'Module 1',
    items: [
      {
        id: 'u1', title: 'Hands carry germs', href: '/u1', complete: true,
      },
      {
        id: 'u2', title: 'Why it matters', href: '/u2', current: true,
      },
    ],
  }];

  it('knowledge check card + certificate row (locked / unlocked); done units get a tick', () => {
    const { container, rerender } = wrap(
      <OutlinePanel sections={sections} knowledge={{ correct: 3, total: 8 }} certificate={{ href: '/cert', unlocked: false }} />,
    );
    expect(screen.getByText('My knowledge check')).toBeInTheDocument();
    expect(screen.getByText('3 / 8 correct')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'My knowledge check' })).toHaveAttribute('aria-valuenow', '38');
    expect(screen.getByText('Pass the final quiz to unlock')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Your certificate/ })).toBeNull();
    expect(container.querySelector('.cls3-unit--done .cls3-unit__dot svg')).not.toBeNull();
    rerender(<IntlProvider locale="en" messages={{}}><OutlinePanel sections={sections} certificate={{ href: '/cert', unlocked: true }} /></IntlProvider>);
    expect(screen.getByRole('link', { name: /Your certificate/ })).toHaveAttribute('href', '/cert');
    expect(screen.queryByText('My knowledge check')).toBeNull();
  });

  it('KnowledgeCard hides with no questions; CertificateRow without href stays text', () => {
    const { container } = wrap(<><KnowledgeCard correct={0} total={0} /><CertificateRow unlocked /></>);
    expect(container.querySelector('.cls4-kc')).toBeNull();
    expect(container.querySelector('a')).toBeNull();
  });

  it('top bar shows the session timer only when given', () => {
    const display = { settings: { theme: 'light', textScale: 100 }, update: jest.fn(), reset: jest.fn() };
    const { rerender } = wrap(<PlayerTopBar3 courseTitle="INF101" backHref="/" display={display} />);
    expect(screen.queryByRole('button', { name: /Learning time this session/ })).toBeNull();
    rerender(<IntlProvider locale="en" messages={{}}><PlayerTopBar3 courseTitle="INF101" backHref="/" display={display} session={session()} sessionPaused /></IntlProvider>);
    expect(screen.getByRole('button', { name: /Learning time this session/ })).toHaveClass('is-paused');
  });
});

describe('ReadingLine', () => {
  it('fills with the scroll position of a box or the window', () => {
    expect(scrollFraction({ scrollHeight: 1000, clientHeight: 400, scrollTop: 300 })).toBe(0.5);
    expect(scrollFraction({ scrollHeight: 400, clientHeight: 400, scrollTop: 0 })).toBe(1);
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => { cb(); return 1; });
    const { container } = wrap(<ReadingLine getScroller={() => null} />);
    expect(container.querySelector('.cls4-read i').style.transform).toMatch(/scaleX/);
    window.requestAnimationFrame.mockRestore();
  });
});

describe('EndCard', () => {
  const next = {
    id: 'u3', title: 'The 5 moments', href: '/u3', number: '2.1',
  };
  const prev = {
    id: 'u1', title: 'Hands carry germs', href: '/u1', number: '1.1',
  };

  it('lists what is left (video, checks, activities once), Next stays usable but soft', () => {
    const { container } = wrap(<EndCard left={['video', 'quiz-check', 'order', 'sort']} next={next} prev={prev} />);
    expect(screen.getByText('Almost there')).toBeInTheDocument();
    expect(screen.getByText('Watch the video to 95% · Answer the check questions · Finish the activity')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /Next · 2.1/ });
    expect(link).toHaveAttribute('href', '/u3');
    expect(link).toHaveClass('is-soft');
    expect(screen.getByRole('link', { name: /1.1 Hands carry germs/ })).toHaveAttribute('href', '/u1');
    expect(container.querySelector('.cls4-end.is-ok')).toBeNull();
  });

  it('page complete: saved line, strong Next; nothing known = nothing to wait for; Thai', () => {
    const onNavigate = jest.fn();
    const { rerender } = wrap(<EndCard left={[]} complete next={next} onNavigate={onNavigate} />);
    expect(screen.getByText('Page complete')).toBeInTheDocument();
    expect(screen.getByText('Saved to your progress')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Next/ })).not.toHaveClass('is-soft');
    rerender(<IntlProvider locale="th" messages={th}><EndCard left={null} next={{ ...next, locked: true }} /></IntlProvider>);
    expect(screen.getByText('หน้านี้เสร็จแล้ว')).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeNull();
  });
});
