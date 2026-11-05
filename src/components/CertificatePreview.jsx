import PropTypes from 'prop-types';
import { WorkspacePremium } from '@openedx/paragon/icons';

import { messages, useClassroomIntl } from '../i18n';
import KitIcon from './KitIcon';
import { useLinkComponent } from './LinkContext';

// S-75 "Your certificate" (doc 04 §6.5): a small certificate with the learner's name. Before it is
// earned it carries a "Preview" ribbon and one line on how to get it; after, a link to the real one.
const CertificatePreview = ({
  courseTitle, learnerName, href, headingLevel = 2,
}) => {
  const intl = useClassroomIntl();
  const Link = useLinkComponent();
  const Heading = `h${headingLevel}`;
  const earned = Boolean(href);
  return (
    <section className="cls-certprev" aria-labelledby="cls-certprev-title">
      <Heading id="cls-certprev-title" className="cls-certprev__title">{intl.formatMessage(messages.certPreviewTitle)}</Heading>
      <div className="cls-certprev__paper" aria-hidden="true">
        {!earned && <span className="cls-certprev__ribbon">{intl.formatMessage(messages.certPreviewBadge)}</span>}
        <span className="cls-certprev__seal"><KitIcon src={WorkspacePremium} size={18} /></span>
        <span className="cls-certprev__kind">{intl.formatMessage(messages.certPreviewKind)}</span>
        {learnerName && <span className="cls-certprev__name">{learnerName}</span>}
        <span className="cls-certprev__course">{courseTitle}</span>
      </div>
      {earned ? (
        <Link className="cls-btn cls-btn--secondary cls-btn--sm" href={href}>{intl.formatMessage(messages.viewCertificate)}</Link>
      ) : (
        <p className="cls-certprev__note">{intl.formatMessage(messages.certPreviewNote)}</p>
      )}
    </section>
  );
};

CertificatePreview.propTypes = {
  courseTitle: PropTypes.string.isRequired,
  learnerName: PropTypes.string,
  href: PropTypes.string,
  headingLevel: PropTypes.number,
};

export default CertificatePreview;
