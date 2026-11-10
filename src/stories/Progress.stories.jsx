import { Page3, now } from './page3';
import { ProgressView } from '../index';
import { grades } from '../__fixtures__/classroom2';
import { dashboard } from '../__fixtures__/portal';

// Plan 5 S-103 Progress. Part 1 = CA-11 (streak in place of the weekly bars); Part 2 adds CA-16 weekly minutes.
const page = (locale, props) => (
  <Page3 current="progress" locale={locale}>
    <ProgressView dashboard={dashboard.data} now={now} {...props} />
  </Page3>
);

export default { title: 'Plan 5/Progress', parameters: { layout: 'fullscreen' } };

export const Part1 = { render: (_, { globals }) => page(globals.locale, {}) };
export const Part2 = { render: (_, { globals }) => page(globals.locale, { grades: grades.data, hoursGoal: 20 }) };
export const Loading = { render: (_, { globals }) => page(globals.locale, { status: 'loading' }) };
