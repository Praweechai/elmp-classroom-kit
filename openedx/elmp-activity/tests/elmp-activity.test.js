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

/* ---------- Bridge v2 (Plan 5 · doc 10 V-4.02) ---------- */

function collectType(type) {
  const seen = [];
  const listener = (event) => { if (event.data && event.data.type === type) { seen.push(event.data); } };
  window.addEventListener('message', listener);
  return { seen, stop: () => window.removeEventListener('message', listener) };
}

test('requirements: null without ELMP blocks, then what is left, re-sent only when it changes', async () => {
  const log = collectType('elmp.requirements');
  const win = lessonFrame();
  await tick();
  expect(log.seen[0]).toEqual({ type: 'elmp.requirements', v: 1, unit: '', left: null });
  const blocks = [{ kind: 'video', complete: false }, { kind: 'quiz-check', complete: false }];
  win.ElmpBlocks = { blocks, left() { return this.blocks.filter((b) => !b.complete).map((b) => b.kind); } };
  win.document.dispatchEvent(new win.CustomEvent('elmp:block'));
  await tick();
  expect(log.seen.pop().left).toEqual(['video', 'quiz-check']);
  win.document.dispatchEvent(new win.CustomEvent('elmp:block')); // nothing changed → no message
  await tick();
  expect(log.seen).toHaveLength(1);
  blocks[0].complete = true;
  win.document.dispatchEvent(new win.CustomEvent('elmp:block'));
  await tick();
  expect(log.seen.pop().left).toEqual(['quiz-check']);
  playerSays(win, { type: 'elmp.ask' }, window.location.origin); // player asks again → sent even if unchanged
  await tick();
  log.stop();
  expect(log.seen.pop().left).toEqual(['quiz-check']);
});

test('requirements messages never count as activity for the idle timer', async () => {
  const log = collect();
  const win = lessonFrame();
  win.ElmpBlocks = { blocks: [{ kind: 'order', complete: false }], left: () => ['order'] };
  win.document.dispatchEvent(new win.CustomEvent('elmp:block'));
  await tick();
  log.stop();
  expect(log.seen.map((m) => m.kind)).toEqual(['ready']);
});

test('viewport from the player switches fade-in on and reveals blocks on screen only', () => {
  const win = lessonFrame();
  const doc = win.document;
  doc.body.innerHTML = '<div class="elmp-block" id="a"></div><div class="elmp-block" id="b"></div>';
  const at = { a: 100, b: 2000 };
  ['a', 'b'].forEach((id) => { doc.getElementById(id).getBoundingClientRect = () => ({ top: at[id] }); });
  expect(doc.documentElement.hasAttribute('data-elmp-reveal')).toBe(false); // nothing hidden until the player drives
  playerSays(win, { type: 'elmp.viewport', top: 0, height: 900 }, 'http://evil.example');
  expect(doc.documentElement.hasAttribute('data-elmp-reveal')).toBe(false);
  playerSays(win, { type: 'elmp.viewport', top: 0, height: 900 }, window.location.origin);
  expect(doc.documentElement.getAttribute('data-elmp-reveal')).toBe('on');
  expect(doc.getElementById('a').classList.contains('is-in')).toBe(true);
  expect(doc.getElementById('b').classList.contains('is-in')).toBe(false);
  playerSays(win, { type: 'elmp.viewport', top: 1500, height: 900 }, window.location.origin);
  expect(doc.getElementById('b').classList.contains('is-in')).toBe(true);
  playerSays(win, { type: 'elmp.viewport', top: 'x', height: 900 }, window.location.origin); // ignored
});

test('less motion shows every block at once', () => {
  const win = lessonFrame();
  win.document.body.innerHTML = '<div class="elmp-block" id="far"></div>';
  win.document.getElementById('far').getBoundingClientRect = () => ({ top: 9000 });
  playerSays(win, { type: 'elmp.display', reduceMotion: true }, window.location.origin);
  playerSays(win, { type: 'elmp.viewport', top: 0, height: 500 }, window.location.origin);
  expect(win.document.getElementById('far').classList.contains('is-in')).toBe(true);
});

test('"Scroll to begin" asks the player to scroll to the next part', async () => {
  const log = collectType('elmp.scroll');
  const win = lessonFrame();
  win.document.body.innerHTML = '<section class="elmp-hero"><button data-elmp-scroll-next>Scroll to begin</button></section><section id="next"></section>';
  win.document.getElementById('next').getBoundingClientRect = () => ({ top: 640.4 });
  win.document.querySelector('button').click();
  await tick();
  log.stop();
  expect(log.seen).toEqual([{ type: 'elmp.scroll', v: 1, unit: '', top: 640 }]);
});
