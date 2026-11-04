import { createContext, forwardRef, useContext } from 'react';
import PropTypes from 'prop-types';

// Forks can provide their router's Link (props: href, ...); default is a plain anchor.
const PlainLink = forwardRef(({ href, children, ...rest }, ref) => <a ref={ref} href={href} {...rest}>{children}</a>);
PlainLink.displayName = 'PlainLink';
PlainLink.propTypes = { href: PropTypes.string, children: PropTypes.node };

export const LinkContext = createContext(PlainLink);
export const useLinkComponent = () => useContext(LinkContext);
export { PlainLink };
