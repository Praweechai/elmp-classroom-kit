"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TIME_ZONE = void 0;
exports.formatDate = formatDate;
exports.formatHours = formatHours;
exports.getClassroomIntl = getClassroomIntl;
exports.greetingKey = greetingKey;
exports.localized = exports.kitLanguage = void 0;
Object.defineProperty(exports, "messages", {
  enumerable: true,
  get: function () {
    return _messages.default;
  }
});
exports.timeAgo = timeAgo;
exports.translations = void 0;
exports.useClassroomIntl = useClassroomIntl;
var _react = require("react");
var _reactIntl = require("react-intl");
var _messages = _interopRequireDefault(require("./messages"));
var _th = _interopRequireDefault(require("./th.json"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, e) { if ("object" != typeof t || !t) return t; var r; if ("undefined" != typeof Symbol && void 0 !== (r = t[Symbol.toPrimitive])) { var i = r.call(t, e || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === e ? String : Number)(t); }
const TIME_ZONE = exports.TIME_ZONE = 'Asia/Bangkok';
const translations = exports.translations = {
  th: _th.default
};
const cache = (0, _reactIntl.createIntlCache)();
const intls = {};
const kitLanguage = (locale = 'en') => String(locale).toLowerCase().startsWith('th') ? 'th' : 'en';
exports.kitLanguage = kitLanguage;
function getClassroomIntl(locale) {
  const lang = kitLanguage(locale);
  if (!intls[lang]) {
    intls[lang] = (0, _reactIntl.createIntl)({
      locale: lang === 'th' ? 'th-TH' : 'en-GB',
      defaultLocale: 'en-GB',
      messages: translations[lang] || {},
      timeZone: TIME_ZONE,
      onError: () => {}
    }, cache);
  }
  return intls[lang];
}

// Kit components format with the kit's own messages, in the language the app already chose.
function useClassroomIntl() {
  const {
    locale
  } = (0, _reactIntl.useIntl)();
  return (0, _react.useMemo)(() => getClassroomIntl(locale), [locale]);
}

// "12 Nov 2026" / "12 พ.ย. 2569" (Buddhist Era), always Bangkok time (doc 04 §9).
function formatDate(value, locale, options = {}) {
  if (!value) {
    return '';
  }
  const lang = kitLanguage(locale);
  const date = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00+07:00`) : new Date(value);
  return new Intl.DateTimeFormat(lang === 'th' ? 'th-TH-u-ca-buddhist' : 'en-GB', _objectSpread({
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: TIME_ZONE
  }, options)).format(date);
}
function formatHours(value, locale) {
  const lang = kitLanguage(locale);
  return new Intl.NumberFormat(lang === 'th' ? 'th-TH' : 'en-GB', {
    maximumFractionDigits: 1
  }).format(Number(value) || 0);
}

// "5 min ago" / "5 นาทีที่แล้ว" for messages (doc 04 §5.15).
function timeAgo(value, locale, now = Date.now()) {
  if (!value) {
    return '';
  }
  const seconds = Math.round((new Date(value).getTime() - now) / 1000);
  const rtf = new Intl.RelativeTimeFormat(kitLanguage(locale) === 'th' ? 'th-TH' : 'en-GB', {
    numeric: 'auto',
    style: 'short'
  });
  const steps = [[60, 'second'], [3600, 'minute'], [86400, 'hour'], [604800, 'day']];
  const abs = Math.abs(seconds);
  if (abs < 60) {
    return rtf.format(seconds, 'second');
  }
  for (let i = 1; i < steps.length; i += 1) {
    if (abs < steps[i][0]) {
      return rtf.format(Math.round(seconds / steps[i - 1][0]), steps[i][1]);
    }
  }
  if (abs < 2592000) {
    return rtf.format(Math.round(seconds / 86400), 'day');
  }
  return formatDate(value, locale);
}

// Greeting by Bangkok time: morning < 12, afternoon < 17, evening (doc 04 §5.3).
function greetingKey(now = new Date()) {
  const hour = Number(new Intl.DateTimeFormat('en-GB', {
    hour: 'numeric',
    hourCycle: 'h23',
    timeZone: TIME_ZONE
  }).format(now));
  if (hour < 12) {
    return 'greetingMorning';
  }
  if (hour < 17) {
    return 'greetingAfternoon';
  }
  return 'greetingEvening';
}

// Portal sends {en, th}; pick the user's language, fall back to English.
const localized = (value, locale) => {
  if (value == null || typeof value === 'string') {
    return value || '';
  }
  return value[kitLanguage(locale)] || value.en || '';
};
exports.localized = localized;