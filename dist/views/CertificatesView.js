"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = require("react");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _i18n = require("../i18n");
var _CertificateCard = _interopRequireDefault(require("../components/CertificateCard"));
var _Feedback = require("../components/Feedback");
var _HomeView = require("./HomeView");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const FILTERS = [[null, _i18n.messages.filterAll], ['roadmap', _i18n.messages.filterRoadmap], ['course', _i18n.messages.filterCourse]];

// S-72 Certificates (doc 04 §6.3, F-96). Items = CA-07 `data[]` (newest first from the Portal).
const CertificatesView = ({
  items = [],
  status = 'loading',
  error,
  onDownload,
  onCopied,
  onRetry
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const [kind, setKind] = (0, _react.useState)(null);
  const shown = kind ? items.filter(c => c.kind === kind) : items;
  const code = status === 'error' ? error?.code || 'unavailable' : null;
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
    className: "cls-page cls-root",
    children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("header", {
      className: "cls-page-head",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("h1", {
        children: intl.formatMessage(_i18n.messages.certificatesTitle)
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
        children: intl.formatMessage(_i18n.messages.certificatesIntro)
      })]
    }), code && _HomeView.NO_ACCESS.includes(code) && /*#__PURE__*/(0, _jsxRuntime.jsxs)("section", {
      className: "cls-panel cls-noaccess",
      role: "status",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("h2", {
        children: intl.formatMessage(_i18n.messages.noAccessTitle)
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
        children: intl.formatMessage(_i18n.messages.noAccess)
      })]
    }), code && !_HomeView.NO_ACCESS.includes(code) && /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Notice, {
      onRetry: onRetry,
      children: intl.formatMessage(_i18n.messages.unavailable)
    }), status === 'loading' && /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      className: "cls-cert-grid",
      "aria-busy": "true",
      children: [0, 1, 2].map(i => /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Skeleton, {
        height: 220,
        radius: 14
      }, i))
    }), status !== 'loading' && !code && /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
      children: [items.length > 0 && /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
        className: "cls-chips",
        role: "group",
        "aria-label": intl.formatMessage(_i18n.messages.filterLabel),
        children: FILTERS.map(([key, label]) => /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
          type: "button",
          className: "cls-chip",
          "aria-pressed": kind === key,
          onClick: () => setKind(key),
          children: intl.formatMessage(label)
        }, key || 'all'))
      }), shown.length > 0 ? /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
        className: "cls-cert-grid",
        children: shown.map(c => /*#__PURE__*/(0, _jsxRuntime.jsx)(_CertificateCard.default, {
          certificate: c,
          onDownload: onDownload,
          onCopied: onCopied,
          headingLevel: 2
        }, c.code || c.course_key))
      }) : /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
        className: "cls-panel",
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.EmptyState, {
          children: intl.formatMessage(_i18n.messages.certificatesEmpty)
        })
      })]
    })]
  });
};
CertificatesView.propTypes = {
  items: _propTypes.default.arrayOf(_propTypes.default.shape({
    kind: _propTypes.default.string
  })),
  status: _propTypes.default.oneOf(['loading', 'ready', 'refreshing', 'error']),
  error: _propTypes.default.shape({
    code: _propTypes.default.string
  }),
  onDownload: _propTypes.default.func,
  onCopied: _propTypes.default.func,
  onRetry: _propTypes.default.func
};
var _default = exports.default = CertificatesView;