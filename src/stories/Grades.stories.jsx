import { Page3 } from './page3';
import { GradesView } from '../index';
import { grades } from '../__fixtures__/classroom2';
import { dashboard } from '../__fixtures__/portal';

// Plan 5 S-102 Grades. Part 1 = CA-11 course table; Part 2 = CA-16 one table card per course.
const page = (locale, props) => (
  <Page3 current="grades" locale={locale}>
    <GradesView dashboard={dashboard.data} {...props} />
  </Page3>
);

export default { title: 'Plan 5/Grades', parameters: { layout: 'fullscreen' } };

export const Part1 = { render: (_, { globals }) => page(globals.locale, {}) };
export const Part2 = { render: (_, { globals }) => page(globals.locale, { grades: grades.data }) };
export const PortalDown = { render: (_, { globals }) => page(globals.locale, { status: 'error', onRetry: () => {} }) };
