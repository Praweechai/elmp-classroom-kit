import PropTypes from 'prop-types';
import { WorkspacePremium } from '@openedx/paragon/icons';

import KitIcon from './KitIcon';

export const CATEGORIES = ['clinical', 'safety', 'compliance', 'soft', 'general'];

// Studio image, or a generated cover from the category colour + course code (F-92 BR-2).
const CourseCover = ({
  imageUrl, category, code, certificate = false, className = '', style,
}) => {
  const cat = CATEGORIES.includes(category) ? category : 'general';
  const generated = !imageUrl;
  return (
    <div
      className={`cls-cover ${generated ? `cls-cover--generated cls-cover--${cat}` : ''} ${className}`.trim()}
      style={generated ? style : { ...style, backgroundImage: `url("${imageUrl}")` }}
      aria-hidden="true"
    >
      {code && <span className="cls-code-chip">{code}</span>}
      {certificate && <span className="cls-cert-flag"><KitIcon src={WorkspacePremium} size={18} /></span>}
    </div>
  );
};

CourseCover.propTypes = {
  imageUrl: PropTypes.string,
  category: PropTypes.string,
  code: PropTypes.string,
  certificate: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.shape({}),
};

export default CourseCover;
