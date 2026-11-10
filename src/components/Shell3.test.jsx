import { fireEvent, screen } from '@testing-library/react';
import { axe } from 'jest-axe';

import { announcement } from '../__fixtures__/classroom2';
import { BANNED_WORDS, renderKit, visibleWords } from '../testUtils';
import { ClassroomShell3 } from './Shell3';

// Plan 5 P5-2.01 — Shell 3 (D-73…D-77).

const links = {
  home: '/', courses: '/courses', grades: '/grades', progress: '/progress', certificates: '/certificates', account: '/account', signOut: '/logout',
};
const nok = { name: 'Nok Srisuk', email: 'nok@missionhospital.example', position: 'Registered Nurse' };
const searchItems = [
  { label: 'Patient Safety Basics', href: '/c/psb101' },
  { label: 'Hospital Regulations', href: '/c/reg101' },
  { label: 'How to download a certificate', href: '/help/cert' },
];
const shell = (props = {}, locale = 'en') => renderKit(
  <ClassroomShell3
    current="grades"
    title="Grades"
    links={links}
    user={nok}
    locale={locale}
    announcement={announcement.data}
    categories={[{ label: 'Compliance', href: '/courses?category=compliance' }]}
    searchItems={searchItems}
    helpItems={[{ label: 'Help centre', href: '/help' }]}
    {...props}
  >
    <p>page</p>
  </ClassroomShell3>,
  { locale },
);

beforeEach(() => { window.sessionStorage.clear(); window.localStorage.clear(); });

describe('ClassroomShell3', () => {
  it('sidebar + phone tabs list the five pages, current page marked; no axe violations', async () => {
    const { container } = shell();
    const side = screen.getByRole('navigation', { name: 'Main menu' });
    ['My Learning', 'Courses', 'Grades', 'Progress', 'Certificates'].forEach((name) => {
      expect(side.querySelector(`a[title="${name}"]`)).not.toBeNull();
    });
    expect(side.querySelector('a[title="Grades"]')).toHaveAttribute('aria-current', 'page');
    const tabs = screen.getByRole('navigation', { name: 'Classroom tabs' });
    expect(tabs.querySelectorAll('a')).toHaveLength(5);
    expect(screen.getByRole('heading', { level: 1, name: 'Grades' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveTextContent('page');
    expect(await axe(container)).toHaveNoViolations();
  });

  it('CE hours link only when switched on (F-112)', () => {
    shell({ links: { ...links, hours: '/hours' } });
    expect(screen.getByRole('navigation', { name: 'Main menu' }).querySelector('a[href="/hours"]')).not.toBeNull();
  });

  it('banner shows CA-14 text + link and stays closed after dismiss', () => {
    const { unmount } = shell();
    expect(screen.getByRole('region', { name: 'Announcement' })).toHaveTextContent('Annual Infection Control');
    expect(screen.getByRole('link', { name: 'Open INF101' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss announcement' }));
    expect(screen.queryByRole('region', { name: 'Announcement' })).toBeNull();
    unmount();
    shell();
    expect(screen.queryByRole('region', { name: 'Announcement' })).toBeNull();
  });

  it('no announcement → no banner; no searchItems → no search box', () => {
    shell({ announcement: null, searchItems: undefined });
    expect(screen.queryByRole('region', { name: 'Announcement' })).toBeNull();
    expect(screen.queryByRole('search')).toBeNull();
  });

  it('search filters suggestions; Enter calls onSearch', () => {
    const onSearch = jest.fn();
    shell({ onSearch });
    const box = screen.getByRole('combobox', { name: 'Search courses and help' });
    fireEvent.change(box, { target: { value: 'safety' } });
    expect(screen.getByRole('link', { name: 'Patient Safety Basics' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Hospital Regulations' })).toBeNull();
    fireEvent.change(box, { target: { value: 'zzz' } });
    expect(screen.getByText('No suggestions')).toBeInTheDocument();
    fireEvent.submit(screen.getByRole('search'));
    expect(onSearch).toHaveBeenCalledWith('zzz');
  });

  it('Explore lists categories + All courses; Esc closes', () => {
    shell();
    const btn = screen.getByRole('button', { name: /Explore/ });
    fireEvent.click(btn);
    expect(screen.getByRole('link', { name: 'Compliance' })).toHaveAttribute('href', '/courses?category=compliance');
    expect(screen.getByRole('link', { name: 'All courses' })).toHaveAttribute('href', '/courses');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('link', { name: 'Compliance' })).toBeNull();
    expect(btn).toHaveFocus();
  });

  it('language menu switches EN → TH', () => {
    const onLocaleChange = jest.fn();
    shell({ onLocaleChange });
    fireEvent.click(screen.getByRole('button', { name: 'Choose language' }));
    fireEvent.click(screen.getByRole('option', { name: 'ไทย (Thai)' }));
    expect(onLocaleChange).toHaveBeenCalledWith('th');
  });

  it('profile menu: e-mail, profile link, sign out', () => {
    shell();
    fireEvent.click(screen.getByRole('button', { name: 'Account menu for Nok Srisuk' }));
    expect(screen.getByText('nok@missionhospital.example')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'My profile' })).toHaveAttribute('href', '/account');
    expect(screen.getByRole('menuitem', { name: 'Sign out' })).toHaveAttribute('href', '/logout');
  });

  it('sidebar collapse is remembered', () => {
    const { container } = shell();
    fireEvent.click(screen.getByRole('button', { name: 'Collapse menu' }));
    expect(container.querySelector('.cls3-shell')).toHaveAttribute('data-sidebar', 'collapsed');
    expect(window.localStorage.getItem('elmp.sidebar')).toBe('collapsed');
  });

  it('Thai: page names, banner in Thai, no platform words', () => {
    const { container } = shell({}, 'th');
    expect(screen.getByRole('navigation', { name: 'เมนูหลัก' }).querySelector('a[title="ผลคะแนน"]')).not.toBeNull();
    expect(screen.getByRole('link', { name: 'เปิด INF101' })).toBeInTheDocument();
    expect(visibleWords(container)).not.toMatch(BANNED_WORDS);
  });
});
