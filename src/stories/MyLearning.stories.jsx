import storyLogo from './logo';
import { ClassroomShell3, MyLearningView, kitLanguage } from '../index';
import { achievements, announcement, catalogue } from '../__fixtures__/classroom2';
import { dashboard } from '../__fixtures__/portal';

// Plan 5 S-100 My Learning inside Shell 3. "Part 1" = live data today (CA-11 only); "Part 2" adds CA-13/14/15.
const now = new Date('2026-11-10T09:00:00+07:00');
const links = {
  home: '#home', courses: '#courses', grades: '#grades', progress: '#progress', certificates: '#certificates', signOut: '#out',
};
const nok = {
  name: 'Nok Srisuk', email: 'nok@missionhospital.example', position: 'Registered Nurse', department: 'ICU',
};

const page = (locale, viewProps, shellProps = {}) => (
  <ClassroomShell3
    current="home"
    title={kitLanguage(locale) === 'th' ? 'การเรียนของฉัน' : 'My Learning'}
    links={links}
    user={nok}
    locale={locale}
    logoUrl={storyLogo}
    {...shellProps}
  >
    <MyLearningView dashboard={dashboard.data} firstName="Nok" now={now} {...viewProps} />
  </ClassroomShell3>
);

export default { title: 'Plan 5/My Learning', parameters: { layout: 'fullscreen' } };

export const Part1 = { render: (_, { globals }) => page(globals.locale, {}) };
export const Part2 = {
  render: (_, { globals }) => page(
    globals.locale,
    { catalogue: catalogue.data, achievements: achievements.data, achievementsHref: '#achievements' },
    { announcement: announcement.data },
  ),
};
export const Loading = { render: (_, { globals }) => page(globals.locale, { status: 'loading' }) };
export const PortalDown = { render: (_, { globals }) => page(globals.locale, { status: 'error', onRetry: () => {} }) };
