import { screen } from '@testing-library/react';
import { axe } from 'jest-axe';

import { renderKit } from '../testUtils';
import CertificatePreview from './CertificatePreview';
import CourseHero from './CourseHero';

describe('CertificatePreview (S-75)', () => {
  it('shows a preview with the learner name before it is earned', async () => {
    const { container } = renderKit(<CertificatePreview courseTitle="Infection Control 2026" learnerName="Nok Srisuk" />);
    expect(screen.getByRole('heading', { name: 'Your certificate' })).toBeInTheDocument();
    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByText('Pass the course to get it with your name.')).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeNull();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('links to the real certificate once earned, in Thai', async () => {
    const { container } = renderKit(<CertificatePreview courseTitle="x" href="/certificates/abc" />, { locale: 'th' });
    expect(screen.queryByText('ตัวอย่าง')).toBeNull();
    expect(screen.getByRole('link', { name: 'ดูใบประกาศ' })).toHaveAttribute('href', '/certificates/abc');
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('CourseHero aside + phone bar', () => {
  it('puts the aside next to the hero and keeps one reachable main action', async () => {
    const { container } = renderKit(
      <CourseHero
        title="Infection Control 2026"
        progress={{
          percent: 10, done: 1, total: 8, href: '/go', action: 'resume',
        }}
        aside={<CertificatePreview courseTitle="Infection Control 2026" />}
      />,
    );
    expect(container.querySelector('.cls-hero--aside .cls-hero__aside')).not.toBeNull();
    expect(screen.getAllByRole('link', { name: 'Resume' })).toHaveLength(1);
    expect(container.querySelectorAll('a[href="/go"]')).toHaveLength(2);
    expect(await axe(container)).toHaveNoViolations();
  });
});
