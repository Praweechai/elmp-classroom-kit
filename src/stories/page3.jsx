import PropTypes from 'prop-types';

import storyLogo from './logo';
import { ClassroomShell3, kitLanguage } from '../index';

// Shared Shell 3 frame for the Plan 5 page stories (S-101…S-104).
export const now = new Date('2026-11-10T09:00:00+07:00');
const links = {
  home: '#home', courses: '#courses', grades: '#grades', progress: '#progress', certificates: '#certificates', signOut: '#out',
};
const nok = {
  name: 'Nok Srisuk', email: 'nok@missionhospital.example', position: 'Registered Nurse', department: 'ICU',
};
const TITLES = {
  courses: ['Courses', 'หลักสูตร'],
  grades: ['Grades', 'ผลคะแนน'],
  progress: ['Progress', 'ความก้าวหน้า'],
  certificates: ['Certificates', 'ใบประกาศ'],
};

export const Page3 = ({ current, locale, children }) => (
  <ClassroomShell3
    current={current}
    title={TITLES[current][kitLanguage(locale) === 'th' ? 1 : 0]}
    links={links}
    user={nok}
    locale={locale}
    logoUrl={storyLogo}
  >
    {children}
  </ClassroomShell3>
);

Page3.propTypes = {
  current: PropTypes.oneOf(Object.keys(TITLES)).isRequired,
  locale: PropTypes.string,
  children: PropTypes.node,
};
