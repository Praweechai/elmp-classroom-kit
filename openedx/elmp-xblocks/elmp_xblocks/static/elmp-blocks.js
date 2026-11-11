/* ELMP lesson blocks — shared screens for elmp_quiz, elmp_video and elmp_activity (doc 10 V-3.04).
   Ported from the Learner v2 prototype (doc/plan-5/04-design/learner-v2/player.js). Plain JS, no framework.
   - Every answer check, score and completion is decided on the server (the handlers); this file only draws.
   - Author text is always escaped (no HTML from authors or learners).
   - Language comes from the server (config.lang); dark / text size / less motion from the activity bridge (<html> attributes).
   - Each block tells the page when it changes: a bubbling 'elmp:block' event + window.ElmpBlocks (read by the bridge, V-4.02). */
(function () {
  'use strict';

  /* ---------- words ---------- */
  const WORDS = {
    check: ['Check', 'ตรวจคำตอบ'], tryAgain: ['Try again', 'ลองอีกครั้ง'], great: ['Great!', 'เยี่ยมมาก!'], notQuite: ['Not quite', 'ยังไม่ถูก'],
    checkTitle: ['Check your understanding', 'ตรวจสอบความเข้าใจ'], selectAll: ['Select all that apply', 'เลือกทุกข้อที่ถูก'],
    quizIntro: ['Final quiz', 'แบบทดสอบท้ายบท'], questions: ['Questions', 'จำนวนข้อ'], passMark: ['Pass mark', 'เกณฑ์ผ่าน'],
    attemptsLeft: ['Attempts left', 'ครั้งที่เหลือ'], unlimited: ['Unlimited', 'ไม่จำกัด'], about: ['About', 'ประมาณ'], min: ['min', 'นาที'],
    bestCounts: ['Your best score counts', 'นับคะแนนครั้งที่ดีที่สุด'], now: ['now', 'ตอนนี้'], startQuiz: ['Start quiz', 'เริ่มทำแบบทดสอบ'],
    question: ['Question', 'ข้อที่'], of: ['of', 'จาก'], back: ['Back', 'ย้อนกลับ'], next: ['Next', 'ถัดไป'], submit: ['Submit answers', 'ส่งคำตอบ'],
    passed: ['You passed!', 'คุณสอบผ่าน!'], failed: ['Almost there', 'เกือบแล้ว'], saved: ['Your score is saved to your grades.', 'คะแนนของคุณถูกบันทึกแล้ว'],
    noAttempts: ['No attempts left. Your best score is kept.', 'ไม่เหลือสิทธิ์สอบแล้ว ระบบเก็บคะแนนที่ดีที่สุดไว้'],
    reviewAns: ['Review your answers', 'ทบทวนคำตอบ'], answerAll: ['Answer every question first.', 'ตอบให้ครบทุกข้อก่อน'],
    offline: ['Could not save — check your connection and try again.', 'บันทึกไม่ได้ — ตรวจสอบการเชื่อมต่อแล้วลองอีกครั้ง'],
    watched: ['watched', 'ดูแล้ว'], watchHint: ['Watch to {n}% to continue', 'ดูให้ถึง {n}% เพื่อไปต่อ'], transcript: ['Transcript', 'คำบรรยาย'],
    play: ['Play', 'เล่น'], pause: ['Pause', 'หยุด'], captions: ['Captions', 'คำบรรยายใต้ภาพ'], full: ['Full screen', 'เต็มจอ'], speed: ['Speed', 'ความเร็ว'],
    noSkip: ['You can skip ahead after you have watched it once.', 'ข้ามไปข้างหน้าได้หลังดูจบหนึ่งครั้ง'],
    tapNumber: ['Tap a number on the picture', 'แตะตัวเลขบนภาพ'], explored: ['explored', 'สำรวจแล้ว'],
    tapNext: ['Tap the next one…', 'แตะรายการถัดไป…'], allInOrder: ['All in order — well done!', 'เรียงครบถูกต้องแล้ว เยี่ยมมาก!'],
    scenario: ['Scenario', 'สถานการณ์จำลอง'], scnDone: ['Scenario complete', 'จบสถานการณ์แล้ว'], playAgain: ['Play again', 'เล่นอีกครั้ง'],
    card: ['Card', 'การ์ด'], nextCard: ['Next card', 'การ์ดถัดไป'], sorted: ['Sorted!', 'จัดกลุ่มเสร็จแล้ว'], sortAgain: ['Sort again', 'จัดใหม่'],
    learned: ['learned', 'จำได้แล้ว'], term: ['Term', 'คำศัพท์'], meaning: ['Meaning', 'ความหมาย'], tapFlip: ['Tap to flip', 'แตะเพื่อพลิก'],
    again: ['Again', 'อีกครั้ง'], gotIt: ['Got it', 'จำได้แล้ว'], allLearned: ['All cards learned!', 'จำได้ครบทุกการ์ดแล้ว!'], studyAgain: ['Study again', 'ทบทวนอีกครั้ง'],
    seconds: ['seconds', 'วินาที'], startPractice: ['Start practice', 'เริ่มฝึก'], wellDone: ['Well done!', 'เยี่ยมมาก!'],
    done: ['Done', 'เสร็จแล้ว'], score: ['Score', 'คะแนน'],
    previewOnly: ['Preview — answers are checked and saved only in the course.', 'ตัวอย่าง — ระบบตรวจและบันทึกคำตอบเฉพาะในหลักสูตรจริง'],
  };

  /* ---------- icons (same shapes as the prototype) ---------- */
  const ICONS = {
    play: '<path d="M7 4v16l13-8z"/>', pause: '<path d="M8 5v14M16 5v14"/>', check: '<path d="M20 6 9 17l-5-5"/>', x: '<path d="M18 6 6 18M6 6l12 12"/>',
    left: '<path d="m15 18-6-6 6-6"/>', right: '<path d="m9 18 6-6-6-6"/>', arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    expand: '<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>', refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    award: '<circle cx="12" cy="9" r="6"/><path d="m8.5 14.2-1.5 7.8 5-3 5 3-1.5-7.8"/>',
    alert: '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
    cc: '<rect x="2" y="5" width="20" height="14" rx="3"/><path d="M10 10.5a2 2 0 1 0 0 3M17 10.5a2 2 0 1 0 0 3"/>',
    chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    hand: '<path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6-2.4l-3.6-3.6a2 2 0 0 1 2.8-2.8L7 15"/>',
  };
  const ic = (n) => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;

  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ESC[c]);
  const clock = (s) => { s = Math.max(0, Math.floor(s)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  const shuffle = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } if (b.length > 1 && b.join() === a.join()) { b.reverse(); } return b; };
  const KEYS = 'ABCDEFGH';

  function ring(pct, size, cls, inner) {
    const r = 42; const c = 2 * Math.PI * r; const p = Math.max(0, Math.min(100, pct || 0));
    return `<div class="ring ${cls || ''}" style="width:${size}px;height:${size}px"><svg viewBox="0 0 100 100" aria-hidden="true"><circle class="track" cx="50" cy="50" r="${r}"/>`
      + `<circle class="val" cx="50" cy="50" r="${r}" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - p / 100)}"/></svg><div class="ring__txt">${inner || ''}</div></div>`;
  }

  /* ---------- pictures: drawn library (content kit 3, D-96) or a course file ---------- */
  /* ELMP-ART-START (copied from the prototype by tools; keep in step with content kit 3) */
  function art(name, cls = '') {
    const g = `<defs><linearGradient id="ga" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1FA35A"/><stop offset="1" stop-color="#03692A"/></linearGradient>
      <linearGradient id="gb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F7E3A8"/><stop offset="1" stop-color="#DDB866"/></linearGradient></defs>`;
    const S = {
      hands: `${g}<circle cx="300" cy="200" r="150" fill="url(#ga)" opacity=".18"/><circle cx="300" cy="200" r="104" fill="url(#ga)" opacity=".25"/>
        <g fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" transform="translate(222 122) scale(6.5)"><path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6-2.4l-3.6-3.6a2 2 0 0 1 2.8-2.8L7 15"/></g>
        ${[[120, 90, 16], [470, 120, 22], [440, 300, 12], [150, 300, 26], [520, 220, 10], [90, 200, 9]].map(([x, y, r], i) => `<circle class="bub" style="--d:${i * .6}s" cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#F7E3A8" stroke-width="3" opacity=".8"/>`).join('')}`,
      germs: `${g}<rect x="70" y="60" width="460" height="280" rx="140" fill="url(#ga)" opacity=".16"/>
        <g fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" transform="translate(204 104) scale(8)" opacity=".95"><path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6-2.4l-3.6-3.6a2 2 0 0 1 2.8-2.8L7 15"/></g>
        ${[[250, 150, '#F05A50'], [330, 120, '#DDB866'], [300, 230, '#9C84F0'], [380, 260, '#F05A50'], [230, 270, '#DDB866'], [410, 180, '#5B93F0']].map(([x, y, c], i) => `<g class="germ" style="--d:${i * .4}s" transform="translate(${x} ${y})"><circle r="13" fill="${c}"/>${[0, 60, 120, 180, 240, 300].map((a) => `<line x1="0" y1="0" x2="${Math.cos(a * Math.PI / 180) * 21}" y2="${Math.sin(a * Math.PI / 180) * 21}" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`).join('')}<circle r="4" cx="-3" cy="-3" fill="#fff" opacity=".7"/></g>`).join('')}`,
      ward: `${g}<rect x="0" y="300" width="600" height="100" fill="#0B4A24" opacity=".25"/>
        <rect x="120" y="190" width="300" height="70" rx="14" fill="#E9F3EC"/><rect x="120" y="170" width="70" height="40" rx="12" fill="#fff"/><rect x="190" y="178" width="230" height="30" rx="10" fill="#B0DABF"/>
        <rect x="112" y="150" width="14" height="150" rx="6" fill="#D0D7D3"/><rect x="414" y="190" width="14" height="110" rx="6" fill="#D0D7D3"/><rect x="140" y="260" width="10" height="45" fill="#A8B3AD"/><rect x="390" y="260" width="10" height="45" fill="#A8B3AD"/>
        <circle cx="160" cy="160" r="22" fill="#F2C9A4"/><rect x="460" y="70" width="100" height="70" rx="10" fill="#13241B"/><polyline points="470,110 490,110 498,90 508,128 516,104 526,110 550,110" fill="none" stroke="#45E08A" stroke-width="4" stroke-linejoin="round"/>
        <rect x="505" y="140" width="10" height="160" fill="#A8B3AD"/><rect x="40" y="60" width="8" height="240" fill="#A8B3AD"/><rect x="20" y="60" width="48" height="60" rx="12" fill="#D7EDF7" opacity=".9"/><path d="M44 120 C44 160 90 170 120 190" fill="none" stroke="#D7EDF7" stroke-width="3"/>
        <rect x="455" y="250" width="36" height="52" rx="8" fill="url(#gb)"/><rect x="466" y="238" width="14" height="14" rx="3" fill="#BE8E28"/>
        ${[[118, 165], [280, 192], [510, 105], [44, 90], [472, 275]].map(([x, y], i) => `<circle class="pulse" style="--d:${i * .5}s" cx="${x}" cy="${y}" r="10" fill="#F05A50" opacity=".85"/>`).join('')}`,
      zone: `${g}<ellipse cx="300" cy="205" rx="250" ry="165" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="10 10" opacity=".5"/>
        <ellipse cx="300" cy="205" rx="170" ry="110" fill="url(#ga)" opacity=".28"/><ellipse cx="300" cy="205" rx="170" ry="110" fill="none" stroke="#F7E3A8" stroke-width="3" stroke-dasharray="8 8"/>
        <rect x="200" y="170" width="200" height="70" rx="16" fill="#E9F3EC"/><rect x="200" y="170" width="54" height="70" rx="14" fill="#fff"/><circle cx="228" cy="205" r="18" fill="#F2C9A4"/><rect x="254" y="182" width="140" height="46" rx="12" fill="#B0DABF"/>
        <text x="300" y="132" text-anchor="middle" fill="#F7E3A8" font-family="Inter,sans-serif" font-size="15" font-weight="700" letter-spacing="2">PATIENT ZONE</text>
        <text x="300" y="393" text-anchor="middle" fill="#fff" opacity=".75" font-family="Inter,sans-serif" font-size="13" font-weight="600" letter-spacing="2">HEALTHCARE AREA</text>`,
      rub: `${g}<circle cx="300" cy="200" r="140" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="18"/><circle class="rubring" cx="300" cy="200" r="140" fill="none" stroke="url(#gb)" stroke-width="18" stroke-linecap="round" stroke-dasharray="880" stroke-dashoffset="300" transform="rotate(-90 300 200)"/>
        <text x="300" y="215" text-anchor="middle" fill="#fff" font-family="Inter,sans-serif" font-size="64" font-weight="800">20s</text>
        ${[0, 1, 2, 3, 4, 5].map((i) => { const a = (i / 6) * Math.PI * 2 - Math.PI / 2; return `<g transform="translate(${300 + Math.cos(a) * 190} ${200 + Math.sin(a) * 160})"><circle r="20" fill="#fff" opacity=".95"/><text y="6" text-anchor="middle" fill="#03692A" font-family="Inter,sans-serif" font-size="17" font-weight="800">${i + 1}</text></g>`; }).join('')}`,
    };
    return `<svg class="art ${cls}" viewBox="0 0 600 400" role="img" aria-hidden="true">${S[name] || ''}</svg>`;
  }
  /* ELMP-ART-END */
  function picture(name, alt) {
    if (!name) { return ''; }
    if (/^(\/|https?:)/.test(name) || /^\/?asset-v1:/.test(name)) { return `<img class="art" src="${esc(name)}" alt="${esc(alt || '')}">`; }
    return art(name);
  }

  /* ---------- server ---------- */
  function csrf() {
    const m = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
    return m ? decodeURIComponent(m[1]) : '';
  }
  function post(ctx, handler, body, keepalive) {
    if (ctx.cfg.preview) { // Studio preview: nothing is checked or saved
      return Promise.resolve({ ok: false, reason: 'preview', message: ctx.t('previewOnly') });
    }
    return fetch(ctx.runtime.handlerUrl(ctx.element, handler), {
      method: 'POST', credentials: 'same-origin', keepalive: !!keepalive,
      headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf(), 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify(body || {}),
    }).then((r) => { if (!r.ok) { throw new Error(String(r.status)); } return r.json(); });
  }

  /* ---------- page registry (bridge reads it: what is left on this page) ---------- */
  const registry = window.ElmpBlocks || (window.ElmpBlocks = { blocks: [], left() { return this.blocks.filter((b) => !b.complete).map((b) => b.kind); } });
  function tell(ctx) {
    ctx.entry.complete = !!ctx.complete;
    try { ctx.root.dispatchEvent(new CustomEvent('elmp:block', { bubbles: true, detail: { kind: ctx.entry.kind, complete: ctx.entry.complete } })); } catch (e) { /* old browser */ }
  }

  /* ---------- small UI helpers ---------- */
  function paint(ctx, html) {
    const y = window.scrollY;
    ctx.root.innerHTML = html;
    if (window.scrollY !== y) { window.scrollTo(0, y); }
  }
  function flash(ctx, message) {
    let n = ctx.root.querySelector('.eb-note--live');
    if (!n) { n = document.createElement('p'); n.className = 'eb-note eb-note--live'; n.setAttribute('role', 'status'); ctx.root.appendChild(n); }
    n.textContent = message;
  }
  function title(ctx) { return ctx.cfg.title ? `<h2 class="eb-title">${esc(ctx.cfg.title)}</h2>` : ''; }
  function on(ctx, handlers) {
    ctx.root.addEventListener('click', (e) => {
      const el = e.target.closest('[data-a]');
      if (!el || !ctx.root.contains(el) || el.disabled) { return; }
      const fn = handlers[el.getAttribute('data-a')];
      if (fn) { fn(el.getAttribute('data-v'), el, e); }
    });
  }

  /* =====================================================================================
     QUIZ — check mode (inline questions, instant feedback, not graded)
     ===================================================================================== */
  function quizCheck(ctx) {
    const { cfg, t } = ctx;
    const st = { pick: {}, res: Object.assign({}, cfg.checked || {}), retry: {} };
    Object.keys(st.res).forEach((qid) => { st.pick[qid] = st.res[qid].given || []; });

    function question(q, qi) {
      const res = st.res[q.id]; const show = !!res && !st.retry[q.id]; const sel = st.pick[q.id] || [];
      const multi = q.type === 'multi';
      const choices = q.choices.map((c, i) => {
        const pick = sel.indexOf(c.id) >= 0;
        const cls = show ? (res.correct && res.answer.indexOf(c.id) >= 0 ? 'is-right' : (pick && !res.correct ? 'is-wrong' : '')) : '';
        return `<button class="choice ${multi ? 'choice--multi' : ''} ${cls}" data-a="pick" data-v="${esc(q.id)}|${esc(c.id)}" aria-pressed="${pick}" ${show ? 'disabled' : ''}>`
          + `<span class="choice__key">${multi ? (pick ? ic('check') : '') : KEYS[i]}</span><span>${esc(c.text)}</span></button>`;
      }).join('');
      const fb = show
        ? `<div class="nb-q__fb">${ic(res.correct ? 'check' : 'x')}<div><b>${t(res.correct ? 'great' : 'notQuite')}</b> ${esc(res.explain)}</div>`
          + `${res.correct ? '' : `<button class="btn btn--sm btn--ghost" data-a="retry" data-v="${esc(q.id)}">${ic('refresh')} ${t('tryAgain')}</button>`}</div>`
        : `<button class="btn btn--primary btn--sm nb-q__go" data-a="check" data-v="${esc(q.id)}" ${sel.length && !st.busy ? '' : 'disabled'}>${t('check')}</button>`;
      return `<div class="nb-q ${show ? (res.correct ? 'is-ok' : 'is-bad') : ''}"><p class="nb-q__p"><span>${qi + 1}</span>${esc(q.prompt)}${multi ? ` <em>${t('selectAll')}</em>` : ''}</p>`
        + `<div class="choices" role="group">${choices}</div>${fb}</div>`;
    }
    function render() {
      const n = cfg.questions.filter((q) => st.res[q.id]).length;
      paint(ctx, `<div class="nb-check"><div class="nb-check__h">${ic('target')} <b>${esc(cfg.title || t('checkTitle'))}</b><small>${n} / ${cfg.questions.length}</small></div>`
        + `${cfg.intro ? `<p class="eb-intro">${esc(cfg.intro)}</p>` : ''}${cfg.questions.map(question).join('')}</div>`);
    }
    on(ctx, {
      pick(v) {
        const [qid, cid] = v.split('|'); const q = cfg.questions.find((x) => x.id === qid); const cur = st.pick[qid] || [];
        st.pick[qid] = q.type === 'multi' ? (cur.indexOf(cid) >= 0 ? cur.filter((x) => x !== cid) : cur.concat(cid)) : [cid];
        render();
      },
      check(qid) {
        st.busy = true; render();
        post(ctx, 'check', { question: qid, given: st.pick[qid] || [] }).then((r) => {
          st.busy = false;
          if (r.ok) { st.res[qid] = { correct: r.correct, explain: r.explain, answer: r.answer, given: st.pick[qid] }; delete st.retry[qid]; ctx.complete = true; tell(ctx); }
          render();
          if (!r.ok) { flash(ctx, r.message || t('offline')); }
        }).catch(() => { st.busy = false; render(); flash(ctx, t('offline')); });
      },
      retry(qid) { st.retry[qid] = true; st.pick[qid] = []; render(); },
    });
    render();
  }

  /* =====================================================================================
     QUIZ — exam mode (graded; one question at a time; review never shows the right choice)
     ===================================================================================== */
  function quizExam(ctx) {
    const { t } = ctx;
    let cfg = ctx.cfg;
    const st = { phase: cfg.last ? 'result' : 'intro', i: 0, ans: {}, busy: false };

    function intro() {
      const left = cfg.attemptsLeft;
      const mins = Math.max(1, Math.round(cfg.questions.length * 0.6));
      return `<div class="nb-quiz"><span class="dialog__ic">${ic('target')}</span><h1>${esc(cfg.title || t('quizIntro'))}</h1>`
        + `${cfg.intro ? `<p class="lead">${esc(cfg.intro)}</p>` : ''}`
        + `<div class="facts"><div class="fact"><span>${t('questions')}</span><b>${cfg.questions.length}</b></div><div class="fact"><span>${t('passMark')}</span><b>${cfg.passPct}%</b></div>`
        + `<div class="fact"><span>${t('attemptsLeft')}</span><b>${left == null ? t('unlimited') : left}</b></div><div class="fact"><span>${t('about')}</span><b>${mins} ${t('min')}</b></div></div>`
        + `<p class="muted">${t('bestCounts')}${cfg.best ? ` — ${t('now')} ${cfg.best.percent}%` : ''}</p>`
        + `<button class="btn btn--primary btn--lg" data-a="start" ${left === 0 ? 'disabled' : ''}>${t('startQuiz')} ${ic('arrow')}</button>`
        + `${left === 0 ? `<p class="eb-note">${t('noAttempts')}</p>` : ''}</div>`;
    }
    function questionView() {
      const Q = cfg.questions; const q = Q[st.i]; const sel = st.ans[q.id] || []; const multi = q.type === 'multi';
      const last = st.i === Q.length - 1;
      return `<div class="nb-quiz nb-quiz--q"><div class="q-meta"><span>${t('question')} ${st.i + 1} ${t('of')} ${Q.length}</span><span>${multi ? t('selectAll') : ''}</span></div>`
        + `<div class="segs" style="margin-bottom:22px">${Q.map((_, i) => `<i class="${i < st.i ? 'is-done' : (i === st.i ? 'is-now' : '')}"></i>`).join('')}</div>`
        + `<p class="q-prompt">${esc(q.prompt)}</p><div class="choices" role="group">${q.choices.map((c, i) => {
          const pick = sel.indexOf(c.id) >= 0;
          return `<button class="choice ${multi ? 'choice--multi' : ''}" data-a="pick" data-v="${esc(c.id)}" aria-pressed="${pick}"><span class="choice__key">${multi ? (pick ? ic('check') : '') : KEYS[i]}</span><span>${esc(c.text)}</span></button>`;
        }).join('')}</div>`
        + `<div class="nb-quiz__nav">${st.i ? `<button class="btn btn--ghost" data-a="back">${ic('left')} ${t('back')}</button>` : '<span></span>'}`
        + `<button class="btn btn--primary btn--lg" data-a="next" ${sel.length && !st.busy ? '' : 'disabled'}>${last ? t('submit') : t('next')} ${ic('right')}</button></div></div>`;
    }
    function result() {
      const r = cfg.last; const pass = r.passed; const left = cfg.attemptsLeft;
      const prompts = {}; cfg.questions.forEach((q) => { prompts[q.id] = q.prompt; });
      const review = Object.keys(r.review || {}).map((qid) => {
        const x = r.review[qid];
        return `<div class="review__item"><span class="req__st req__st--${x.correct ? 'ok' : 'bad'}">${ic(x.correct ? 'check' : 'x')}</span><div><b>${esc(prompts[qid] || '')}</b>${x.explain ? `<p>${esc(x.explain)}</p>` : ''}</div></div>`;
      }).join('');
      const again = !pass && left !== 0 ? `<button class="btn btn--primary" data-a="start">${ic('refresh')} ${t('tryAgain')}</button>` : '';
      const line = pass ? t('saved') : (left === 0 ? t('noAttempts') : `${left == null ? '' : `${left} ${t('attemptsLeft').toLowerCase()} · `}${t('bestCounts')}`);
      return `<div class="nb-quiz">${ring(r.percent, 160, pass ? '' : 'ring--gold', `<b class="num">${r.percent}%</b><span>${t('passMark')} ${cfg.passPct}%</span>`)}`
        + `<h1>${t(pass ? 'passed' : 'failed')}</h1><p class="lead">${esc(line)}</p>`
        + `${cfg.best && cfg.best.percent !== r.percent ? `<p class="muted">${t('bestCounts')} — ${cfg.best.percent}%</p>` : ''}`
        + `<div class="eb-row" style="justify-content:center">${again}</div>`
        + `${review ? `<div class="review"><h2 style="font-size:1.05rem">${t('reviewAns')}</h2>${review}</div>` : ''}</div>`;
    }
    function render() {
      paint(ctx, st.phase === 'intro' ? intro() : (st.phase === 'q' ? questionView() : result()));
    }
    on(ctx, {
      start() { st.phase = 'q'; st.i = 0; st.ans = {}; render(); ctx.root.scrollIntoView({ block: 'start' }); },
      pick(cid) {
        const q = cfg.questions[st.i]; const cur = st.ans[q.id] || [];
        st.ans[q.id] = q.type === 'multi' ? (cur.indexOf(cid) >= 0 ? cur.filter((x) => x !== cid) : cur.concat(cid)) : [cid];
        render();
      },
      back() { st.i -= 1; render(); },
      next() {
        if (st.i < cfg.questions.length - 1) { st.i += 1; render(); return; }
        st.busy = true; render();
        post(ctx, 'submit', { answers: st.ans }).then((r) => {
          st.busy = false;
          if (r.ok || r.reason === 'no_attempts_left') {
            cfg = Object.assign({}, cfg, r); delete cfg.ok; delete cfg.reason;
            st.phase = cfg.last ? 'result' : 'intro';
            ctx.complete = cfg.attempts > 0; tell(ctx);
            render(); ctx.root.scrollIntoView({ block: 'start' });
            return;
          }
          render(); flash(ctx, r.reason === 'answer_all' ? t('answerAll') : (r.message || t('offline')));
        }).catch(() => { st.busy = false; render(); flash(ctx, t('offline')); });
      },
    });
    render();
  }

  /* =====================================================================================
     VIDEO — our player: captions, speed, chapters, no skipping ahead, counts on the server
     ===================================================================================== */
  function video(ctx) {
    const { cfg, t } = ctx;
    const REPORT_MS = 10000;
    const st = {
      furthest: cfg.furthest || 0, percent: cfg.percent || 0, cc: true, speed: 1,
      seg: null, pending: [], lastT: null, timer: null,
    };
    const capLang = (cfg.captions.find((c) => c.lang === cfg.lang) || cfg.captions[0] || {}).lang;
    const pc = (x) => (cfg.seconds ? (x / cfg.seconds) * 100 : 0);
    const reach = () => (cfg.allowSkip ? cfg.seconds : Math.max(st.furthest, st.seg ? st.seg[1] : 0));

    paint(ctx, `${title(ctx)}<div class="vp"><div class="vp__screen" data-a="toggle">`
      + `<video preload="metadata" playsinline ${cfg.poster ? `poster="${esc(cfg.poster)}"` : ''} src="${esc(cfg.src)}">`
      + `${cfg.captions.map((c) => `<track kind="subtitles" srclang="${esc(c.lang)}" label="${c.lang === 'th' ? 'ไทย' : 'English'}" src="${esc(c.src)}">`).join('')}</video>`
      + `<span class="vp__big" aria-hidden="true">${ic('play')}</span><div class="vp__cc" hidden></div></div>`
      + `<div class="vp__bar"><button class="icon-btn" data-a="toggle" aria-label="${t('play')}">${ic('play')}</button>`
      + `<div class="scrub" data-a="seek" role="slider" tabindex="0" aria-label="${esc(cfg.title || 'Video')}" aria-valuemin="0" aria-valuemax="${cfg.seconds}"><div class="scrub__track"><div class="scrub__seen"></div><div class="scrub__now"></div>`
      + `${cfg.chapters.slice(1).map((c) => `<span class="scrub__mark" style="left:${pc(c.at)}%"></span>`).join('')}<span class="scrub__knob"></span></div></div>`
      + `<span class="vp__time num"></span><button class="vp__speed" data-a="speed" aria-label="${t('speed')}">1×</button>`
      + `<button class="icon-btn" data-a="cc" aria-label="${t('captions')}" aria-pressed="true">${ic('cc')}</button>`
      + `<button class="icon-btn hide-xs" data-a="full" aria-label="${t('full')}">${ic('expand')}</button></div></div>`
      + `<div class="vp-under"><div class="chapters"></div><div class="watched"></div></div>`
      + `${cfg.transcript ? `<details class="eb-transcript"><summary>${t('transcript')}</summary><p>${esc(cfg.transcript)}</p></details>` : ''}`);

    const v = ctx.root.querySelector('video');
    const q = (s) => ctx.root.querySelector(s);
    const tracks = () => Array.prototype.slice.call(v.textTracks || []);
    function setCaptions() {
      tracks().forEach((tr) => { tr.mode = st.cc && tr.language === capLang ? 'hidden' : 'disabled'; });
    }
    function cue() {
      const tr = tracks().find((x) => x.mode === 'hidden');
      const c = tr && tr.activeCues && tr.activeCues[0];
      const box = q('.vp__cc');
      box.hidden = !(st.cc && c);
      if (c) { box.textContent = c.text; }
    }
    function bar() {
      const now = v.currentTime || 0;
      q('.scrub__seen').style.width = `${pc(reach())}%`;
      q('.scrub__now').style.width = `${pc(now)}%`;
      q('.scrub__knob').style.left = `${pc(now)}%`;
      q('.scrub').setAttribute('aria-valuenow', String(Math.floor(now)));
      q('.vp__time').textContent = `${clock(now)} / ${clock(cfg.seconds)}`;
      const playing = !v.paused && !v.ended;
      const btn = q('.vp__bar [data-a="toggle"]'); btn.innerHTML = ic(playing ? 'pause' : 'play'); btn.setAttribute('aria-label', t(playing ? 'pause' : 'play'));
      q('.vp__big').hidden = playing;
      const r = reach();
      q('.chapters').innerHTML = cfg.chapters.map((c, i, a) => {
        const cur = now >= c.at && (i === a.length - 1 || now < a[i + 1].at); const lock = c.at > r + 0.5;
        return `<button class="${cur ? 'is-now' : ''}" data-a="chap" data-v="${c.at}" ${lock ? `disabled title="${t('noSkip')}"` : ''}>${ic(lock ? 'lock' : 'play')} ${clock(c.at)} ${esc(c.title)}</button>`;
      }).join('');
      const pct = Math.max(st.percent, Math.min(100, Math.round(pc(localWatched()))));
      const ok = cfg.complete || pct >= cfg.completePct;
      const w = q('.watched'); w.className = `watched ${ok ? 'is-ok' : ''}`;
      w.innerHTML = `${ring(pct, 40)}<span><b class="num">${pct}%</b> ${ok ? t('watched') : esc(t('watchHint').replace('{n}', cfg.completePct))}</span>`;
    }
    function localWatched() { // what the server already has + what is waiting to be sent (estimate for the ring)
      return (st.percent / 100) * cfg.seconds + st.pending.concat(st.seg ? [st.seg] : []).reduce((s, x) => s + (x[1] - x[0]), 0);
    }
    function closeSeg() { if (st.seg && st.seg[1] - st.seg[0] > 0.05) { st.pending.push(st.seg); } st.seg = null; }
    function track() {
      const now = v.currentTime;
      if (!v.paused && st.lastT != null) {
        const gap = now - st.lastT;
        if (gap > 0 && gap <= 1.5 * (v.playbackRate || 1) + 0.5) {
          if (!st.seg) { st.seg = [st.lastT, now]; } else { st.seg[1] = now; }
        } else if (gap !== 0) { closeSeg(); }
      }
      st.lastT = now;
    }
    function report(final) {
      closeSeg();
      if (!st.pending.length) { return; }
      const segments = st.pending.map((s) => [Math.round(s[0] * 100) / 100, Math.round(s[1] * 100) / 100]);
      st.pending = [];
      post(ctx, 'progress', { segments, position: v.currentTime || 0 }, final).then((r) => {
        if (!r.ok) { return; }
        st.furthest = r.furthest; st.percent = r.percent;
        if (r.complete && !cfg.complete) { cfg.complete = true; ctx.complete = true; tell(ctx); }
        bar();
      }).catch(() => { st.pending = segments.concat(st.pending); }); // try again with the next report
    }
    function seekTo(x) {
      const target = Math.max(0, Math.min(cfg.seconds, x));
      if (!cfg.allowSkip && target > reach() + 0.5) { v.currentTime = reach(); flash(ctx, t('noSkip')); } else { v.currentTime = target; }
      closeSeg(); st.lastT = v.currentTime; bar();
    }

    v.addEventListener('loadedmetadata', () => {
      setCaptions();
      if (cfg.position > 0 && cfg.position < cfg.seconds - 1) { v.currentTime = Math.min(cfg.position, reach()); }
      st.lastT = v.currentTime; bar();
    });
    v.addEventListener('timeupdate', () => { track(); cue(); bar(); });
    v.addEventListener('seeking', () => {
      if (!cfg.allowSkip && v.currentTime > reach() + 1) { v.currentTime = reach(); }
      closeSeg(); st.lastT = v.currentTime;
    });
    v.addEventListener('play', () => { st.lastT = v.currentTime; clearInterval(st.timer); st.timer = setInterval(() => report(false), REPORT_MS); bar(); });
    v.addEventListener('pause', () => { track(); clearInterval(st.timer); report(false); bar(); });
    v.addEventListener('ended', () => { track(); clearInterval(st.timer); report(false); bar(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) { track(); report(true); } });
    window.addEventListener('pagehide', () => { track(); report(true); });

    on(ctx, {
      toggle() { if (v.paused || v.ended) { v.play().catch(() => {}); } else { v.pause(); } },
      speed(_, el) { const sp = cfg.speeds || [1, 1.25, 1.5]; st.speed = sp[(sp.indexOf(st.speed) + 1) % sp.length]; v.playbackRate = st.speed; el.textContent = `${st.speed}×`; },
      cc(_, el) { st.cc = !st.cc; el.setAttribute('aria-pressed', String(st.cc)); setCaptions(); cue(); },
      full() { const box = q('.vp'); if (document.fullscreenElement) { document.exitFullscreen(); } else if (box.requestFullscreen) { box.requestFullscreen(); } },
      chap(at) { seekTo(Number(at)); },
      seek(_, el, e) { const r = el.getBoundingClientRect(); seekTo(((e.clientX - r.left) / r.width) * cfg.seconds); },
    });
    q('.scrub').addEventListener('keydown', (e) => {
      const d = { ArrowRight: 5, ArrowLeft: -5, Home: -1e9, End: 1e9 }[e.key];
      if (d != null) { e.preventDefault(); seekTo((v.currentTime || 0) + d); }
    });
    ctx.root.addEventListener('keydown', (e) => {
      if ((e.key === ' ' || e.key === 'k') && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'SUMMARY') { e.preventDefault(); if (v.paused) { v.play().catch(() => {}); } else { v.pause(); } }
    });
    bar();
  }

  /* =====================================================================================
     ACTIVITIES — never graded; the server checks the "done when" rule (finish handler)
     ===================================================================================== */
  function finish(ctx, body, after) {
    return post(ctx, 'finish', body).then((r) => {
      if (r.ok) { ctx.cfg.complete = true; ctx.cfg.result = r; ctx.complete = true; tell(ctx); }
      if (after) { after(r); }
    }).catch(() => flash(ctx, ctx.t('offline')));
  }

  function hotspot(ctx) {
    const { cfg, t } = ctx;
    const st = { sel: null, seen: cfg.complete ? cfg.spots.map((s) => s.n) : [] };
    function render() {
      const s = cfg.spots.find((x) => x.n === st.sel);
      paint(ctx, `${title(ctx)}<div class="nb-hot"><div class="nb-hot__stage" role="img" aria-label="${esc(cfg.alt)}">${picture(cfg.art, cfg.alt)}`
        + `${cfg.spots.map((x) => `<button class="nb-spot ${st.seen.indexOf(x.n) >= 0 ? 'is-seen' : ''} ${st.sel === x.n ? 'is-on' : ''}" style="left:${Number(x.x)}%;top:${Number(x.y)}%" data-a="spot" data-v="${x.n}" aria-label="${x.n}: ${esc(x.title)}" aria-pressed="${st.sel === x.n}">${x.n}</button>`).join('')}</div>`
        + `<div class="nb-hot__card" aria-live="polite">${s ? `<span class="nb-hot__n">${s.n}</span><div><b>${esc(s.title)}</b><p>${esc(s.text)}</p></div>`
          : `<span class="nb-hot__n">${ic('hand')}</span><div><b>${t('tapNumber')}</b><p>${st.seen.length} / ${cfg.spots.length} ${t('explored')}</p></div>`}</div></div>`);
    }
    on(ctx, {
      spot(v) {
        const n = Number(v); st.sel = n;
        if (st.seen.indexOf(n) < 0) { st.seen.push(n); }
        render();
        if (!cfg.complete && st.seen.length >= cfg.spots.length) { finish(ctx, { opened: st.seen }); }
      },
    });
    render();
  }

  function order(ctx) {
    const { cfg, t } = ctx;
    const all = cfg.items.map((_, i) => i);
    const st = { placed: cfg.complete ? all.slice() : [], pool: shuffle(all), wrong: null };
    function render() {
      const n = cfg.items.length; const full = st.placed.length === n;
      paint(ctx, `${title(ctx)}<div class="order-slots">${cfg.items.map((x, i) => {
        const f = st.placed.indexOf(i) >= 0; const nx = !f && i === st.placed.length;
        return `<div class="slot ${f ? 'is-filled' : ''} ${nx ? 'is-next' : ''}"><b>${i + 1}</b><span>${f ? esc(x) : (nx ? t('tapNext') : '')}</span></div>`;
      }).join('')}</div>`
        + (full ? `<div class="nb-ok">${ic('check')} ${t('allInOrder')}</div>`
          : `<div class="pool">${st.pool.filter((i) => st.placed.indexOf(i) < 0).map((i) => `<button data-a="ord" data-v="${i}" class="${st.wrong === i ? 'is-wrong' : ''}">${esc(cfg.items[i])}</button>`).join('')}</div>`));
    }
    on(ctx, {
      ord(v) {
        const i = Number(v);
        if (i === st.placed.length) {
          st.placed.push(i);
          if (st.placed.length === cfg.items.length && !cfg.complete) { finish(ctx, { order: st.placed }); }
        } else { st.wrong = i; setTimeout(() => { st.wrong = null; render(); }, 450); }
        render();
      },
    });
    render();
  }

  function scenario(ctx) {
    const { cfg, t } = ctx;
    const endId = Object.keys(cfg.scenes).find((k) => cfg.scenes[k].end);
    const goodSteps = Object.keys(cfg.scenes).filter((k) => (cfg.scenes[k].choices || []).some((c) => c.good === true)).length;
    let st;
    const reset = () => { st = { at: cfg.complete ? endId : cfg.start, path: [cfg.start], fb: null, steps: cfg.complete ? goodSteps : 0 }; };
    reset();
    function render() {
      const sc = cfg.scenes[st.at];
      paint(ctx, `<div class="nb-scn"><div class="nb-scn__top">${ic('chat')} <b>${esc(cfg.title || t('scenario'))}</b><span class="nb-scn__dots">${Array.from({ length: goodSteps }, (_, i) => `<i class="${i < st.steps || sc.end ? 'is-on' : ''}"></i>`).join('')}</span></div>`
        + `${sc.art ? `<div class="nb-scn__art">${picture(sc.art)}</div>` : ''}`
        + `${st.fb ? `<div class="nb-scn__fb ${st.fb.ok ? 'is-ok' : 'is-bad'}" role="status">${ic(st.fb.ok ? 'check' : 'alert')} ${esc(st.fb.text)}</div>` : ''}`
        + `<p class="nb-scn__t">${esc(sc.text)}</p>`
        + (sc.end ? `<div class="nb-ok">${ic('award')} ${t('scnDone')}</div><button class="btn btn--ghost btn--sm" data-a="again">${ic('refresh')} ${t('playAgain')}</button>`
          : `<div class="nb-scn__ch">${sc.choices.map((c, i) => `<button class="nb-scn__c" data-a="choose" data-v="${i}"><span>${KEYS[i]}</span>${esc(c.text)}</button>`).join('')}</div>`)
        + '</div>');
    }
    on(ctx, {
      choose(v) {
        const c = cfg.scenes[st.at].choices[Number(v)];
        st.fb = c.feedback ? { ok: c.good !== false, text: c.feedback } : null;
        if (c.good === true) { st.steps += 1; }
        st.at = c.next; st.path.push(c.next);
        if (cfg.scenes[st.at].end && !cfg.complete) { finish(ctx, { path: st.path }); }
        render();
      },
      again() { st = { at: cfg.start, path: [cfg.start], fb: null, steps: 0 }; render(); },
    });
    render();
  }

  function sort(ctx) {
    const { cfg, t } = ctx;
    const n = cfg.items.length;
    let st;
    const reset = (done) => { st = { i: done ? n : 0, placed: [], right: done ? ((cfg.result && cfg.result.score) != null ? cfg.result.score : n) : 0, fb: null }; };
    reset(cfg.complete);
    function render() {
      if (st.i >= n) {
        paint(ctx, `${title(ctx)}<div class="nb-sort"><div class="nb-sort__done">${ring((st.right / n) * 100, 96, '', `<b class="num">${st.right}/${n}</b>`)}<div><b>${t('sorted')}</b></div></div>`
          + `<button class="btn btn--ghost btn--sm" data-a="again">${ic('refresh')} ${t('sortAgain')}</button></div>`);
        return;
      }
      const it = cfg.items[st.i];
      paint(ctx, `${title(ctx)}<div class="nb-sort"><div class="nb-sort__meta">${t('card')} ${st.i + 1} / ${n}</div>`
        + `<div class="nb-sort__card ${st.fb ? (st.fb.ok ? 'is-ok' : 'is-bad') : ''}" aria-live="polite">${esc(it.text)}${st.fb && it.why ? `<small>${ic(st.fb.ok ? 'check' : 'x')} ${esc(it.why)}</small>` : ''}</div>`
        + (st.fb ? `<button class="btn btn--primary" data-a="next">${t('nextCard')} ${ic('arrow')}</button>`
          : `<div class="nb-sort__bins">${cfg.bins.map((b, i) => `<button class="nb-bin nb-bin--${i}" data-a="bin" data-v="${i}">${ic(i ? 'refresh' : 'hand')}<b>${esc(b)}</b></button>`).join('')}</div>`)
        + '</div>');
    }
    on(ctx, {
      bin(v) { const b = Number(v); const ok = cfg.items[st.i].bin === b; st.placed[st.i] = b; st.fb = { ok }; if (ok) { st.right += 1; } render(); },
      next() {
        st.i += 1; st.fb = null;
        if (st.i >= n) { finish(ctx, { placed: st.placed }); }
        render();
      },
      again() { reset(false); render(); },
    });
    render();
  }

  function deck(ctx) {
    const { cfg, t } = ctx;
    const n = cfg.cards.length;
    let st;
    const reset = (done) => { st = { q: done ? [] : cfg.cards.map((_, i) => i), got: [], flip: false }; };
    reset(cfg.complete);
    function render() {
      if (!st.q.length) {
        paint(ctx, `${title(ctx)}<div class="nb-deck"><div class="nb-ok">${ic('award')} ${t('allLearned')}</div><button class="btn btn--ghost btn--sm" data-a="again">${ic('refresh')} ${t('studyAgain')}</button></div>`);
        return;
      }
      const c = cfg.cards[st.q[0]];
      paint(ctx, `${title(ctx)}<div class="nb-deck"><div class="nb-deck__meta"><span>${st.got.length} / ${n} ${t('learned')}</span><div class="bar" style="flex:1;max-width:220px"><i style="width:${(st.got.length / n) * 100}%"></i></div></div>`
        + `<div class="nb-deck__stack"><i></i><i></i><button class="flip nb-deck__card ${st.flip ? 'is-flipped' : ''}" data-a="flip" aria-pressed="${st.flip}"><div class="flip__in">`
        + `<div class="flip__f"><span class="flip__k">${t('term')}</span><span class="flip__q" style="font-size:1.4rem">${esc(c.front)}</span><span class="flip__hint">${ic('refresh')} ${t('tapFlip')}</span></div>`
        + `<div class="flip__b"><span class="flip__k">${t('meaning')}</span><span style="font-size:1.05rem">${esc(c.back)}</span></div></div></button></div>`
        + `<div class="nb-deck__acts"><button class="btn btn--ghost" data-a="later" ${st.flip ? '' : 'disabled'}>${ic('refresh')} ${t('again')}</button>`
        + `<button class="btn btn--primary" data-a="got" ${st.flip ? '' : 'disabled'}>${ic('check')} ${t('gotIt')}</button></div></div>`);
    }
    on(ctx, {
      flip() { st.flip = !st.flip; render(); },
      later() { st.q.push(st.q.shift()); st.flip = false; render(); },
      got() {
        st.got.push(st.q.shift()); st.flip = false;
        if (!st.q.length && !cfg.complete) { finish(ctx, { known: st.got }); }
        render();
      },
      again() { reset(false); render(); },
    });
    render();
  }

  function practice(ctx) {
    const { cfg, t } = ctx;
    const total = cfg.seconds;
    const st = { left: total, running: false, done: !!cfg.complete, timer: null };
    function render() {
      const steps = cfg.steps.length;
      const si = st.running || st.done ? Math.min(steps - 1, Math.floor(((total - st.left) / total) * steps)) : -1;
      paint(ctx, `${title(ctx)}<div class="nb-prac"><div class="rub">${ring(((total - st.left) / total) * 100, 200, 'ring--gold', `<b class="num">${st.left}</b><span>${t('seconds')}</span>`)}`
        + `<ol class="rub-steps">${cfg.steps.map((x, i) => `<li class="${st.done || i < si ? 'is-past' : ''} ${i === si && !st.done ? 'is-now' : ''}">${esc(x)}</li>`).join('')}</ol></div>`
        + `<div class="eb-row"><button class="btn ${st.done ? 'btn--ghost' : 'btn--primary'}" data-a="go" ${st.running ? 'disabled' : ''}>${ic(st.done ? 'refresh' : 'play')} ${st.done ? t('again') : t('startPractice')}</button>`
        + `${st.done ? `<span class="nb-okline">${ic('check')} ${t('wellDone')}</span>` : ''}</div></div>`);
    }
    on(ctx, {
      go() {
        st.left = total; st.running = true; st.done = false; render();
        post(ctx, 'start', {}).catch(() => {});
        const started = Date.now();
        clearInterval(st.timer);
        st.timer = setInterval(() => {
          st.left = Math.max(0, total - Math.floor((Date.now() - started) / 1000));
          if (st.left <= 0) {
            clearInterval(st.timer); st.running = false; st.done = true;
            if (!cfg.complete) { finish(ctx, {}); }
          }
          render();
        }, 250);
      },
    });
    render();
  }

  const ACTIVITY = { hotspot, order, scenario, sort, deck, practice };

  /* =====================================================================================
     entry point (XBlock initialize_js)
     ===================================================================================== */
  function ElmpBlock(runtime, element, config) {
    const root = (element.querySelector && element.querySelector('[data-elmp-block]')) || element;
    const lang = config.lang === 'th' ? 1 : 0;
    const ctx = {
      runtime, element, root, cfg: config, complete: !!config.complete,
      t: (k) => (WORDS[k] ? WORDS[k][lang] : k),
    };
    const kind = config.block === 'activity' ? (config.kind || 'activity') : (config.block === 'quiz' && config.mode ? `quiz-${config.mode}` : config.block);
    ctx.entry = { kind, complete: ctx.complete };
    registry.blocks.push(ctx.entry);
    if (config.error) {
      paint(ctx, `${title(ctx)}<div class="eb-error" role="alert">${ic('alert')} ${esc(config.error)}</div>`);
      tell(ctx);
      return;
    }
    if (config.block === 'quiz') { (config.mode === 'exam' ? quizExam : quizCheck)(ctx); } else if (config.block === 'video') { video(ctx); } else if (ACTIVITY[config.kind]) { ACTIVITY[config.kind](ctx); }
    tell(ctx);
  }

  window.ElmpBlock = ElmpBlock;
}());
