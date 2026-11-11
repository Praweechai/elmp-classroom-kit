import storyLogo from './logo';
import {
  BottomTabs, ClassroomHeader, EmptyState, LanguageToggle, Notice, Skeleton, ToastProvider, useToast,
} from '../index';

const links = {
  home: '#home', certificates: '#certificates', hours: '#hours', account: '#account', signOut: '#sign-out',
};
const nok = { name: 'Nok Srisuk', position: 'Registered Nurse', department: 'ICU' };
const logoUrl = storyLogo;

export default { title: 'Shell' };

export const Header = {
  render: (_, { globals }) => <ClassroomHeader current="home" links={links} user={nok} unread={3} locale={globals.locale} logoUrl={logoUrl} />,
  parameters: { layout: 'fullscreen' },
};

export const HeaderForHrUser = {
  render: (_, { globals }) => (
    <ClassroomHeader current="certificates" links={{ ...links, portal: '#portal' }} user={nok} unread={12} locale={globals.locale} logoUrl={logoUrl} />
  ),
  parameters: { layout: 'fullscreen' },
};

export const PhoneTabs = {
  render: () => <div style={{ height: 120 }}><BottomTabs current="home" links={links} unread={3} /></div>,
  parameters: { layout: 'fullscreen', viewport: { defaultViewport: 'mobile1' } },
};

export const Language = { render: (_, { globals }) => <LanguageToggle value={globals.locale} /> };

export const States = {
  render: () => (
    <div style={{
      display: 'grid', gap: 16, maxWidth: 720, margin: '0 auto',
    }}
    >
      <Notice onRetry={() => {}}>Deadlines are not available right now.</Notice>
      <div className="cls-panel"><EmptyState title="Nothing here yet">No training assigned yet. HR will add your courses.</EmptyState></div>
      <div className="cls-panel" style={{ display: 'grid', gap: 10 }}>
        <Skeleton width="40%" height={28} />
        <Skeleton width="70%" />
        <Skeleton height={104} radius={12} />
      </div>
    </div>
  ),
};

const ToastDemo = () => {
  const show = useToast();
  return <button type="button" className="cls-btn cls-btn--primary" onClick={() => show('Progress updated · 62 %')}>Show toast</button>;
};

export const Toast = { render: () => <ToastProvider><ToastDemo /></ToastProvider> };
