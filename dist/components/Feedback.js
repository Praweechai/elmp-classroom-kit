"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useToast = exports.ToastProvider = exports.Skeleton = exports.Notice = exports.EmptyState = void 0;
var _react = require("react");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _icons = require("@openedx/paragon/icons");
var _i18n = require("../i18n");
var _KitIcon = _interopRequireDefault(require("./KitIcon"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// Quiet info bar used when Portal data is unavailable (doc 04 §5.14, F-90 BR-3).
const Notice = ({
  children,
  onRetry
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
    className: "cls-notice",
    role: "status",
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
      src: _icons.Info,
      size: 20
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
      children: children
    }), onRetry && /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
      type: "button",
      className: "cls-notice__action",
      onClick: onRetry,
      children: intl.formatMessage(_i18n.messages.tryAgain)
    })]
  });
};
exports.Notice = Notice;
Notice.propTypes = {
  children: _propTypes.default.node.isRequired,
  onRetry: _propTypes.default.func
};
const EmptyArt = () => /*#__PURE__*/(0, _jsxRuntime.jsxs)("svg", {
  width: "120",
  height: "96",
  viewBox: "0 0 120 96",
  fill: "none",
  "aria-hidden": "true",
  children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("path", {
    d: "M60 30c-10-8-26-10-40-7v52c14-3 30-1 40 7 10-8 26-10 40-7V23c-14-3-30-1-40 7z",
    fill: "#EEF7F1",
    stroke: "#03692A",
    strokeWidth: "2",
    strokeLinejoin: "round"
  }), /*#__PURE__*/(0, _jsxRuntime.jsx)("path", {
    d: "M60 30v52",
    stroke: "#03692A",
    strokeWidth: "2"
  }), /*#__PURE__*/(0, _jsxRuntime.jsx)("path", {
    d: "M86 12c-8 2-13 9-12 17 8-1 14-7 15-15l-3-2z",
    fill: "#F5E7C2",
    stroke: "#BE8E28",
    strokeWidth: "2",
    strokeLinejoin: "round"
  })]
});
const EmptyState = ({
  title,
  children,
  action
}) => /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
  className: "cls-empty",
  children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(EmptyArt, {}), title && /*#__PURE__*/(0, _jsxRuntime.jsx)("h3", {
    children: title
  }), children && /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
    children: children
  }), action]
});
exports.EmptyState = EmptyState;
EmptyState.propTypes = {
  title: _propTypes.default.node,
  children: _propTypes.default.node,
  action: _propTypes.default.node
};

// Same geometry as the real component, so nothing jumps when data arrives (doc 04 §5.13).
const Skeleton = ({
  width = '100%',
  height = 16,
  radius = 8,
  className = ''
}) => /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
  className: `cls-skeleton ${className}`.trim(),
  style: {
    width,
    height,
    borderRadius: radius
  },
  "aria-hidden": "true"
});
exports.Skeleton = Skeleton;
Skeleton.propTypes = {
  width: _propTypes.default.oneOfType([_propTypes.default.number, _propTypes.default.string]),
  height: _propTypes.default.oneOfType([_propTypes.default.number, _propTypes.default.string]),
  radius: _propTypes.default.number,
  className: _propTypes.default.string
};
const ToastContext = /*#__PURE__*/(0, _react.createContext)(() => {});
const useToast = () => (0, _react.useContext)(ToastContext);
exports.useToast = useToast;
const ToastItem = ({
  toast,
  onClose
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const closeRef = (0, _react.useRef)(onClose);
  closeRef.current = onClose;
  (0, _react.useEffect)(() => {
    const t = setTimeout(() => closeRef.current(), toast.duration);
    return () => clearTimeout(t);
  }, [toast.duration]);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
    className: "cls-toast",
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
      src: _icons.CheckCircle,
      size: 20
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
      children: toast.message
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
      type: "button",
      className: "cls-icon-btn",
      onClick: onClose,
      "aria-label": intl.formatMessage(_i18n.messages.dismiss),
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
        src: _icons.Close,
        size: 18
      })
    })]
  });
};
ToastItem.propTypes = {
  toast: _propTypes.default.shape({
    message: _propTypes.default.node,
    duration: _propTypes.default.number
  }).isRequired,
  onClose: _propTypes.default.func.isRequired
};

// Bottom-centre toasts, 4 s, above the phone tab bar (doc 04 §5.16).
const ToastProvider = ({
  children
}) => {
  const [toasts, setToasts] = (0, _react.useState)([]);
  const nextId = (0, _react.useRef)(0);
  const show = (0, _react.useCallback)((message, {
    duration = 4000
  } = {}) => {
    nextId.current += 1;
    const id = nextId.current;
    setToasts(list => [...list.slice(-2), {
      id,
      message,
      duration
    }]);
  }, []);
  const close = (0, _react.useCallback)(id => setToasts(list => list.filter(t => t.id !== id)), []);
  const value = (0, _react.useMemo)(() => show, [show]);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(ToastContext.Provider, {
    value: value,
    children: [children, /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      className: "cls-toast-region cls-root",
      role: "status",
      "aria-live": "polite",
      children: toasts.map(t => /*#__PURE__*/(0, _jsxRuntime.jsx)(ToastItem, {
        toast: t,
        onClose: () => close(t.id)
      }, t.id))
    })]
  });
};
exports.ToastProvider = ToastProvider;
ToastProvider.propTypes = {
  children: _propTypes.default.node
};