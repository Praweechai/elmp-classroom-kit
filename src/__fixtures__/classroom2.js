// Plan 5 Part 2 APIs (CA-13…CA-16), fake data in the exact shapes of Portal doc plan-5/02-technical.md §5.
// Same envelope as Classroom API v1: { data, meta }. Text the learner reads is { en, th }.
// Persona: Nok (ICU nurse). Hospital demo courses. No real people.

const t = (en, th) => ({ en, th });
const generated = { generated_at: '2026-11-10T08:00:00+07:00' };

// CA-13 GET /classroom/api/v1/achievements — always all four (D-84); not earned yet = earned_at null.
export const achievements = {
  data: [
    {
      code: 'first_steps',
      title: t('First Steps', 'ก้าวแรก'),
      text: t('Completed your first module', 'เรียนจบโมดูลแรก'),
      earned_at: '2026-10-04T09:12:00+07:00',
      progress: null,
      course: { course_key: 'course-v1:MHB+REG101+2026', code: 'REG101', title: t('Hospital Regulations', 'ระเบียบโรงพยาบาล') },
    },
    {
      code: 'quiz_streak',
      title: t('Quiz Streak', 'ผ่านแบบทดสอบต่อเนื่อง'),
      text: t('Passed 5 quizzes in a row', 'ผ่านแบบทดสอบ 5 ครั้งติดต่อกัน'),
      earned_at: '2026-10-19T14:40:00+07:00',
      progress: null,
      course: null,
    },
    {
      code: 'course_complete',
      title: t('Course Complete', 'เรียนจบหลักสูตร'),
      text: t('Finished Hospital Regulations', 'เรียนจบ ระเบียบโรงพยาบาล'),
      earned_at: '2026-10-27T16:05:00+07:00',
      progress: null,
      course: { course_key: 'course-v1:MHB+REG101+2026', code: 'REG101', title: t('Hospital Regulations', 'ระเบียบโรงพยาบาล') },
    },
    {
      code: 'night_owl',
      title: t('Night Owl', 'นกฮูกกลางคืน'),
      text: t('Studied after 10 PM three times', 'เรียนหลัง 4 ทุ่ม 3 ครั้ง'),
      earned_at: null,
      progress: [2, 3],
      course: null,
    },
  ],
  meta: generated,
};

// CA-14 GET /classroom/api/v1/announcement — one active HR banner, or data: null (banner hidden).
export const announcement = {
  data: {
    id: 12,
    tone: 'info', // info | urgent
    text: t(
      'Annual Infection Control training is due by 30 November. Finish INF101 to keep your CE hours.',
      'การอบรมควบคุมการติดเชื้อประจำปีต้องเสร็จภายใน 30 พฤศจิกายน เรียน INF101 ให้จบเพื่อรักษาชั่วโมง CE',
    ),
    link: { href: '/course/course-v1:MHB+INF101+2026', label: t('Open INF101', 'เปิด INF101') },
    starts_at: '2026-11-01T00:00:00+07:00',
    ends_at: '2026-11-30T23:59:59+07:00',
  },
  meta: generated,
};
export const noAnnouncement = { data: null, meta: generated };

// CA-15 GET /classroom/api/v1/catalogue?q=&category=&page=&per_page= — courses the learner may see.
// Search suggestions = same call with q and per_page=5.
const cat = {
  infection: { key: 'infection', ...t('Infection control', 'ควบคุมการติดเชื้อ') },
  safety: { key: 'safety', ...t('Patient safety', 'ความปลอดภัยของผู้ป่วย') },
  compliance: { key: 'compliance', ...t('Compliance', 'ระเบียบและกฎหมาย') },
  emergency: { key: 'emergency', ...t('Emergency', 'ภาวะฉุกเฉิน') },
};
const entry = (code, title, category, extra = {}) => ({
  course_key: `course-v1:MHB+${code}+2026`,
  code,
  title,
  description: t(`${title.en} for hospital staff.`, `${title.th} สำหรับบุคลากรโรงพยาบาล`),
  category,
  level: 'basic', // basic | intermediate | advanced
  hours: 1.5,
  units_total: 7,
  cover_url: null, // null → gradient from colour (D-83)
  colour: '#03692A',
  required: false,
  enrolled: true,
  learner_status: 'not_started', // not_started | in_progress | almost | completed | overdue
  progress_pct: 0,
  due_at: null,
  last_activity_at: null,
  href: `/course/course-v1:MHB+${code}+2026/home`,
  ...extra,
});

export const catalogue = {
  data: [
    entry('INF101', t('Infection Control & Hand Hygiene', 'การควบคุมการติดเชื้อและสุขอนามัยของมือ'), cat.infection, {
      hours: 2, colour: '#1F8A4C', required: true, learner_status: 'almost', progress_pct: 71, due_at: '2026-11-20T23:59:59+07:00', last_activity_at: '2026-11-09T21:30:00+07:00',
    }),
    entry('PSB101', t('Patient Safety Basics', 'พื้นฐานความปลอดภัยของผู้ป่วย'), cat.safety, {
      hours: 2, colour: '#C2410C', required: true, learner_status: 'overdue', progress_pct: 14, due_at: '2026-11-05T23:59:59+07:00', last_activity_at: '2026-11-05T10:00:00+07:00',
    }),
    entry('REG101', t('Hospital Regulations', 'ระเบียบโรงพยาบาล'), cat.compliance, {
      colour: '#1D4ED8', required: true, learner_status: 'completed', progress_pct: 100, last_activity_at: '2026-10-27T16:05:00+07:00',
    }),
    entry('FIRE101', t('Fire Safety & Evacuation', 'ความปลอดภัยจากอัคคีภัยและการอพยพ'), cat.emergency, {
      hours: 1, units_total: 5, colour: '#B91C1C', enrolled: false, level: 'intermediate',
    }),
  ],
  meta: {
    ...generated,
    total: 4,
    page: 1,
    per_page: 20,
    categories: [
      { ...cat.infection, count: 1 },
      { ...cat.safety, count: 1 },
      { ...cat.compliance, count: 1 },
      { ...cat.emergency, count: 1 },
    ],
  },
};

// CA-16 GET /classroom/api/v1/grades — Grades + Progress pages (S-102, S-103).
const part = (blockId, name, kind, score, max, extra = {}) => ({
  block_id: blockId,
  name,
  kind,
  score,
  max,
  attempts: score === null ? 0 : 1,
  passed: score === null ? null : score / max >= 0.6,
  submitted_at: null,
  ...extra,
});
export const grades = {
  data: {
    summary: {
      courses_graded: 3,
      average_pct: 91,
      quizzes_passed: [12, 20],
      minutes_week: 95,
      days_active_month: 9,
    },
    // last 8 weeks, oldest first (Progress "hours per week" bars)
    weekly_minutes: [
      { week_start: '2026-09-21', minutes: 40 },
      { week_start: '2026-09-28', minutes: 0 },
      { week_start: '2026-10-05', minutes: 75 },
      { week_start: '2026-10-12', minutes: 60 },
      { week_start: '2026-10-19', minutes: 120 },
      { week_start: '2026-10-26', minutes: 90 },
      { week_start: '2026-11-02', minutes: 30 },
      { week_start: '2026-11-09', minutes: 95 },
    ],
    courses: [
      {
        course_key: 'course-v1:MHB+INF101+2026',
        code: 'INF101',
        title: t('Infection Control & Hand Hygiene', 'การควบคุมการติดเชื้อและสุขอนามัยของมือ'),
        grade_pct: 93,
        passed: null, // null = course not finished yet
        parts: [
          part('b-inf-1', t('Video check 1', 'คำถามระหว่างวิดีโอ 1'), 'quiz', 1, 1),
          part('b-inf-2', t('5 moments quiz', 'แบบทดสอบ 5 จังหวะ'), 'quiz', 5, 5, { attempts: 2 }),
          part('b-inf-3', t('Final quiz', 'แบบทดสอบท้ายบท'), 'exam', null, 10),
        ],
      },
      {
        course_key: 'course-v1:MHB+REG101+2026',
        code: 'REG101',
        title: t('Hospital Regulations', 'ระเบียบโรงพยาบาล'),
        grade_pct: 87,
        passed: true,
        parts: [
          part('b-reg-1', t('Rules quiz', 'แบบทดสอบระเบียบ'), 'quiz', 4, 5),
          part('b-reg-2', t('Final quiz', 'แบบทดสอบท้ายบท'), 'exam', 9, 10, { submitted_at: '2026-10-27T15:50:00+07:00' }),
        ],
      },
    ],
  },
  meta: generated,
};
