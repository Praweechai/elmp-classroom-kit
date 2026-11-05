import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Close, Event, Notifications, School, WorkspacePremium,
} from '@openedx/paragon/icons';

import {
  localized, messages, timeAgo, useClassroomIntl,
} from '../i18n';
import KitIcon from './KitIcon';
import { Notice, Skeleton } from './Feedback';

const KIND = (type = '') => {
  if (/deadline|overdue|reminder/.test(type)) { return { icon: Event, cls: 'soon' }; }
  if (/certificate|completed/.test(type)) { return { icon: WorkspacePremium, cls: 'gold' }; }
  if (/assign|roadmap|welcome/.test(type)) { return { icon: School, cls: 'action' }; }
  return { icon: Notifications, cls: 'neutral' };
};

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Messages panel (S-74, doc 04 §5.15, F-100). Items = CA-09 `data[]`. Dialog: focus trap, Esc closes.
const NotificationPanel = ({
  open, onClose, items = [], loading = false, error, hasMore = false,
  onOpenItem, onMarkAllRead, onLoadMore, onRetry, now,
}) => {
  const intl = useClassroomIntl();
  const { locale } = intl;
  const panel = useRef(null);

  useEffect(() => {
    if (!open) { return undefined; }
    panel.current?.querySelector('[data-autofocus]')?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose?.(); return; }
      if (e.key !== 'Tab') { return; }
      const nodes = [...(panel.current?.querySelectorAll(FOCUSABLE) || [])];
      if (!nodes.length) { return; }
      const [first, last] = [nodes[0], nodes[nodes.length - 1]];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) { return null; }
  const unread = items.some((n) => !n.read_at);

  return (
    <div className="cls-root cls-npanel-layer">
      <button type="button" className="cls-scrim" aria-label={intl.formatMessage(messages.close)} tabIndex={-1} onClick={onClose} />
      <div ref={panel} className="cls-npanel" role="dialog" aria-modal="true" aria-labelledby="cls-npanel-title">
        <header className="cls-npanel__head">
          <h2 id="cls-npanel-title">{intl.formatMessage(messages.messagesTitle)}</h2>
          {unread && onMarkAllRead && (
            <button type="button" className="cls-btn cls-btn--ghost cls-btn--sm" onClick={onMarkAllRead}>
              {intl.formatMessage(messages.markAllRead)}
            </button>
          )}
          <button type="button" className="cls-icon-btn" onClick={onClose} aria-label={intl.formatMessage(messages.close)} data-autofocus>
            <KitIcon src={Close} size={20} />
          </button>
        </header>
        <div className="cls-npanel__body">
          {error && <div className="cls-npanel__pad"><Notice onRetry={onRetry}>{intl.formatMessage(messages.messagesUnavailable)}</Notice></div>}
          {loading && !items.length && (
            <div className="cls-npanel__pad cls-stack" aria-busy="true">
              {[0, 1, 2].map((i) => <Skeleton key={i} height={56} radius={10} />)}
            </div>
          )}
          {!loading && !error && !items.length && <p className="cls-npanel__empty">{intl.formatMessage(messages.caughtUp)}</p>}
          {items.length > 0 && (
            <ul>
              {items.map((n) => {
                const kind = KIND(n.type);
                const title = localized(n.title, locale);
                return (
                  <li key={n.id}>
                    <button type="button" className={`cls-nitem${n.read_at ? '' : ' is-unread'}`} onClick={() => onOpenItem?.(n)}>
                      <span className={`cls-nitem__tile cls-nitem__tile--${kind.cls}`}><KitIcon src={kind.icon} size={20} /></span>
                      <span className="cls-nitem__text">
                        <b>{title}</b>
                        <span>{localized(n.body, locale)}</span>
                        <time dateTime={n.created_at}>{timeAgo(n.created_at, locale, now)}</time>
                      </span>
                      {!n.read_at && <span className="cls-nitem__dot"><span className="cls-sr">{intl.formatMessage(messages.unreadLabel)}</span></span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {hasMore && (
            <div className="cls-npanel__pad">
              <button type="button" className="cls-btn cls-btn--secondary cls-btn--block" onClick={onLoadMore}>{intl.formatMessage(messages.showMore)}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

NotificationPanel.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.string,
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})]),
    body: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})]),
    read_at: PropTypes.string,
    created_at: PropTypes.string,
  })),
  loading: PropTypes.bool,
  error: PropTypes.bool,
  hasMore: PropTypes.bool,
  onOpenItem: PropTypes.func,
  onMarkAllRead: PropTypes.func,
  onLoadMore: PropTypes.func,
  onRetry: PropTypes.func,
  // Fixed "now" for stories and screenshot tests; real use leaves it empty.
  now: PropTypes.number,
};

export default NotificationPanel;
