import PropTypes from 'prop-types';
import {
  AccessTime, CheckCircle, MenuBook, Quiz, Shield, WorkspacePremium,
} from '@openedx/paragon/icons';

import * as fx from '../__fixtures__/portal';
import storyLogo from './logo';
import {
  ClassroomShell, CourseTable, DashboardView, DeadlineList, EncouragementBanner, Gauge, MyCoursesView, NextQuizList,
  SidebarNav, StatGroup, StatRing, StreakWeek, localized, messages, useClassroomIntl,
} from '../index';

// Plan 4 kit 1.0 (P4-3): compare with doc/plan-4/04-design/index.html (S-90, S-91).
export default { title: 'Dashboard', parameters: { layout: 'fullscreen' } };

const d = fx.dashboard.data;
const now = new Date('2026-11-06T01:00:00Z'); // 08:00 Bangkok
const links = {
  home: '#home', courses: '#courses', certificates: '#certificates', account: '#account', help: '#help', signOut: '#sign-out',
};
const user = { name: 'Boonmee Sukjai' };

const Page = ({
  locale, current = 'home', title, children,
}) => (
  <ClassroomShell current={current} title={title} links={links} user={user} unread={2} locale={locale} logoUrl={storyLogo}>
    {children}
  </ClassroomShell>
);

Page.propTypes = {
  locale: PropTypes.string, current: PropTypes.string, title: PropTypes.string.isRequired, children: PropTypes.node,
};

const Home = ({ locale, status = 'ready', dashboard = d }) => {
  const intl = useClassroomIntl();
  return (
    <Page locale={locale} title={intl.formatMessage(messages.navHomeShort)}>
      <DashboardView
        dashboard={dashboard}
        status={status}
        firstName={localized({ en: 'Boonmee', th: 'บุญมี' }, locale)}
        now={now}
        coursesHref="#courses"
        certificatesHref="#certificates"
        courseLimit={3}
      />
    </Page>
  );
};

Home.propTypes = { locale: PropTypes.string, status: PropTypes.string, dashboard: PropTypes.shape({}) };

export const S90Home = { render: (_, { globals }) => <Home locale={globals.locale} /> };
export const S90HomePortalDown = { render: (_, { globals }) => <Home locale={globals.locale} status="error" dashboard={null} /> };
export const S90HomeLoading = { render: (_, { globals }) => <Home locale={globals.locale} status="loading" /> };
export const S90HomeAllDone = {
  render: (_, { globals }) => (
    <Home
      locale={globals.locale}
      dashboard={{
        ...d,
        banner: { kind: 'all_done' },
        gauge: { required_done_on_time_pct: 100, label: 'on_track' },
        rings: { ...d.rings, required_done: [2, 2], completed: 3 },
        deadlines: [],
        next_quizzes: [],
      }}
    />
  ),
};

const Courses = ({ locale }) => {
  const intl = useClassroomIntl();
  return (
    <Page locale={locale} current="courses" title={intl.formatMessage(messages.navCourses)}>
      <MyCoursesView courses={d.courses} />
    </Page>
  );
};

Courses.propTypes = { locale: PropTypes.string };

export const S91MyCourses = { render: (_, { globals }) => <Courses locale={globals.locale} /> };

// Single widgets on a plain page (padded) for close review.
const Widgets = () => {
  const intl = useClassroomIntl();
  const t = (m) => intl.formatMessage(m);
  return (
    <div className="cls-dash" style={{ padding: 16 }}>
      <div className="cls-dash__full"><EncouragementBanner banner={{ kind: 'due_soon', n: 2, course: 'Hospital Regulations' }} now={now} /></div>
      <div className="cls-dcard"><Gauge pct={67} label="on_track" /></div>
      <div className="cls-dcard"><Gauge pct={null} /></div>
      <StatGroup title={t(messages.dashMyLearning)}>
        <StatRing icon={MenuBook} tone="green" label={t(messages.statEnrolled)} value="5" pct={100} />
        <StatRing icon={CheckCircle} tone="blue" label={t(messages.statCompleted)} value="2" pct={40} />
        <StatRing icon={AccessTime} tone="pink" label={t(messages.statHoursLearned)} value="—" pct={0} />
      </StatGroup>
      <StatGroup title={t(messages.required)}>
        <StatRing icon={Shield} tone="late" label={t(messages.statRequiredDone)} value="1/3" pct={33} />
        <StatRing icon={Quiz} tone="violet" label={t(messages.statQuizzes)} value="8/12" pct={67} />
        <StatRing icon={WorkspacePremium} tone="gold" label={t(messages.statCertificates)} value="2" pct={100} />
      </StatGroup>
      <div className="cls-dcard"><StreakWeek days={[false, false, false, false, false, false, false]} current={0} today={now} /></div>
      <div className="cls-dcard cls-dash__two"><DeadlineList items={d.deadlines} /></div>
      <div className="cls-dcard"><NextQuizList items={d.next_quizzes} /></div>
      <div className="cls-dcard cls-dash__full"><CourseTable courses={d.courses} /></div>
    </div>
  );
};

export const WidgetStates = { render: () => <Widgets /> };

export const SidebarCollapsed = {
  render: () => (
    <div className="cls-shell" style={{ minHeight: 560 }}>
      <SidebarNav current="certificates" links={{ ...links, hours: '#hours' }} unread={12} state="collapsed" onToggle={() => {}} logoUrl={storyLogo} />
    </div>
  ),
};
