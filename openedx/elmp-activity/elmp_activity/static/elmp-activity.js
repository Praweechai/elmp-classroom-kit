/*
 * ELMP activity bridge (Plan 4 · F-117 · doc 02 §7). Runs inside Open edX lesson pages
 * (LMS /xblock/<unit>) shown in the Classroom player's iframe.
 * Tells the player when the learner is active and when a video plays, and pauses every
 * video when the player asks ({type: 'elmp.pause'}). Applies the player's display settings
 * ({type: 'elmp.display'}, Plan 5) as data- attributes on <html>.
 * Bridge v2 (Plan 5 · doc 10 §4.1, V-4.02):
 *  - frame → player {type: 'elmp.requirements', unit, left}: ELMP lesson blocks still open on this page
 *    (left: null = the page has no ELMP blocks). Sent at start and whenever a block changes.
 *  - player → frame {type: 'elmp.viewport', top, height}: the part of this page on screen (the player scrolls,
 *    not the frame) → blocks fade in as they come into view. Off until the first message, so nothing hides elsewhere.
 *  - frame → player {type: 'elmp.scroll', unit, top}: a "Scroll to begin" button asks the player to scroll.
 *  - player → frame {type: 'elmp.ask'}: send the requirements again.
 * Sends only: kind, unit id, H5P verb. No personal data (NFR-D5).
 */
(function () {
  'use strict';

  var cfg = window.ELMP_ACTIVITY || {};
  var parentOrigin = cfg.parentOrigin;
  if (!parentOrigin || window.parent === window || window.__elmpActivity) { return; }
  window.__elmpActivity = true;

  var INPUT_GAP_MS = 10000; // at most one "input" message per 10 s
  var PLAY_BEAT_MS = 15000; // "video-playing" heartbeat while a video runs
  var SCAN_MS = 2000; // look for new same-origin frames (H5P content) and H5P itself
  var INPUT_EVENTS = ['pointerdown', 'keydown', 'scroll', 'wheel', 'touchstart'];
  var MEDIA_EVENTS = ['play', 'pause', 'ended'];

  var unit = '';
  try {
    unit = decodeURIComponent((window.location.pathname.split('/xblock/')[1] || '').replace(/\/$/, ''));
  } catch (e) { unit = ''; }

  var docs = [];
  var lastInput = 0;
  var beat = null;

  function post(msg) {
    try { window.parent.postMessage(msg, parentOrigin); } catch (e) { /* parent gone */ }
  }

  function send(kind, extra) {
    var msg = { type: 'elmp.activity', v: 1, kind: kind, unit: unit };
    if (extra) { Object.keys(extra).forEach(function (k) { msg[k] = extra[k]; }); }
    post(msg);
  }

  // ---- Bridge v2: what is left on this page ----
  var lastLeft;
  function requirements(force) {
    var reg = window.ElmpBlocks;
    var left = null;
    try { left = reg && reg.blocks && reg.blocks.length ? reg.left() : null; } catch (e) { left = null; }
    var key = JSON.stringify(left);
    if (!force && key === lastLeft) { return; }
    lastLeft = key;
    post({ type: 'elmp.requirements', v: 1, unit: unit, left: left });
  }

  // ---- Bridge v2: fade blocks in as they come into view (the player tells us what is on screen) ----
  var REVEAL = '.elmp-block, .elmp-rv';
  var view = null;
  function reveal() {
    if (!view) { return; }
    var root = document.documentElement;
    var still = root.getAttribute('data-elmp-motion') === 'on'
      || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var bottom = view.top + view.height * 0.92;
    var els = document.querySelectorAll(REVEAL);
    for (var i = 0; i < els.length; i += 1) {
      var el = els[i];
      if (!el.classList.contains('is-in')) {
        var top = el.getBoundingClientRect().top + (window.scrollY || 0);
        if (still || top < bottom) { el.classList.add('is-in'); }
      }
    }
  }
  function onViewport(d) {
    var top = Number(d.top);
    var height = Number(d.height);
    if (!isFinite(top) || !isFinite(height) || height <= 0) { return; }
    view = { top: Math.max(0, top), height: height };
    document.documentElement.setAttribute('data-elmp-reveal', 'on');
    reveal();
  }

  // ---- Bridge v2: "Scroll to begin" → the player scrolls to the next part ----
  function onScrollAsk(event) {
    var btn = event.target && event.target.closest && event.target.closest('[data-elmp-scroll-next]');
    if (!btn) { return; }
    var from = btn.closest('section, .elmp-hero') || btn;
    var nextEl = from.nextElementSibling;
    var target = nextEl || from;
    var y = target.getBoundingClientRect().top + (window.scrollY || 0);
    event.preventDefault();
    post({ type: 'elmp.scroll', v: 1, unit: unit, top: Math.max(0, Math.round(y)) });
  }

  function media() {
    var list = [];
    docs.forEach(function (d) {
      try { Array.prototype.push.apply(list, d.querySelectorAll('video, audio')); } catch (e) { /* frame gone */ }
    });
    return list;
  }

  function anyPlaying() {
    return media().some(function (m) { return !m.paused && !m.ended; });
  }

  function stopBeat() { if (beat) { clearInterval(beat); beat = null; } }
  function startBeat() {
    if (beat) { return; }
    beat = setInterval(function () {
      if (anyPlaying()) { send('video-playing'); } else { stopBeat(); }
    }, PLAY_BEAT_MS);
  }

  function onInput() {
    var now = Date.now();
    if (now - lastInput >= INPUT_GAP_MS) { lastInput = now; send('input'); }
  }

  function onMedia(event) {
    var el = event.target;
    if (!el || (el.tagName !== 'VIDEO' && el.tagName !== 'AUDIO')) { return; }
    if (event.type === 'play') {
      send('video-playing');
      startBeat();
    } else {
      send('video-paused');
      if (!anyPlaying()) { stopBeat(); }
    }
  }

  function hookH5P(win) {
    try {
      var dispatcher = win && win.H5P && win.H5P.externalDispatcher;
      // the H5P frame and the page can share one dispatcher: hook each dispatcher once
      if (!dispatcher || dispatcher.__elmpHooked) { return; }
      dispatcher.__elmpHooked = true;
      dispatcher.on('xAPI', function (event) {
        var verb = '';
        try { verb = event.getVerb ? event.getVerb() : ''; } catch (e) { verb = ''; }
        send('h5p', { verb: verb });
      });
    } catch (e) { /* not ready yet */ }
  }

  function hookDoc(doc) {
    if (!doc || docs.indexOf(doc) !== -1) { return; }
    docs.push(doc);
    INPUT_EVENTS.forEach(function (t) { doc.addEventListener(t, onInput, { capture: true, passive: true }); });
    // media events don't bubble; capture on the document still sees them
    MEDIA_EVENTS.forEach(function (t) { doc.addEventListener(t, onMedia, true); });
  }

  function scan(doc) {
    hookDoc(doc);
    hookH5P(doc.defaultView);
    var frames = doc.querySelectorAll('iframe');
    for (var i = 0; i < frames.length; i += 1) {
      try {
        var inner = frames[i].contentDocument; // null or throws when cross-origin (e.g. YouTube)
        if (inner && inner.documentElement) { scan(inner); }
      } catch (e) { /* cross-origin frame: skip */ }
    }
  }

  // Plan 5 · P5-3.02 (F-136, D-81): player display settings → data- attributes on the lesson <html>.
  // Only elmp-lesson.css and the content kit read them; H5P and the video player keep their own look.
  function applyDisplay(d) {
    var root = document.documentElement;
    var scale = Math.round(Number(d.textScale) / 10) * 10;
    scale = isFinite(scale) ? Math.min(160, Math.max(80, scale)) : 100;
    root.setAttribute('data-elmp-theme', 'light'); // V-7.02 (owner): dark mode removed, lessons always light
    ['contrast', 'spacing', 'reduceMotion'].forEach(function (k) {
      var attr = 'data-elmp-' + (k === 'reduceMotion' ? 'motion' : k);
      if (d[k] === true) { root.setAttribute(attr, 'on'); } else { root.removeAttribute(attr); }
    });
    root.style.setProperty('--elmp-text-scale', String(scale / 100));
  }

  // V-7.02: Indigo's dark-theme.js adds body.indigo-dark-theme ~200 ms after load whenever the computer is in
  // dark mode (even with INDIGO_ENABLE_DARK_TOGGLE off) → near-white text on our white lesson card. The player's
  // own theme (data-elmp-theme + elmp-lesson.css) owns light and dark here, so keep Indigo's class off.
  function noIndigoDark() {
    var body = document.body;
    if (body && body.classList.contains('indigo-dark-theme')) { body.classList.remove('indigo-dark-theme'); }
  }
  function watchIndigo() {
    noIndigoDark();
    if (document.body && window.MutationObserver) {
      new MutationObserver(noIndigoDark).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }
  }
  if (document.body) { watchIndigo(); } else { document.addEventListener('DOMContentLoaded', watchIndigo); }

  window.addEventListener('message', function (event) {
    if (event.origin !== parentOrigin || !event.data) { return; }
    if (event.data.type === 'elmp.display') { applyDisplay(event.data); reveal(); return; }
    if (event.data.type === 'elmp.viewport') { onViewport(event.data); return; }
    if (event.data.type === 'elmp.ask') { requirements(true); return; }
    if (event.data.type !== 'elmp.pause') { return; }
    media().forEach(function (m) { try { m.pause(); } catch (e) { /* ignore */ } });
    stopBeat();
  });

  scan(document);
  setInterval(function () {
    docs = docs.filter(function (d) { try { return !!d.defaultView; } catch (e) { return false; } });
    scan(document);
  }, SCAN_MS);
  send('ready');

  document.addEventListener('elmp:block', function () { requirements(false); reveal(); });
  document.addEventListener('click', onScrollAsk);
  // ELMP blocks start when the page has loaded; say what is left once they have.
  requirements(true);
  window.addEventListener('load', function () { requirements(false); });
  setTimeout(function () { requirements(false); }, 1500);
}());
