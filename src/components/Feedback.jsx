import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import { CheckCircle, Close, Info } from '@openedx/paragon/icons';

import { messages, useClassroomIntl } from '../i18n';
import KitIcon from './KitIcon';

// Quiet info bar used when Portal data is unavailable (doc 04 §5.14, F-90 BR-3).
export const Notice = ({ children, onRetry }) => {
  const intl = useClassroomIntl();
  return (
    <div className="cls-notice" role="status">
      <KitIcon src={Info} size={20} />
      <span>{children}</span>
      {onRetry && (
        <button type="button" className="cls-notice__action" onClick={onRetry}>
          {intl.formatMessage(messages.tryAgain)}
        </button>
      )}
    </div>
  );
};

Notice.propTypes = { children: PropTypes.node.isRequired, onRetry: PropTypes.func };

const EmptyArt = () => (
  <svg width="120" height="96" viewBox="0 0 120 96" fill="none" aria-hidden="true">
    <path d="M60 30c-10-8-26-10-40-7v52c14-3 30-1 40 7 10-8 26-10 40-7V23c-14-3-30-1-40 7z" fill="#EEF7F1" stroke="#03692A" strokeWidth="2" strokeLinejoin="round" />
    <path d="M60 30v52" stroke="#03692A" strokeWidth="2" />
    <path d="M86 12c-8 2-13 9-12 17 8-1 14-7 15-15l-3-2z" fill="#F5E7C2" stroke="#BE8E28" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

export const EmptyState = ({ title, children, action }) => (
  <div className="cls-empty">
    <EmptyArt />
    {title && <h3>{title}</h3>}
    {children && <p>{children}</p>}
    {action}
  </div>
);

EmptyState.propTypes = { title: PropTypes.node, children: PropTypes.node, action: PropTypes.node };

// Same geometry as the real component, so nothing jumps when data arrives (doc 04 §5.13).
export const Skeleton = ({
  width = '100%', height = 16, radius = 8, className = '',
}) => (
  <span className={`cls-skeleton ${className}`.trim()} style={{ width, height, borderRadius: radius }} aria-hidden="true" />
);

Skeleton.propTypes = {
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  radius: PropTypes.number,
  className: PropTypes.string,
};

const ToastContext = createContext(() => {});
export const useToast = () => useContext(ToastContext);

const ToastItem = ({ toast, onClose }) => {
  const intl = useClassroomIntl();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const t = setTimeout(() => closeRef.current(), toast.duration);
    return () => clearTimeout(t);
  }, [toast.duration]);
  return (
    <div className="cls-toast">
      <KitIcon src={CheckCircle} size={20} />
      <span>{toast.message}</span>
      <button type="button" className="cls-icon-btn" onClick={onClose} aria-label={intl.formatMessage(messages.dismiss)}>
        <KitIcon src={Close} size={18} />
      </button>
    </div>
  );
};

ToastItem.propTypes = {
  toast: PropTypes.shape({ message: PropTypes.node, duration: PropTypes.number }).isRequired,
  onClose: PropTypes.func.isRequired,
};

// Bottom-centre toasts, 4 s, above the phone tab bar (doc 04 §5.16).
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);
  const show = useCallback((message, { duration = 4000 } = {}) => {
    nextId.current += 1;
    const id = nextId.current;
    setToasts((list) => [...list.slice(-2), { id, message, duration }]);
  }, []);
  const close = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);
  const value = useMemo(() => show, [show]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="cls-toast-region cls-root" role="status" aria-live="polite">
        {toasts.map((t) => <ToastItem key={t.id} toast={t} onClose={() => close(t.id)} />)}
      </div>
    </ToastContext.Provider>
  );
};

ToastProvider.propTypes = { children: PropTypes.node };
