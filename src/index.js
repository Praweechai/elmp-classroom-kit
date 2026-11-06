import './tokens/tokens.css';
import './styles/classroom.css';

export { default as tokens } from './tokens/tokens';
export {
  TIME_ZONE, formatDate, formatHours, getClassroomIntl, greetingKey, kitLanguage, localized, messages, timeAgo,
  useClassroomIntl,
} from './i18n';

export { default as KitIcon } from './components/KitIcon';
export { LinkContext, useLinkComponent } from './components/LinkContext';
export { default as StatusPill, STATUSES } from './components/StatusPill';
export { ProgressBar, ProgressRing } from './components/Progress';
export { default as CourseCover, CATEGORIES } from './components/CourseCover';
export { default as CourseCard, COURSE_STATES } from './components/CourseCard';
export { default as ContinueCard } from './components/ContinueCard';
export { default as RequiredGroup } from './components/RequiredGroup';
export { default as CertificateCard } from './components/CertificateCard';
export { default as HoursCard } from './components/HoursCard';
export { default as KeyFacts } from './components/KeyFacts';
export { default as CourseHero } from './components/CourseHero';
export { default as CertificatePreview } from './components/CertificatePreview';
export { default as CourseFinished, nextRequiredCourse } from './components/CourseFinished';
export { default as GreetingBand } from './components/GreetingBand';
export { PlayerTopBar, UnitTitle } from './components/Player';
export { default as CourseOutline, OutlineDrawer, OutlineRail } from './components/CourseOutline';
export { default as NotificationPanel } from './components/NotificationPanel';
export { default as HomeView, NO_ACCESS } from './views/HomeView';
export { default as CertificatesView } from './views/CertificatesView';
export { default as HoursView } from './views/HoursView';
export {
  EmptyState, Notice, Skeleton, ToastProvider, useToast,
} from './components/Feedback';
export {
  AccountMenu, Avatar, BottomTabs, ClassroomHeader, LanguageToggle, MessagesButton,
} from './components/Header';

// Plan 4 · kit 1.0 (P4-3): sidebar shell + home dashboard widgets + pages.
export {
  ClassroomShell, SidebarNav, TopBar, useSidebarState,
} from './components/Shell';
export {
  BANNER_KINDS, DashCard, DeadlineList, EncouragementBanner, Gauge, NextQuizList, StatGroup, StatRing, StreakWeek,
  TONES, bangkokDay, urgency, weekdayLabels,
} from './components/Dashboard';
export {
  default as CourseTable, COURSE_FILTERS, COURSE_STATUSES, CourseFilters, CourseStatus, coursePercent,
} from './components/CourseTable';
export { default as DashboardView, DashboardSkeleton } from './views/DashboardView';
export { default as MyCoursesView } from './views/MyCoursesView';

// Plan 4 · kit 1.1 (P4-6): player inactivity + time on task (F-117).
export { default as IdleDialog } from './components/IdleDialog';
export { default as useIdleTimer, PAGE_EVENTS, isBridgeMessage } from './player/useIdleTimer';
export {
  default as useActivitySender, MAX_PER_CALL, SEND_EVERY_MS, beacon, chunks,
} from './player/useActivitySender';

export {
  CACHE_MS, PortalError, TIMEOUT_MS, createPortalClient, getPortalClient, resetPortalClient, toPortalError,
} from './portal/PortalClient';
export { default as usePortal } from './portal/usePortal';
