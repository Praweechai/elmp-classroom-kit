/**
 * Activity bridge (F-117): runs the real script inside a jsdom iframe and listens as the player.
 */
const fs = require('fs');
const path = require('path');

const SCRIPT = fs.readFileSync(path.join(__dirname, '../elmp_activity/static/elmp-activity.js'), 'utf8');

function lessonFrame(parentOrigin = window.location.origin) {
  const frame = document.createElement('iframe');
  document.body.appendChild(frame);
  const win = frame.contentWindow;
  win.document.body.innerHTML = '<p>lesson</p><video></video>';
  win.ELMP_ACTIVITY = { parentOrigin };
  win.eval(SCRIPT);
  return win;
}

function collect() {
  const seen = [];
  const listener = (event) => { if (event.data && event.data.type === 'elmp.activity') { seen.push(event.data); } };
  window.addEventListener('message', listener);
  return { seen, stop: () => window.removeEventListener('message', listener) };
}

function playerSays(win, data, origin) {
  win.dispatchEvent(new win.MessageEvent('message', { data, origin }));
}

const tick = () => new Promise((resolve) => { setTimeout(resolve, 20); });

afterEach(() => { document.body.innerHTML = ''; });

test('says ready, reports input at most once per 10 s, reports video play/pause', async () => {
  const log = collect();
  const win = lessonFrame();
  await tick();
  win.document.dispatchEvent(new win.Event('keydown'));
  win.document.dispatchEvent(new win.Event('pointerdown'));
  const video = win.document.querySelector('video');
  video.dispatchEvent(new win.Event('play'));
  video.dispatchEvent(new win.Event('pause'));
  await tick();
  log.stop();
  expect(log.seen.map((m) => m.kind)).toEqual(['ready', 'input', 'video-playing', 'video-paused']);
  expect(Object.keys(log.seen[1]).sort()).toEqual(['kind', 'type', 'unit', 'v']); // no personal data
});

test('pauses videos when the player asks', () => {
  const win = lessonFrame();
  const pause = jest.fn();
  win.HTMLMediaElement.prototype.pause = pause;
  playerSays(win, { type: 'elmp.pause' }, window.location.origin);
  expect(pause).toHaveBeenCalledTimes(1);
});

test('ignores pause requests from another origin or of another type', () => {
  const win = lessonFrame('http://apps.local.openedx.io');
  const pause = jest.fn();
  win.HTMLMediaElement.prototype.pause = pause;
  playerSays(win, { type: 'elmp.pause' }, 'http://evil.example');
  playerSays(win, { type: 'other' }, 'http://apps.local.openedx.io');
  expect(pause).not.toHaveBeenCalled();
});

test('forwards H5P xAPI verbs, hooking each dispatcher once', async () => {
  const log = collect();
  const win = lessonFrame();
  const handlers = [];
  win.H5P = { externalDispatcher: { on: (name, fn) => handlers.push(fn) } };
  await new Promise((resolve) => { setTimeout(resolve, 2100); }); // next scan
  win.document.body.innerHTML += '<iframe></iframe>';
  win.document.querySelector('iframe').contentWindow.H5P = win.H5P; // same dispatcher seen twice
  await new Promise((resolve) => { setTimeout(resolve, 2100); });
  expect(handlers).toHaveLength(1);
  handlers.forEach((fn) => fn({ getVerb: () => 'completed' }));
  await tick();
  log.stop();
  expect(log.seen.find((m) => m.kind === 'h5p')).toMatchObject({ verb: 'completed' });
});

test('does nothing outside an iframe or without a parent origin', () => {
  window.ELMP_ACTIVITY = { parentOrigin: window.location.origin };
  window.eval(SCRIPT);
  expect(window.__elmpActivity).toBeUndefined();
});

test('applies display settings from the player only (Plan 5 · P5-3.02)', () => {
  const win = lessonFrame('http://apps.local.openedx.io');
  const html = win.document.documentElement;
  playerSays(win, {
    type: 'elmp.display', theme: 'dark', textScale: 999, contrast: true, spacing: false, reduceMotion: true,
  }, 'http://apps.local.openedx.io');
  expect(html.getAttribute('data-elmp-theme')).toBe('dark');
  expect(html.getAttribute('data-elmp-contrast')).toBe('on');
  expect(html.hasAttribute('data-elmp-spacing')).toBe(false);
  expect(html.getAttribute('data-elmp-motion')).toBe('on');
  expect(html.style.getPropertyValue('--elmp-text-scale')).toBe('1.6');
  playerSays(win, { type: 'elmp.display', theme: '<x>', textScale: 'big' }, 'http://apps.local.openedx.io');
  expect(html.getAttribute('data-elmp-theme')).toBe('light');
  expect(html.hasAttribute('data-elmp-contrast')).toBe(false);
  expect(html.style.getPropertyValue('--elmp-text-scale')).toBe('1');
  playerSays(win, { type: 'elmp.display', theme: 'dark' }, 'http://evil.example');
  expect(html.getAttribute('data-elmp-theme')).toBe('light');
});
