"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SEND_EVERY_MS = exports.MAX_PER_CALL = void 0;
exports.beacon = beacon;
exports.chunks = void 0;
exports.default = useActivitySender;
var _react = require("react");
var _Dashboard = require("../components/Dashboard");
// F-117 time on task → Portal CA-12 `POST /activity` every 60 s, and a beacon when the page is hidden
// or closed. The Portal keeps at most 70 s per call, so bigger amounts go in parts.
const SEND_EVERY_MS = exports.SEND_EVERY_MS = 60000;
const MAX_PER_CALL = exports.MAX_PER_CALL = 70;
const MAX_BACKLOG = 600; // Portal down for long: keep at most 10 min to retry, drop the rest

const chunks = seconds => {
  const out = [];
  let left = Math.floor(seconds);
  while (left > 0) {
    const part = Math.min(MAX_PER_CALL, left);
    out.push(part);
    left -= part;
  }
  return out;
};

// sendBeacon cannot set headers: the body goes as text/plain JSON (a "simple" request, no preflight);
// the Portal accepts it on /activity when the Origin is the Classroom (doc 02 §7).
exports.chunks = chunks;
function beacon(url, body) {
  try {
    if (!url || typeof navigator === 'undefined' || typeof navigator.sendBeacon !== 'function') {
      return false;
    }
    return navigator.sendBeacon(url, new Blob([JSON.stringify(body)], {
      type: 'text/plain'
    }));
  } catch (e) {
    return false;
  }
}
function useActivitySender({
  client,
  courseKey,
  takeSeconds,
  giveBack,
  enabled = true,
  everyMs = SEND_EVERY_MS
}) {
  const busy = (0, _react.useRef)(false);
  const ref = (0, _react.useRef)({
    client,
    courseKey,
    takeSeconds,
    giveBack
  });
  ref.current = {
    client,
    courseKey,
    takeSeconds,
    giveBack
  };
  (0, _react.useEffect)(() => {
    if (!enabled || !courseKey) {
      return undefined;
    }
    const flush = async () => {
      const r = ref.current;
      if (busy.current || !r.client) {
        return;
      }
      const seconds = r.takeSeconds();
      if (seconds <= 0) {
        return;
      }
      busy.current = true;
      const day = (0, _Dashboard.bangkokDay)();
      const parts = chunks(seconds);
      let sent = 0;
      try {
        // eslint-disable-next-line no-restricted-syntax
        for (const part of parts) {
          // eslint-disable-next-line no-await-in-loop
          await r.client.activity({
            courseKey: r.courseKey,
            seconds: part,
            day
          });
          sent += part;
        }
      } catch (e) {
        if (r.giveBack) {
          r.giveBack(Math.min(MAX_BACKLOG, seconds - sent));
        }
      } finally {
        busy.current = false;
      }
    };
    const onHide = () => {
      const r = ref.current;
      const seconds = r.takeSeconds();
      if (seconds <= 0) {
        return;
      }
      const url = r.client?.activityUrl?.();
      const day = (0, _Dashboard.bangkokDay)();
      const parts = chunks(seconds);
      const ok = parts.every(part => beacon(url, {
        course_key: r.courseKey,
        seconds: part,
        day
      }));
      if (!ok && r.giveBack) {
        r.giveBack(seconds);
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        onHide();
      }
    };
    const timer = setInterval(flush, everyMs);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onHide);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onHide);
      onHide(); // leaving the player (route change): send what is left
    };
  }, [enabled, courseKey, everyMs]);
}