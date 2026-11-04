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
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// Roadmap or course certificate (doc 04 §5.9, F-96). Takes a CA-07 item.
const CertificateCard = ({
  certificate,
  onDownload,
  onCopied,
  headingLevel = 3
}) => {
  const Heading = `h${headingLevel}`;
  const intl = (0, _i18n.useClassroomIntl)();
  const {
    locale
  } = intl;
  const [busy, setBusy] = (0, _react.useState)(false);
  const revoked = Boolean(certificate.revoked_at);
  const roadmap = certificate.kind === 'roadmap';
  const title = (0, _i18n.localized)(certificate.title, locale);
  const download = async () => {
    setBusy(true);
    try {
      await onDownload?.(certificate);
    } finally {
      setBusy(false);
    }
  };
  const copy = async () => {
    await navigator.clipboard?.writeText(certificate.code);
    onCopied?.(certificate);
  };
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("article", {
    className: `cls-cert${revoked ? ' cls-cert--revoked' : ''}`,
    id: certificate.code ? `cert-${certificate.code}` : undefined,
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
      className: "cls-cert__seal",
      "aria-hidden": "true",
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
        src: _icons.WorkspacePremium,
        size: 22
      })
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
        className: "cls-cert__type",
        children: intl.formatMessage(roadmap ? _i18n.messages.certificateRoadmap : _i18n.messages.certificateCourse)
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(Heading, {
        className: "cls-cert__title",
        children: title
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
        className: "cls-cert__date",
        children: revoked ? intl.formatMessage(_i18n.messages.certificateRevoked, {
          date: (0, _i18n.formatDate)(certificate.revoked_at, locale)
        }) : intl.formatMessage(_i18n.messages.certificateIssued, {
          date: (0, _i18n.formatDate)(certificate.issued_at, locale)
        })
      })]
    }), roadmap && certificate.code && /*#__PURE__*/(0, _jsxRuntime.jsxs)("p", {
      className: "cls-cert__code",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("span", {
        className: "cls-sr",
        children: [intl.formatMessage(_i18n.messages.certificateCode), ": "]
      }), revoked ? /*#__PURE__*/(0, _jsxRuntime.jsx)("s", {
        children: certificate.code
      }) : certificate.code, !revoked && /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
        type: "button",
        className: "cls-icon-btn",
        onClick: copy,
        "aria-label": intl.formatMessage(_i18n.messages.copyCode, {
          code: certificate.code
        }),
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
          src: _icons.ContentCopy,
          size: 16
        })
      })]
    }), !revoked && /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      className: "cls-cert__acts",
      children: roadmap ? /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
        type: "button",
        className: "cls-btn cls-btn--primary cls-btn--sm",
        onClick: download,
        "aria-busy": busy,
        disabled: busy,
        children: intl.formatMessage(_i18n.messages.certificateDownload)
      }) : /*#__PURE__*/(0, _jsxRuntime.jsx)("a", {
        className: "cls-btn cls-btn--secondary cls-btn--sm",
        href: certificate.url,
        target: "_blank",
        rel: "noopener noreferrer",
        children: intl.formatMessage(_i18n.messages.certificateView)
      })
    })]
  });
};
CertificateCard.propTypes = {
  certificate: _propTypes.default.shape({
    kind: _propTypes.default.oneOf(['roadmap', 'course']).isRequired,
    code: _propTypes.default.string,
    title: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.shape({})]).isRequired,
    issued_at: _propTypes.default.string,
    revoked_at: _propTypes.default.string,
    url: _propTypes.default.string
  }).isRequired,
  onDownload: _propTypes.default.func,
  onCopied: _propTypes.default.func,
  headingLevel: _propTypes.default.oneOf([2, 3])
};
var _default = exports.default = CertificateCard;