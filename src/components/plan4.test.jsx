import { screen } from '@testing-library/react';
import { axe } from 'jest-axe';

import * as fx from '../__fixtures__/portal';
import { renderKit } from '../testUtils';
import CertificateCard from './CertificateCard';
import CourseCard from './CourseCard';
import { BottomTabs, ClassroomHeader } from './Header';
import RequiredGroup from './RequiredGroup';

// Plan 4 P4-2.02 (F-111 "Almost done") and P4-2.03 (F-112 CE hours switch).

const base = {
  title: 'Isolation Precautions', code: 'INF101', category: 'clinical', href: '/home', resumeHref: '/resume', units: 7,
};

describe('CourseCard — Almost done (F-111)', () => {
  it('passed by quiz but units left: Continue, never 100 %, "2 units left"', () => {
    renderKit(<CourseCard {...base} state="almost" unitsDone={5} progress={100} />);
    expect(screen.getByRole('link', { name: 'Continue: Isolation Precautions' })).toHaveAttribute('href', '/resume');
    expect(screen.getByText('Almost done — 2 units left')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '99');
  });

  it('Thai', () => {
    renderKit(<CourseCard {...base} state="almost" unitsDone={6} progress={85} />, { locale: 'th' });
    expect(screen.getByText('ใกล้เสร็จ — เหลืออีก 1 บท')).toBeInTheDocument();
  });

  it('units unknown → plain "Almost done"; no axe violations', async () => {
    const { container } = renderKit(<CourseCard {...base} units={undefined} state="almost" progress={80} />);
    expect(screen.getByText('Almost done')).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('RequiredGroup — Portal learner_status (F-111)', () => {
  const withCourse = (extra) => ({
    ...fx.overdueAssignment,
    courses: [{ ...fx.overdueAssignment.courses[0], ...extra }],
  });

  it('shows "Almost done — n units left" for a passed course with units missing', () => {
    renderKit(<RequiredGroup assignment={withCourse({
      status: 'passed', learner_status: 'almost', units_left: 2, progress_percent: 71,
    })}
    />);
    expect(screen.getByText('Almost done — 2 units left')).toBeInTheDocument();
    expect(screen.queryByText('Passed')).not.toBeInTheDocument();
  });

  it('shows Completed when the Portal says completed', () => {
    renderKit(<RequiredGroup assignment={withCourse({ status: 'passed', learner_status: 'completed' })} />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('older Portal (no learner_status) keeps the Plan 3 label', () => {
    renderKit(<RequiredGroup assignment={withCourse({ status: 'passed' })} />);
    expect(screen.getByText('Passed')).toBeInTheDocument();
  });

  it('no CE line when the Portal sends no CE hours (switch off)', () => {
    renderKit(<RequiredGroup assignment={withCourse({ ce_hours: null })} />);
    expect(screen.queryByText(/CE hours/)).not.toBeInTheDocument();
  });
});

describe('Header without CE hours (F-112)', () => {
  const links = { home: '/learner-dashboard/', certificates: '/learner-dashboard/certificates' };

  it('has no CE hours tab in the header or the bottom tabs', () => {
    renderKit(
      <>
        <ClassroomHeader current="home" links={links} user={{ name: 'Nok' }} locale="en" />
        <BottomTabs current="home" links={links} />
      </>,
    );
    expect(screen.queryByRole('link', { name: /CE hours/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^Hours$/ })).not.toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Certificates' })).toHaveLength(2);
  });
});

describe('CertificateCard — Portal course certificate (F-113)', () => {
  it('a course certificate with a code downloads our PDF and shows the code', async () => {
    const onDownload = jest.fn();
    renderKit(<CertificateCard
      certificate={{
        kind: 'course', code: 'ELMP-2026-DDDD-4444', title: { en: 'Course INF101', th: 'Course INF101' }, issued_at: '2026-11-06T10:00:00+07:00',
      }}
      onDownload={onDownload}
    />);
    expect(screen.getByText('ELMP-2026-DDDD-4444')).toBeInTheDocument();
    screen.getByRole('button', { name: 'Download PDF' }).click();
    expect(onDownload).toHaveBeenCalled();
  });

  it('an old Open edX course link (no code) still opens the link', () => {
    renderKit(<CertificateCard certificate={{ kind: 'course', title: 'Course A', url: 'https://x/cert' }} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://x/cert');
  });
});
