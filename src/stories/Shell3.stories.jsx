import storyLogo from './logo';
import { ClassroomShell3, kitLanguage } from '../index';
import { announcement, catalogue } from '../__fixtures__/classroom2';

// Plan 5 Shell 3 (S-100…S-105 frame). Page content comes in P5-2.02/2.03.
const links = {
  home: '#home',
  courses: '#courses',
  grades: '#grades',
  progress: '#progress',
  certificates: '#certificates',
  account: '#account',
  signOut: '#sign-out',
  privacy: '#privacy',
  accessibility: '#accessibility',
};
const nok = {
  name: 'Nok Srisuk', email: 'nok@missionhospital.example', position: 'Registered Nurse', department: 'ICU',
};

const frame = (locale, extra = {}) => {
  const lang = kitLanguage(locale);
  const categories = catalogue.meta.categories.map((c) => ({ label: c[lang], href: `#courses?category=${c.key}` }));
  const searchItems = catalogue.data.map((c) => ({ label: c.title[lang], href: `#${c.code}` }))
    .concat([{ label: 'How to download a certificate', href: '#help-cert' }]);
  return (
    <ClassroomShell3
      current="home"
      title={lang === 'th' ? 'การเรียนของฉัน' : 'My Learning'}
      links={links}
      user={nok}
      locale={locale}
      logoUrl={storyLogo}
      announcement={announcement.data}
      categories={categories}
      searchItems={searchItems}
      helpItems={[{ label: 'Help centre', href: '#help' }, { label: 'Contact HR training', href: '#hr' }]}
      {...extra}
    >
      <div className="cls-panel" style={{ minHeight: 320 }}>Page content (My Learning comes in P5-2.02)</div>
    </ClassroomShell3>
  );
};

export default { title: 'Plan 5/Shell 3', parameters: { layout: 'fullscreen' } };

export const Desktop = { render: (_, { globals }) => frame(globals.locale) };
export const NoBannerNoSearch = {
  render: (_, { globals }) => frame(globals.locale, { announcement: null, searchItems: undefined, categories: [] }),
};
export const UrgentBanner = {
  render: (_, { globals }) => frame(globals.locale, { announcement: { ...announcement.data, id: 99, tone: 'urgent' } }),
};
export const Phone = {
  render: (_, { globals }) => frame(globals.locale),
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
