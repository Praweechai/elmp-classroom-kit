import { Page3 } from './page3';
import { GradesView } from '../index';
import { grades } from '../__fixtures__/classroom2';
import { dashboard } from '../__fixtures__/portal';

// S-102 Grades rows (kit 2.1). Part 1 = CA-11 only; Part 2 = CA-16 dates, best scores and Details; Dark.
const page = (locale, props, display = { theme: 'light' }) => (
  <Page3 current="grades" locale={locale} display={display}>
    <GradesView dashboard={dashboard.data} {...props} />
  </Page3>
);

export default { title: 'Plan 5/Grades', parameters: { layout: 'fullscreen' } };

export const Part1 = { render: (_, { globals }) => page(globals.locale, {}) };
export const Part2 = { render: (_, { globals }) => page(globals.locale, { grades: grades.data }) };
export const Dark = { render: (_, { globals }) => page(globals.locale, { grades: grades.data }, { theme: 'dark' }) };
export const PortalDown = { render: (_, { globals }) => page(globals.locale, { status: 'error', onRetry: () => {} }) };
