import PropTypes from 'prop-types';

// Paragon icons (Material Symbols set, doc 04 §4). Decorative unless a label is given.
const KitIcon = ({
  src: Src, size = 20, label, className,
}) => (
  <Src
    width={size}
    height={size}
    className={className}
    focusable="false"
    aria-hidden={label ? undefined : true}
    role={label ? 'img' : undefined}
    aria-label={label}
  />
);

KitIcon.propTypes = {
  src: PropTypes.elementType.isRequired,
  size: PropTypes.number,
  label: PropTypes.string,
  className: PropTypes.string,
};

export default KitIcon;
