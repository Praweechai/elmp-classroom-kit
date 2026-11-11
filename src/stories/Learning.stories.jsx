import {
  Event, Schedule, ViewList, WorkspacePremium,
} from '@openedx/paragon/icons';

import * as fx from '../__fixtures__/portal';
import {
  ContinueCard, CourseCard, CourseOutline, KeyFacts, ProgressBar, ProgressRing, RequiredGroup, StatusPill,
} from '../index';

export default { title: 'Learning' };

const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 };

export const Pills = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {['on_track', 'due_soon', 'overdue', 'completed', 'not_started'].map((s) => <StatusPill key={s} status={s} />)}
    </div>
  ),
};

export const Progress = {
  render: () => (
    <div style={{
      display: 'flex', gap: 24, alignItems: 'center', maxWidth: 640, margin: '0 auto',
    }}
    >
      <div style={{ flex: 1 }}><ProgressBar value={62} /></div>
      <ProgressRing value={50} size={32} />
      <ProgressRing value={60} size={56} />
      <ProgressRing value={100} size={120} gold>40 / 40</ProgressRing>
    </div>
  ),
};

export const CourseCards = {
  render: () => (
    <div style={grid}>
      <CourseCard title="Isolation Precautions" code="INF101" category="clinical" href="#" state="in_progress" progress={62} durationHours={3} ceHours={3} units={8} required={{ roadmap: 'Infection Control 2026', dueAt: '2026-10-31T23:59:59+07:00', overdue: true }} />
      <CourseCard title="Patient Safety Basics" code="PSB101" category="safety" href="#" state="not_started" durationHours={2} ceHours={2} units={6} required={{ roadmap: 'Patient Safety 2026', dueAt: '2026-11-12T23:59:59+07:00' }} />
      <CourseCard title="Medical Records and PDPA — consent, access and retention for ward staff" code="REG101" category="compliance" href="#" state="passed" certificateUrl="#cert" completedAt="2026-11-02T10:00:00+07:00" durationHours={2} ceHours={2} units={5} />
      <CourseCard title="Fire Safety on the Ward" code="FIRE101" category="general" href="#" enrolled={false} durationHours={1} ceHours={1} units={3} />
    </div>
  ),
};

export const Continue = {
  render: () => (
    <div style={{ maxWidth: 840, margin: '0 auto' }}>
      <ContinueCard title="Infection Control 2026" code="INF101" category="clinical" href="#" roadmap="Infection Control 2026" unitIndex={3} unitCount={8} unitTitle="Hand hygiene" progress={62} />
    </div>
  ),
};

export const RequiredGroups = {
  render: () => (
    <div style={{
      display: 'grid', gap: 12, maxWidth: 840, margin: '0 auto',
    }}
    >
      <RequiredGroup assignment={fx.overdueAssignment} courseHref={() => '#'} />
      <RequiredGroup assignment={fx.dueSoonAssignment} courseHref={() => '#'} />
      <RequiredGroup assignment={fx.completedAssignment} courseHref={() => '#'} />
    </div>
  ),
};

export const CourseKeyFacts = {
  render: () => (
    <KeyFacts facts={[
      { icon: Schedule, value: '4 h', label: 'Duration' },
      { icon: ViewList, value: '8', label: 'Units' },
      { icon: Event, value: '4', label: 'CE hours' },
      { icon: WorkspacePremium, value: 'Included', label: 'Certificate' },
      {
        icon: Event, value: '31 Oct 2026', label: 'Due date', overdue: true,
      },
    ]}
    />
  ),
};

export const Outline = {
  render: () => (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <CourseOutline title="Course outline" sections={fx.outline} />
    </div>
  ),
};
