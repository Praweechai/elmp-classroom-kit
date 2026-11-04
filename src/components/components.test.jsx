import { act, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Event, Schedule } from '@openedx/paragon/icons';

import * as fx from '../__fixtures__/portal';
import { BANNED_WORDS, renderKit, visibleWords } from '../testUtils';
import CertificateCard from './CertificateCard';
import ContinueCard from './ContinueCard';
import GreetingBand from './GreetingBand';
import CourseCard from './CourseCard';
import {
  EmptyState, Notice, Skeleton, ToastProvider, useToast,
} from './Feedback';
import { BottomTabs, ClassroomHeader } from './Header';
import HoursCard from './HoursCard';
import KeyFacts from './KeyFacts';
import { LinkContext } from './LinkContext';
import { ProgressBar, ProgressRing } from './Progress';
import RequiredGroup from './RequiredGroup';
import StatusPill from './StatusPill';

const links = {
  home: '/learner-dashboard/',
  certificates: '/learner-dashboard/certificates',
  hours: '/learner-dashboard/hours',
  account: 'http://portal.local.openedx.io/profile',
  signOut: 'http://local.openedx.io/logout',
};
const nok = { name: 'Nok Srisuk', position: 'Registered Nurse', department: 'ICU' };

describe('StatusPill', () => {
  it.each([
    ['on_track', 'On track', 'ตามกำหนด'],
    ['due_soon', 'Due soon', 'ใกล้ครบกำหนด'],
    ['overdue', 'Overdue', 'เลยกำหนด'],
    ['completed', 'Completed', 'เสร็จแล้ว'],
  ])('%s shows text, not only colour', (status, en, th) => {
    const { unmount } = renderKit(<StatusPill status={status} />);
    expect(screen.getByText(en)).toHaveClass(`cls-pill--${status}`);
    unmount();
    renderKit(<StatusPill status={status} />, { locale: 'th' });
    expect(screen.getByText(th)).toBeInTheDocument();
  });
});

describe('Progress', () => {
  it('bar and ring expose progressbar values, clamped to 0–100', () => {
    renderKit(<><ProgressBar value={140} label="INF101" /><ProgressRing value={-5} size={56} label="ring" /></>);
    expect(screen.getByRole('progressbar', { name: 'INF101' })).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByRole('progressbar', { name: 'ring' })).toHaveAttribute('aria-valuenow', '0');
  });
});

describe('RequiredGroup (F-91)', () => {
  it('shows an overdue group with calm danger styling and late days (AC-1)', () => {
    const { container } = renderKit(<RequiredGroup assignment={fx.overdueAssignment} courseHref={(c) => `/learning/course/${c.course_key}/home`} />);
    expect(screen.getByRole('heading', { name: /Annual Infection Control 2026/ })).toBeInTheDocument();
    expect(screen.getByText('Overdue')).toBeInTheDocument();
    expect(screen.getByText('Due 31 Oct 2026 · 3 days late')).toBeInTheDocument();
    expect(container.querySelector('#required-41')).toHaveClass('cls-group--overdue');
    expect(screen.getByRole('link', { name: /Isolation Precautions/ })).toHaveAttribute('href', '/learning/course/course-v1:MHB+INF101+2026/home');
  });

  it('shows "Getting your course ready…" without a link for a pending enrolment (BR-2)', () => {
    renderKit(<RequiredGroup assignment={fx.dueSoonAssignment} courseHref={() => '/x'} />);
    expect(screen.getByText('Getting your course ready…')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Fire Safety/ })).toBeNull();
    expect(screen.getByText('Due 12 Nov 2026 · 9 days left')).toBeInTheDocument();
  });

  it('collapses completed groups behind "Show courses"', async () => {
    renderKit(<RequiredGroup assignment={fx.completedAssignment} />);
    expect(screen.queryByText('Medical Records and PDPA')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Show courses' }));
    expect(screen.getByText('Medical Records and PDPA')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hide courses' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('speaks Thai with Buddhist Era dates', () => {
    renderKit(<RequiredGroup assignment={fx.overdueAssignment} />, { locale: 'th' });
    expect(screen.getByText('ครบกำหนด 31 ต.ค. 2569 · เลยมา 3 วัน')).toBeInTheDocument();
    expect(screen.getByText('ควบคุมการติดเชื้อประจำปี 2569', { exact: false })).toBeInTheDocument();
  });

  it('highlights the group when opened from a deep link (J-4)', () => {
    jest.useFakeTimers();
    const { container } = renderKit(<RequiredGroup assignment={fx.dueSoonAssignment} highlighted />);
    expect(container.querySelector('#required-42')).toHaveClass('is-highlighted');
    act(() => { jest.advanceTimersByTime(1300); });
    expect(container.querySelector('#required-42')).not.toHaveClass('is-highlighted');
    jest.useRealTimers();
  });
});

describe('CourseCard (F-92)', () => {
  const base = {
    title: 'Isolation Precautions', code: 'INF101', category: 'clinical', href: '/home', resumeHref: '/resume', durationHours: 3, ceHours: 3, units: 8,
  };

  it.each([
    ['not_started', 'Start'],
    ['in_progress', 'Continue'],
    ['passed', 'Review'],
  ])('%s → %s (BR-1)', (state, label) => {
    renderKit(<CourseCard {...base} state={state} progress={62} />);
    expect(screen.getByRole('link', { name: `${label}: Isolation Precautions` })).toBeInTheDocument();
  });

  it('passed with certificate → View certificate, gold flag', () => {
    renderKit(<CourseCard {...base} state="passed" certificateUrl="/cert" completedAt="2026-11-02T10:00:00+07:00" />);
    expect(screen.getByRole('link', { name: 'View certificate: Isolation Precautions' })).toHaveAttribute('href', '/cert');
    expect(screen.getByText('Completed · 2 Nov 2026')).toBeInTheDocument();
  });

  it('shows the required strip and keeps the full title for long titles (AC-1)', () => {
    renderKit(<CourseCard {...base} required={{ roadmap: 'Infection Control 2026', dueAt: '2026-11-12T23:59:59+07:00' }} />);
    expect(screen.getByText('Required · Infection Control 2026 · due 12 Nov 2026')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Isolation Precautions' })).toHaveAttribute('title', 'Isolation Precautions');
  });

  it('not enrolled yet → preparing, no links', () => {
    renderKit(<CourseCard {...base} enrolled={false} />);
    expect(screen.getByRole('status')).toHaveTextContent('Getting your course ready…');
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  it('uses the fork router link when provided', () => {
    const RouterLink = ({ href, children, ...rest }) => <a data-router="yes" href={href} {...rest}>{children}</a>; // eslint-disable-line react/prop-types
    renderKit(<LinkContext.Provider value={RouterLink}><CourseCard {...base} /></LinkContext.Provider>);
    expect(screen.getByRole('link', { name: 'Isolation Precautions' })).toHaveAttribute('data-router', 'yes');
  });
});

describe('ContinueCard', () => {
  it('shows unit position and a Continue action', () => {
    renderKit(<ContinueCard title="Infection Control 2026" href="/u3" roadmap="Infection Control 2026" unitIndex={3} unitCount={8} unitTitle="Hand hygiene" progress={62} />);
    expect(screen.getByText('Unit 3 of 8 · Hand hygiene')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Continue: Infection Control 2026' })).toHaveAttribute('href', '/u3');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '62');
  });
});

describe('CertificateCard (F-96)', () => {
  it('downloads a roadmap PDF through the callback (signed link, BR-1)', async () => {
    const onDownload = jest.fn().mockResolvedValue();
    renderKit(<CertificateCard certificate={fx.roadmapCertificate} onDownload={onDownload} />);
    await userEvent.click(screen.getByRole('button', { name: 'Download PDF' }));
    expect(onDownload).toHaveBeenCalledWith(fx.roadmapCertificate);
    expect(screen.getByText('ELMP-2026-7KQ4-9XTD')).toBeInTheDocument();
  });

  it('copies the verification code', async () => {
    const writeText = jest.fn().mockResolvedValue();
    Object.assign(navigator, { clipboard: { writeText } });
    const onCopied = jest.fn();
    renderKit(<CertificateCard certificate={fx.roadmapCertificate} onCopied={onCopied} />);
    fireEvent.click(screen.getByRole('button', { name: 'Copy code ELMP-2026-7KQ4-9XTD' }));
    await screen.findByText('ELMP-2026-7KQ4-9XTD');
    expect(writeText).toHaveBeenCalledWith('ELMP-2026-7KQ4-9XTD');
  });

  it('revoked: no download, struck code, revoked date (BR-2)', () => {
    renderKit(<CertificateCard certificate={fx.revokedCertificate} />);
    expect(screen.queryByRole('button', { name: 'Download PDF' })).toBeNull();
    expect(screen.getByText('Revoked on 15 Jan 2026')).toBeInTheDocument();
    expect(screen.getByText('ELMP-2025-AB12-CD34').tagName).toBe('S');
  });

  it('course certificate opens the printable page in a new tab', () => {
    renderKit(<CertificateCard certificate={fx.courseCertificate} />);
    const link = screen.getByRole('link', { name: 'View' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});

describe('HoursCard (F-97)', () => {
  it('shows hours to go before the year ends', () => {
    renderKit(<HoursCard year={2026} earned={24} target={40} yearEnds="2026-12-31" />);
    expect(screen.getByText('16 hours to go before 31 Dec 2026')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: '24 of 40 hours' })).toHaveAttribute('aria-valuenow', '60');
  });

  it('turns gold and congratulates when the target is reached; Buddhist year in Thai', () => {
    const { container } = renderKit(<HoursCard year={2026} earned={40} target={40} yearEnds="2026-12-31" />, { locale: 'th' });
    expect(screen.getByText('ครบตามเป้าหมายแล้ว เยี่ยมมาก')).toBeInTheDocument();
    expect(screen.getByText('ชั่วโมง CE ปี 2569')).toBeInTheDocument();
    expect(container.querySelector('.cls-ring')).toHaveClass('cls-ring--gold');
  });
});

describe('KeyFacts, Notice, EmptyState, Skeleton', () => {
  it('render their content', async () => {
    const onRetry = jest.fn();
    renderKit(
      <>
        <KeyFacts facts={[{ icon: Schedule, value: '4 h', label: 'Duration' }, {
          icon: Event, value: '12 Nov', label: 'Due date', overdue: true,
        }]}
        />
        <Notice onRetry={onRetry}>Deadlines are not available right now.</Notice>
        <EmptyState title="Nothing here yet">No training assigned yet.</EmptyState>
        <Skeleton height={24} />
      </>,
    );
    expect(screen.getByText('4 h')).toBeInTheDocument();
    expect(screen.getByText('12 Nov').closest('li')).toHaveClass('cls-fact--overdue');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Nothing here yet' })).toBeInTheDocument();
  });
});

describe('ClassroomHeader + BottomTabs (F-98)', () => {
  it('marks the current page and caps the badge at 9+', () => {
    renderKit(<ClassroomHeader current="certificates" links={links} user={nok} unread={12} locale="en" />);
    expect(screen.getByRole('link', { name: 'Certificates' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Messages, 12 unread' })).toHaveTextContent('9+');
  });

  it('opens the account menu, closes on Escape and returns focus (doc 04 §10)', async () => {
    renderKit(<ClassroomHeader links={links} user={nok} locale="en" />);
    const trigger = screen.getByRole('button', { name: 'Account menu for Nok Srisuk' });
    await userEvent.click(trigger);
    expect(screen.getByRole('menuitem', { name: 'Account settings' })).toHaveAttribute('href', links.account);
    expect(screen.getByRole('menuitem', { name: 'Sign out' })).toHaveAttribute('href', links.signOut);
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it('switches language through the callback (F-98 BR-1)', async () => {
    const onLocaleChange = jest.fn();
    renderKit(<ClassroomHeader links={links} user={nok} locale="en" onLocaleChange={onLocaleChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'ไทย' }));
    expect(onLocaleChange).toHaveBeenCalledWith('th');
  });

  it.each(['en', 'th'])('never shows platform words in %s (A3-6)', async (locale) => {
    const { container } = renderKit(
      <>
        <ClassroomHeader current="home" links={links} user={nok} unread={3} locale={locale} />
        <BottomTabs current="home" links={links} unread={3} />
      </>,
      { locale },
    );
    await userEvent.click(screen.getAllByRole('button', { name: /Nok Srisuk|นก|Nok/ })[0]);
    expect(visibleWords(container)).not.toMatch(BANNED_WORDS);
  });

  it('bottom tabs open messages', async () => {
    const onOpenMessages = jest.fn();
    renderKit(<BottomTabs current="home" links={links} unread={0} onOpenMessages={onOpenMessages} />);
    await userEvent.click(screen.getByRole('button', { name: 'Messages' }));
    expect(onOpenMessages).toHaveBeenCalled();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
  });
});

describe('Toast', () => {
  it('shows a message and hides it after 4 s', () => {
    jest.useFakeTimers();
    const Trigger = () => { const show = useToast(); return <button type="button" onClick={() => show('Progress updated · 62 %')}>go</button>; };
    renderKit(<ToastProvider><Trigger /></ToastProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'go' }));
    expect(screen.getByText('Progress updated · 62 %')).toBeInTheDocument();
    act(() => { jest.advanceTimersByTime(4100); });
    expect(screen.queryByText('Progress updated · 62 %')).toBeNull();
    jest.useRealTimers();
  });
});

describe('accessibility (NFR-C4: axe, 0 violations)', () => {
  it.each(['en', 'th'])('all components in %s', async (locale) => {
    const { container } = renderKit(
      <main>
        <ClassroomHeader current="home" links={links} user={nok} unread={3} locale={locale} />
        <ContinueCard title="Infection Control 2026" href="/u3" unitIndex={3} unitCount={8} progress={62} />
        <RequiredGroup assignment={fx.overdueAssignment} courseHref={() => '/c'} />
        <RequiredGroup assignment={fx.dueSoonAssignment} courseHref={() => '/c'} />
        <RequiredGroup assignment={fx.completedAssignment} />
        <CourseCard title="Isolation Precautions" code="INF101" href="/h" state="in_progress" progress={40} ceHours={3} units={8} />
        <CertificateCard certificate={fx.roadmapCertificate} />
        <CertificateCard certificate={fx.revokedCertificate} />
        <HoursCard year={2026} earned={24} target={40} yearEnds="2026-12-31" />
        <Notice onRetry={() => {}}>Deadlines are not available right now.</Notice>
        <BottomTabs current="home" links={links} unread={3} />
      </main>,
      { locale },
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('GreetingBand (doc 04 §5.3)', () => {
  const summary = {
    overdue: 1, due_soon: 1, due_this_month: 2, ce_hours: 24, ce_target_hours: 40,
  };

  it('greets by Bangkok time and highlights overdue', () => {
    renderKit(<GreetingBand firstName="Nok" summary={summary} now={new Date('2026-11-04T02:00:00Z')} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Good morning, Nok' })).toBeInTheDocument();
    expect(screen.getByText('1 overdue')).toHaveClass('cls-greet__late');
    expect(screen.getByText('2 due this month')).toBeInTheDocument();
    expect(screen.getByText('24 / 40 CE hours')).toBeInTheDocument();
  });

  it('says "Nothing due" when everything is done, in Thai too', () => {
    renderKit(
      <GreetingBand
        firstName="นก"
        summary={{
          ...summary, overdue: 0, due_soon: 0, due_this_month: 0,
        }}
        now={new Date('2026-11-04T12:00:00Z')}
      />,
      { locale: 'th' },
    );
    expect(screen.getByRole('heading', { name: 'สวัสดีตอนเย็น คุณนก' })).toBeInTheDocument();
    expect(screen.getByText('ไม่มีงานค้าง เยี่ยมมาก')).toBeInTheDocument();
  });

  it('shows only the greeting when Portal data is missing (F-90 BR-3)', () => {
    const { container } = renderKit(<GreetingBand firstName="Nok" now={new Date('2026-11-04T08:00:00Z')} />);
    expect(screen.getByRole('heading', { name: 'Good afternoon, Nok' })).toBeInTheDocument();
    expect(container.querySelector('.cls-greet p')).toBeNull();
  });
});
