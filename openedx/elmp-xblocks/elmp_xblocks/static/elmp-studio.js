/* Studio editor for the ELMP blocks (D-95): JSON + server check + live preview with the real learner screens.
   Saving goes through studio_submit, which refuses anything the learner page would refuse. */
function ElmpStudio(runtime, element, init) {
  'use strict';

  const root = element.querySelector('.elmp-studio') || element;
  const $ = (s) => root.querySelector(s);
  const json = $('.es-json');
  const msg = $('.es-msg');
  const box = $('.es-preview');
  let lang = init.lang === 'th' ? 'th' : 'en';

  $('.es-display').value = init.displayName || '';
  $('.es-type').textContent = init.blockType;
  json.value = init.config;
  $('[data-es="lang"]').setAttribute('aria-pressed', String(lang === 'th'));

  function csrf() {
    const m = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : '';
  }
  function call(handler, body) {
    return fetch(runtime.handlerUrl(element, handler), {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf(), 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify(body),
    }).then((r) => { if (!r.ok) { throw new Error(`HTTP ${r.status}`); } return r.json(); });
  }
  function say(text, ok) { msg.textContent = text; msg.className = `es-msg ${ok ? 'is-ok' : 'is-bad'}`; }
  function localJson() {
    try { JSON.parse(json.value); return true; } catch (e) { say(`Not valid JSON: ${e.message}`, false); return false; }
  }

  function preview() {
    if (!localJson()) { return Promise.resolve(false); }
    return call('studio_preview', { config: json.value, lang }).then((r) => {
      if (!r.ok) { say(r.error, false); return false; }
      say('Looks good.', true);
      box.innerHTML = '';
      const holder = document.createElement('div');
      const kind = r.preview.kind ? ` elmp-${r.preview.kind}` : '';
      holder.innerHTML = `<div class="elmp-block elmp-${r.preview.block}${kind}" data-elmp-block="${r.preview.block}" lang="${lang}"></div>`;
      box.appendChild(holder);
      window.ElmpBlock({ handlerUrl: () => '#' }, holder, r.preview);
      return true;
    }).catch((e) => { say(`Could not reach the server (${e.message}).`, false); return false; });
  }

  root.addEventListener('click', (e) => {
    const el = e.target.closest('[data-es]');
    if (!el) { return; }
    const what = el.getAttribute('data-es');
    if (what === 'preview') { preview(); }
    if (what === 'format' && localJson()) { json.value = JSON.stringify(JSON.parse(json.value), null, 2); say('Tidied.', true); }
    if (what === 'example') { json.value = init.template; preview(); }
    if (what === 'lang') { lang = lang === 'th' ? 'en' : 'th'; el.setAttribute('aria-pressed', String(lang === 'th')); preview(); }
    if (what === 'cancel') { runtime.notify('cancel', {}); }
    if (what === 'save') {
      if (!localJson()) { return; }
      runtime.notify('save', { state: 'start' });
      call('studio_submit', { config: json.value, display_name: $('.es-display').value }).then((r) => {
        if (r.ok) { runtime.notify('save', { state: 'end' }); return; }
        say(r.error, false);
        runtime.notify('error', { title: 'Not saved', message: r.error });
      }).catch((err) => { say(`Not saved (${err.message}).`, false); runtime.notify('error', { title: 'Not saved', message: err.message }); });
    }
  });
  json.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') { // two spaces instead of leaving the box
      e.preventDefault();
      const { selectionStart: a, selectionEnd: b } = json;
      json.value = `${json.value.slice(0, a)}  ${json.value.slice(b)}`;
      json.selectionStart = a + 2; json.selectionEnd = a + 2;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); preview(); }
  });
  preview();
}
window.ElmpStudio = ElmpStudio;
