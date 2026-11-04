import { useState } from 'react';
import PropTypes from 'prop-types';

import { messages, useClassroomIntl } from '../i18n';
import CertificateCard from '../components/CertificateCard';
import { EmptyState, Notice, Skeleton } from '../components/Feedback';
import { NO_ACCESS } from './HomeView';

const FILTERS = [[null, messages.filterAll], ['roadmap', messages.filterRoadmap], ['course', messages.filterCourse]];

// S-72 Certificates (doc 04 §6.3, F-96). Items = CA-07 `data[]` (newest first from the Portal).
const CertificatesView = ({
  items = [], status = 'loading', error, onDownload, onCopied, onRetry,
}) => {
  const intl = useClassroomIntl();
  const [kind, setKind] = useState(null);
  const shown = kind ? items.filter((c) => c.kind === kind) : items;
  const code = status === 'error' ? (error?.code || 'unavailable') : null;

  return (
    <main className="cls-page cls-root" id="main-content">
      <header className="cls-page-head">
        <h1>{intl.formatMessage(messages.certificatesTitle)}</h1>
        <p>{intl.formatMessage(messages.certificatesIntro)}</p>
      </header>
      {code && NO_ACCESS.includes(code) && (
        <section className="cls-panel cls-noaccess" role="status">
          <h2>{intl.formatMessage(messages.noAccessTitle)}</h2>
          <p>{intl.formatMessage(messages.noAccess)}</p>
        </section>
      )}
      {code && !NO_ACCESS.includes(code) && (
        <Notice onRetry={onRetry}>{intl.formatMessage(messages.unavailable)}</Notice>
      )}
      {status === 'loading' && (
        <div className="cls-cert-grid" aria-busy="true">{[0, 1, 2].map((i) => <Skeleton key={i} height={220} radius={14} />)}</div>
      )}
      {status !== 'loading' && !code && (
        <>
          {items.length > 0 && (
            <div className="cls-chips" role="group" aria-label={intl.formatMessage(messages.filterLabel)}>
              {FILTERS.map(([key, label]) => (
                <button key={key || 'all'} type="button" className="cls-chip" aria-pressed={kind === key} onClick={() => setKind(key)}>
                  {intl.formatMessage(label)}
                </button>
              ))}
            </div>
          )}
          {shown.length > 0 ? (
            <div className="cls-cert-grid">
              {shown.map((c) => (
                <CertificateCard
                  key={c.code || c.course_key}
                  certificate={c}
                  onDownload={onDownload}
                  onCopied={onCopied}
                  headingLevel={2}
                />
              ))}
            </div>
          ) : (
            <div className="cls-panel"><EmptyState>{intl.formatMessage(messages.certificatesEmpty)}</EmptyState></div>
          )}
        </>
      )}
    </main>
  );
};

CertificatesView.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({ kind: PropTypes.string })),
  status: PropTypes.oneOf(['loading', 'ready', 'refreshing', 'error']),
  error: PropTypes.shape({ code: PropTypes.string }),
  onDownload: PropTypes.func,
  onCopied: PropTypes.func,
  onRetry: PropTypes.func,
};

export default CertificatesView;
