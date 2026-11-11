/**
 * ELMP lesson block screens (V-3.04): runs the real bundle in jsdom with a fake XBlock runtime and a fake server.
 * The server decides (handlers); here we check that the screens draw, send the right evidence and follow answers.
 */
const fs = require('fs');
const path = require('path');

const STATIC = path.join(__dirname, '../elmp_xblocks/static');
const SCRIPT = fs.readFileSync(path.join(STATIC, 'elmp-blocks.js'), 'utf8');
const EX = (name) => JSON.parse(fs.readFileSync(path.join(__dirname, '../schemas/examples/inf101', name), 'utf8'));

// eslint-disable-next-line no-new-func
new Function(SCRIPT)();

let calls;
let replies;
beforeEach(() => {
  document.body.innerHTML = '';
  document.cookie = 'csrftoken=tok123';
  window.ElmpBlocks.blocks.length = 0;
  calls = [];
  replies = {};
  global.fetch = jest.fn((url, opts) => {
    const handler = url.split('/').pop();
    const body = JSON.parse(opts.body);
    calls.push({ handler, body, headers: opts.headers });
    const reply = typeof replies[handler] === 'function' ? replies[handler](body) : (replies[handler] || { ok: true });
    return Promise.resolve({ ok: true, json: () => Promise.resolve(reply) });
  });
  window.scrollTo = jest.fn();
  Element.prototype.scrollIntoView = jest.fn();
});

const flush = () => new Promise((r) => { setTimeout(r, 0); });
const runtime = { handlerUrl: (el, h) => `/handler/${h}` };

function mount(block, config) {
  const element = document.createElement('div');
  element.innerHTML = `<div class="elmp-block" data-elmp-block="${block}"></div>`;
  document.body.appendChild(element);
  window.ElmpBlock(runtime, element, { lang: 'en', ...config });
  return element.querySelector('[data-elmp-block]');
}
const click = (root, sel) => { const el = root.querySelector(sel); expect(el).not.toBeNull(); el.click(); };
const all = (root, sel) => Array.from(root.querySelectorAll(sel));
const publicQs = (quiz) => quiz.questions.map((q) => ({ id: q.id, type: q.type || 'single', prompt: q.prompt, choices: q.choices }));

/* ---------- safety ---------- */

test('author text is escaped, never HTML', () => {
  const root = mount('activity', { block: 'activity', kind: 'order', title: '<img src=x onerror=alert(1)>', items: ['<b>a</b>', 'b', 'c'] });
  expect(root.querySelector('img')).toBeNull();
  expect(root.querySelector('.eb-title').textContent).toBe('<img src=x onerror=alert(1)>');
  expect(root.innerHTML).toContain('&lt;b&gt;a&lt;/b&gt;');
});

test('author mistake shows a message and stays "not done"', () => {
  const root = mount('quiz', { block: 'quiz', title: 'Quiz', error: 'the quiz needs 1 to 50 questions' });
  expect(root.querySelector('[role="alert"]').textContent).toContain('1 to 50 questions');
  expect(window.ElmpBlocks.left()).toEqual(['quiz']);
});

/* ---------- quiz: check mode ---------- */

test('check mode: pick, check with CSRF, feedback, retry; tells the page once done', async () => {
  const quiz = EX('quiz-check-1-3.json');
  const q = quiz.questions[0];
  const wrong = q.choices.find((c) => !q.answer.includes(c.id)).id;
  const events = [];
  document.addEventListener('elmp:block', (e) => events.push(e.detail));
  const root = mount('quiz', { block: 'quiz', mode: 'check', questions: publicQs(quiz), checked: {}, complete: false });
  expect(window.ElmpBlocks.left()).toEqual(['quiz-check']);
  expect(root.querySelector('.nb-q__go').disabled).toBe(true);

  click(root, `[data-a="pick"][data-v="${q.id}|${wrong}"]`);
  replies.check = { ok: true, correct: false, explain: 'Because.', answer: q.answer };
  click(root, `[data-a="check"][data-v="${q.id}"]`);
  await flush();
  expect(calls[0]).toMatchObject({ handler: 'check', body: { question: q.id, given: [wrong] } });
  expect(calls[0].headers['X-CSRFToken']).toBe('tok123');
  const box = root.querySelector('.nb-q');
  expect(box.classList.contains('is-bad')).toBe(true);
  expect(box.querySelector('.choice.is-wrong')).not.toBeNull();
  expect(box.querySelector('.choice.is-right')).toBeNull(); // wrong try: right choice not shown (prototype)
  expect(box.textContent).toContain('Because.');
  expect(window.ElmpBlocks.left()).toEqual([]);
  expect(events.pop()).toEqual({ kind: 'quiz-check', complete: true });

  click(root, `[data-a="retry"][data-v="${q.id}"]`);
  expect(root.querySelector('.nb-q').classList.contains('is-bad')).toBe(false);
});

test('check mode: Thai words', () => {
  const quiz = EX('quiz-check-1-3.json');
  const root = mount('quiz', { block: 'quiz', mode: 'check', lang: 'th', title: '', questions: publicQs(quiz), checked: {} });
  expect(root.textContent).toContain('ตรวจสอบความเข้าใจ');
  expect(root.querySelector('.nb-q__go').textContent).toBe('ตรวจคำตอบ');
});

/* ---------- quiz: exam mode ---------- */

function examConfig(extra) {
  const quiz = EX('quiz-exam-final.json');
  return {
    block: 'quiz', mode: 'exam', title: 'Final quiz', questions: publicQs(quiz), possible: quiz.questions.length,
    passPct: 80, attempts: 0, maxAttempts: 3, attemptsLeft: 3, best: null, complete: false, ...extra,
  };
}

test('exam: intro facts → one question at a time → submit all answers → result + review without right choices', async () => {
  const cfg = examConfig();
  const root = mount('quiz', cfg);
  expect(all(root, '.fact b').map((b) => b.textContent)).toEqual([String(cfg.questions.length), '80%', '3', expect.stringMatching(/min/)]);
  click(root, '[data-a="start"]');
  const answers = {};
  replies.submit = {
    ok: true, ...cfg, attempts: 1, attemptsLeft: 2, best: { earned: 4, percent: 80, passed: true },
    last: { earned: 4, percent: 80, passed: true, answers: {}, review: { q1: { correct: true, explain: 'Rub until dry.' }, q2: { correct: false, explain: '' } } },
  };
  cfg.questions.forEach((q, i) => {
    expect(root.querySelector('.q-meta').textContent).toContain(`Question ${i + 1} of ${cfg.questions.length}`);
    expect(root.querySelector('[data-a="next"]').disabled).toBe(true);
    const first = root.querySelector('[data-a="pick"]');
    first.click();
    answers[q.id] = [first.getAttribute('data-v')];
    click(root, '[data-a="next"]');
  });
  await flush();
  expect(calls).toHaveLength(1);
  expect(calls[0]).toMatchObject({ handler: 'submit', body: { answers } });
  await flush();
  expect(root.querySelector('h1').textContent).toBe('You passed!');
  expect(root.querySelector('.ring__txt b').textContent).toBe('80%');
  expect(all(root, '.review__item')).toHaveLength(2);
  expect(root.querySelector('.review').textContent).not.toMatch(/correct answer/i);
  expect(window.ElmpBlocks.left()).toEqual([]);
});

test('exam: opens on the last result; failed with attempts left offers Try again; none left disables start', () => {
  const failed = mount('quiz', examConfig({
    attempts: 1, attemptsLeft: 2, best: { earned: 2, percent: 40, passed: false },
    last: { earned: 2, percent: 40, passed: false, answers: {}, review: {} }, complete: true,
  }));
  expect(failed.querySelector('h1').textContent).toBe('Almost there');
  expect(failed.querySelector('[data-a="start"]').textContent).toContain('Try again');

  const out = mount('quiz', examConfig({ attempts: 3, attemptsLeft: 0, best: { earned: 2, percent: 40, passed: false }, complete: true }));
  expect(out.querySelector('[data-a="start"]').disabled).toBe(true);
  expect(out.textContent).toContain('No attempts left');
});

test('exam: server says answer all → stays on the questions with a message', async () => {
  const root = mount('quiz', examConfig({ questions: examConfig().questions.slice(0, 1) }));
  click(root, '[data-a="start"]');
  root.querySelector('[data-a="pick"]').click();
  replies.submit = { ok: false, reason: 'answer_all', missing: ['q1'] };
  click(root, '[data-a="next"]');
  await flush(); await flush();
  expect(root.querySelector('.q-meta')).not.toBeNull();
  expect(root.querySelector('[role="status"]').textContent).toBe('Answer every question first.');
});

/* ---------- video ---------- */

function videoConfig(extra) {
  const v = EX('video-1-2.json');
  return {
    block: 'video', title: v.title, src: v.src, poster: v.poster, seconds: v.seconds, captions: v.captions, chapters: v.chapters,
    transcript: v.transcript, completePct: 95, allowSkip: false, speeds: [0.75, 1, 1.25, 1.5, 2],
    position: 0, furthest: 0, watched: 0, percent: 0, complete: false, ...extra,
  };
}

function fakeMedia(v) {
  let t = 0; let paused = true;
  Object.defineProperty(v, 'currentTime', { get: () => t, set: (x) => { t = x; v.dispatchEvent(new Event('seeking')); }, configurable: true });
  Object.defineProperty(v, 'paused', { get: () => paused, configurable: true });
  Object.defineProperty(v, 'ended', { get: () => false, configurable: true });
  v.play = () => { paused = false; v.dispatchEvent(new Event('play')); return Promise.resolve(); };
  v.pause = () => { paused = true; v.dispatchEvent(new Event('pause')); };
  return { tick(to) { t = to; v.dispatchEvent(new Event('timeupdate')); } };
}

test('video: our player with captions track, chapters locked ahead, transcript; reports played stretches on pause', async () => {
  const root = mount('video', videoConfig());
  const v = root.querySelector('video');
  expect(v.getAttribute('src')).toBe('/static/inf101-why-it-matters.mp4');
  expect(all(root, 'track').map((x) => x.getAttribute('srclang'))).toEqual(['en', 'th']);
  expect(root.querySelector('.eb-transcript').textContent).toContain('Every shift');
  const chapters = all(root, '.chapters button');
  expect(chapters.map((b) => b.disabled)).toEqual([false, true, true]);
  expect(root.querySelector('.watched').textContent).toContain('Watch to 95% to continue');

  const m = fakeMedia(v);
  root.querySelector('.vp__bar [data-a="toggle"]').click();
  for (let s = 1; s <= 16; s += 1) { m.tick(s); }
  replies.progress = { ok: true, furthest: 16, percent: 36, complete: false };
  v.pause();
  await flush();
  expect(calls[0].handler).toBe('progress');
  expect(calls[0].body.segments).toEqual([[0, 16]]);
  expect(all(root, '.chapters button').map((b) => b.disabled)).toEqual([false, false, true]);
});

test('video: cannot seek past the furthest point (unless allow_skip); completion tells the page', async () => {
  const root = mount('video', videoConfig({ furthest: 10, percent: 22 }));
  const v = root.querySelector('video');
  fakeMedia(v);
  const scrub = root.querySelector('.scrub');
  scrub.getBoundingClientRect = () => ({ left: 0, width: 450 });
  scrub.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 400 })); // 40 s
  expect(v.currentTime).toBe(10);
  expect(root.querySelector('[role="status"]').textContent).toContain('skip ahead');

  const free = mount('video', videoConfig({ allowSkip: true }));
  const fv = free.querySelector('video');
  fakeMedia(fv);
  free.querySelector('.scrub').getBoundingClientRect = () => ({ left: 0, width: 450 });
  free.querySelector('.scrub').dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 400 }));
  expect(fv.currentTime).toBe(40);

  const m = fakeMedia(v);
  v.currentTime = 10;
  v.play();
  for (let s = 11; s <= 45; s += 1) { m.tick(s); }
  replies.progress = { ok: true, furthest: 45, percent: 100, complete: true };
  v.pause();
  await flush(); await flush();
  expect(calls.pop().body.segments).toEqual([[10, 45]]);
  expect(window.ElmpBlocks.blocks[0].complete).toBe(true);
  expect(root.querySelector('.watched').classList.contains('is-ok')).toBe(true);
});

/* ---------- activities ---------- */

function act(kind, extra) {
  const a = EX(`activity-${kind}-${{ hotspot: '2-1', order: '2-1', scenario: '2-2', sort: '3-2', deck: '3-3', practice: '3-1' }[kind]}.json`);
  return { block: 'activity', complete: false, result: {}, ...a, ...extra };
}

test('hotspot: finish only after every spot is opened', async () => {
  const a = act('hotspot');
  const root = mount('activity', a);
  expect(root.querySelector('svg.art')).not.toBeNull();
  a.spots.forEach((s, i) => {
    click(root, `[data-a="spot"][data-v="${s.n}"]`);
    expect(root.querySelector('.nb-hot__card').textContent).toContain(s.title);
    if (i < a.spots.length - 1) { expect(calls).toHaveLength(0); }
  });
  await flush();
  expect(calls).toEqual([expect.objectContaining({ handler: 'finish', body: { opened: a.spots.map((s) => s.n) } })]);
});

test('order: wrong pick shakes, right picks fill slots, then finish with the order', async () => {
  const a = act('order');
  const root = mount('activity', a);
  click(root, '[data-a="ord"][data-v="1"]');
  expect(root.querySelector('.is-wrong')).not.toBeNull();
  a.items.forEach((_, i) => click(root, `[data-a="ord"][data-v="${i}"]`));
  await flush();
  expect(all(root, '.slot.is-filled')).toHaveLength(a.items.length);
  expect(calls[0].body).toEqual({ order: a.items.map((_, i) => i) });
});

test('scenario: choices follow the story, feedback shows, end sends the path', async () => {
  const a = act('scenario');
  const root = mount('activity', a);
  const path = [a.start];
  let here = a.start;
  while (!a.scenes[here].end) {
    const choices = a.scenes[here].choices;
    const i = Math.max(0, choices.findIndex((c) => c.good));
    click(root, `[data-a="choose"][data-v="${i}"]`);
    here = choices[i].next; path.push(here);
  }
  await flush();
  expect(root.textContent).toContain('Scenario complete');
  expect(calls[0].body).toEqual({ path });
  click(root, '[data-a="again"]');
  expect(root.querySelector('[data-a="choose"]')).not.toBeNull();
});

test('sort: card by card with why, then finish with every placement; score ring', async () => {
  const a = act('sort');
  const root = mount('activity', a);
  a.items.forEach((it) => {
    click(root, `[data-a="bin"][data-v="${it.bin}"]`);
    expect(root.querySelector('.nb-sort__card').classList.contains('is-ok')).toBe(true);
    click(root, '[data-a="next"]');
  });
  await flush();
  expect(calls[0].body).toEqual({ placed: a.items.map((it) => it.bin) });
  expect(root.querySelector('.ring__txt b').textContent).toBe(`${a.items.length}/${a.items.length}`);
});

test('deck: flip, Again sends the card back, Got it on every card finishes', async () => {
  const a = act('deck');
  const root = mount('activity', a);
  expect(root.querySelector('[data-a="got"]').disabled).toBe(true);
  click(root, '[data-a="flip"]');
  click(root, '[data-a="later"]');
  for (let i = 0; i < a.cards.length; i += 1) { click(root, '[data-a="flip"]'); click(root, '[data-a="got"]'); }
  await flush();
  expect(root.textContent).toContain('All cards learned!');
  expect(calls[0].body.known.slice().sort((x, y) => x - y)).toEqual(a.cards.map((_, i) => i));
});

test('practice: start tells the server, timer runs, finish at the end', async () => {
  jest.useFakeTimers();
  const a = act('practice', { seconds: 5 });
  const root = mount('activity', a);
  const start = Date.now();
  jest.spyOn(Date, 'now').mockImplementation(() => start);
  click(root, '[data-a="go"]');
  expect(calls[0].handler).toBe('start_timer');
  Date.now.mockImplementation(() => start + 2000);
  jest.advanceTimersByTime(300);
  expect(root.querySelector('.ring__txt b').textContent).toBe('3');
  expect(root.querySelector('.rub-steps li.is-now')).not.toBeNull();
  Date.now.mockImplementation(() => start + 5100);
  jest.advanceTimersByTime(300);
  expect(calls.map((c) => c.handler)).toEqual(['start_timer', 'finish']);
  expect(root.textContent).toContain('Well done!');
  Date.now.mockRestore();
  jest.useRealTimers();
});

test('activities already complete open in their done state', () => {
  expect(mount('activity', act('order', { complete: true })).textContent).toContain('All in order');
  expect(mount('activity', act('deck', { complete: true })).textContent).toContain('All cards learned!');
  expect(mount('activity', act('sort', { complete: true, result: { score: 4, of: 6 } })).querySelector('.ring__txt b').textContent).toBe('4/6');
});

test('bundle + styles stay inside the 30 kB (gzip) budget', () => {
  const zlib = require('zlib');
  const size = ['elmp-blocks.js', 'elmp-blocks.css'].reduce((s, f) => s + zlib.gzipSync(fs.readFileSync(path.join(STATIC, f))).length, 0);
  expect(size).toBeLessThanOrEqual(30 * 1024);
});
