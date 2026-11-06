import {
  IdleDialog, OutlineDrawer, OutlineRail, PlayerTopBar, UnitTitle,
} from '../index';
import { outline } from '../__fixtures__/portal';

export default { title: 'Player', parameters: { layout: 'fullscreen' } };

const Frame = ({ children }) => <div style={{ minHeight: 360, background: '#fff' }}>{children}</div>;

export const TopBarAndTitle = {
  render: () => (
    <Frame>
      <PlayerTopBar courseTitle="Infection Control & Hand Hygiene" courseHref="#" unitIndex={4} unitCount={8} progress={62} onToggleOutline={() => {}} />
      <div style={{ maxWidth: 840, margin: '0 auto', padding: '24px 16px' }}>
        <UnitTitle section="2. Isolation precautions" title="Contact precautions" />
        <div style={{ height: 180, borderRadius: 12, background: '#F1F4F2' }} />
      </div>
    </Frame>
  ),
};

export const TopBarLongTitle = {
  render: () => (
    <Frame>
      <PlayerTopBar courseTitle="Medical Records and PDPA — consent, access and retention for ward staff" courseHref="#" unitIndex={12} unitCount={14} progress={100} />
    </Frame>
  ),
};

export const OutlineSidebar = {
  render: () => (
    <Frame>
      <div style={{ display: 'flex', minHeight: 520 }}>
        <OutlineDrawer sections={outline} onClose={() => {}} />
      </div>
    </Frame>
  ),
};

// Plan 4 · P4-6 (F-116): tree hidden → 40 px rail with ☰ next to the unit.
export const S95RailClosed = {
  render: () => (
    <Frame>
      <PlayerTopBar courseTitle="Infection Control & Hand Hygiene" courseHref="#" unitIndex={4} unitCount={8} progress={62} onToggleOutline={() => {}} />
      <div style={{ display: 'flex', minHeight: 420 }}>
        <OutlineRail onOpen={() => {}} />
        <div style={{
          flex: 1, maxWidth: 840, margin: '0 auto', padding: '24px 16px',
        }}
        >
          <UnitTitle section="2. Isolation precautions" title="Contact precautions" />
          <div style={{ height: 180, borderRadius: 12, background: '#F1F4F2' }} />
        </div>
      </div>
    </Frame>
  ),
};

// F-117: "Are you still there?" and the paused state.
export const S96IdleWarning = { render: () => <Frame><IdleDialog state="warning" secondsLeft={42} onResume={() => {}} /></Frame> };
export const S96IdlePaused = { render: () => <Frame><IdleDialog state="paused" onResume={() => {}} /></Frame> };
