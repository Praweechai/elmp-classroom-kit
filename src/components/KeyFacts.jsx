import PropTypes from 'prop-types';

import KitIcon from './KitIcon';

// Key-facts row on the course home (doc 04 §5.10, R-11 P-5).
const KeyFacts = ({ facts }) => (
  <ul className="cls-facts">
    {facts.map(({
      icon, value, label, overdue,
    }) => (
      <li key={label} className={`cls-fact${overdue ? ' cls-fact--overdue' : ''}`}>
        <span className="cls-fact__tile"><KitIcon src={icon} size={20} /></span>
        <span><b>{value}</b><span>{label}</span></span>
      </li>
    ))}
  </ul>
);

KeyFacts.propTypes = {
  facts: PropTypes.arrayOf(PropTypes.shape({
    icon: PropTypes.elementType.isRequired,
    value: PropTypes.node.isRequired,
    label: PropTypes.string.isRequired,
    overdue: PropTypes.bool,
  })).isRequired,
};

export default KeyFacts;
