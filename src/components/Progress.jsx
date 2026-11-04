import PropTypes from 'prop-types';

import { useClassroomIntl, messages } from '../i18n';

const clamp = (v) => Math.max(0, Math.min(100, Math.round(Number(v) || 0)));

export const ProgressBar = ({
  value, size = 'md', label, showValue = true,
}) => {
  const intl = useClassroomIntl();
  const pct = clamp(value);
  return (
    <div className="cls-progress">
      <div
        className={`cls-bar${size === 'lg' ? ' cls-bar--lg' : ''}`}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={label || intl.formatMessage(messages.progressLabel)}
      >
        <i style={{ width: `${pct}%` }} />
      </div>
      {showValue && <span className="cls-num" aria-hidden="true">{pct}%</span>}
    </div>
  );
};

ProgressBar.propTypes = {
  value: PropTypes.number.isRequired,
  size: PropTypes.oneOf(['md', 'lg']),
  label: PropTypes.string,
  showValue: PropTypes.bool,
};

const RING = { 32: 4, 56: 6, 120: 10 };

// 32 / 56 / 120 px rings (doc 04 §5.8). `children` replaces the centre label (e.g. "24/40").
export const ProgressRing = ({
  value, size = 32, gold = false, label, children,
}) => {
  const intl = useClassroomIntl();
  const pct = clamp(value);
  const stroke = RING[size] || 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const showText = size >= 56;
  return (
    <svg
      className={`cls-ring${gold ? ' cls-ring--gold' : ''}`}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label={label || intl.formatMessage(messages.progressLabel)}
    >
      <circle className="cls-ring__track" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} />
      <circle
        className="cls-ring__fill"
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={stroke}
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct / 100)}
      />
      {showText && (
        <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fontSize={size >= 120 ? 22 : 14} aria-hidden="true">
          {children ?? `${pct}%`}
        </text>
      )}
    </svg>
  );
};

ProgressRing.propTypes = {
  value: PropTypes.number.isRequired,
  size: PropTypes.oneOf([32, 56, 120]),
  gold: PropTypes.bool,
  label: PropTypes.string,
  children: PropTypes.node,
};
