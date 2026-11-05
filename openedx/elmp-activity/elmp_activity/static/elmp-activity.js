/*
 * ELMP activity bridge (Plan 4 · F-117 · doc 02 §7). Runs inside Open edX lesson pages
 * (LMS /xblock/<unit>) shown in the Classroom player's iframe.
 * Tells the player when the learner is active and when a video plays, and pauses every
 * video when the player asks ({type: 'elmp.pause'}).
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

  function send(kind, extra) {
    var msg = { type: 'elmp.activity', v: 1, kind: kind, unit: unit };
    if (extra) { Object.keys(extra).forEach(function (k) { msg[k] = extra[k]; }); }
    try { window.parent.postMessage(msg, parentOrigin); } catch (e) { /* parent gone */ }
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
      if (!win || win.__elmpH5P || !win.H5P || !win.H5P.externalDispatcher) { return; }
      win.__elmpH5P = true;
      win.H5P.externalDispatcher.on('xAPI', function (event) {
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

  window.addEventListener('message', function (event) {
    if (event.origin !== parentOrigin || !event.data || event.data.type !== 'elmp.pause') { return; }
    media().forEach(function (m) { try { m.pause(); } catch (e) { /* ignore */ } });
    stopBeat();
  });

  scan(document);
  setInterval(function () {
    docs = docs.filter(function (d) { try { return !!d.defaultView; } catch (e) { return false; } });
    scan(document);
  }, SCAN_MS);
  send('ready');
}());
