import { screen } from '@testing-library/react';
import { axe } from 'jest-axe';

import { training } from '../__fixtures__/portal';
import { renderKit } from '../testUtils';
import CourseFinished, { nextRequiredCourse } from './CourseFinished';

describe('nextRequiredCourse', () => {
  it('picks the most urgent unfinished required course, never the current one', () => {
    const next = nextRequiredCourse(training.data, 'course-v1:MHB+INF101+2026');
    expect(next.course.course_key).toBe('course-v1:MHB+PSB101+2026');
    expect(next.assignment.id).toBe(42);
    expect(nextRequiredCourse(training.data, 'x').course.course_key).toBe('course-v1:MHB+INF101+2026');
    expect(nextRequiredCourse({ assignments: [] }, 'x')).toBeNull();
    expect(nextRequiredCourse(undefined, 'x')).toBeNull();
  });
});

describe('CourseFinished (S-77)', () => {
  it('celebrates with stats, certificate and the next course', async () => {
    const upNext = { ...nextRequiredCourse(training.data, 'course-v1:MHB+INF101+2026'), href: '/next' };
    const { container } = renderKit(
      <CourseFinished
        courseTitle="Isolation Precautions"
        grade={92}
        ceHours={3}
        finishedAt="2026-11-03T09:10:00+07:00"
        certificateHref="/cert"
        upNext={upNext}
        backHref="/learner-dashboard/"
        record="updated"
      />,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Isolation Precautions' })).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByText('3 h')).toBeInTheDocument();
    expect(screen.getByText('3 Nov 2026')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Your training record is up to date.');
    expect(screen.getByRole('link', { name: 'View certificate' })).toHaveAttribute('href', '/cert');
    expect(screen.getByText('Patient Safety Basics')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Start' })).toHaveAttribute('href', '/next');
    expect(screen.getByRole('link', { name: 'Back to My learning' })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('works with only a title, in Thai', async () => {
    const { container } = renderKit(<CourseFinished courseTitle="หลักสูตร" record="updating" />, { locale: 'th' });
    expect(screen.getByText('คุณเรียนจบแล้ว')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('กำลังอัปเดตประวัติการอบรมของคุณ…');
    expect(screen.queryByRole('link')).toBeNull();
    expect(await axe(container)).toHaveNoViolations();
  });
});
