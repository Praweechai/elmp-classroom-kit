import PropTypes from 'prop-types';

// Plan 5 page strip (NetAcad arrangement): big page name + one line under it, on Courses, Grades, Progress,
// Certificates. The Shell 3 top bar already holds the page <h1>, so the strip title is an <h2>.
const PageStrip = ({ title, children, id }) => (
  <section className="cls3-strip" aria-labelledby={id}>
    <h2 id={id} className="cls3-strip__title">{title}</h2>
    {children && <p>{children}</p>}
  </section>
);

PageStrip.propTypes = {
  title: PropTypes.node.isRequired,
  children: PropTypes.node,
  id: PropTypes.string.isRequired,
};

export default PageStrip;
