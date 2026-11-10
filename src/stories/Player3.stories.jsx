import storyLogo from './logo';
import { PlayerLayout3 } from '../index';
import { outline } from '../__fixtures__/portal';

// Plan 5 S-105 Course player 3. The grey box stands in for the lesson iframe.
const resources = [
  { title: 'WHO hand hygiene poster', href: '#poster', type: 'PDF · 1 page' },
  { title: 'Isolation signs checklist', href: '#checklist', type: 'PDF · 2 pages' },
];
const Lesson = () => (
  <div style={{ padding: 24, minHeight: 360 }}>
    <p>Contact precautions protect patients and staff from germs spread by touch.</p>
  </div>
);
const player = (locale, props = {}) => (
  <PlayerLayout3
    courseTitle="Infection Control & Hand Hygiene"
    backHref="#home"
    logoUrl={storyLogo}
    sections={outline}
    resources={resources}
    progress={43}
    locale={locale}
    onLocaleChange={() => {}}
    {...props}
  >
    <Lesson />
  </PlayerLayout3>
);

export default { title: 'Plan 5/Player', parameters: { layout: 'fullscreen' } };

export const Default = { render: (_, { globals }) => player(globals.locale, { initialDisplay: {} }) };
export const Dark = {
  render: (_, { globals }) => player(globals.locale, { initialDisplay: { theme: 'dark', textScale: 120 } }),
};
export const NoResources = { render: (_, { globals }) => player(globals.locale, { resources: [], initialDisplay: {} }) };
