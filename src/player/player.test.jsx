import { act, fireEvent, screen } from '@testing-library/react';
import { axe } from 'jest-axe';

import { renderKit } from '../testUtils';
import CourseOutline, { OutlineDrawer, OutlineRail } from '../components/CourseOutline';
import IdleDialog from '../components/IdleDialog';
import { PlayerTopBar } from '../components/Player';
import useIdleTimer, { isBridgeMessage } from './useIdleTimer';
import useActivitySender, { beacon, chunks } from './useActivitySender';

// Plan 4 · P4-6 kit 1.1: player tree (F-116) + inactivity and time on task (F-117).

const LMS = 'http://local.openedx.io';
const sections = [
  {
    id: 's1',
    title: 'Why hand hygiene matters',
    items: [
      {
        id: 'u1', title: 'Intro', complete: true, href: '#u1',
      },
      {
        id: 'u2', title: 'The five moments', current: true, href: '#u2',
      },
    ],
  },
  {
    id: 's2',
    title: 'Practice',
    items: [{
      id: 'u3', title: 'Quiz', complete: true, href: '#u3',
    }],
  },
  { id: 's3', title: 'Gated', items: [{ id: 'u4', title: 'Final', locked: true }] },
];

const bridge = (kind, origin = LMS) => act(() => {
  window.dispatchEvent(new MessageEvent('message', { data: { type: 'elmp.activity', v: 1, kind }, origin }));
});

describe('player tree (F-116)', () => {
  it('numbers modules and topics, marks module state', async () => {
    const { container } = renderKit(<OutlineDrawer sections={sections} onClose={() => {}} />);
    const nums = [...container.querySelectorAll('.cls-outline__num')].map((n) => n.textContent);
    expect(nums).toEqual(['1', '1.1', '1.2', '2', '2.1', '3', '3.1']);
    expect(container.querySelector('.cls-outline__mark--ring')).toBeInTheDocument();
    expect(container.querySelectorAll('.cls-outline__mark--complete')).toHaveLength(1);
    expect(container.querySelectorAll('.cls-outline__mark--locked')).toHaveLength(1);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('course home outline stays without numbers', () => {
    const { container } = renderKit(<CourseOutline sections={sections} />);
    expect(container.querySelector('.cls-outline__num')).toBeNull();
  });

  it('rail brings the tree back; top bar has a labelled Outline button and %', async () => {
    const onOpen = jest.fn();
    const { container, unmount } = renderKit(<OutlineRail onOpen={onOpen} />);
    fireEvent.click(screen.getByRole('button', { name: 'Show course outline' }));
    expect(onOpen).toHaveBeenCalled();
    expect(await axe(container)).toHaveNoViolations();
    unmount();
    renderKit(<PlayerTopBar courseTitle="INF101" courseHref="#c" unitIndex={4} unitCount={12} progress={33} onToggleOutline={() => {}} />);
    const btn = screen.getByRole('button', { name: 'Course outline' });
    expect(btn).toHaveTextContent('Outline');
    expect(screen.getByText('33%')).toBeInTheDocument();
    expect(screen.getByText('Unit 4 of 12')).toBeInTheDocument();
  });
});

describe('IdleDialog', () => {
  it('warning: countdown + I am here, focus on the button; paused state', async () => {
    const onResume = jest.fn();
    const { container, unmount } = renderKit(<IdleDialog state="warning" secondsLeft={42} onResume={onResume} />);
    const dialog = screen.getByRole('alertdialog', { name: 'Are you still there?' });
    expect(dialog).toHaveTextContent('Your lesson will pause in 42 seconds.');
    expect(screen.getByRole('button', { name: "I'm here" })).toHaveFocus();
    expect(await axe(container)).toHaveNoViolations();
    unmount();
    renderKit(<IdleDialog state="paused" onResume={onResume} />);
    fireEvent.click(screen.getByRole('button', { name: 'Continue learning' }));
    expect(onResume).toHaveBeenCalled();
    expect(screen.getByRole('alertdialog', { name: 'Paused — continue when ready' })).toBeInTheDocument();
  });

  it('active: nothing shown', () => {
    const { container } = renderKit(<IdleDialog state="active" onResume={() => {}} />);
    expect(container.querySelector('.cls-idle')).toBeNull();
  });
});

let timer;
const Probe = (props) => {
  timer = useIdleTimer(props);
  return <output>{`${timer.state}:${timer.secondsLeft}`}</output>;
};

describe('useIdleTimer (fake timers, test setting 20 s)', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  const tick = (s) => act(() => { jest.advanceTimersByTime(s * 1000); });

  it('active → warning after idle → paused after the countdown; I am here resumes', () => {
    const onPause = jest.fn();
    renderKit(<Probe idleSeconds={20} warnSeconds={5} bridgeOrigins={[LMS]} onPause={onPause} />);
    tick(19);
    expect(timer.state).toBe('active');
    tick(1);
    expect(timer.state).toBe('warning');
    tick(2);
    expect(timer.secondsLeft).toBe(3);
    tick(3);
    expect(timer.state).toBe('paused');
    expect(onPause).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(window, { key: 'a' }); // input alone does not leave "paused"
    expect(timer.state).toBe('paused');
    act(() => timer.resume());
    expect(timer.state).toBe('active');
  });

  it('input or a bridge message during the warning keeps the learner active', () => {
    renderKit(<Probe idleSeconds={20} warnSeconds={10} bridgeOrigins={[LMS]} />);
    tick(20);
    expect(timer.state).toBe('warning');
    fireEvent.pointerDown(window);
    expect(timer.state).toBe('active');
    tick(20);
    expect(timer.state).toBe('warning');
    bridge('input');
    expect(timer.state).toBe('active');
  });

  it('a playing video never triggers the warning; messages from other origins are ignored', () => {
    renderKit(<Probe idleSeconds={20} warnSeconds={10} bridgeOrigins={[LMS]} />);
    bridge('video-playing');
    for (let i = 0; i < 6; i += 1) { tick(15); bridge('video-playing'); }
    expect(timer.state).toBe('active');
    bridge('video-paused');
    tick(20);
    expect(timer.state).toBe('warning');
    act(() => timer.resume());
    bridge('input', 'http://evil.example');
    tick(20);
    expect(timer.state).toBe('warning');
    expect(isBridgeMessage({ data: { type: 'elmp.activity' }, origin: LMS }, [LMS])).toBe(true);
    expect(isBridgeMessage({ data: { type: 'other' }, origin: LMS }, [LMS])).toBe(false);
  });

  it('counts active seconds only while active and visible', () => {
    renderKit(<Probe idleSeconds={20} warnSeconds={5} bridgeOrigins={[LMS]} />);
    tick(10);
    expect(timer.takeSeconds()).toBe(10);
    expect(timer.takeSeconds()).toBe(0);
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    tick(5);
    expect(timer.takeSeconds()).toBe(0);
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
    tick(30); // 5 s active, then warning + paused: not counted
    const counted = timer.takeSeconds();
    expect(counted).toBeGreaterThanOrEqual(4);
    expect(counted).toBeLessThanOrEqual(6);
    act(() => timer.giveBack(7));
    expect(timer.takeSeconds()).toBe(7);
  });

  it('disabled: always active', () => {
    renderKit(<Probe enabled={false} idleSeconds={20} />);
    tick(60);
    expect(timer.state).toBe('active');
  });
});

const Sender = (props) => { useActivitySender(props); return null; };

describe('useActivitySender (CA-12)', () => {
  beforeEach(() => jest.useFakeTimers({ now: new Date('2026-11-06T03:00:00Z') }));
  afterEach(() => { jest.useRealTimers(); delete navigator.sendBeacon; });

  it('splits big amounts into ≤ 70 s parts', () => {
    expect(chunks(0)).toEqual([]);
    expect(chunks(60)).toEqual([60]);
    expect(chunks(150.7)).toEqual([70, 70, 10]);
  });

  it('posts every 60 s with the Bangkok day; gives seconds back when the Portal fails', async () => {
    let pending = 60;
    const takeSeconds = jest.fn(() => { const s = pending; pending = 0; return s; });
    const giveBack = jest.fn();
    const client = { activity: jest.fn().mockResolvedValue({}), activityUrl: () => 'http://portal/api/classroom/v1/activity' };
    const { unmount } = renderKit(<Sender client={client} courseKey="course-v1:MHB+INF101+2026" takeSeconds={takeSeconds} giveBack={giveBack} />);
    await act(async () => { jest.advanceTimersByTime(60000); });
    expect(client.activity).toHaveBeenCalledWith({ courseKey: 'course-v1:MHB+INF101+2026', seconds: 60, day: '2026-11-06' });
    client.activity.mockRejectedValueOnce(new Error('down'));
    pending = 45;
    await act(async () => { jest.advanceTimersByTime(60000); });
    expect(giveBack).toHaveBeenCalledWith(45);
    navigator.sendBeacon = jest.fn(() => true);
    pending = 12;
    unmount(); // leaving the player sends the rest as a beacon
    expect(navigator.sendBeacon).toHaveBeenCalledWith('http://portal/api/classroom/v1/activity', expect.any(Blob));
  });

  it('beacon on page hide (text/plain JSON); false when not supported', async () => {
    expect(beacon('http://x', {})).toBe(false);
    navigator.sendBeacon = jest.fn(() => true);
    let pending = 30;
    const takeSeconds = () => { const s = pending; pending = 0; return s; };
    const client = { activity: jest.fn(), activityUrl: () => 'http://portal/a' };
    renderKit(<Sender client={client} courseKey="k" takeSeconds={takeSeconds} giveBack={() => {}} />);
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    act(() => { document.dispatchEvent(new Event('visibilitychange')); });
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
    const [url, blob] = navigator.sendBeacon.mock.calls[0];
    expect(url).toBe('http://portal/a');
    expect(blob.type).toBe('text/plain');
    const text = await new Promise((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.readAsText(blob);
    });
    expect(JSON.parse(text)).toEqual({ course_key: 'k', seconds: 30, day: '2026-11-06' });
  });
});
