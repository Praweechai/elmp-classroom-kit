// Guards the CA-13…CA-16 fixture shapes (Portal doc plan-5/02-technical.md §5).
// If a contract changes, change the doc, the fixture and this test together.
import {
  achievements, announcement, noAnnouncement, catalogue, grades,
} from './classroom2';

const isText = (v) => v && typeof v.en === 'string' && typeof v.th === 'string';
const isDate = (v) => typeof v === 'string' && !Number.isNaN(Date.parse(v));

describe('Plan 5 contracts', () => {
  test('CA-13 achievements: the four D-84 codes, earned or with progress', () => {
    expect(achievements.data.map((a) => a.code)).toEqual(['first_steps', 'quiz_streak', 'course_complete', 'night_owl']);
    achievements.data.forEach((a) => {
      expect(isText(a.title) && isText(a.text)).toBe(true);
      if (a.earned_at === null) {
        expect(a.progress).toHaveLength(2);
      } else {
        expect(isDate(a.earned_at)).toBe(true);
      }
    });
  });

  test('CA-14 announcement: one banner or null', () => {
    const a = announcement.data;
    expect(['info', 'urgent']).toContain(a.tone);
    expect(isText(a.text)).toBe(true);
    expect(isText(a.link.label)).toBe(true);
    expect(isDate(a.starts_at) && isDate(a.ends_at)).toBe(true);
    expect(noAnnouncement.data).toBeNull();
  });

  test('CA-15 catalogue: course meta + learner status + category counts', () => {
    const statuses = ['not_started', 'in_progress', 'almost', 'completed', 'overdue'];
    catalogue.data.forEach((c) => {
      expect(c.course_key).toMatch(/^course-v1:/);
      expect(isText(c.title) && isText(c.description)).toBe(true);
      expect(isText(c.category)).toBe(true);
      expect(['basic', 'intermediate', 'advanced']).toContain(c.level);
      expect(statuses).toContain(c.learner_status);
      expect(c.progress_pct).toBeGreaterThanOrEqual(0);
      expect(c.progress_pct).toBeLessThanOrEqual(100);
      expect(c.cover_url === null || typeof c.cover_url === 'string').toBe(true);
      expect(c.colour).toMatch(/^#[0-9A-F]{6}$/i);
    });
    const counted = catalogue.meta.categories.reduce((n, c) => n + c.count, 0);
    expect(counted).toBe(catalogue.meta.total);
  });

  test('CA-16 grades: summary, 8 weeks, parts with score/max', () => {
    const { summary, weekly_minutes: weeks, courses } = grades.data;
    expect(summary.quizzes_passed).toHaveLength(2);
    expect(weeks).toHaveLength(8);
    weeks.forEach((w) => expect(isDate(w.week_start)).toBe(true));
    courses.forEach((c) => {
      expect(isText(c.title)).toBe(true);
      c.parts.forEach((p) => {
        expect(isText(p.name)).toBe(true);
        expect(['quiz', 'activity', 'exam']).toContain(p.kind);
        expect(p.max).toBeGreaterThan(0);
        if (p.score === null) { expect(p.passed).toBeNull(); }
      });
    });
  });
});
