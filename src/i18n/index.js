import { useMemo } from 'react';
import { createIntl, createIntlCache, useIntl } from 'react-intl';

import messages from './messages';
import th from './th.json';

export const TIME_ZONE = 'Asia/Bangkok';
const translations = { th };
const cache = createIntlCache();
const intls = {};

export const kitLanguage = (locale = 'en') => (String(locale).toLowerCase().startsWith('th') ? 'th' : 'en');

export function getClassroomIntl(locale) {
  const lang = kitLanguage(locale);
  if (!intls[lang]) {
    intls[lang] = createIntl({
      locale: lang === 'th' ? 'th-TH' : 'en-GB',
      defaultLocale: 'en-GB',
      messages: translations[lang] || {},
      timeZone: TIME_ZONE,
      onError: () => {},
    }, cache);
  }
  return intls[lang];
}

// Kit components format with the kit's own messages, in the language the app already chose.
export function useClassroomIntl() {
  const { locale } = useIntl();
  return useMemo(() => getClassroomIntl(locale), [locale]);
}

// "12 Nov 2026" / "12 พ.ย. 2569" (Buddhist Era), always Bangkok time (doc 04 §9).
export function formatDate(value, locale, options = {}) {
  if (!value) { return ''; }
  const lang = kitLanguage(locale);
  const date = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00+07:00`) : new Date(value);
  return new Intl.DateTimeFormat(lang === 'th' ? 'th-TH-u-ca-buddhist' : 'en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: TIME_ZONE, ...options,
  }).format(date);
}

export function formatHours(value, locale) {
  const lang = kitLanguage(locale);
  return new Intl.NumberFormat(lang === 'th' ? 'th-TH' : 'en-GB', { maximumFractionDigits: 1 }).format(Number(value) || 0);
}

// "5 min ago" / "5 นาทีที่แล้ว" for messages (doc 04 §5.15).
export function timeAgo(value, locale, now = Date.now()) {
  if (!value) { return ''; }
  const seconds = Math.round((new Date(value).getTime() - now) / 1000);
  const rtf = new Intl.RelativeTimeFormat(kitLanguage(locale) === 'th' ? 'th-TH' : 'en-GB', { numeric: 'auto', style: 'short' });
  const steps = [[60, 'second'], [3600, 'minute'], [86400, 'hour'], [604800, 'day']];
  const abs = Math.abs(seconds);
  if (abs < 60) { return rtf.format(seconds, 'second'); }
  for (let i = 1; i < steps.length; i += 1) {
    if (abs < steps[i][0]) { return rtf.format(Math.round(seconds / steps[i - 1][0]), steps[i][1]); }
  }
  if (abs < 2592000) { return rtf.format(Math.round(seconds / 86400), 'day'); }
  return formatDate(value, locale);
}

// Greeting by Bangkok time: morning < 12, afternoon < 17, evening (doc 04 §5.3).
export function greetingKey(now = new Date()) {
  const hour = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: TIME_ZONE }).format(now));
  if (hour < 12) { return 'greetingMorning'; }
  if (hour < 17) { return 'greetingAfternoon'; }
  return 'greetingEvening';
}

// Portal sends {en, th}; pick the user's language, fall back to English.
export const localized = (value, locale) => {
  if (value == null || typeof value === 'string') { return value || ''; }
  return value[kitLanguage(locale)] || value.en || '';
};

export { messages, translations };
