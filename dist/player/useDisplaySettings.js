"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TEXT_SCALE = exports.DISPLAY_MESSAGE = exports.DISPLAY_KEY = exports.DEFAULT_DISPLAY = void 0;
exports.default = useDisplaySettings;
exports.sanitizeDisplay = exports.postDisplay = exports.isDefaultDisplay = exports.displayMessage = exports.displayAttributes = void 0;
var _react = require("react");
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, e) { if ("object" != typeof t || !t) return t; var r; if ("undefined" != typeof Symbol && void 0 !== (r = t[Symbol.toPrimitive])) { var i = r.call(t, e || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === e ? String : Number)(t); }
// Player 3 display settings (F-136, D-81): dark mode + accessibility panel. Kept in localStorage, shown on the
// player chrome through data- attributes, and sent to the lesson iframe as `{type: 'elmp.display', ...}` (P5-3.02):
// the Plan 4 activity script copies them onto the lesson <html>, where only elmp-lesson.css and the content kit
// read them. Nothing here is personal data.

const DISPLAY_KEY = exports.DISPLAY_KEY = 'elmp.display';
const DISPLAY_MESSAGE = exports.DISPLAY_MESSAGE = 'elmp.display';
const TEXT_SCALE = exports.TEXT_SCALE = {
  min: 80,
  max: 160,
  step: 10
};
const DEFAULT_DISPLAY = exports.DEFAULT_DISPLAY = Object.freeze({
  theme: 'light',
  textScale: 100,
  contrast: false,
  spacing: false,
  reduceMotion: false
});
const sanitizeDisplay = (value = {}) => {
  const scale = Math.round(Number(value.textScale) / TEXT_SCALE.step) * TEXT_SCALE.step;
  return {
    theme: value.theme === 'dark' ? 'dark' : 'light',
    textScale: Number.isFinite(scale) ? Math.min(TEXT_SCALE.max, Math.max(TEXT_SCALE.min, scale)) : 100,
    contrast: value.contrast === true,
    spacing: value.spacing === true,
    reduceMotion: value.reduceMotion === true
  };
};
exports.sanitizeDisplay = sanitizeDisplay;
const read = () => {
  try {
    return sanitizeDisplay(_objectSpread(_objectSpread({}, DEFAULT_DISPLAY), JSON.parse(window.localStorage.getItem(DISPLAY_KEY) || '{}')));
  } catch (e) {
    return _objectSpread({}, DEFAULT_DISPLAY);
  }
};
const isDefaultDisplay = s => Object.keys(DEFAULT_DISPLAY).every(k => s[k] === DEFAULT_DISPLAY[k]);
exports.isDefaultDisplay = isDefaultDisplay;
const displayMessage = settings => _objectSpread({
  type: DISPLAY_MESSAGE
}, sanitizeDisplay(settings));

// Send the settings to a lesson frame. `targetOrigin` = the lesson origin (the LMS); never contains secrets.
exports.displayMessage = displayMessage;
const postDisplay = (frameWindow, settings, targetOrigin = '*') => {
  try {
    frameWindow?.postMessage(displayMessage(settings), targetOrigin);
  } catch (e) {/* frame gone */}
};

// Attributes for the player root: CSS reads them (shell colours, text size, spacing, motion).
exports.postDisplay = postDisplay;
const displayAttributes = s => ({
  'data-theme': s.theme,
  'data-contrast': s.contrast ? 'high' : undefined,
  'data-spacing': s.spacing ? 'wide' : undefined,
  'data-motion': s.reduceMotion ? 'reduce' : undefined,
  style: {
    '--cls3-text-scale': s.textScale / 100
  }
});
exports.displayAttributes = displayAttributes;
function useDisplaySettings(initial) {
  const [settings, setSettings] = (0, _react.useState)(() => initial ? sanitizeDisplay(initial) : read());
  (0, _react.useEffect)(() => {
    try {
      window.localStorage.setItem(DISPLAY_KEY, JSON.stringify(settings));
    } catch (e) {/* private mode */}
  }, [settings]);
  const update = (0, _react.useCallback)(patch => setSettings(s => sanitizeDisplay(_objectSpread(_objectSpread({}, s), patch))), []);
  const reset = (0, _react.useCallback)(() => setSettings(_objectSpread({}, DEFAULT_DISPLAY)), []);
  return {
    settings,
    update,
    reset
  };
}