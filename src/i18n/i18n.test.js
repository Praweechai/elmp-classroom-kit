import { parse } from '@formatjs/icu-messageformat-parser';

import {
  formatDate, formatHours, getClassroomIntl, greetingKey, kitLanguage, localized, messages, translations,
} from '.';

const BANNED = /open\s?edx|\blms\b|\bsso\b|\bmfe\b/i;

describe('i18n', () => {
  const ids = Object.values(messages).map((m) => m.id);

  it('has a Thai translation for every message and no extra keys', () => {
    expect(ids.filter((id) => !translations.th[id])).toEqual([]);
    expect(Object.keys(translations.th).filter((id) => !ids.includes(id))).toEqual([]);
  });

  it('never shows platform words to staff (F-98 AC-1, A3-6)', () => {
    const all = [...Object.values(messages).map((m) => m.defaultMessage), ...Object.values(translations.th)];
    expect(all.filter((text) => BANNED.test(text))).toEqual([]);
  });

  it('keeps every placeholder in the Thai text', () => {
    const args = (ast, out = new Set()) => {
      ast.forEach((el) => {
        if (el.value && el.type !== 0) { out.add(el.value); }
        Object.values(el.options || {}).forEach((opt) => args(opt.value, out));
      });
      return out;
    };
    const missing = Object.values(messages).flatMap(({ id, defaultMessage }) => {
      const th = args(parse(translations.th[id]));
      return [...args(parse(defaultMessage))].filter((name) => !th.has(name)).map((name) => `${id}:${name}`);
    });
    expect(missing).toEqual([]);
  });

  it('formats every message in both languages without errors', () => {
    const values = {
      name: 'Nok',
      n: 3,
      count: 2,
      earned: '24',
      target: '40',
      roadmap: 'R',
      date: 'D',
      i: 1,
      pct: 5,
      hours: '2',
      title: 'T',
      time: 't',
      year: 2026,
      code: 'C',
      course: 'K',
      q: 8,
      m: 15,
      action: 'A',
      column: 'Col',
      done: 1,
      total: 2,
      status: 'S',
    };
    ['en', 'th'].forEach((lang) => {
      const intl = getClassroomIntl(lang);
      Object.values(messages).forEach((m) => expect(() => intl.formatMessage(m, values)).not.toThrow());
    });
  });

  it('uses plurals in English', () => {
    const intl = getClassroomIntl('en');
    expect(intl.formatMessage(messages.late, { n: 1, date: '31 Oct 2026' })).toBe('Due 31 Oct 2026 · 1 day late');
    expect(intl.formatMessage(messages.due, { n: 9, date: '12 Nov 2026' })).toBe('Due 12 Nov 2026 · 9 days left');
    expect(intl.formatMessage(messages.due, { n: 0, date: '12 Nov 2026' })).toBe('Due 12 Nov 2026 · today');
  });

  it('formats dates in Bangkok time, Buddhist Era in Thai', () => {
    expect(formatDate('2026-11-12', 'en')).toBe('12 Nov 2026');
    expect(formatDate('2026-11-12', 'th')).toBe('12 พ.ย. 2569');
    // 23:59 Bangkok on 31 Oct is 16:59 UTC; must still read 31 Oct.
    expect(formatDate('2026-10-31T23:59:59+07:00', 'en-us')).toBe('31 Oct 2026');
    expect(formatDate(null, 'en')).toBe('');
  });

  it('formats hours with at most one decimal', () => {
    expect(formatHours(24, 'en')).toBe('24');
    expect(formatHours('2.5', 'th')).toBe('2.5');
  });

  it('greets by Bangkok time', () => {
    expect(greetingKey(new Date('2026-11-04T01:00:00Z'))).toBe('greetingMorning'); // 08:00
    expect(greetingKey(new Date('2026-11-04T06:30:00Z'))).toBe('greetingAfternoon'); // 13:30
    expect(greetingKey(new Date('2026-11-04T12:00:00Z'))).toBe('greetingEvening'); // 19:00
  });

  it('picks the user language from Portal {en, th} values', () => {
    expect(localized({ en: 'Nok', th: 'นก' }, 'th')).toBe('นก');
    expect(localized({ en: 'Nok' }, 'th')).toBe('Nok');
    expect(localized('plain', 'th')).toBe('plain');
    expect(kitLanguage('th-th')).toBe('th');
    expect(kitLanguage(undefined)).toBe('en');
  });
});
