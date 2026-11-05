import { fireEvent, screen } from '@testing-library/react';
import { axe } from 'jest-axe';

import { outline } from '../__fixtures__/portal';
import { renderKit } from '../testUtils';
import CourseOutline, { OutlineDrawer } from './CourseOutline';

describe('CourseOutline (doc 04 §5.11)', () => {
  it('opens the section with the current item and marks where the learner is', async () => {
    const { container } = renderKit(<CourseOutline title="Course outline" sections={outline} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Course outline' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /1\. Why hand hygiene matters/ })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: /2\. Isolation precautions/ })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('1 / 3 done')).toBeInTheDocument();
    const current = screen.getByRole('link', { name: /Contact precautions ?, not done yet, you are here/ });
    expect(current).toHaveAttribute('aria-current', 'location');
    expect(current).toHaveAttribute('href', '#q4');
    expect(await axe(container)).toHaveNoViolations();
  });

  it('toggles one section and all sections; locked items are not links', () => {
    renderKit(<CourseOutline sections={outline} />);
    const first = screen.getByRole('button', { name: /1\. Why hand hygiene matters/ });
    fireEvent.click(first);
    expect(first).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: /The 5 moments ?, completed/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Expand all' }));
    expect(screen.getByText(/Final quiz/).closest('a')).toBeNull();
    expect(screen.getByText(/Final quiz/)).toHaveTextContent('locked');
    fireEvent.click(screen.getByRole('button', { name: 'Collapse all' }));
    expect(first).toHaveAttribute('aria-expanded', 'false');
  });

  it('speaks Thai and reports navigation in the drawer', async () => {
    const onNavigate = jest.fn();
    const { container } = renderKit(
      <CourseOutline sections={outline} variant="drawer" showExpandAll={false} onNavigate={onNavigate} />,
      { locale: 'th' },
    );
    expect(screen.getByRole('region', { name: 'เนื้อหาหลักสูตร' })).toBeInTheDocument();
    expect(screen.getByText('เสร็จ 1 / 3')).toBeInTheDocument();
    expect(screen.getByText('7 นาที')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'เปิดทั้งหมด' })).toBeNull();
    fireEvent.click(screen.getByRole('link', { name: /Contact precautions/ }));
    expect(onNavigate).toHaveBeenCalledWith(expect.objectContaining({ id: 'q4' }), expect.anything());
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('OutlineDrawer (S-76)', () => {
  it('has a titled navigation landmark, closes with the button and with Esc as a sheet', async () => {
    const onClose = jest.fn();
    const { container } = renderKit(<OutlineDrawer sections={outline} onClose={onClose} overlay />);
    expect(screen.getByRole('navigation', { name: 'Course outline' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close course outline' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
    expect(await axe(container)).toHaveNoViolations();
  });
});
