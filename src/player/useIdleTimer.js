import {
  useCallback, useEffect, useRef, useState,
} from 'react';

// F-117 inactivity timer (doc 02 §7). Activity = the player page's own input events + "elmp.activity"
// messages from lesson pages (activity bridge). A playing video always counts as activity.
// States: active → warning (modal with countdown) → paused (time stops until the learner continues).
// Active seconds are counted only while the page is visible and the state is "active".

export const PAGE_EVENTS = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'];
const VIDEO_STALE_MS = 35000; // the bridge sends a "video-playing" beat every 15 s; two missed beats = stopped
const MAX_TICK_GAP_S = 5; // a throttled background tab must not add minutes at once

export const isBridgeMessage = (event, origins = []) => Boolean(
  event?.data && event.data.type === 'elmp.activity' && origins.includes(event.origin),
);

export default function useIdleTimer({
  idleSeconds = 300, warnSeconds = 60, enabled = true, bridgeOrigins = [], onPause,
} = {}) {
  const [state, setState] = useState('active');
  const [secondsLeft, setSecondsLeft] = useState(warnSeconds);
  const stateRef = useRef('active');
  const lastActivity = useRef(Date.now());
  const lastTick = useRef(Date.now());
  const videoAt = useRef(0); // time of the last "video-playing" message (0 = no video playing)
  const warnAt = useRef(0);
  const active = useRef(0); // seconds, not yet taken by the sender
  const pauseRef = useRef(onPause);
  pauseRef.current = onPause;
  const originsKey = bridgeOrigins.join('|');

  const go = useCallback((next) => { stateRef.current = next; setState(next); }, []);

  // Any sign of life: back to "active" from the warning; the paused state needs the button (resume).
  const activity = useCallback(() => {
    lastActivity.current = Date.now();
    if (stateRef.current === 'warning') { go('active'); }
  }, [go]);

  const resume = useCallback(() => {
    lastActivity.current = Date.now();
    lastTick.current = Date.now();
    go('active');
  }, [go]);

  const takeSeconds = useCallback(() => {
    const whole = Math.floor(active.current);
    active.current -= whole;
    return whole;
  }, []);

  const giveBack = useCallback((seconds) => { active.current += Math.max(0, seconds); }, []);

  useEffect(() => {
    if (!enabled) { return undefined; }
    const onPage = () => activity();
    PAGE_EVENTS.forEach((name) => window.addEventListener(name, onPage, { passive: true, capture: true }));
    const origins = originsKey ? originsKey.split('|') : [];
    const onMessage = (event) => {
      if (!isBridgeMessage(event, origins)) { return; }
      if (event.data.kind === 'video-playing') { videoAt.current = Date.now(); }
      if (event.data.kind === 'video-paused') { videoAt.current = 0; }
      activity();
    };
    window.addEventListener('message', onMessage);
    return () => {
      PAGE_EVENTS.forEach((name) => window.removeEventListener(name, onPage, { capture: true }));
      window.removeEventListener('message', onMessage);
    };
  }, [enabled, activity, originsKey]);

  useEffect(() => {
    if (!enabled) { return undefined; }
    lastTick.current = Date.now();
    const timer = setInterval(() => {
      const now = Date.now();
      const gap = Math.min(MAX_TICK_GAP_S, Math.max(0, (now - lastTick.current) / 1000));
      lastTick.current = now;
      const visible = typeof document === 'undefined' || document.visibilityState !== 'hidden';
      const playing = videoAt.current > 0 && now - videoAt.current < VIDEO_STALE_MS;
      if (stateRef.current === 'active') {
        if (playing) { lastActivity.current = now; }
        if (visible) { active.current += gap; }
        if (now - lastActivity.current >= idleSeconds * 1000) {
          warnAt.current = now;
          setSecondsLeft(warnSeconds);
          go('warning');
        }
      } else if (stateRef.current === 'warning') {
        const left = Math.max(0, Math.ceil(warnSeconds - (now - warnAt.current) / 1000));
        setSecondsLeft(left);
        if (left <= 0) {
          videoAt.current = 0;
          go('paused');
          if (pauseRef.current) { pauseRef.current(); }
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [enabled, idleSeconds, warnSeconds, go]);

  return {
    state: enabled ? state : 'active', secondsLeft, resume, activity, takeSeconds, giveBack,
  };
}
