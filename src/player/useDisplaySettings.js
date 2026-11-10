import { useCallback, useEffect, useState } from 'react';

// Player 3 display settings (F-136, D-81): dark mode + accessibility panel. Kept in localStorage, shown on the
// player chrome through data- attributes, and sent to the lesson iframe as `{type: 'elmp.display', ...}` (P5-3.02):
// the Plan 4 activity script copies them onto the lesson <html>, where only elmp-lesson.css and the content kit
// read them. Nothing here is personal data.

export const DISPLAY_KEY = 'elmp.display';
export const DISPLAY_MESSAGE = 'elmp.display';
export const TEXT_SCALE = { min: 80, max: 160, step: 10 };
export const DEFAULT_DISPLAY = Object.freeze({
  theme: 'light', textScale: 100, contrast: false, spacing: false, reduceMotion: false,
});

export const sanitizeDisplay = (value = {}) => {
  const scale = Math.round(Number(value.textScale) / TEXT_SCALE.step) * TEXT_SCALE.step;
  return {
    theme: value.theme === 'dark' ? 'dark' : 'light',
    textScale: Number.isFinite(scale) ? Math.min(TEXT_SCALE.max, Math.max(TEXT_SCALE.min, scale)) : 100,
    contrast: value.contrast === true,
    spacing: value.spacing === true,
    reduceMotion: value.reduceMotion === true,
  };
};

const read = () => {
  try {
    return sanitizeDisplay({ ...DEFAULT_DISPLAY, ...JSON.parse(window.localStorage.getItem(DISPLAY_KEY) || '{}') });
  } catch (e) {
    return { ...DEFAULT_DISPLAY };
  }
};

export const isDefaultDisplay = (s) => Object.keys(DEFAULT_DISPLAY).every((k) => s[k] === DEFAULT_DISPLAY[k]);

export const displayMessage = (settings) => ({ type: DISPLAY_MESSAGE, ...sanitizeDisplay(settings) });

// Send the settings to a lesson frame. `targetOrigin` = the lesson origin (the LMS); never contains secrets.
export const postDisplay = (frameWindow, settings, targetOrigin = '*') => {
  try { frameWindow?.postMessage(displayMessage(settings), targetOrigin); } catch (e) { /* frame gone */ }
};

// Attributes for the player root: CSS reads them (shell colours, text size, spacing, motion).
export const displayAttributes = (s) => ({
  'data-theme': s.theme,
  'data-contrast': s.contrast ? 'high' : undefined,
  'data-spacing': s.spacing ? 'wide' : undefined,
  'data-motion': s.reduceMotion ? 'reduce' : undefined,
  style: { '--cls3-text-scale': s.textScale / 100 },
});

export default function useDisplaySettings(initial) {
  const [settings, setSettings] = useState(() => (initial ? sanitizeDisplay(initial) : read()));
  useEffect(() => {
    try { window.localStorage.setItem(DISPLAY_KEY, JSON.stringify(settings)); } catch (e) { /* private mode */ }
  }, [settings]);
  const update = useCallback((patch) => setSettings((s) => sanitizeDisplay({ ...s, ...patch })), []);
  const reset = useCallback(() => setSettings({ ...DEFAULT_DISPLAY }), []);
  return { settings, update, reset };
}
