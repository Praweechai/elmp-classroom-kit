import PropTypes from 'prop-types';

import {
  Event, Schedule, ViewList, WorkspacePremium,
} from '@openedx/paragon/icons';
import * as fx from '../__fixtures__/portal';
import storyLogo from './logo';

import {
  BottomTabs, CertificateCard, CertificatePreview, ClassroomHeader, CourseFinished, ContinueCard, CourseCard, CourseHero, CourseOutline, GreetingBand,
  HoursCard, Notice, RequiredGroup, Skeleton, localized, messages, nextRequiredCourse, useClassroomIntl,
} from '../index';

// Whole screens built from kit parts with fake data, to compare with doc 04-design/index.html (S-70, S-79).
// The real pages live in the dashboard fork (P3-4); this is the design preview.

export default { title: 'Screens', parameters: { layout: 'fullscreen' } };

const links = {
  home: '#home', certificates: '#certificates', hours: '#hours', account: '#account', signOut: '#sign-out',
};
const morning = new Date('2026-11-04T02:00:00Z');

const Home = ({ locale, portalDown = false }) => {
  const intl = useClassroomIntl();
  const me = fx.me.data;
  const { summary, assignments } = fx.training.data;
  return (
    <>
      <ClassroomHeader current="home" links={links} user={{ name: localized(me.name, locale), position: localized(me.position, locale), department: localized(me.department, locale) }} unread={3} locale={locale} logoUrl={storyLogo} />
      <main className="cls-page">
        <div className="cls-home-grid">
          <div className="cls-main-col">
            <GreetingBand firstName={localized(me.first_name, locale)} summary={portalDown ? undefined : summary} now={morning} />
            {portalDown && <Notice onRetry={() => {}}>{intl.formatMessage(messages.unavailable)}</Notice>}
            <ContinueCard title="Isolation Precautions" code="INF101" category="clinical" href="#" roadmap={localized(assignments[0].roadmap.title, locale)} unitIndex={3} unitCount={8} unitTitle="Contact precautions" progress={41} />
            {!portalDown && (
              <section>
                <div className="cls-section-title"><h2>{intl.formatMessage(messages.required)}</h2></div>
                <div className="cls-stack">
                  {assignments.map((a) => <RequiredGroup key={a.id} assignment={a} courseHref={() => '#'} />)}
                </div>
              </section>
            )}
            <section>
              <div className="cls-section-title"><h2>{intl.formatMessage(messages.allCourses)}</h2></div>
              <div className="cls-chips">
                <button type="button" className="cls-chip" aria-pressed="true">{intl.formatMessage(messages.statusInProgress)}</button>
                <button type="button" className="cls-chip" aria-pressed="false">{intl.formatMessage(messages.statusNotStarted)}</button>
                <button type="button" className="cls-chip" aria-pressed="false">{intl.formatMessage(messages.statusCompleted)}</button>
              </div>
              <div className="cls-cards">
                <CourseCard title="Isolation Precautions" code="INF101" category="clinical" href="#" state="in_progress" progress={41} durationHours={3} ceHours={3} units={8} required={portalDown ? undefined : { roadmap: localized(assignments[0].roadmap.title, locale), dueAt: assignments[0].due_at, overdue: true }} />
                <CourseCard title="Patient Safety Basics" code="PSB101" category="safety" href="#" state="not_started" durationHours={2} ceHours={2} units={6} />
                <CourseCard title="Medical Records and PDPA" code="REG101" category="compliance" href="#" state="passed" certificateUrl="#" completedAt="2026-11-02T10:00:00+07:00" durationHours={2} ceHours={2} units={5} />
              </div>
            </section>
          </div>
          <aside className="cls-side-col">
            {portalDown ? <Skeleton height={140} radius={12} /> : <HoursCard year={2026} earned={24} target={40} yearEnds="2026-12-31" href="#hours" />}
            {!portalDown && <CertificateCard certificate={fx.roadmapCertificate} />}
          </aside>
        </div>
      </main>
      <BottomTabs current="home" links={links} unread={3} />
    </>
  );
};

Home.propTypes = { locale: PropTypes.string, portalDown: PropTypes.bool };

export const S70ClassroomHome = { render: (_, { globals }) => <Home locale={globals.locale} /> };
export const S79PortalUnavailable = { render: (_, { globals }) => <Home locale={globals.locale} portalDown /> };

const CourseHome = ({ locale }) => {
  const intl = useClassroomIntl();
  const me = fx.me.data;
  return (
    <>
      <ClassroomHeader current="home" links={links} user={{ name: localized(me.name, locale) }} unread={3} locale={locale} logoUrl={storyLogo} />
      <main className="cls-page">
        <CourseHero
          title="Infection Control 2026"
          code="INF101"
          description="Protect patients and yourself with hand hygiene, PPE and safe cleaning on every shift."
          backHref="#home"
          facts={[
            { icon: Schedule, value: intl.formatMessage(messages.duration, { hours: 4 }), label: intl.formatMessage(messages.factDuration) },
            { icon: ViewList, value: '8', label: intl.formatMessage(messages.factUnits) },
            { icon: Event, value: '3', label: intl.formatMessage(messages.factHours) },
            { icon: WorkspacePremium, value: intl.formatMessage(messages.factCertificateYes), label: intl.formatMessage(messages.factCertificate) },
          ]}
          requiredBy={fx.courseContext.required_by}
          progress={{
            percent: 62, done: 5, total: 8, href: '#', action: 'resume',
          }}
          aside={<CertificatePreview courseTitle="Infection Control 2026" learnerName={localized(me.name, locale)} />}
        />
        <CourseOutline title={intl.formatMessage(messages.outlineTitle)} sections={fx.outline} />
      </main>
    </>
  );
};

CourseHome.propTypes = { locale: PropTypes.string };

export const S75CourseHome = { render: (_, { globals }) => <CourseHome locale={globals.locale} /> };

const Finished = ({ locale }) => {
  const me = fx.me.data;
  const upNext = { ...nextRequiredCourse(fx.training.data, 'course-v1:MHB+INF101+2026'), href: '#' };
  return (
    <>
      <ClassroomHeader current="home" links={links} user={{ name: localized(me.name, locale) }} unread={3} locale={locale} logoUrl={storyLogo} />
      <main className="cls-page">
        <CourseFinished
          courseTitle="Isolation Precautions"
          grade={92}
          ceHours={3}
          finishedAt="2026-11-03T09:10:00+07:00"
          certificateHref="#"
          upNext={upNext}
          backHref="#home"
          record="updated"
        />
      </main>
    </>
  );
};

Finished.propTypes = { locale: PropTypes.string };

export const S77CourseFinished = { render: (_, { globals }) => <Finished locale={globals.locale} /> };
