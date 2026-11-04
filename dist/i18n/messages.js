"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _reactIntl = require("react-intl");
// English is the default; Thai lives in th.json (doc 04 §9). Never "Open edX", "LMS", "SSO" or "MFE" here.
const messages = (0, _reactIntl.defineMessages)({
  brand: {
    id: 'cls.brand',
    defaultMessage: 'Mission Hospital Learning'
  },
  brandShort: {
    id: 'cls.brand.short',
    defaultMessage: 'Mission Hospital'
  },
  brandHome: {
    id: 'cls.brand.home',
    defaultMessage: 'Mission Hospital Learning, go to My learning'
  },
  navLabel: {
    id: 'cls.nav.label',
    defaultMessage: 'Classroom'
  },
  tabsLabel: {
    id: 'cls.nav.tabs',
    defaultMessage: 'Classroom tabs'
  },
  navHome: {
    id: 'cls.nav.home',
    defaultMessage: 'My learning'
  },
  navHomeShort: {
    id: 'cls.nav.homeShort',
    defaultMessage: 'Home'
  },
  navCertificates: {
    id: 'cls.nav.certificates',
    defaultMessage: 'Certificates'
  },
  navHours: {
    id: 'cls.nav.hours',
    defaultMessage: 'CE hours'
  },
  navHoursShort: {
    id: 'cls.nav.hoursShort',
    defaultMessage: 'Hours'
  },
  navMessages: {
    id: 'cls.nav.messages',
    defaultMessage: 'Messages'
  },
  messagesButton: {
    id: 'cls.messages.button',
    defaultMessage: '{count, plural, =0 {Messages} one {Messages, # unread} other {Messages, # unread}}'
  },
  accountButton: {
    id: 'cls.account.button',
    defaultMessage: 'Account menu for {name}'
  },
  accountSettings: {
    id: 'cls.account.settings',
    defaultMessage: 'Account settings'
  },
  language: {
    id: 'cls.language',
    defaultMessage: 'Language'
  },
  languageGroup: {
    id: 'cls.language.group',
    defaultMessage: 'Choose language'
  },
  signOut: {
    id: 'cls.signOut',
    defaultMessage: 'Sign out'
  },
  portalLink: {
    id: 'cls.portal',
    defaultMessage: 'HR tools'
  },
  greetingMorning: {
    id: 'cls.greeting.morning',
    defaultMessage: 'Good morning, {name}'
  },
  greetingAfternoon: {
    id: 'cls.greeting.afternoon',
    defaultMessage: 'Good afternoon, {name}'
  },
  greetingEvening: {
    id: 'cls.greeting.evening',
    defaultMessage: 'Good evening, {name}'
  },
  summaryOverdue: {
    id: 'cls.summary.overdue',
    defaultMessage: '{n} overdue'
  },
  summaryDueMonth: {
    id: 'cls.summary.dueMonth',
    defaultMessage: '{n} due this month'
  },
  summaryHours: {
    id: 'cls.summary.hours',
    defaultMessage: '{earned} / {target} CE hours'
  },
  summaryAllDone: {
    id: 'cls.summary.allDone',
    defaultMessage: 'Nothing due. Well done.'
  },
  continue: {
    id: 'cls.continue',
    defaultMessage: 'Continue'
  },
  continueLabel: {
    id: 'cls.continue.label',
    defaultMessage: 'Continue · {roadmap}'
  },
  start: {
    id: 'cls.start',
    defaultMessage: 'Start'
  },
  review: {
    id: 'cls.review',
    defaultMessage: 'Review'
  },
  viewCertificate: {
    id: 'cls.viewCertificate',
    defaultMessage: 'View certificate'
  },
  resume: {
    id: 'cls.resume',
    defaultMessage: 'Resume'
  },
  unitOf: {
    id: 'cls.unitOf',
    defaultMessage: 'Unit {i} of {n}'
  },
  percentDone: {
    id: 'cls.percentDone',
    defaultMessage: '{pct}% done'
  },
  progressLabel: {
    id: 'cls.progress.label',
    defaultMessage: 'Progress'
  },
  required: {
    id: 'cls.required',
    defaultMessage: 'Required training'
  },
  allCourses: {
    id: 'cls.allCourses',
    defaultMessage: 'All my courses'
  },
  course: {
    id: 'cls.course',
    defaultMessage: 'Course'
  },
  requiredStrip: {
    id: 'cls.strip.required',
    defaultMessage: 'Required · {roadmap} · due {date}'
  },
  completedStrip: {
    id: 'cls.strip.completed',
    defaultMessage: 'Completed · {date}'
  },
  ceHours: {
    id: 'cls.ceHours',
    defaultMessage: '{hours} CE hours'
  },
  units: {
    id: 'cls.units',
    defaultMessage: '{n, plural, one {# unit} other {# units}}'
  },
  duration: {
    id: 'cls.duration',
    defaultMessage: '{hours} h'
  },
  preparing: {
    id: 'cls.preparing',
    defaultMessage: 'Getting your course ready…'
  },
  showCourses: {
    id: 'cls.showCourses',
    defaultMessage: 'Show courses'
  },
  hideCourses: {
    id: 'cls.hideCourses',
    defaultMessage: 'Hide courses'
  },
  openCourse: {
    id: 'cls.openCourse',
    defaultMessage: 'Open {title}'
  },
  statusOnTrack: {
    id: 'cls.status.onTrack',
    defaultMessage: 'On track'
  },
  statusDueSoon: {
    id: 'cls.status.dueSoon',
    defaultMessage: 'Due soon'
  },
  statusOverdue: {
    id: 'cls.status.overdue',
    defaultMessage: 'Overdue'
  },
  statusCompleted: {
    id: 'cls.status.completed',
    defaultMessage: 'Completed'
  },
  statusNotStarted: {
    id: 'cls.status.notStarted',
    defaultMessage: 'Not started'
  },
  statusInProgress: {
    id: 'cls.status.inProgress',
    defaultMessage: 'In progress'
  },
  statusPassed: {
    id: 'cls.status.passed',
    defaultMessage: 'Passed'
  },
  due: {
    id: 'cls.due',
    defaultMessage: '{n, plural, =0 {Due {date} · today} one {Due {date} · # day left} other {Due {date} · # days left}}'
  },
  late: {
    id: 'cls.late',
    defaultMessage: '{n, plural, one {Due {date} · # day late} other {Due {date} · # days late}}'
  },
  completedOn: {
    id: 'cls.completedOn',
    defaultMessage: 'Completed {date}'
  },
  updatedAgo: {
    id: 'cls.updatedAgo',
    defaultMessage: 'Updated {time}'
  },
  hoursTitle: {
    id: 'cls.hours.title',
    defaultMessage: 'CE hours {year}'
  },
  hoursValue: {
    id: 'cls.hours.value',
    defaultMessage: '{earned} of {target} hours'
  },
  hoursToGo: {
    id: 'cls.hours.toGo',
    defaultMessage: '{n} hours to go before {date}'
  },
  hoursReached: {
    id: 'cls.hours.reached',
    defaultMessage: 'Target reached. Well done.'
  },
  certificateLatest: {
    id: 'cls.cert.latest',
    defaultMessage: 'Latest certificate'
  },
  certificateRoadmap: {
    id: 'cls.cert.roadmap',
    defaultMessage: 'Roadmap certificate'
  },
  certificateCourse: {
    id: 'cls.cert.course',
    defaultMessage: 'Course certificate'
  },
  certificateIssued: {
    id: 'cls.cert.issued',
    defaultMessage: 'Issued {date}'
  },
  certificateRevoked: {
    id: 'cls.cert.revoked',
    defaultMessage: 'Revoked on {date}'
  },
  certificateCode: {
    id: 'cls.cert.code',
    defaultMessage: 'Verification code'
  },
  certificateDownload: {
    id: 'cls.cert.download',
    defaultMessage: 'Download PDF'
  },
  certificateView: {
    id: 'cls.cert.view',
    defaultMessage: 'View'
  },
  copy: {
    id: 'cls.copy',
    defaultMessage: 'Copy'
  },
  copyCode: {
    id: 'cls.copy.code',
    defaultMessage: 'Copy code {code}'
  },
  copied: {
    id: 'cls.copied',
    defaultMessage: 'Copied'
  },
  factDuration: {
    id: 'cls.fact.duration',
    defaultMessage: 'Duration'
  },
  factUnits: {
    id: 'cls.fact.units',
    defaultMessage: 'Units'
  },
  factHours: {
    id: 'cls.fact.hours',
    defaultMessage: 'CE hours'
  },
  factCertificate: {
    id: 'cls.fact.certificate',
    defaultMessage: 'Certificate'
  },
  factCertificateYes: {
    id: 'cls.fact.certificate.yes',
    defaultMessage: 'Included'
  },
  factDue: {
    id: 'cls.fact.due',
    defaultMessage: 'Due date'
  },
  unavailable: {
    id: 'cls.unavailable',
    defaultMessage: 'Deadlines are not available right now.'
  },
  tryAgain: {
    id: 'cls.tryAgain',
    defaultMessage: 'Try again'
  },
  empty: {
    id: 'cls.empty',
    defaultMessage: 'No training assigned yet. HR will add your courses.'
  },
  emptyTitle: {
    id: 'cls.empty.title',
    defaultMessage: 'Nothing here yet'
  },
  noAccess: {
    id: 'cls.noAccess',
    defaultMessage: "We can't find your training record. Please contact HR."
  },
  loading: {
    id: 'cls.loading',
    defaultMessage: 'Loading'
  },
  dismiss: {
    id: 'cls.dismiss',
    defaultMessage: 'Dismiss'
  },
  close: {
    id: 'cls.close',
    defaultMessage: 'Close'
  },
  homeTitle: {
    id: 'cls.home.title',
    defaultMessage: 'My learning'
  },
  allDoneTitle: {
    id: 'cls.allDone.title',
    defaultMessage: 'All done'
  },
  nextDue: {
    id: 'cls.nextDue',
    defaultMessage: 'Next due: {title} · {date}'
  },
  filterLabel: {
    id: 'cls.filter.label',
    defaultMessage: 'Show courses'
  },
  filterAll: {
    id: 'cls.filter.all',
    defaultMessage: 'All'
  },
  filterRoadmap: {
    id: 'cls.filter.roadmap',
    defaultMessage: 'Roadmap'
  },
  filterCourse: {
    id: 'cls.filter.course',
    defaultMessage: 'Course'
  },
  noCoursesInFilter: {
    id: 'cls.filter.none',
    defaultMessage: 'No courses here.'
  },
  noAccessTitle: {
    id: 'cls.noAccess.title',
    defaultMessage: 'Your training record is missing'
  },
  certificatesTitle: {
    id: 'cls.certs.title',
    defaultMessage: 'Certificates'
  },
  certificatesIntro: {
    id: 'cls.certs.intro',
    defaultMessage: 'Download proof of your training. Roadmap certificates have a code HR can verify.'
  },
  certificatesEmpty: {
    id: 'cls.certs.empty',
    defaultMessage: 'Finish a course to earn your first certificate.'
  },
  downloadFailed: {
    id: 'cls.download.failed',
    defaultMessage: 'The download could not start. Please try again.'
  },
  hoursPageTitle: {
    id: 'cls.hoursPage.title',
    defaultMessage: 'CE hours'
  },
  hoursYearGroup: {
    id: 'cls.hoursPage.year',
    defaultMessage: 'Year'
  },
  hoursListTitle: {
    id: 'cls.hoursPage.list',
    defaultMessage: 'Courses that count'
  },
  hoursColDate: {
    id: 'cls.hoursPage.date',
    defaultMessage: 'Passed on'
  },
  hoursColCourse: {
    id: 'cls.hoursPage.course',
    defaultMessage: 'Course'
  },
  hoursColHours: {
    id: 'cls.hoursPage.hours',
    defaultMessage: 'Hours'
  },
  hoursNone: {
    id: 'cls.hoursPage.none',
    defaultMessage: 'No courses passed in {year} yet.'
  },
  hoursFootnote: {
    id: 'cls.hoursPage.note',
    defaultMessage: 'Only courses passed in this year count. Ask HR about on-site sessions.'
  },
  messagesTitle: {
    id: 'cls.messages.title',
    defaultMessage: 'Messages'
  },
  markAllRead: {
    id: 'cls.messages.readAll',
    defaultMessage: 'Mark all as read'
  },
  caughtUp: {
    id: 'cls.messages.empty',
    defaultMessage: "You're all caught up."
  },
  showMore: {
    id: 'cls.messages.more',
    defaultMessage: 'Show more'
  },
  unreadLabel: {
    id: 'cls.messages.unread',
    defaultMessage: 'Unread'
  },
  messagesUnavailable: {
    id: 'cls.messages.unavailable',
    defaultMessage: 'Messages are not available right now.'
  }
});
var _default = exports.default = messages;