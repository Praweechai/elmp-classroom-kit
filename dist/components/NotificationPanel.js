"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = require("react");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _icons = require("@openedx/paragon/icons");
var _i18n = require("../i18n");
var _KitIcon = _interopRequireDefault(require("./KitIcon"));
var _Feedback = require("./Feedback");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const KIND = (type = '') => {
  if (/deadline|overdue|reminder/.test(type)) {
    return {
      icon: _icons.Event,
      cls: 'soon'
    };
  }
  if (/certificate|completed/.test(type)) {
    return {
      icon: _icons.WorkspacePremium,
      cls: 'gold'
    };
  }
  if (/assign|roadmap|welcome/.test(type)) {
    return {
      icon: _icons.School,
      cls: 'action'
    };
  }
  return {
    icon: _icons.Notifications,
    cls: 'neutral'
  };
};
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Messages panel (S-74, doc 04 §5.15, F-100). Items = CA-09 `data[]`. Dialog: focus trap, Esc closes.
const NotificationPanel = ({
  open,
  onClose,
  items = [],
  loading = false,
  error,
  hasMore = false,
  onOpenItem,
  onMarkAllRead,
  onLoadMore,
  onRetry,
  now
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const {
    locale
  } = intl;
  const panel = (0, _react.useRef)(null);
  (0, _react.useEffect)(() => {
    if (!open) {
      return undefined;
    }
    panel.current?.querySelector('[data-autofocus]')?.focus();
    const onKey = e => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
        return;
      }
      if (e.key !== 'Tab') {
        return;
      }
      const nodes = [...(panel.current?.querySelectorAll(FOCUSABLE) || [])];
      if (!nodes.length) {
        return;
      }
      const [first, last] = [nodes[0], nodes[nodes.length - 1]];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) {
    return null;
  }
  const unread = items.some(n => !n.read_at);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
    className: "cls-root cls-npanel-layer",
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
      type: "button",
      className: "cls-scrim",
      "aria-label": intl.formatMessage(_i18n.messages.close),
      tabIndex: -1,
      onClick: onClose
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      ref: panel,
      className: "cls-npanel",
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "cls-npanel-title",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("header", {
        className: "cls-npanel__head",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("h2", {
          id: "cls-npanel-title",
          children: intl.formatMessage(_i18n.messages.messagesTitle)
        }), unread && onMarkAllRead && /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
          type: "button",
          className: "cls-btn cls-btn--ghost cls-btn--sm",
          onClick: onMarkAllRead,
          children: intl.formatMessage(_i18n.messages.markAllRead)
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
          type: "button",
          className: "cls-icon-btn",
          onClick: onClose,
          "aria-label": intl.formatMessage(_i18n.messages.close),
          "data-autofocus": true,
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
            src: _icons.Close,
            size: 20
          })
        })]
      }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        className: "cls-npanel__body",
        children: [error && /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
          className: "cls-npanel__pad",
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Notice, {
            onRetry: onRetry,
            children: intl.formatMessage(_i18n.messages.messagesUnavailable)
          })
        }), loading && !items.length && /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
          className: "cls-npanel__pad cls-stack",
          "aria-busy": "true",
          children: [0, 1, 2].map(i => /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Skeleton, {
            height: 56,
            radius: 10
          }, i))
        }), !loading && !error && !items.length && /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          className: "cls-npanel__empty",
          children: intl.formatMessage(_i18n.messages.caughtUp)
        }), items.length > 0 && /*#__PURE__*/(0, _jsxRuntime.jsx)("ul", {
          children: items.map(n => {
            const kind = KIND(n.type);
            const title = (0, _i18n.localized)(n.title, locale);
            return /*#__PURE__*/(0, _jsxRuntime.jsx)("li", {
              children: /*#__PURE__*/(0, _jsxRuntime.jsxs)("button", {
                type: "button",
                className: `cls-nitem${n.read_at ? '' : ' is-unread'}`,
                onClick: () => onOpenItem?.(n),
                children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
                  className: `cls-nitem__tile cls-nitem__tile--${kind.cls}`,
                  children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
                    src: kind.icon,
                    size: 20
                  })
                }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("span", {
                  className: "cls-nitem__text",
                  children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
                    children: title
                  }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
                    children: (0, _i18n.localized)(n.body, locale)
                  }), /*#__PURE__*/(0, _jsxRuntime.jsx)("time", {
                    dateTime: n.created_at,
                    children: (0, _i18n.timeAgo)(n.created_at, locale, now)
                  })]
                }), !n.read_at && /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
                  className: "cls-nitem__dot",
                  children: /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
                    className: "cls-sr",
                    children: intl.formatMessage(_i18n.messages.unreadLabel)
                  })
                })]
              })
            }, n.id);
          })
        }), hasMore && /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
          className: "cls-npanel__pad",
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
            type: "button",
            className: "cls-btn cls-btn--secondary cls-btn--block",
            onClick: onLoadMore,
            children: intl.formatMessage(_i18n.messages.showMore)
          })
        })]
      })]
    })]
  });
};
NotificationPanel.propTypes = {
  open: _propTypes.default.bool.isRequired,
  onClose: _propTypes.default.func,
  items: _propTypes.default.arrayOf(_propTypes.default.shape({
    id: _propTypes.default.string.isRequired,
    type: _propTypes.default.string,
    title: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.shape({})]),
    body: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.shape({})]),
    read_at: _propTypes.default.string,
    created_at: _propTypes.default.string
  })),
  loading: _propTypes.default.bool,
  error: _propTypes.default.bool,
  hasMore: _propTypes.default.bool,
  onOpenItem: _propTypes.default.func,
  onMarkAllRead: _propTypes.default.func,
  onLoadMore: _propTypes.default.func,
  onRetry: _propTypes.default.func,
  // Fixed "now" for stories and screenshot tests; real use leaves it empty.
  now: _propTypes.default.number
};
var _default = exports.default = NotificationPanel;