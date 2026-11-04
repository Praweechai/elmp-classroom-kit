import { useState } from 'react';
import PropTypes from 'prop-types';
import { ContentCopy, WorkspacePremium } from '@openedx/paragon/icons';

import {
  formatDate, localized, messages, useClassroomIntl,
} from '../i18n';
import KitIcon from './KitIcon';

// Roadmap or course certificate (doc 04 §5.9, F-96). Takes a CA-07 item.
const CertificateCard = ({
  certificate, onDownload, onCopied, headingLevel = 3,
}) => {
  const Heading = `h${headingLevel}`;
  const intl = useClassroomIntl();
  const { locale } = intl;
  const [busy, setBusy] = useState(false);
  const revoked = Boolean(certificate.revoked_at);
  const roadmap = certificate.kind === 'roadmap';
  const title = localized(certificate.title, locale);

  const download = async () => {
    setBusy(true);
    try { await onDownload?.(certificate); } finally { setBusy(false); }
  };
  const copy = async () => {
    await navigator.clipboard?.writeText(certificate.code);
    onCopied?.(certificate);
  };

  return (
    <article className={`cls-cert${revoked ? ' cls-cert--revoked' : ''}`} id={certificate.code ? `cert-${certificate.code}` : undefined}>
      <span className="cls-cert__seal" aria-hidden="true"><KitIcon src={WorkspacePremium} size={22} /></span>
      <div>
        <p className="cls-cert__type">{intl.formatMessage(roadmap ? messages.certificateRoadmap : messages.certificateCourse)}</p>
        <Heading className="cls-cert__title">{title}</Heading>
        <p className="cls-cert__date">
          {revoked
            ? intl.formatMessage(messages.certificateRevoked, { date: formatDate(certificate.revoked_at, locale) })
            : intl.formatMessage(messages.certificateIssued, { date: formatDate(certificate.issued_at, locale) })}
        </p>
      </div>
      {roadmap && certificate.code && (
        <p className="cls-cert__code">
          <span className="cls-sr">{intl.formatMessage(messages.certificateCode)}: </span>
          {revoked ? <s>{certificate.code}</s> : certificate.code}
          {!revoked && (
            <button
              type="button"
              className="cls-icon-btn"
              onClick={copy}
              aria-label={intl.formatMessage(messages.copyCode, { code: certificate.code })}
            >
              <KitIcon src={ContentCopy} size={16} />
            </button>
          )}
        </p>
      )}
      {!revoked && (
        <div className="cls-cert__acts">
          {roadmap ? (
            <button
              type="button"
              className="cls-btn cls-btn--primary cls-btn--sm"
              onClick={download}
              aria-busy={busy}
              disabled={busy}
            >
              {intl.formatMessage(messages.certificateDownload)}
            </button>
          ) : (
            <a className="cls-btn cls-btn--secondary cls-btn--sm" href={certificate.url} target="_blank" rel="noopener noreferrer">
              {intl.formatMessage(messages.certificateView)}
            </a>
          )}
        </div>
      )}
    </article>
  );
};

CertificateCard.propTypes = {
  certificate: PropTypes.shape({
    kind: PropTypes.oneOf(['roadmap', 'course']).isRequired,
    code: PropTypes.string,
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})]).isRequired,
    issued_at: PropTypes.string,
    revoked_at: PropTypes.string,
    url: PropTypes.string,
  }).isRequired,
  onDownload: PropTypes.func,
  onCopied: PropTypes.func,
  headingLevel: PropTypes.oneOf([2, 3]),
};

export default CertificateCard;
