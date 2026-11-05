// Fake data in the exact Classroom API v1 shapes (doc 05). Personas from Plan 3 doc 01 §3. No real people.

export const me = {
  data: {
    id: '01JC8Z5W7Q6M3E4R2T1Y0U9I8O',
    name: { en: 'Nok Srisuk', th: 'นก ศรีสุข' },
    first_name: { en: 'Nok', th: 'นก' },
    position: { en: 'Registered Nurse', th: 'พยาบาลวิชาชีพ' },
    department: { en: 'ICU', th: 'ไอซียู' },
    locale: 'en',
    photo_url: null,
    ce_target_hours: 40.0,
    unread_notifications: 3,
    has_portal_work: false,
    account_url: 'http://portal.local.openedx.io/profile',
  },
  meta: { generated_at: '2026-11-03T08:41:02+07:00' },
};

const course = (key, en, th, extra = {}) => ({
  course_key: `course-v1:MHB+${key}+2026`,
  title: { en, th },
  required: true,
  status: 'not_started',
  grade_percent: null,
  ce_hours: 2.0,
  enrolled: true,
  passed_at: null,
  ...extra,
});

export const overdueAssignment = {
  id: 41,
  roadmap: { id: 7, title: { en: 'Annual Infection Control 2026', th: 'ควบคุมการติดเชื้อประจำปี 2569' } },
  status: 'overdue',
  due_at: '2026-10-31T23:59:59+07:00',
  days_left: -3,
  progress_percent: 50,
  completed_at: null,
  certificate: null,
  courses: [
    course('HH101', 'Hand Hygiene Basics', 'สุขอนามัยของมือ', { status: 'passed', grade_percent: 96, passed_at: '2026-10-18T10:12:00+07:00' }),
    course('INF101', 'Isolation Precautions', 'การป้องกันการแพร่กระจายเชื้อ', { status: 'in_progress', grade_percent: 41, ce_hours: 3.0 }),
  ],
};

export const dueSoonAssignment = {
  id: 42,
  roadmap: { id: 8, title: { en: 'Patient Safety 2026', th: 'ความปลอดภัยของผู้ป่วย 2569' } },
  status: 'due_soon',
  due_at: '2026-11-12T23:59:59+07:00',
  days_left: 9,
  progress_percent: 0,
  completed_at: null,
  certificate: null,
  courses: [
    course('PSB101', 'Patient Safety Basics', 'พื้นฐานความปลอดภัยของผู้ป่วย'),
    course('FIRE101', 'Fire Safety on the Ward', 'ความปลอดภัยจากอัคคีภัยในหอผู้ป่วย', { enrolled: false }),
  ],
};

export const completedAssignment = {
  id: 43,
  roadmap: { id: 9, title: { en: 'Records & PDPA 2026', th: 'เวชระเบียนและ PDPA 2569' } },
  status: 'completed',
  due_at: '2026-11-30T23:59:59+07:00',
  days_left: 27,
  progress_percent: 100,
  completed_at: '2026-11-02T14:00:00+07:00',
  certificate: { code: 'ELMP-2026-7KQ4-9XTD', issued_at: '2026-11-02T14:00:00+07:00', revoked_at: null },
  courses: [
    course('REG101', 'Medical Records and PDPA', 'เวชระเบียนและ PDPA', { status: 'passed', grade_percent: 88, passed_at: '2026-11-02T10:00:00+07:00' }),
  ],
};

export const training = {
  data: {
    summary: {
      overdue: 1, due_soon: 1, due_this_month: 1, completed: 1, ce_hours: 24.0, ce_target_hours: 40.0,
    },
    continue: { course_key: 'course-v1:MHB+INF101+2026', assignment_id: 41 },
    assignments: [overdueAssignment, dueSoonAssignment, completedAssignment],
  },
  meta: { generated_at: '2026-11-03T08:41:02+07:00', synced_at: '2026-11-03T08:35:10+07:00' },
};

export const hours = {
  data: {
    year: 2026,
    earned: 24.0,
    target: 40.0,
    remaining: 16.0,
    year_ends: '2026-12-31',
    items: [
      {
        course_key: 'course-v1:MHB+REG101+2026', title: { en: 'Medical Records and PDPA', th: 'เวชระเบียนและ PDPA' }, passed_on: '2026-11-02', hours: 2.0,
      },
    ],
    years_available: [2025, 2026],
  },
};

export const roadmapCertificate = {
  kind: 'roadmap', code: 'ELMP-2026-7KQ4-9XTD', title: { en: 'Records & PDPA 2026', th: 'เวชระเบียนและ PDPA 2569' }, issued_at: '2026-11-02T14:00:00+07:00', revoked_at: null,
};

export const courseCertificate = {
  kind: 'course',
  course_key: 'course-v1:MHB+HH101+2026',
  title: { en: 'Hand Hygiene Basics', th: 'สุขอนามัยของมือ' },
  issued_at: '2026-10-18T10:12:00+07:00',
  url: 'http://local.openedx.io/certificates/abc',
  grade_percent: 96,
};

export const revokedCertificate = {
  ...roadmapCertificate, code: 'ELMP-2025-AB12-CD34', title: { en: 'Fire Safety 2025', th: 'ความปลอดภัยจากอัคคีภัย 2568' }, revoked_at: '2026-01-15T09:00:00+07:00',
};

export const certificates = { data: [roadmapCertificate, courseCertificate, revokedCertificate] };

// Course outline (S-75 / S-76 drawer): sections → items, as the learning fork maps the course blocks.
export const outline = [
  {
    id: 's1',
    title: '1. Why hand hygiene matters',
    items: [
      {
        id: 'q1', title: 'Video: The 5 moments', href: '#q1', complete: true, minutes: 6,
      },
      {
        id: 'q2', title: 'Reading: WHO guideline summary', href: '#q2', complete: true, minutes: 8,
      },
    ],
  },
  {
    id: 's2',
    title: '2. Isolation precautions',
    items: [
      {
        id: 'q3', title: 'Video: Standard precautions', href: '#q3', complete: true, minutes: 5,
      },
      {
        id: 'q4', title: 'Video: Contact precautions', href: '#q4', current: true, minutes: 7,
      },
      {
        id: 'q5', title: 'Quiz: Choose the right PPE', href: '#q5', minutes: 10,
      },
    ],
  },
  {
    id: 's3',
    title: '3. Cleaning and waste',
    items: [
      {
        id: 'q6', title: 'Reading: Spill kit steps', href: '#q6', minutes: 6,
      },
      {
        id: 'q7', title: 'Final quiz', locked: true, minutes: 12,
      },
    ],
  },
];

// Plan 4 CA-11 `GET /dashboard` (doc 02 §6), as the dashboard fork passes it to DashboardView
// (hrefs added by the fork).
export const dashboard = {
  data: {
    banner: { kind: 'overdue', n: 1, course: { en: 'Patient Safety Basics', th: 'พื้นฐานความปลอดภัยของผู้ป่วย' } },
    gauge: { required_done_on_time_pct: 50, label: 'needs_attention' },
    required_title: { en: 'New-hire Onboarding 2026', th: 'ปฐมนิเทศพนักงานใหม่ 2569' },
    rings: {
      enrolled: 3, completed: 1, hours_learned: 1.4, required_done: [1, 2], quizzes_passed: [12, 20], certificates: 1,
    },
    deadlines: [
      {
        assignment_id: 6,
        course_key: 'course-v1:MHB+PSB101+2026',
        code: 'PSB101',
        category: 'safety',
        title: { en: 'Patient Safety Basics', th: 'พื้นฐานความปลอดภัยของผู้ป่วย' },
        roadmap: { en: 'New-hire Onboarding', th: 'ปฐมนิเทศพนักงานใหม่' },
        due_at: '2026-10-10T23:59:59+07:00',
        days_left: -27,
        action: 'continue',
        href: '#psb101',
      },
      {
        assignment_id: 7,
        course_key: 'course-v1:MHB+REG101+2026',
        code: 'REG101',
        category: 'compliance',
        title: { en: 'Hospital Regulations', th: 'ระเบียบโรงพยาบาล' },
        roadmap: { en: 'ICU Annual Compliance', th: 'มาตรฐานประจำปีไอซียู' },
        due_at: '2026-11-12T23:59:59+07:00',
        days_left: 6,
        action: 'start',
        href: '#reg101',
      },
    ],
    streak: {
      days: [true, true, false, true, true, true, false], current: 3, best: 6,
    },
    courses: [
      {
        course_key: 'course-v1:MHB+INF101+2026', code: 'INF101', category: 'clinical', title: { en: 'Infection Control & Hand Hygiene', th: 'การควบคุมการติดเชื้อและสุขอนามัยของมือ' }, units_done: 5, units_total: 7, score_pct: 100, status: 'almost', required: true, href: '#inf101',
      },
      {
        course_key: 'course-v1:MHB+PSB101+2026', code: 'PSB101', category: 'safety', title: { en: 'Patient Safety Basics', th: 'พื้นฐานความปลอดภัยของผู้ป่วย' }, units_done: 1, units_total: 7, score_pct: null, status: 'overdue', required: true, href: '#psb101',
      },
      {
        course_key: 'course-v1:MHB+REG101+2026', code: 'REG101', category: 'compliance', title: { en: 'Hospital Regulations', th: 'ระเบียบโรงพยาบาล' }, units_done: 7, units_total: 7, score_pct: 90, status: 'completed', required: false, href: '#reg101',
      },
      {
        course_key: 'course-v1:MHB+FIRE101+2026', code: 'FIRE101', category: 'general', title: { en: 'Fire Safety on the Ward', th: 'ความปลอดภัยจากอัคคีภัยในหอผู้ป่วย' }, units_done: 0, units_total: 5, score_pct: null, status: 'not_started', required: false, href: '#fire101',
      },
    ],
    next_quizzes: [
      {
        course_key: 'course-v1:MHB+PSB101+2026', block_id: 'b1', code: 'PSB101', title: { en: 'Final quiz', th: 'แบบทดสอบท้ายบท' }, questions: 8, minutes: 15, href: '#q1',
      },
      {
        course_key: 'course-v1:MHB+PSB101+2026', block_id: 'b2', code: 'PSB101', title: { en: 'Video check', th: 'คำถามระหว่างวิดีโอ' }, questions: 2, minutes: 4, href: '#q2',
      },
    ],
    latest_certificate: {
      kind: 'course', code: 'ELMP-2026-Q563-7KQ4', title: { en: 'Hospital Regulations', th: 'ระเบียบโรงพยาบาล' }, issued_at: '2026-11-03T10:00:00+07:00', revoked_at: null,
    },
  },
  meta: { generated_at: '2026-11-06T08:00:00+07:00' },
};

// CA-04 course context (doc 05).
export const courseContext = {
  course_key: 'course-v1:MHB+INF101+2026',
  ce_hours: 3.0,
  required_by: [{
    assignment_id: 41,
    roadmap_title: { en: 'Annual Infection Control 2026', th: 'การควบคุมการติดเชื้อประจำปี 2569' },
    due_at: '2026-10-31T23:59:59+07:00',
    days_left: -3,
    status: 'overdue',
  }],
  category: { key: 'clinical', en: 'Clinical', th: 'คลินิก' },
};
