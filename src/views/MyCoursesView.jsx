import { useState } from 'react';
import PropTypes from 'prop-types';
import { Search } from '@openedx/paragon/icons';

import { messages, useClassroomIntl } from '../i18n';
import CourseTable, { COURSE_FILTERS, CourseFilters } from '../components/CourseTable';
import { Notice, Skeleton } from '../components/Feedback';
import KitIcon from '../components/KitIcon';

// S-91 My courses (F-115): the full course table with search and filter chips.
const MyCoursesView = ({ courses = [], status = 'ready', onRetry }) => {
  const intl = useClassroomIntl();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const counts = Object.fromEntries(Object.entries(COURSE_FILTERS).map(([k, f]) => [k, courses.filter(f).length]));
  const label = intl.formatMessage(messages.searchCourses);
  return (
    <div className="cls-dash cls-dash--single">
      <section className="cls-dcard cls-dash__full" aria-labelledby="cls-courses-title">
        <div className="cls-dcard__head">
          <div>
            <h2 id="cls-courses-title">{intl.formatMessage(messages.dashCourses, { n: courses.length })}</h2>
            <p>{intl.formatMessage(messages.coursesPageIntro)}</p>
          </div>
        </div>
        {status === 'error' && <Notice onRetry={onRetry}>{intl.formatMessage(messages.unavailable)}</Notice>}
        {status === 'loading' && <Skeleton height={320} radius={12} />}
        {status === 'ready' && (
          <>
            <div className="cls-coursebar">
              <div className="cls-search">
                <KitIcon src={Search} size={20} />
                <input
                  type="search"
                  value={search}
                  placeholder={label}
                  aria-label={label}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <CourseFilters value={filter} onChange={setFilter} counts={counts} />
            </div>
            <CourseTable courses={courses} filter={filter} search={search} caption={label} />
          </>
        )}
      </section>
    </div>
  );
};

MyCoursesView.propTypes = {
  courses: PropTypes.arrayOf(PropTypes.shape({})),
  status: PropTypes.oneOf(['loading', 'ready', 'error']),
  onRetry: PropTypes.func,
};

export default MyCoursesView;
