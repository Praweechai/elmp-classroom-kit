"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _propTypes = _interopRequireDefault(require("prop-types"));
var _icons = require("@openedx/paragon/icons");
var _i18n = require("../i18n");
var _KitIcon = _interopRequireDefault(require("./KitIcon"));
var _LinkContext = require("./LinkContext");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// S-75 "Your certificate" (doc 04 §6.5): a small certificate with the learner's name. Before it is
// earned it carries a "Preview" ribbon and one line on how to get it; after, a link to the real one.
const CertificatePreview = ({
  courseTitle,
  learnerName,
  href,
  headingLevel = 2
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const Link = (0, _LinkContext.useLinkComponent)();
  const Heading = `h${headingLevel}`;
  const earned = Boolean(href);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("section", {
    className: "cls-certprev",
    "aria-labelledby": "cls-certprev-title",
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(Heading, {
      id: "cls-certprev-title",
      className: "cls-certprev__title",
      children: intl.formatMessage(_i18n.messages.certPreviewTitle)
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls-certprev__paper",
      "aria-hidden": "true",
      children: [!earned && /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        className: "cls-certprev__ribbon",
        children: intl.formatMessage(_i18n.messages.certPreviewBadge)
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        className: "cls-certprev__seal",
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
          src: _icons.WorkspacePremium,
          size: 18
        })
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        className: "cls-certprev__kind",
        children: intl.formatMessage(_i18n.messages.certPreviewKind)
      }), learnerName && /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        className: "cls-certprev__name",
        children: learnerName
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        className: "cls-certprev__course",
        children: courseTitle
      })]
    }), earned ? /*#__PURE__*/(0, _jsxRuntime.jsx)(Link, {
      className: "cls-btn cls-btn--secondary cls-btn--sm",
      href: href,
      children: intl.formatMessage(_i18n.messages.viewCertificate)
    }) : /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
      className: "cls-certprev__note",
      children: intl.formatMessage(_i18n.messages.certPreviewNote)
    })]
  });
};
CertificatePreview.propTypes = {
  courseTitle: _propTypes.default.string.isRequired,
  learnerName: _propTypes.default.string,
  href: _propTypes.default.string,
  headingLevel: _propTypes.default.number
};
var _default = exports.default = CertificatePreview;