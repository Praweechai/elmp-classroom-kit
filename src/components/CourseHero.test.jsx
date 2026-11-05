import { screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Schedule } from '@openedx/paragon/icons';

import { courseContext } from '../__fixtures__/portal';
import { renderKit } from '../testUtils';
import CourseHero from './CourseHero';

const props = {
  title: 'Infection Control 2026',
  code: 'INF101',
  description: 'Protect patients and yourself with hand hygiene and PPE.',
  backHref: '/learner-dashboard/',
  facts: [{ icon: Schedule, value: '4 h', label: 'Duration' }],
  requiredBy: courseContext.required_by,
  progress: {
    percent: 62, done: 5, total: 8, href: '/course/x/s/u', action: 'resume',
  },
};

describe('CourseHero (S-75)', () => {
  it('shows the course, the required banner and the resume action', async () => {
    const { container } = renderKit(<CourseHero {...props} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Infection Control 2026' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'My learning' })).toHaveAttribute('href', '/learner-dashboard/');
    expect(screen.getByText('Required for Annual Infection Control 2026')).toBeInTheDocument();
    expect(screen.getByText(/3 days late/)).toBeInTheDocument();
    expect(screen.getByText('Overdue')).toBeInTheDocument();
    expect(screen.getByText('5 of 8 done')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '62');
    expect(screen.getByRole('link', { name: 'Resume' })).toHaveAttribute('href', '/course/x/s/u');
    expect(await axe(container)).toHaveNoViolations();
  });

  it('leaves out what is not there and speaks Thai', async () => {
    const { container } = renderKit(
      <CourseHero
        title="ความปลอดภัยของผู้ป่วย"
        requiredBy={[{ ...courseContext.required_by[0], status: 'completed' }]}
        progress={{
          percent: 0, done: 0, total: 6, href: '#', action: 'start',
        }}
      />,
      { locale: 'th' },
    );
    expect(screen.queryByText(/หลักสูตรบังคับของ/)).toBeNull();
    expect(screen.queryByRole('link', { name: 'การเรียนของฉัน' })).toBeNull();
    expect(screen.getByText('เรียนแล้ว 0 จาก 6')).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
