import {
  useCallback, useEffect, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import {
  Close, ContentCopy, Lock, WorkspacePremium,
} from '@openedx/paragon/icons';

import {
  formatDate, localized, messages, useClassroomIntl,
} from '../i18n';
import { EmptyState, Notice, Skeleton } from '../components/Feedback';
import KitIcon from '../components/KitIcon';
import { useLinkComponent } from '../components/LinkContext';
import PageStrip from '../components/PageStrip';
import { usePageEnter } from '../components/Learner21';
import { NO_ACCESS } from './HomeView';

// S-104 Certificates (F-135, NetAcad arrangement): page strip, 3-column cards. Earned = gold seal, date, code,
// View (certificate paper in a dialog) + Download PDF + Verify. Not earned (CA-11 courses not finished yet) =
// locked card "Complete the course to unlock". Items = CA-07 `data[]`; downloads = CA-08 via `onDownload`.

const FILTERS = [[null, messages.filterAll], ['roadmap', messages.filterRoadmap], ['course', messages.filterCourse]];
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Certificate paper in a modal dialog: focus trap, Esc / scrim / Close button close it, focus goes back.
export const CertificateDialog = ({
  certificate, learnerName, logoUrl, onClose, onDownload,
}) => {
  const intl = useClassroomIntl();
  const t = (m, v) => intl.formatMessage(m, v);
  const box = useRef(null);
  const title = localized(certificate.title, intl.locale);

  useEffect(() => {
    const back = document.activeElement;
    box.current?.querySelector('[data-autofocus]')?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      if (e.key !== 'Tab') { return; }
      const nodes = [...(box.current?.querySelectorAll(FOCUSABLE) || [])];
      const [first, last] = [nodes[0], nodes[nodes.length - 1]];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); back?.focus?.(); };
  }, [onClose]);

  return (
    <div className="cls-root cls3-modal">
      <button type="button" className="cls-scrim" aria-label={t(messages.close)} tabIndex={-1} onClick={onClose} />
      <div ref={box} className="cls3-modal__box" role="dialog" aria-modal="true" aria-labelledby="cls3-cert-dialog-title">
        <h2 id="cls3-cert-dialog-title" className="cls-sr">{t(messages.certDialog, { title })}</h2>
        <button type="button" className="cls-icon-btn cls3-modal__close" onClick={onClose} aria-label={t(messages.close)} data-autofocus>
          <KitIcon src={Close} size={20} />
        </button>
        <div className="cls3-paper">
          {logoUrl ? <img className="cls3-paper__logo" src={logoUrl} alt={t(messages.brand)} /> : <p className="cls3-paper__brand">{t(messages.brand)}</p>}
          <p className="cls3-paper__kicker">{t(messages.certPaperKicker)}</p>
          <p>{t(messages.certPaperCertify)}</p>
          {learnerName && <p className="cls3-paper__name">{learnerName}</p>}
          <p>{t(messages.certPaperCompleted)}</p>
          <p className="cls3-paper__course">{title}</p>
          <p className="cls3-paper__meta">
            {certificate.code
              ? t(messages.certPaperMeta, {
                date: formatDate(certificate.issued_at, intl.locale), code: certificate.code,
              })
              : t(messages.certificateIssued, { date: formatDate(certificate.issued_at, intl.locale) })}
          </p>
          <div className="cls3-paper__sign"><span>{t(messages.brandShort)}</span><i aria-hidden="true" /></div>
        </div>
        {onDownload && (
          <div className="cls3-modal__acts">
            <button type="button" className="cls-btn cls-btn--primary cls-btn--sm" onClick={() => onDownload(certificate)}>
              {t(messages.certificateDownload)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
CertificateDialog.propTypes = {
  certificate: PropTypes.shape({
    code: PropTypes.string,
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})]),
    issued_at: PropTypes.string,
  }).isRequired,
  learnerName: PropTypes.string,
  logoUrl: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onDownload: PropTypes.func,
};

const EarnedCard = ({
  certificate, onView, onDownload, onCopied, verifyUrl,
}) => {
  const intl = useClassroomIntl();
  const t = (m, v) => intl.formatMessage(m, v);
  const [busy, setBusy] = useState(false);
  const revoked = Boolean(certificate.revoked_at);
  const roadmap = certificate.kind === 'roadmap';
  const ownPdf = Boolean(certificate.code) || roadmap; // Plan 4 F-113: Portal code = our own PDF (CA-08)
  const title = localized(certificate.title, intl.locale);

  const download = async () => {
    setBusy(true);
    try { await onDownload?.(certificate); } finally { setBusy(false); }
  };
  const copy = async () => {
    await navigator.clipboard?.writeText(certificate.code);
    onCopied?.(certificate);
  };

  return (
    <article
      className={`cls3-certcard cls3-lift cls3-rise cls3-tone--done${revoked ? ' cls3-certcard--revoked' : ''}`}
      id={certificate.code ? `cert-${certificate.code}` : undefined}
    >
      <div className="cls3-certcard__thumb" aria-hidden="true">
        <KitIcon src={WorkspacePremium} size={48} />
        {!revoked && <span className="cls3-certcard__shine" />}
      </div>
      <div className="cls3-certcard__body">
        <p className="cls3-certcard__type">{t(roadmap ? messages.certificateRoadmap : messages.certificateCourse)}</p>
        <h2 className="cls3-certcard__title">{title}</h2>
        <p className="cls3-certcard__date">
          {revoked
            ? t(messages.certificateRevoked, { date: formatDate(certificate.revoked_at, intl.locale) })
            : t(messages.certificateIssued, { date: formatDate(certificate.issued_at, intl.locale) })}
        </p>
        {certificate.code && (
          <p className="cls3-certcard__code">
            <span className="cls-sr">{t(messages.certificateCode)}: </span>
            {revoked ? <s>{certificate.code}</s> : certificate.code}
            {!revoked && (
              <button type="button" className="cls-icon-btn" onClick={copy} aria-label={t(messages.copyCode, { code: certificate.code })}>
                <KitIcon src={ContentCopy} size={16} />
              </button>
            )}
          </p>
        )}
        {!revoked && (
          <div className="cls3-certcard__acts">
            {ownPdf ? (
              <>
                <button
                  type="button"
                  className="cls-btn cls-btn--primary cls-btn--sm"
                  onClick={() => onView(certificate)}
                  aria-label={t(messages.actionLabel, { action: t(messages.certificateView), title })}
                >
                  {t(messages.certificateView)}
                </button>
                <button
                  type="button"
                  className="cls-btn cls-btn--secondary cls-btn--sm"
                  onClick={download}
                  aria-busy={busy}
                  disabled={busy}
                  aria-label={t(messages.actionLabel, { action: t(messages.certificateDownload), title })}
                >
                  {t(messages.certificateDownload)}
                </button>
              </>
            ) : (
              <a className="cls-btn cls-btn--primary cls-btn--sm" href={certificate.url} target="_blank" rel="noopener noreferrer">
                {t(messages.certificateView)}
              </a>
            )}
            {verifyUrl && certificate.code && (
              <a className="cls3-link" href={`${verifyUrl}?code=${encodeURIComponent(certificate.code)}`} target="_blank" rel="noopener noreferrer">
                {t(messages.certVerify)}
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
};
EarnedCard.propTypes = {
  certificate: PropTypes.shape({
    kind: PropTypes.string,
    code: PropTypes.string,
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})]),
    issued_at: PropTypes.string,
    revoked_at: PropTypes.string,
    url: PropTypes.string,
  }).isRequired,
  onView: PropTypes.func.isRequired,
  onDownload: PropTypes.func,
  onCopied: PropTypes.func,
  verifyUrl: PropTypes.string,
};

const LockedCard = ({ course }) => {
  const intl = useClassroomIntl();
  const Link = useLinkComponent();
  const t = (m, v) => intl.formatMessage(m, v);
  const title = localized(course.title, intl.locale);
  return (
    <article className="cls3-certcard cls3-certcard--locked cls3-rise">
      <div className="cls3-certcard__thumb" aria-hidden="true"><KitIcon src={Lock} size={44} /></div>
      <div className="cls3-certcard__body">
        <p className="cls3-certcard__type">{t(messages.certLockedLabel)}</p>
        <h2 className="cls3-certcard__title">{title}</h2>
        <p className="cls3-certcard__date">{t(messages.certLocked)}</p>
        {course.href && (
          <div className="cls3-certcard__acts">
            <Link className="cls3-link" href={course.href} aria-label={t(messages.actionLabel, { action: t(messages.certGoCourse), title })}>
              {t(messages.certGoCourse)}
            </Link>
          </div>
        )}
      </div>
    </article>
  );
};
LockedCard.propTypes = {
  course: PropTypes.shape({
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})]), href: PropTypes.string,
  }).isRequired,
};

const CertificatesView2 = ({
  items = [], courses = [], status = 'ready', error, learnerName, logoUrl, verifyUrl, onDownload, onCopied, onRetry,
}) => {
  const intl = useClassroomIntl();
  const t = (m, v) => intl.formatMessage(m, v);
  const [kind, setKind] = useState(null);
  const [open, setOpen] = useState(null);
  const close = useCallback(() => setOpen(null), []); // stable, so the dialog keeps the element to refocus
  const pageRef = usePageEnter([status]);
  const code = status === 'error' ? (error?.code || 'unavailable') : null;
  const strip = (
    <PageStrip id="cls3-certs-strip" title={t(messages.shell3Certificates)}>{t(messages.pageCertsIntro)}</PageStrip>
  );

  if (status === 'loading') {
    return (
      <div className="cls3-page" aria-busy="true">
        {strip}
        <div className="cls3-certgrid">{[0, 1, 2].map((i) => <Skeleton key={i} height={300} radius={16} />)}</div>
      </div>
    );
  }

  // A course certificate already earned is not shown again as locked.
  const earnedKeys = new Set(items.map((c) => c.course_key).filter(Boolean));
  const locked = courses.filter((c) => c.status !== 'completed' && !earnedKeys.has(c.course_key));
  const kinds = new Set(items.map((c) => c.kind));
  const shown = kind ? items.filter((c) => c.kind === kind) : items;

  return (
    <div className="cls3-page" ref={pageRef}>
      {strip}
      {code && NO_ACCESS.includes(code) && (
        <section className="cls-panel cls-noaccess" role="status">
          <h2>{t(messages.noAccessTitle)}</h2>
          <p>{t(messages.noAccess)}</p>
        </section>
      )}
      {code && !NO_ACCESS.includes(code) && <Notice onRetry={onRetry}>{t(messages.notAvailable)}</Notice>}
      {!code && (
        <>
          {kinds.size > 1 && (
            <div className="cls3-pills" role="group" aria-label={t(messages.filterLabel)}>
              {FILTERS.map(([k, m]) => (
                <button key={k || 'all'} type="button" className="cls3-pill" aria-pressed={kind === k} onClick={() => setKind(k)}>
                  {t(m)}
                </button>
              ))}
            </div>
          )}
          {shown.length === 0 && locked.length === 0 ? (
            <div className="cls-panel"><EmptyState>{t(messages.certificatesEmpty)}</EmptyState></div>
          ) : (
            <div className="cls3-certgrid">
              {shown.map((c) => (
                <EarnedCard
                  key={c.code || c.course_key}
                  certificate={c}
                  onView={setOpen}
                  onDownload={onDownload}
                  onCopied={onCopied}
                  verifyUrl={verifyUrl}
                />
              ))}
              {!kind && locked.map((c) => <LockedCard key={c.course_key} course={c} />)}
            </div>
          )}
        </>
      )}
      {open && (
        <CertificateDialog
          certificate={open}
          learnerName={learnerName}
          logoUrl={logoUrl}
          onClose={close}
          onDownload={onDownload}
        />
      )}
    </div>
  );
};

CertificatesView2.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({ kind: PropTypes.string, course_key: PropTypes.string })), // CA-07
  courses: PropTypes.arrayOf(PropTypes.shape({ course_key: PropTypes.string, status: PropTypes.string })), // CA-11
  status: PropTypes.oneOf(['loading', 'ready', 'refreshing', 'error']),
  error: PropTypes.shape({ code: PropTypes.string }),
  learnerName: PropTypes.string,
  logoUrl: PropTypes.string,
  verifyUrl: PropTypes.string,
  onDownload: PropTypes.func,
  onCopied: PropTypes.func,
  onRetry: PropTypes.func,
};

export default CertificatesView2;
