import { screen } from '@testing-library/react';
import { axe } from 'jest-axe';

import { renderKit } from '../testUtils';
import { PlayerTopBar, UnitTitle } from './Player';

describe('PlayerTopBar (doc 04 §5.12)', () => {
  const props = {
    courseTitle: 'Infection Control 2026', courseHref: '/learning/course/x/home', unitIndex: 4, unitCount: 8, progress: 62,
  };

  it('links back to the course page and shows unit position and course progress', async () => {
    const onToggle = jest.fn();
    const { container } = renderKit(<PlayerTopBar {...props} onToggleOutline={onToggle} />);
    expect(screen.getByRole('link', { name: 'Back to the course page' })).toHaveAttribute('href', '/learning/course/x/home');
    expect(screen.getByText('Unit 4 of 8')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Course progress' })).toHaveAttribute('aria-valuenow', '62');
    screen.getByRole('button', { name: 'Course outline' }).click();
    expect(onToggle).toHaveBeenCalled();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('hides what it does not know, in Thai', async () => {
    const { container } = renderKit(<PlayerTopBar courseTitle="ความปลอดภัยของผู้ป่วย" courseHref="#" />, { locale: 'th' });
    expect(screen.getByRole('link', { name: 'กลับไปหน้าหลักสูตร' })).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('UnitTitle', () => {
  it('is the page heading with the section above it', () => {
    renderKit(<UnitTitle title="Contact precautions" section="2. Isolation precautions" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Contact precautions' })).toBeInTheDocument();
    expect(screen.getByText('2. Isolation precautions')).toBeInTheDocument();
  });
});
