/**
 * Studio editor (V-3.04, D-95): preview with the real learner screens, save through the server, refusals shown.
 */
const fs = require('fs');
const path = require('path');

const STATIC = path.join(__dirname, '../elmp_xblocks/static');
// eslint-disable-next-line no-new-func
new Function(fs.readFileSync(path.join(STATIC, 'elmp-blocks.js'), 'utf8'))();
// eslint-disable-next-line no-new-func
new Function(fs.readFileSync(path.join(STATIC, 'elmp-studio.js'), 'utf8'))();
const HTML = fs.readFileSync(path.join(STATIC, 'elmp-studio.html'), 'utf8');

const flush = () => new Promise((r) => { setTimeout(r, 0); });
let replies;
let calls;
let notes;

function open(config) {
  const element = document.createElement('div');
  element.innerHTML = HTML;
  document.body.appendChild(element);
  const runtime = { handlerUrl: (el, h) => `/h/${h}`, notify: (kind, data) => notes.push([kind, data]) };
  window.ElmpStudio(runtime, element, {
    blockType: 'elmp_activity', displayName: 'Order', lang: 'en', config: JSON.stringify(config), template: '{"kind": "order"}',
  });
  return element;
}

beforeEach(() => {
  document.body.innerHTML = '';
  calls = []; notes = [];
  replies = {
    studio_preview: { ok: true, preview: { block: 'activity', kind: 'order', lang: 'en', title: 'Steps', items: ['a', 'b', 'c'], complete: false, result: {}, preview: true } },
    studio_submit: { ok: true },
  };
  global.fetch = jest.fn((url, opts) => {
    const h = url.split('/').pop(); calls.push([h, JSON.parse(opts.body)]);
    return Promise.resolve({ ok: true, json: () => Promise.resolve(replies[h]) });
  });
});

test('opens with a preview drawn by the learner screens; preview never saves', async () => {
  const el = open({ kind: 'order', items: ['a', 'b', 'c'] });
  await flush();
  expect(calls[0][0]).toBe('studio_preview');
  expect(el.querySelector('.es-preview .nb-ord__it')).not.toBeNull();
  for (let guard = 0; guard < 20; guard += 1) { // put the rows in order with the ↑ buttons, then Check
    const now = Array.from(el.querySelectorAll('.es-preview .nb-ord__it')).map((li) => Number(li.getAttribute('data-i')));
    const p = now.findIndex((v, k) => k > 0 && now[k - 1] > v);
    if (p < 0) { break; }
    el.querySelector(`.es-preview [data-a="up"][data-v="${p}"]`).click();
  }
  el.querySelector('.es-preview [data-a="check"]').click();
  await flush();
  expect(el.querySelector('.es-preview').textContent).toContain('All in order');
  expect(calls.map((c) => c[0])).toEqual(['studio_preview']); // the preview's finish did not reach the server
});

test('bad JSON is caught before the server; server refusals are shown', async () => {
  const el = open({ kind: 'order', items: ['a', 'b', 'c'] });
  await flush();
  el.querySelector('.es-json').value = '{oops';
  el.querySelector('[data-es="preview"]').click();
  expect(el.querySelector('.es-msg').textContent).toMatch(/Not valid JSON/);
  replies.studio_submit = { ok: false, error: 'items: 3 to 8 needed' };
  el.querySelector('.es-json').value = '{"kind": "order", "items": ["a"]}';
  el.querySelector('[data-es="save"]').click();
  await flush();
  expect(el.querySelector('.es-msg').textContent).toBe('items: 3 to 8 needed');
  expect(notes).toEqual([['save', { state: 'start' }], ['error', { title: 'Not saved', message: 'items: 3 to 8 needed' }]]);
});

test('save sends JSON + name and tells Studio it ended; Thai preview; cancel', async () => {
  const el = open({ kind: 'order', items: ['a', 'b', 'c'] });
  await flush();
  el.querySelector('.es-display').value = 'Put in order';
  el.querySelector('[data-es="save"]').click();
  await flush();
  expect(calls.pop()).toEqual(['studio_submit', { config: '{"kind":"order","items":["a","b","c"]}', display_name: 'Put in order' }]);
  expect(notes.pop()).toEqual(['save', { state: 'end' }]);
  el.querySelector('[data-es="lang"]').click();
  await flush();
  expect(calls.pop()[1].lang).toBe('th');
  el.querySelector('[data-es="cancel"]').click();
  expect(notes.pop()).toEqual(['cancel', {}]);
});
