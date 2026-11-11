import { Page3, now } from './page3';
import { ProgressView } from '../index';
import { compliance, grades, learningTime } from '../__fixtures__/classroom2';
import { dashboard } from '../__fixtures__/portal';

// S-103 Progress "Am I up to date?" (kit 2.1). Part 1 = CA-11 only (one Required training group, CA-16 bars when
// present); V2 = CA-17 groups + licence + CA-11 week; Dark = same in dark mode.
const v2 = { ...dashboard.data, learning_time: learningTime };
const page = (locale, props, display = { theme: 'light' }) => (
  <Page3 current="progress" locale={locale} display={display}>
    <ProgressView dashboard={dashboard.data} now={now} {...props} />
  </Page3>
);
const full = { dashboard: v2, compliance: compliance.data, jobTitle: 'Registered Nurse · ICU' };

export default { title: 'Plan 5/Progress', parameters: { layout: 'fullscreen' } };

export const Part1 = { render: (_, { globals }) => page(globals.locale, {}) };
export const Part2 = { render: (_, { globals }) => page(globals.locale, { grades: grades.data }) };
export const V2 = { render: (_, { globals }) => page(globals.locale, full) };
export const Dark = { render: (_, { globals }) => page(globals.locale, full, { theme: 'dark' }) };
export const Loading = { render: (_, { globals }) => page(globals.locale, { status: 'loading' }) };
