import { Page3, now } from './page3';
import { CoursesView } from '../index';
import { catalogue } from '../__fixtures__/classroom2';
import { dashboard } from '../__fixtures__/portal';

// Plan 5 S-101 Courses. Part 1 = CA-11 courses; Part 2 = CA-15 catalogue (open courses, covers, hours).
const page = (locale, props) => (
  <Page3 current="courses" locale={locale}>
    <CoursesView dashboard={dashboard.data} now={now} {...props} />
  </Page3>
);

export default { title: 'Plan 5/Courses', parameters: { layout: 'fullscreen' } };

export const Part1 = { render: (_, { globals }) => page(globals.locale, {}) };
export const Part2 = { render: (_, { globals }) => page(globals.locale, { catalogue: catalogue.data }) };
export const NoMatch = { render: (_, { globals }) => page(globals.locale, { initialQuery: 'zzz' }) };
export const Loading = { render: (_, { globals }) => page(globals.locale, { status: 'loading' }) };
