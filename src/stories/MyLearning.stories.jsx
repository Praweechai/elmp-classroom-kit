import storyLogo from './logo';
import { ClassroomShell3, MyLearningView, kitLanguage } from '../index';
import {
  achievements, announcement, catalogue, compliance, learningTime,
} from '../__fixtures__/classroom2';
import { dashboard } from '../__fixtures__/portal';

// S-100 My Learning inside Shell 3. "Part 1" = CA-11 as live today (old daily streak); "V2" = kit 2.1 with CA-11
// `learning_time` (Today card, week streak) + CA-17 licence; "Part 2" adds CA-13/14/15; "Dark" = dark mode.
const now = new Date('2026-11-11T09:00:00+07:00');
const links = {
  home: '#home', courses: '#courses', grades: '#grades', progress: '#progress', certificates: '#certificates', signOut: '#out',
};
const nok = {
  name: 'Nok Srisuk', email: 'nok@missionhospital.example', position: 'Registered Nurse', department: 'ICU',
};
const v2 = { ...dashboard.data, learning_time: learningTime };

const page = (locale, viewProps, shellProps = {}) => (
  <ClassroomShell3
    current="home"
    title={kitLanguage(locale) === 'th' ? 'การเรียนของฉัน' : 'My Learning'}
    links={links}
    user={nok}
    locale={locale}
    logoUrl={storyLogo}
    display={{ theme: 'light' }}
    {...shellProps}
  >
    <MyLearningView dashboard={dashboard.data} firstName="Nok" now={now} {...viewProps} />
  </ClassroomShell3>
);

export default { title: 'Plan 5/My Learning', parameters: { layout: 'fullscreen' } };

export const Part1 = { render: (_, { globals }) => page(globals.locale, {}) };
export const V2 = { render: (_, { globals }) => page(globals.locale, { dashboard: v2, compliance: compliance.data }) };
export const Part2 = {
  render: (_, { globals }) => page(
    globals.locale,
    {
      dashboard: v2, compliance: compliance.data, catalogue: catalogue.data, achievements: achievements.data, achievementsHref: '#achievements',
    },
    { announcement: announcement.data },
  ),
};
export const Dark = {
  render: (_, { globals }) => page(globals.locale, { dashboard: v2, compliance: compliance.data }, { display: { theme: 'dark' } }),
};
export const Loading = { render: (_, { globals }) => page(globals.locale, { status: 'loading' }) };
export const PortalDown = { render: (_, { globals }) => page(globals.locale, { status: 'error', onRetry: () => {} }) };
