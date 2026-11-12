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
    correctAnswer: ['Correct answer:', 'คำตอบที่ถูก:'], youGot: ['You got {n} of {m} right', 'ตอบถูก {n} จาก {m} ข้อ'],
    dragOrder: ['Drag the steps into the right order, then check.', 'ลากเรียงขั้นตอนให้ถูกลำดับ แล้วกดตรวจ'],
    checkOrder: ['Check order', 'ตรวจลำดับ'], notOrder: ['Not yet — the red steps are in the wrong place. Drag them again.', 'ยังไม่ถูก — ขั้นตอนสีแดงอยู่ผิดตำแหน่ง ลองลากใหม่'],
    moveUp: ['Move up', 'เลื่อนขึ้น'], moveDown: ['Move down', 'เลื่อนลง'], dragHandle: ['Drag to move', 'ลากเพื่อย้าย'],
    dragCard: ['Drag the card into a box — or tap a box.', 'ลากการ์ดไปวางในกล่อง หรือแตะที่กล่อง'],
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
  /* ELMP-ART-START (generated by content-kit/sync_block_art.py from content-kit/art/*.svg — do not edit here) */
  const ART = {"germs": "<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"art\" viewBox=\"0 0 600 400\" role=\"img\" aria-hidden=\"true\"><defs><linearGradient id=\"ga\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0\" stop-color=\"#1FA35A\"/><stop offset=\"1\" stop-color=\"#03692A\"/></linearGradient> <linearGradient id=\"gb\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#F7E3A8\"/><stop offset=\"1\" stop-color=\"#DDB866\"/></linearGradient></defs><rect x=\"70\" y=\"60\" width=\"460\" height=\"280\" rx=\"140\" fill=\"url(#ga)\" opacity=\".16\"/> <g fill=\"none\" stroke=\"#fff\" stroke-width=\"1.3\" stroke-linecap=\"round\" stroke-linejoin=\"round\" transform=\"translate(204 104) scale(8)\" opacity=\".95\"><path d=\"M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8\"/><path d=\"M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6-2.4l-3.6-3.6a2 2 0 0 1 2.8-2.8L7 15\"/></g> <g class=\"germ\" data-d=\"0\" transform=\"translate(250 150)\"><circle r=\"13\" fill=\"#F05A50\"/><line x1=\"0\" y1=\"0\" x2=\"21\" y2=\"0\" stroke=\"#F05A50\" stroke-width=\"4\" stroke-linecap=\"round\"/><line x1=\"0\" y1=\"0\" x2=\"10.5\" y2=\"18.19\" stroke=\"#F05A50\" stroke-width=\"4\" stroke-linecap=\"round\"/><line x1=\"0\" y1=\"0\" x2=\"-10.5\" y2=\"18.19\" stroke=\"#F05A50\" stroke-width=\"4\" stroke-linecap=\"round\"/><line x1=\"0\" y1=\"0\" x2=\"-21\" y2=\"0\" stroke=\"#F05A50\" stroke-width=\"4\" stroke-linecap=\"round\"/><line x1=\"0\" y1=\"0\" x2=\"-10.5\" y2=\"-18.19\" stroke=\"#F05A50\" stroke-width=\"4\" stroke-linecap=\"round\"/><line x1=\"0\" y1=\"0\" x2=\"10.5\" y2=\"-18.19\" stroke=\"#F05A50\" stroke-width=\"4\" stroke-linecap=\"round\"/><circle r=\"4\" cx=\"-3\" cy=\"-3\" fill=\"#fff\" opacity=\".7\"/></g><g class=\"germ\" data-d=\"4\" transform=\"translate(330 120)\"><circle r=\"13\" fill=\"#DDB866\"/><line x1=\"0\" y1=\"0\" x2=\"21\" y2=\"0\" stroke=\"#DDB866\" stroke-width=\"4\" stroke-linecap=\"round\"/><line x1=\"0\" y1=\"0\" x2=\"10.5\" y2=\"18.19\" stroke=\"#DDB866\" stroke-width=\"4\" stroke-linecap=\"round\"/><line x1=\"0\" y1=\"0\" x2=\"-10.5\" y2=\"18.19\" stroke=\"#DDB866\" stroke-width=\"4\" stroke-linecap=\"round\"/><line x1=\"0\" y1=\"0\" x2=\"-21\" y2=\"0\" stroke=\"#DDB866\" stroke-width=\"4\" stroke-linecap=\"round\"/><line x1=\"0\" y1=\"0\" x2=\"-10.5\" y2=\"-18.19\" stroke=\"#DDB866\" stroke-width=\"4\" stroke-linecap=\"round\"/><line x1=\"0\" y1=\"0\" x2=\"10.5\" y2=\"-18.19\" stroke=\"#DDB866\" stroke-width=\"4\" stroke-linecap=\"round\"/><circle r=\"4\" cx=\"-3\" cy=\"-3\" fill=\"#fff\" opacity=\".7\"/></g><g class=\"germ\" data-d=\"8\" transform=\"translate(300 230)\"><circle r=\"13\" fill=\"#9C84F0\"/><line x1=\"0\" y1=\"0\" x2=\"21\" y2=\"0\" stroke=\"#9C84F0\" stroke-width=\"4\" stroke-linecap=\"round\"/><line x1=\"0\" y1=\"0\" x2=\"10.5\" y2=\"18.19\" stroke=\"#9C84F0\" stroke-width=\"4\" stroke-linecap=\"round\"/><line x1=\"0\" y1=\"0\" x2=\"-10.5\" y2=\"18.19\" stroke=\"#9C84F0\" stroke-width=\"4\" stroke-linecap=\"round\"/><line x1=\"0\" y1=\"0\" x2=\"-21\" y2=\"0\" stroke=\"#9C84F0\" stroke-width=\"4\" stroke-linecap=\"round\"/><line x1=\"0\" y1=\"0\" x2=\"-10.5\" y2=\"-18.19\" stroke=\"#9C84F0\" stroke-width=\"4\" stroke-linecap=\"round\"/><line x1=\"0\" y1=\"0\" x2=\"10.5\" y2=\"-18.19\" stroke=\"#9C84F0\" stroke-width=\"4\" stroke-linecap=\"round\"/><circle r=\"4\" cx=\"-3\" cy=\"-3\" fill=\"#fff\" opacity=\".7\"/></g><g class=\"germ\" data-d=\"12\" transform=\"translate(380 260)\"><circle r=\"13\" fill=\"#F05A50\"/><line x1=\"0\" y1=\"0\" x2=\"21\" y2=\"0\" stroke=\"#F05A50\" stroke-width=\"4\" stroke-linecap=\"round\"/><line x1=\"0\" y1=\"0\" x2=\"10.5\" y2=\"18.19\" stroke=\"#F05A50\" stroke-width=\"4\" stroke-linecap=\"round\"/><line x1=\"0\" y1=\"0\" x2=\"-10.5\" y2=\"18.19\" stroke=\"#F05A50\" stroke-width=\"4\" stroke-linecap=\"round\"/><line x1=\"0\" y1=\"0\" x2=\"-21\" y2=\"0\" stroke=\"#F05A50\" stroke-width=\"4\" stroke-linecap=\"round\"/><line x1=\"0\" y1=\"0\" x2=\"-10.5\" y2=\"-18.19\" stroke=\"#F05A50\" stroke-width=\"4\" stroke-linecap=\"round\"/><line x1=\"0\" y1=\"0\" x2=\"10.5\" y2=\"-18.19\" stroke=\"#F05A50\" stroke-width=\"4\" stroke-linecap=\"round\"/><circle r=\"4\" cx=\"-3\" cy=\"-3\" fill=\"#fff\" opacity=\".7\"/></g><g class=\"germ\" data-d=\"16\" transform=\"translate(230 270)\"><circle r=\"13\" fill=\"#DDB866\"/><line x1=\"0\" y1=\"0\" x2=\"21\" y2=\"0\" stroke=\"#DDB866\" stroke-width=\"4\" stroke-linecap=\"round\"/><line x1=\"0\" y1=\"0\" x2=\"10.5\" y2=\"18.19\" stroke=\"#DDB866\" stroke-width=\"4\" stroke-linecap=\"round\"/><line x1=\"0\" y1=\"0\" x2=\"-10.5\" y2=\"18.19\" stroke=\"#DDB866\" stroke-width=\"4\" stroke-linecap=\"round\"/><line x1=\"0\" y1=\"0\" x2=\"-21\" y2=\"0\" stroke=\"#DDB866\" stroke-width=\"4\" stroke-linecap=\"round\"/><line x1=\"0\" y1=\"0\" x2=\"-10.5\" y2=\"-18.19\" stroke=\"#DDB866\" stroke-width=\"4\" stroke-linecap=\"round\"/><line x1=\"0\" y1=\"0\" x2=\"10.5\" y2=\"-18.19\" stroke=\"#DDB866\" stroke-width=\"4\" stroke-linecap=\"round\"/><circle r=\"4\" cx=\"-3\" cy=\"-3\" fill=\"#fff\" opacity=\".7\"/></g><g class=\"germ\" data-d=\"20\" transform=\"translate(410 180)\"><circle r=\"13\" fill=\"#5B93F0\"/><line x1=\"0\" y1=\"0\" x2=\"21\" y2=\"0\" stroke=\"#5B93F0\" stroke-width=\"4\" stroke-linecap=\"round\"/><line x1=\"0\" y1=\"0\" x2=\"10.5\" y2=\"18.19\" stroke=\"#5B93F0\" stroke-width=\"4\" stroke-linecap=\"round\"/><line x1=\"0\" y1=\"0\" x2=\"-10.5\" y2=\"18.19\" stroke=\"#5B93F0\" stroke-width=\"4\" stroke-linecap=\"round\"/><line x1=\"0\" y1=\"0\" x2=\"-21\" y2=\"0\" stroke=\"#5B93F0\" stroke-width=\"4\" stroke-linecap=\"round\"/><line x1=\"0\" y1=\"0\" x2=\"-10.5\" y2=\"-18.19\" stroke=\"#5B93F0\" stroke-width=\"4\" stroke-linecap=\"round\"/><line x1=\"0\" y1=\"0\" x2=\"10.5\" y2=\"-18.19\" stroke=\"#5B93F0\" stroke-width=\"4\" stroke-linecap=\"round\"/><circle r=\"4\" cx=\"-3\" cy=\"-3\" fill=\"#fff\" opacity=\".7\"/></g></svg>", "gloves": "<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"art\" viewBox=\"0 0 600 400\" role=\"img\" aria-hidden=\"true\"><defs><linearGradient id=\"ga\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0\" stop-color=\"#1FA35A\"/><stop offset=\"1\" stop-color=\"#03692A\"/></linearGradient><linearGradient id=\"gb\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#F7E3A8\"/><stop offset=\"1\" stop-color=\"#DDB866\"/></linearGradient></defs><circle cx=\"300\" cy=\"200\" r=\"150\" fill=\"url(#ga)\" opacity=\".2\"/><g transform=\"translate(170 90) rotate(-12)\"><path d=\"M40 210 V120 a14 14 0 0 1 28 0 V70 a14 14 0 0 1 28 0 V60 a14 14 0 0 1 28 0 V72 a14 14 0 0 1 28 0 V150 l18 -26 a14 14 0 0 1 24 14 L160 210 Z\" fill=\"#D7EDF7\" stroke=\"#fff\" stroke-width=\"5\" stroke-linejoin=\"round\"/><rect x=\"36\" y=\"206\" width=\"132\" height=\"30\" rx=\"10\" fill=\"#B6D7EA\"/></g><g transform=\"translate(300 100) rotate(10)\"><path d=\"M40 210 V120 a14 14 0 0 1 28 0 V70 a14 14 0 0 1 28 0 V60 a14 14 0 0 1 28 0 V72 a14 14 0 0 1 28 0 V150 l18 -26 a14 14 0 0 1 24 14 L160 210 Z\" fill=\"#E9F3EC\" stroke=\"#fff\" stroke-width=\"5\" stroke-linejoin=\"round\"/><rect x=\"36\" y=\"206\" width=\"132\" height=\"30\" rx=\"10\" fill=\"#B0DABF\"/></g><circle class=\"pulse\" data-d=\"3\" cx=\"470\" cy=\"110\" r=\"10\" fill=\"#F05A50\" opacity=\".85\"/><circle class=\"pulse\" data-d=\"9\" cx=\"130\" cy=\"300\" r=\"8\" fill=\"#F05A50\" opacity=\".85\"/></svg>", "handover": "<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"art\" viewBox=\"0 0 600 400\" role=\"img\" aria-hidden=\"true\"><defs><linearGradient id=\"ga\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0\" stop-color=\"#1FA35A\"/><stop offset=\"1\" stop-color=\"#03692A\"/></linearGradient><linearGradient id=\"gb\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#F7E3A8\"/><stop offset=\"1\" stop-color=\"#DDB866\"/></linearGradient></defs><circle cx=\"300\" cy=\"200\" r=\"160\" fill=\"url(#ga)\" opacity=\".18\"/><circle cx=\"200\" cy=\"150\" r=\"42\" fill=\"#F2C9A4\"/><path d=\"M130 330 Q130 220 200 214 Q270 220 270 330 Z\" fill=\"#B0DABF\"/><circle cx=\"400\" cy=\"150\" r=\"42\" fill=\"#E2B48C\"/><path d=\"M330 330 Q330 220 400 214 Q470 220 470 330 Z\" fill=\"#D7EDF7\"/><rect x=\"262\" y=\"230\" width=\"76\" height=\"96\" rx=\"8\" fill=\"#fff\"/><rect x=\"284\" y=\"222\" width=\"32\" height=\"16\" rx=\"4\" fill=\"#A8B3AD\"/><path d=\"M276 256 h48 M276 274 h48 M276 292 h34\" stroke=\"#B0DABF\" stroke-width=\"5\" stroke-linecap=\"round\"/><path d=\"M168 112 a42 42 0 0 1 64 0\" fill=\"none\" stroke=\"#0B4A24\" stroke-width=\"12\" stroke-linecap=\"round\"/><g class=\"bub\" data-d=\"2\"><rect x=\"240\" y=\"60\" width=\"120\" height=\"44\" rx=\"14\" fill=\"#fff\" opacity=\".95\"/><path d=\"M262 82 h76\" stroke=\"#03692A\" stroke-width=\"5\" stroke-linecap=\"round\"/></g></svg>", "hands": "<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"art\" viewBox=\"0 0 600 400\" role=\"img\" aria-hidden=\"true\"><defs><linearGradient id=\"ga\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0\" stop-color=\"#1FA35A\"/><stop offset=\"1\" stop-color=\"#03692A\"/></linearGradient> <linearGradient id=\"gb\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#F7E3A8\"/><stop offset=\"1\" stop-color=\"#DDB866\"/></linearGradient></defs><circle cx=\"300\" cy=\"200\" r=\"150\" fill=\"url(#ga)\" opacity=\".18\"/><circle cx=\"300\" cy=\"200\" r=\"104\" fill=\"url(#ga)\" opacity=\".25\"/> <g fill=\"none\" stroke=\"#fff\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" transform=\"translate(222 122) scale(6.5)\"><path d=\"M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8\"/><path d=\"M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6-2.4l-3.6-3.6a2 2 0 0 1 2.8-2.8L7 15\"/></g> <circle class=\"bub\" data-d=\"0\" cx=\"120\" cy=\"90\" r=\"16\" fill=\"none\" stroke=\"#F7E3A8\" stroke-width=\"3\" opacity=\".8\"/><circle class=\"bub\" data-d=\"6\" cx=\"470\" cy=\"120\" r=\"22\" fill=\"none\" stroke=\"#F7E3A8\" stroke-width=\"3\" opacity=\".8\"/><circle class=\"bub\" data-d=\"12\" cx=\"440\" cy=\"300\" r=\"12\" fill=\"none\" stroke=\"#F7E3A8\" stroke-width=\"3\" opacity=\".8\"/><circle class=\"bub\" data-d=\"18\" cx=\"150\" cy=\"300\" r=\"26\" fill=\"none\" stroke=\"#F7E3A8\" stroke-width=\"3\" opacity=\".8\"/><circle class=\"bub\" data-d=\"24\" cx=\"520\" cy=\"220\" r=\"10\" fill=\"none\" stroke=\"#F7E3A8\" stroke-width=\"3\" opacity=\".8\"/><circle class=\"bub\" data-d=\"30\" cx=\"90\" cy=\"200\" r=\"9\" fill=\"none\" stroke=\"#F7E3A8\" stroke-width=\"3\" opacity=\".8\"/></svg>", "isolation": "<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"art\" viewBox=\"0 0 600 400\" role=\"img\" aria-hidden=\"true\"><defs><linearGradient id=\"ga\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0\" stop-color=\"#1FA35A\"/><stop offset=\"1\" stop-color=\"#03692A\"/></linearGradient><linearGradient id=\"gb\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#F7E3A8\"/><stop offset=\"1\" stop-color=\"#DDB866\"/></linearGradient></defs><rect x=\"0\" y=\"320\" width=\"600\" height=\"80\" fill=\"#0B4A24\" opacity=\".25\"/><rect x=\"150\" y=\"60\" width=\"200\" height=\"262\" rx=\"10\" fill=\"#E9F3EC\"/><rect x=\"165\" y=\"75\" width=\"170\" height=\"232\" rx=\"6\" fill=\"#D0D7D3\"/><circle cx=\"315\" cy=\"200\" r=\"8\" fill=\"#A8B3AD\"/><rect x=\"190\" y=\"104\" width=\"120\" height=\"78\" rx=\"10\" fill=\"url(#gb)\"/><text x=\"250\" y=\"136\" text-anchor=\"middle\" fill=\"#8A6418\" font-family=\"Inter,sans-serif\" font-size=\"15\" font-weight=\"800\">CONTACT</text><text x=\"250\" y=\"160\" text-anchor=\"middle\" fill=\"#8A6418\" font-family=\"Inter,sans-serif\" font-size=\"13\" font-weight=\"700\">PRECAUTIONS</text><rect x=\"390\" y=\"190\" width=\"120\" height=\"132\" rx=\"10\" fill=\"#E9F3EC\"/><rect x=\"390\" y=\"230\" width=\"120\" height=\"6\" fill=\"#B0DABF\"/><rect x=\"390\" y=\"276\" width=\"120\" height=\"6\" fill=\"#B0DABF\"/><rect x=\"404\" y=\"160\" width=\"40\" height=\"30\" rx=\"6\" fill=\"#D7EDF7\"/><rect x=\"452\" y=\"166\" width=\"46\" height=\"24\" rx=\"6\" fill=\"#B6D7EA\"/><circle class=\"pulse\" data-d=\"4\" cx=\"250\" cy=\"96\" r=\"10\" fill=\"#F05A50\" opacity=\".85\"/></svg>", "mask": "<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"art\" viewBox=\"0 0 600 400\" role=\"img\" aria-hidden=\"true\"><defs><linearGradient id=\"ga\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0\" stop-color=\"#1FA35A\"/><stop offset=\"1\" stop-color=\"#03692A\"/></linearGradient><linearGradient id=\"gb\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#F7E3A8\"/><stop offset=\"1\" stop-color=\"#DDB866\"/></linearGradient></defs><circle cx=\"300\" cy=\"200\" r=\"150\" fill=\"url(#ga)\" opacity=\".2\"/><circle cx=\"300\" cy=\"170\" r=\"92\" fill=\"#F2C9A4\"/><path d=\"M208 150 a92 92 0 0 1 184 0 v-20 a92 92 0 0 0 -184 0 Z\" fill=\"#0B4A24\"/><circle cx=\"268\" cy=\"160\" r=\"8\" fill=\"#13241B\"/><circle cx=\"332\" cy=\"160\" r=\"8\" fill=\"#13241B\"/><path d=\"M222 190 Q300 170 378 190 L370 245 Q300 275 230 245 Z\" fill=\"#D7EDF7\" stroke=\"#fff\" stroke-width=\"5\" stroke-linejoin=\"round\"/><path d=\"M240 208 h120 M244 226 h112\" stroke=\"#B6D7EA\" stroke-width=\"5\" stroke-linecap=\"round\"/><path d=\"M222 196 L196 176 M378 196 L404 176\" stroke=\"#fff\" stroke-width=\"5\" stroke-linecap=\"round\"/><path d=\"M190 300 Q300 250 410 300 V400 H190 Z\" fill=\"#B0DABF\"/><path d=\"M300 270 V400\" stroke=\"#E9F3EC\" stroke-width=\"6\"/></svg>", "rub": "<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"art\" viewBox=\"0 0 600 400\" role=\"img\" aria-hidden=\"true\"><defs><linearGradient id=\"ga\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0\" stop-color=\"#1FA35A\"/><stop offset=\"1\" stop-color=\"#03692A\"/></linearGradient> <linearGradient id=\"gb\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#F7E3A8\"/><stop offset=\"1\" stop-color=\"#DDB866\"/></linearGradient></defs><circle cx=\"300\" cy=\"200\" r=\"140\" fill=\"none\" stroke=\"#fff\" stroke-opacity=\".18\" stroke-width=\"18\"/><circle class=\"rubring\" cx=\"300\" cy=\"200\" r=\"140\" fill=\"none\" stroke=\"url(#gb)\" stroke-width=\"18\" stroke-linecap=\"round\" stroke-dasharray=\"880\" stroke-dashoffset=\"300\" transform=\"rotate(-90 300 200)\"/> <text x=\"300\" y=\"215\" text-anchor=\"middle\" fill=\"#fff\" font-family=\"Inter,sans-serif\" font-size=\"64\" font-weight=\"800\">20s</text> <g transform=\"translate(300 40)\"><circle r=\"20\" fill=\"#fff\" opacity=\".95\"/><text y=\"6\" text-anchor=\"middle\" fill=\"#03692A\" font-family=\"Inter,sans-serif\" font-size=\"17\" font-weight=\"800\">1</text></g><g transform=\"translate(464.54 120)\"><circle r=\"20\" fill=\"#fff\" opacity=\".95\"/><text y=\"6\" text-anchor=\"middle\" fill=\"#03692A\" font-family=\"Inter,sans-serif\" font-size=\"17\" font-weight=\"800\">2</text></g><g transform=\"translate(464.54 280)\"><circle r=\"20\" fill=\"#fff\" opacity=\".95\"/><text y=\"6\" text-anchor=\"middle\" fill=\"#03692A\" font-family=\"Inter,sans-serif\" font-size=\"17\" font-weight=\"800\">3</text></g><g transform=\"translate(300 360)\"><circle r=\"20\" fill=\"#fff\" opacity=\".95\"/><text y=\"6\" text-anchor=\"middle\" fill=\"#03692A\" font-family=\"Inter,sans-serif\" font-size=\"17\" font-weight=\"800\">4</text></g><g transform=\"translate(135.46 280)\"><circle r=\"20\" fill=\"#fff\" opacity=\".95\"/><text y=\"6\" text-anchor=\"middle\" fill=\"#03692A\" font-family=\"Inter,sans-serif\" font-size=\"17\" font-weight=\"800\">5</text></g><g transform=\"translate(135.46 120)\"><circle r=\"20\" fill=\"#fff\" opacity=\".95\"/><text y=\"6\" text-anchor=\"middle\" fill=\"#03692A\" font-family=\"Inter,sans-serif\" font-size=\"17\" font-weight=\"800\">6</text></g></svg>", "sharps": "<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"art\" viewBox=\"0 0 600 400\" role=\"img\" aria-hidden=\"true\"><defs><linearGradient id=\"ga\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0\" stop-color=\"#1FA35A\"/><stop offset=\"1\" stop-color=\"#03692A\"/></linearGradient><linearGradient id=\"gb\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#F7E3A8\"/><stop offset=\"1\" stop-color=\"#DDB866\"/></linearGradient></defs><circle cx=\"300\" cy=\"200\" r=\"150\" fill=\"url(#ga)\" opacity=\".2\"/><rect x=\"210\" y=\"160\" width=\"180\" height=\"170\" rx=\"16\" fill=\"url(#gb)\"/><rect x=\"200\" y=\"140\" width=\"200\" height=\"34\" rx=\"10\" fill=\"#BE8E28\"/><rect x=\"270\" y=\"148\" width=\"60\" height=\"16\" rx=\"6\" fill=\"#8A6418\"/><path d=\"M248 236 l52 -52 l52 52 Z\" fill=\"none\" stroke=\"#fff\" stroke-width=\"7\" stroke-linejoin=\"round\"/><circle cx=\"300\" cy=\"236\" r=\"8\" fill=\"#fff\"/><g transform=\"translate(330 70) rotate(40)\"><rect x=\"0\" y=\"0\" width=\"22\" height=\"110\" rx=\"5\" fill=\"#D7EDF7\" stroke=\"#fff\" stroke-width=\"3\"/><rect x=\"-6\" y=\"-14\" width=\"34\" height=\"16\" rx=\"4\" fill=\"#B6D7EA\"/><path d=\"M11 110 v36\" stroke=\"#D0D7D3\" stroke-width=\"4\" stroke-linecap=\"round\"/></g><circle class=\"pulse\" data-d=\"6\" cx=\"300\" cy=\"130\" r=\"9\" fill=\"#F05A50\" opacity=\".85\"/></svg>", "sink": "<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"art\" viewBox=\"0 0 600 400\" role=\"img\" aria-hidden=\"true\"><defs><linearGradient id=\"ga\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0\" stop-color=\"#1FA35A\"/><stop offset=\"1\" stop-color=\"#03692A\"/></linearGradient><linearGradient id=\"gb\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#F7E3A8\"/><stop offset=\"1\" stop-color=\"#DDB866\"/></linearGradient></defs><circle cx=\"300\" cy=\"210\" r=\"160\" fill=\"url(#ga)\" opacity=\".18\"/><rect x=\"150\" y=\"250\" width=\"300\" height=\"70\" rx=\"22\" fill=\"#E9F3EC\"/><rect x=\"170\" y=\"250\" width=\"260\" height=\"34\" rx=\"14\" fill=\"#B0DABF\"/><path d=\"M300 110 v-30 h70 a14 14 0 0 1 14 14 v16\" fill=\"none\" stroke=\"#D0D7D3\" stroke-width=\"14\" stroke-linecap=\"round\"/><rect x=\"286\" y=\"104\" width=\"28\" height=\"40\" rx=\"8\" fill=\"#D0D7D3\"/><rect x=\"430\" y=\"120\" width=\"54\" height=\"90\" rx=\"12\" fill=\"url(#gb)\"/><rect x=\"448\" y=\"100\" width=\"18\" height=\"24\" rx=\"4\" fill=\"#BE8E28\"/><path d=\"M440 140 h34\" stroke=\"#fff\" stroke-width=\"5\" stroke-linecap=\"round\" opacity=\".8\"/><circle class=\"bub\" data-d=\"0\" cx=\"282\" cy=\"170\" r=\"6\" fill=\"#D7EDF7\" opacity=\".9\"/><circle class=\"bub\" data-d=\"5\" cx=\"300\" cy=\"196\" r=\"5\" fill=\"#D7EDF7\" opacity=\".9\"/><circle class=\"bub\" data-d=\"10\" cx=\"318\" cy=\"176\" r=\"6\" fill=\"#D7EDF7\" opacity=\".9\"/><circle class=\"bub\" data-d=\"15\" cx=\"292\" cy=\"222\" r=\"4\" fill=\"#D7EDF7\" opacity=\".9\"/><circle class=\"bub\" data-d=\"20\" cx=\"310\" cy=\"236\" r=\"5\" fill=\"#D7EDF7\" opacity=\".9\"/></svg>", "ward": "<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"art\" viewBox=\"0 0 600 400\" role=\"img\" aria-hidden=\"true\"><defs><linearGradient id=\"ga\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0\" stop-color=\"#1FA35A\"/><stop offset=\"1\" stop-color=\"#03692A\"/></linearGradient> <linearGradient id=\"gb\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#F7E3A8\"/><stop offset=\"1\" stop-color=\"#DDB866\"/></linearGradient></defs><rect x=\"0\" y=\"300\" width=\"600\" height=\"100\" fill=\"#0B4A24\" opacity=\".25\"/> <rect x=\"120\" y=\"190\" width=\"300\" height=\"70\" rx=\"14\" fill=\"#E9F3EC\"/><rect x=\"120\" y=\"170\" width=\"70\" height=\"40\" rx=\"12\" fill=\"#fff\"/><rect x=\"190\" y=\"178\" width=\"230\" height=\"30\" rx=\"10\" fill=\"#B0DABF\"/> <rect x=\"112\" y=\"150\" width=\"14\" height=\"150\" rx=\"6\" fill=\"#D0D7D3\"/><rect x=\"414\" y=\"190\" width=\"14\" height=\"110\" rx=\"6\" fill=\"#D0D7D3\"/><rect x=\"140\" y=\"260\" width=\"10\" height=\"45\" fill=\"#A8B3AD\"/><rect x=\"390\" y=\"260\" width=\"10\" height=\"45\" fill=\"#A8B3AD\"/> <circle cx=\"160\" cy=\"160\" r=\"22\" fill=\"#F2C9A4\"/><rect x=\"460\" y=\"70\" width=\"100\" height=\"70\" rx=\"10\" fill=\"#13241B\"/><polyline points=\"470,110 490,110 498,90 508,128 516,104 526,110 550,110\" fill=\"none\" stroke=\"#45E08A\" stroke-width=\"4\" stroke-linejoin=\"round\"/> <rect x=\"505\" y=\"140\" width=\"10\" height=\"160\" fill=\"#A8B3AD\"/><rect x=\"40\" y=\"60\" width=\"8\" height=\"240\" fill=\"#A8B3AD\"/><rect x=\"20\" y=\"60\" width=\"48\" height=\"60\" rx=\"12\" fill=\"#D7EDF7\" opacity=\".9\"/><path d=\"M44 120 C44 160 90 170 120 190\" fill=\"none\" stroke=\"#D7EDF7\" stroke-width=\"3\"/> <rect x=\"455\" y=\"250\" width=\"36\" height=\"52\" rx=\"8\" fill=\"url(#gb)\"/><rect x=\"466\" y=\"238\" width=\"14\" height=\"14\" rx=\"3\" fill=\"#BE8E28\"/> <circle class=\"pulse\" data-d=\"0\" cx=\"118\" cy=\"165\" r=\"10\" fill=\"#F05A50\" opacity=\".85\"/><circle class=\"pulse\" data-d=\"5\" cx=\"280\" cy=\"192\" r=\"10\" fill=\"#F05A50\" opacity=\".85\"/><circle class=\"pulse\" data-d=\"10\" cx=\"510\" cy=\"105\" r=\"10\" fill=\"#F05A50\" opacity=\".85\"/><circle class=\"pulse\" data-d=\"15\" cx=\"44\" cy=\"90\" r=\"10\" fill=\"#F05A50\" opacity=\".85\"/><circle class=\"pulse\" data-d=\"20\" cx=\"472\" cy=\"275\" r=\"10\" fill=\"#F05A50\" opacity=\".85\"/></svg>", "zone": "<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"art\" viewBox=\"0 0 600 400\" role=\"img\" aria-hidden=\"true\"><defs><linearGradient id=\"ga\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0\" stop-color=\"#1FA35A\"/><stop offset=\"1\" stop-color=\"#03692A\"/></linearGradient> <linearGradient id=\"gb\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#F7E3A8\"/><stop offset=\"1\" stop-color=\"#DDB866\"/></linearGradient></defs><ellipse cx=\"300\" cy=\"205\" rx=\"250\" ry=\"165\" fill=\"none\" stroke=\"#fff\" stroke-width=\"3\" stroke-dasharray=\"10 10\" opacity=\".5\"/> <ellipse cx=\"300\" cy=\"205\" rx=\"170\" ry=\"110\" fill=\"url(#ga)\" opacity=\".28\"/><ellipse cx=\"300\" cy=\"205\" rx=\"170\" ry=\"110\" fill=\"none\" stroke=\"#F7E3A8\" stroke-width=\"3\" stroke-dasharray=\"8 8\"/> <rect x=\"200\" y=\"170\" width=\"200\" height=\"70\" rx=\"16\" fill=\"#E9F3EC\"/><rect x=\"200\" y=\"170\" width=\"54\" height=\"70\" rx=\"14\" fill=\"#fff\"/><circle cx=\"228\" cy=\"205\" r=\"18\" fill=\"#F2C9A4\"/><rect x=\"254\" y=\"182\" width=\"140\" height=\"46\" rx=\"12\" fill=\"#B0DABF\"/> <text x=\"300\" y=\"132\" text-anchor=\"middle\" fill=\"#F7E3A8\" font-family=\"Inter,sans-serif\" font-size=\"15\" font-weight=\"700\" letter-spacing=\"2\">PATIENT ZONE</text> <text x=\"300\" y=\"393\" text-anchor=\"middle\" fill=\"#fff\" opacity=\".75\" font-family=\"Inter,sans-serif\" font-size=\"13\" font-weight=\"600\" letter-spacing=\"2\">HEALTHCARE AREA</text></svg>"};
  function art(name) { return ART[name] || ''; }
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
    // Keep keyboard focus: innerHTML drops the focused button, so focus its new copy (same action + value).
    const a = document.activeElement;
    const key = a && ctx.root.contains(a) && a.getAttribute('data-a') ? [a.getAttribute('data-a'), a.getAttribute('data-v')] : null;
    ctx.root.innerHTML = html;
    if (key) {
      const b = Array.prototype.find.call(ctx.root.querySelectorAll('[data-a]'),
        (el) => el.getAttribute('data-a') === key[0] && el.getAttribute('data-v') === key[1] && !el.disabled);
      if (b) { b.focus({ preventScroll: true }); }
    }
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
  // V-7.02 (owner): answer every question, one "Submit answers", then right/wrong per question with the right
  // choice shown on a wrong answer, and "Try again" to answer everything again. The server checks each answer.
  function quizCheck(ctx) {
    const { cfg, t } = ctx;
    const qs = cfg.questions;
    let st;
    const fresh = () => ({ pick: {}, res: {}, shown: false, busy: false });
    st = fresh(); // the server keeps only right/wrong per question, so a reload starts clean (the block stays done)
    const answered = () => qs.every((q) => (st.pick[q.id] || []).length > 0);
    const letters = (q, ids) => q.choices.map((c, i) => (ids.indexOf(c.id) >= 0 ? `${KEYS[i]}. ${c.text}` : null)).filter(Boolean).join(', ');

    function question(q, qi) {
      const res = st.shown ? st.res[q.id] : null; const sel = st.pick[q.id] || [];
      const multi = q.type === 'multi';
      const choices = q.choices.map((c, i) => {
        const pick = sel.indexOf(c.id) >= 0;
        const right = res && res.answer && res.answer.indexOf(c.id) >= 0;
        const cls = res ? (right ? 'is-right' : (pick ? 'is-wrong' : '')) : '';
        return `<button class="choice ${multi ? 'choice--multi' : ''} ${cls}" data-a="pick" data-v="${esc(q.id)}|${esc(c.id)}" aria-pressed="${pick}" ${res ? 'disabled' : ''}>`
          + `<span class="choice__key">${multi ? (pick ? ic('check') : '') : KEYS[i]}</span><span>${esc(c.text)}</span></button>`;
      }).join('');
      const fb = res
        ? `<div class="nb-q__fb" role="status">${ic(res.correct ? 'check' : 'x')}<div><b>${t(res.correct ? 'great' : 'notQuite')}</b> `
          + `${!res.correct && res.answer ? `<span class="nb-q__ans">${t('correctAnswer')} <b>${esc(letters(q, res.answer))}</b></span> ` : ''}${esc(res.explain)}</div></div>`
        : '';
      return `<div class="nb-q ${res ? (res.correct ? 'is-ok' : 'is-bad') : ''}"><p class="nb-q__p"><span>${qi + 1}</span>${esc(q.prompt)}${multi ? ` <em>${t('selectAll')}</em>` : ''}</p>`
        + `<div class="choices" role="group">${choices}</div>${fb}</div>`;
    }
    function render() {
      const right = qs.filter((q) => st.res[q.id] && st.res[q.id].correct).length;
      const head = st.shown ? `${right} / ${qs.length}` : `${qs.filter((q) => (st.pick[q.id] || []).length).length} / ${qs.length}`;
      const foot = st.shown
        ? `<div class="nb-check__foot"><b class="nb-check__score">${esc(t('youGot').replace('{n}', right).replace('{m}', qs.length))}</b>`
          + `<button class="btn btn--ghost btn--sm" data-a="again">${ic('refresh')} ${t('tryAgain')}</button></div>`
        : `<div class="nb-check__foot"><button class="btn btn--primary nb-q__go" data-a="submit" ${answered() && !st.busy ? '' : 'disabled'}>${t('submit')}</button>`
          + `${answered() ? '' : `<small>${t('answerAll')}</small>`}</div>`;
      paint(ctx, `<div class="nb-check"><div class="nb-check__h">${ic('target')} <b>${esc(cfg.title || t('checkTitle'))}</b><small>${head}</small></div>`
        + `${cfg.intro ? `<p class="eb-intro">${esc(cfg.intro)}</p>` : ''}${qs.map(question).join('')}${foot}</div>`);
    }
    on(ctx, {
      pick(v) {
        if (st.shown) { return; }
        const [qid, cid] = v.split('|'); const q = qs.find((x) => x.id === qid); const cur = st.pick[qid] || [];
        st.pick[qid] = q.type === 'multi' ? (cur.indexOf(cid) >= 0 ? cur.filter((x) => x !== cid) : cur.concat(cid)) : [cid];
        render();
      },
      submit() {
        if (!answered()) { return; }
        st.busy = true; render();
        Promise.all(qs.map((q) => post(ctx, 'check', { question: q.id, given: st.pick[q.id] })))
          .then((rs) => {
            st.busy = false;
            const bad = rs.find((r) => !r.ok);
            if (bad) { render(); flash(ctx, bad.message || t('offline')); return; }
            rs.forEach((r, i) => { st.res[qs[i].id] = { correct: r.correct, explain: r.explain, answer: r.answer }; });
            st.shown = true; ctx.complete = true; tell(ctx);
            render();
          })
          .catch(() => { st.busy = false; render(); flash(ctx, t('offline')); });
      },
      again() { st = fresh(); render(); },
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

  /* Drag with Pointer Events (V-7.02): one code path for mouse, pen and touch. Listens on the window from
     pointerdown to pointerup, so the drag keeps going when the pointer leaves the item, and captures the pointer
     when it can. A move under 5 px is a tap, not a drag. Buttons inside the item keep working. CSS sets
     touch-action: none only on what is dragged, so the page still scrolls on phones. */
  function draggable(ctx, sel, h) {
    ctx.root.addEventListener('pointerdown', (e) => {
      const el = e.target.closest(sel);
      if (!el || !ctx.root.contains(el) || e.button > 0 || e.target.closest('button')) { return; }
      e.preventDefault(); // no text selection, no native image drag
      const s = { el, id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, dx: 0, dy: 0, on: false };
      try { el.setPointerCapture(e.pointerId); } catch (err) { /* old browser: the window listeners still follow */ }
      const move = (ev) => {
        if (ev.pointerId !== s.id) { return; }
        s.x = ev.clientX; s.y = ev.clientY; s.dx = s.x - s.x0; s.dy = s.y - s.y0;
        if (!s.on) {
          if (Math.abs(s.dx) + Math.abs(s.dy) < 5) { return; }
          s.on = true; el.classList.add('is-drag'); ctx.root.classList.add('is-dragging');
          if (h.start) { h.start(s); }
        }
        ev.preventDefault();
        h.move(s);
      };
      const end = (ev) => {
        if (ev.pointerId !== s.id) { return; }
        window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', end); window.removeEventListener('pointercancel', end);
        el.classList.remove('is-drag'); ctx.root.classList.remove('is-dragging');
        if (s.on) { h.drop(s, ev.type === 'pointercancel'); }
      };
      window.addEventListener('pointermove', move, { passive: false });
      window.addEventListener('pointerup', end);
      window.addEventListener('pointercancel', end);
    });
  }

  // Order (V-7.02): a list the learner drags into order (or moves with ↑ / ↓), then "Check order".
  // Wrong places turn red; the server gets the order only when it is right (its "done when" rule).
  function order(ctx) {
    const { cfg, t } = ctx;
    const all = cfg.items.map((_, i) => i);
    const st = { list: cfg.complete ? all.slice() : shuffle(all), wrong: [], done: !!cfg.complete, tried: false };
    const grip = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>';
    function render() {
      const n = cfg.items.length;
      const rows = st.list.map((i, pos) => `<li class="nb-ord__it ${st.done ? 'is-ok' : ''} ${st.wrong.indexOf(pos) >= 0 ? 'is-wrong' : ''}" data-i="${i}">`
        + `${st.done ? '' : `<span class="nb-ord__h" title="${t('dragHandle')}">${grip}</span>`}<b class="nb-ord__n">${pos + 1}</b><span class="nb-ord__t">${esc(cfg.items[i])}</span>`
        + (st.done ? `<span class="nb-ord__ok">${ic('check')}</span>`
          : `<span class="nb-ord__mv"><button type="button" data-a="up" data-v="${pos}" aria-label="${t('moveUp')}: ${esc(cfg.items[i])}" ${pos === 0 ? 'disabled' : ''}>↑</button>`
            + `<button type="button" data-a="down" data-v="${pos}" aria-label="${t('moveDown')}: ${esc(cfg.items[i])}" ${pos === n - 1 ? 'disabled' : ''}>↓</button></span>`)
        + '</li>').join('');
      paint(ctx, `${title(ctx)}${st.done ? '' : `<p class="eb-intro">${t('dragOrder')}</p>`}<ol class="nb-ord">${rows}</ol>`
        + (st.done ? `<div class="nb-ok">${ic('check')} ${t('allInOrder')}</div>`
          : `${st.wrong.length ? `<div class="nb-ord__fb" role="status">${ic('x')} ${t('notOrder')}</div>` : ''}`
            + `<button type="button" class="btn btn--primary nb-ord__go" data-a="check">${t('checkOrder')}</button>`));
    }
    const focusBtn = (a, p) => { const b = ctx.root.querySelectorAll(`[data-a="${a}"]`)[p]; if (b && !b.disabled) { b.focus(); } };
    const swap = (a, b) => { const x = st.list[a]; st.list[a] = st.list[b]; st.list[b] = x; st.wrong = []; render(); };
    on(ctx, {
      up(v) { const p = Number(v); if (p > 0) { swap(p, p - 1); focusBtn('up', p - 1); } },
      down(v) { const p = Number(v); if (p < st.list.length - 1) { swap(p, p + 1); focusBtn('down', p + 1); } },
      check() {
        st.wrong = st.list.map((i, pos) => (i === pos ? -1 : pos)).filter((p) => p >= 0);
        if (!st.wrong.length) {
          st.done = true;
          if (!cfg.complete) { finish(ctx, { order: st.list.slice() }); }
        }
        render();
      },
    });
    draggable(ctx, '.nb-ord__it', {
      move(s) {
        // Move the neighbours around the dragged row (the row itself never leaves the page, so the drag survives).
        const list = s.el.parentNode;
        const prev = s.el.previousElementSibling; const next = s.el.nextElementSibling;
        const mid = (el) => { const r = el.getBoundingClientRect(); return r.top + r.height / 2; };
        if (next && s.y > mid(next)) { list.insertBefore(next, s.el); } else if (prev && s.y < mid(prev)) { list.insertBefore(prev, s.el.nextSibling); }
        Array.prototype.forEach.call(list.children, (li, k) => { li.querySelector('.nb-ord__n').textContent = k + 1; li.classList.remove('is-wrong'); });
      },
      drop(s) {
        st.list = Array.prototype.map.call(s.el.parentNode.children, (li) => Number(li.getAttribute('data-i')));
        st.wrong = [];
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
      paint(ctx, `${title(ctx)}<div class="nb-sort"><div class="nb-sort__meta">${t('card')} ${st.i + 1} / ${n}${st.fb ? '' : ` · ${t('dragCard')}`}</div>`
        + `<div class="nb-sort__card ${st.fb ? (st.fb.ok ? 'is-ok' : 'is-bad') : 'is-draggable'}" aria-live="polite">${esc(it.text)}${st.fb && it.why ? `<small>${ic(st.fb.ok ? 'check' : 'x')} ${esc(it.why)}</small>` : ''}</div>`
        + (st.fb ? `<button class="btn btn--primary" data-a="next">${t('nextCard')} ${ic('arrow')}</button>`
          : `<div class="nb-sort__bins">${cfg.bins.map((b, i) => `<button class="nb-bin nb-bin--${i}" data-a="bin" data-v="${i}">${ic(i ? 'refresh' : 'hand')}<b>${esc(b)}</b></button>`).join('')}</div>`)
        + '</div>');
    }
    const place = (b) => { const ok = cfg.items[st.i].bin === b; st.placed[st.i] = b; st.fb = { ok }; if (ok) { st.right += 1; } render(); };
    // V-7.02: the card follows the pointer; dropped on a box = the same as tapping that box; anywhere else = back.
    const binAt = (s) => {
      const hit = ctx.root.ownerDocument.elementFromPoint(s.x, s.y);
      const b = hit && hit.closest ? hit.closest('.nb-bin') : null;
      return b && ctx.root.contains(b) ? b : null;
    };
    draggable(ctx, '.nb-sort__card.is-draggable', {
      move(s) {
        s.el.style.transform = `translate(${s.dx}px, ${s.dy}px) rotate(${Math.max(-6, Math.min(6, s.dx / 30))}deg)`;
        s.el.style.pointerEvents = 'none'; // so the box under the pointer is found
        const over = binAt(s);
        Array.prototype.forEach.call(ctx.root.querySelectorAll('.nb-bin'), (b) => b.classList.toggle('is-over', b === over));
      },
      drop(s, cancelled) {
        const b = cancelled ? null : binAt(s);
        if (b) { place(Number(b.getAttribute('data-v'))); } else { render(); }
      },
    });
    on(ctx, {
      bin(v) { place(Number(v)); },
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
        post(ctx, 'start_timer', {}).catch(() => {});
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
