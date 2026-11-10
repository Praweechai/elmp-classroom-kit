"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.CertificateDialog = void 0;
var _react = require("react");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _icons = require("@openedx/paragon/icons");
var _i18n = require("../i18n");
var _Feedback = require("../components/Feedback");
var _KitIcon = _interopRequireDefault(require("../components/KitIcon"));
var _LinkContext = require("../components/LinkContext");
var _PageStrip = _interopRequireDefault(require("../components/PageStrip"));
var _HomeView = require("./HomeView");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// S-104 Certificates (F-135, NetAcad arrangement): page strip, 3-column cards. Earned = gold seal, date, code,
// View (certificate paper in a dialog) + Download PDF + Verify. Not earned (CA-11 courses not finished yet) =
// locked card "Complete the course to unlock". Items = CA-07 `data[]`; downloads = CA-08 via `onDownload`.
const FILTERS = [[null, _i18n.messages.filterAll], ['roadmap', _i18n.messages.filterRoadmap], ['course', _i18n.messages.filterCourse]];
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Certificate paper in a modal dialog: focus trap, Esc / scrim / Close button close it, focus goes back.
const CertificateDialog = ({
  certificate,
  learnerName,
  logoUrl,
  onClose,
  onDownload
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const t = (m, v) => intl.formatMessage(m, v);
  const box = (0, _react.useRef)(null);
  const title = (0, _i18n.localized)(certificate.title, intl.locale);
  (0, _react.useEffect)(() => {
    const back = document.activeElement;
    box.current?.querySelector('[data-autofocus]')?.focus();
    const onKey = e => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') {
        return;
      }
      const nodes = [...(box.current?.querySelectorAll(FOCUSABLE) || [])];
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
    return () => {
      document.removeEventListener('keydown', onKey);
      back?.focus?.();
    };
  }, [onClose]);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
    className: "cls-root cls3-modal",
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
      type: "button",
      className: "cls-scrim",
      "aria-label": t(_i18n.messages.close),
      tabIndex: -1,
      onClick: onClose
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      ref: box,
      className: "cls3-modal__box",
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "cls3-cert-dialog-title",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("h2", {
        id: "cls3-cert-dialog-title",
        className: "cls-sr",
        children: t(_i18n.messages.certDialog, {
          title
        })
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
        type: "button",
        className: "cls-icon-btn cls3-modal__close",
        onClick: onClose,
        "aria-label": t(_i18n.messages.close),
        "data-autofocus": true,
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
          src: _icons.Close,
          size: 20
        })
      }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        className: "cls3-paper",
        children: [logoUrl ? /*#__PURE__*/(0, _jsxRuntime.jsx)("img", {
          className: "cls3-paper__logo",
          src: logoUrl,
          alt: t(_i18n.messages.brand)
        }) : /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          className: "cls3-paper__brand",
          children: t(_i18n.messages.brand)
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          className: "cls3-paper__kicker",
          children: t(_i18n.messages.certPaperKicker)
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          children: t(_i18n.messages.certPaperCertify)
        }), learnerName && /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          className: "cls3-paper__name",
          children: learnerName
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          children: t(_i18n.messages.certPaperCompleted)
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          className: "cls3-paper__course",
          children: title
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          className: "cls3-paper__meta",
          children: certificate.code ? t(_i18n.messages.certPaperMeta, {
            date: (0, _i18n.formatDate)(certificate.issued_at, intl.locale),
            code: certificate.code
          }) : t(_i18n.messages.certificateIssued, {
            date: (0, _i18n.formatDate)(certificate.issued_at, intl.locale)
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
          className: "cls3-paper__sign",
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
            children: t(_i18n.messages.brandShort)
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)("i", {
            "aria-hidden": "true"
          })]
        })]
      }), onDownload && /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
        className: "cls3-modal__acts",
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
          type: "button",
          className: "cls-btn cls-btn--primary cls-btn--sm",
          onClick: () => onDownload(certificate),
          children: t(_i18n.messages.certificateDownload)
        })
      })]
    })]
  });
};
exports.CertificateDialog = CertificateDialog;
CertificateDialog.propTypes = {
  certificate: _propTypes.default.shape({
    code: _propTypes.default.string,
    title: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.shape({})]),
    issued_at: _propTypes.default.string
  }).isRequired,
  learnerName: _propTypes.default.string,
  logoUrl: _propTypes.default.string,
  onClose: _propTypes.default.func.isRequired,
  onDownload: _propTypes.default.func
};
const EarnedCard = ({
  certificate,
  onView,
  onDownload,
  onCopied,
  verifyUrl
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const t = (m, v) => intl.formatMessage(m, v);
  const [busy, setBusy] = (0, _react.useState)(false);
  const revoked = Boolean(certificate.revoked_at);
  const roadmap = certificate.kind === 'roadmap';
  const ownPdf = Boolean(certificate.code) || roadmap; // Plan 4 F-113: Portal code = our own PDF (CA-08)
  const title = (0, _i18n.localized)(certificate.title, intl.locale);
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
    className: `cls3-certcard${revoked ? ' cls3-certcard--revoked' : ''}`,
    id: certificate.code ? `cert-${certificate.code}` : undefined,
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      className: "cls3-certcard__thumb",
      "aria-hidden": "true",
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
        src: _icons.WorkspacePremium,
        size: 48
      })
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls3-certcard__body",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
        className: "cls3-certcard__type",
        children: t(roadmap ? _i18n.messages.certificateRoadmap : _i18n.messages.certificateCourse)
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("h2", {
        className: "cls3-certcard__title",
        children: title
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
        className: "cls3-certcard__date",
        children: revoked ? t(_i18n.messages.certificateRevoked, {
          date: (0, _i18n.formatDate)(certificate.revoked_at, intl.locale)
        }) : t(_i18n.messages.certificateIssued, {
          date: (0, _i18n.formatDate)(certificate.issued_at, intl.locale)
        })
      }), certificate.code && /*#__PURE__*/(0, _jsxRuntime.jsxs)("p", {
        className: "cls3-certcard__code",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("span", {
          className: "cls-sr",
          children: [t(_i18n.messages.certificateCode), ": "]
        }), revoked ? /*#__PURE__*/(0, _jsxRuntime.jsx)("s", {
          children: certificate.code
        }) : certificate.code, !revoked && /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
          type: "button",
          className: "cls-icon-btn",
          onClick: copy,
          "aria-label": t(_i18n.messages.copyCode, {
            code: certificate.code
          }),
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
            src: _icons.ContentCopy,
            size: 16
          })
        })]
      }), !revoked && /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        className: "cls3-certcard__acts",
        children: [ownPdf ? /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
            type: "button",
            className: "cls-btn cls-btn--primary cls-btn--sm",
            onClick: () => onView(certificate),
            "aria-label": t(_i18n.messages.actionLabel, {
              action: t(_i18n.messages.certificateView),
              title
            }),
            children: t(_i18n.messages.certificateView)
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
            type: "button",
            className: "cls-btn cls-btn--secondary cls-btn--sm",
            onClick: download,
            "aria-busy": busy,
            disabled: busy,
            "aria-label": t(_i18n.messages.actionLabel, {
              action: t(_i18n.messages.certificateDownload),
              title
            }),
            children: t(_i18n.messages.certificateDownload)
          })]
        }) : /*#__PURE__*/(0, _jsxRuntime.jsx)("a", {
          className: "cls-btn cls-btn--primary cls-btn--sm",
          href: certificate.url,
          target: "_blank",
          rel: "noopener noreferrer",
          children: t(_i18n.messages.certificateView)
        }), verifyUrl && certificate.code && /*#__PURE__*/(0, _jsxRuntime.jsx)("a", {
          className: "cls3-link",
          href: `${verifyUrl}?code=${encodeURIComponent(certificate.code)}`,
          target: "_blank",
          rel: "noopener noreferrer",
          children: t(_i18n.messages.certVerify)
        })]
      })]
    })]
  });
};
EarnedCard.propTypes = {
  certificate: _propTypes.default.shape({
    kind: _propTypes.default.string,
    code: _propTypes.default.string,
    title: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.shape({})]),
    issued_at: _propTypes.default.string,
    revoked_at: _propTypes.default.string,
    url: _propTypes.default.string
  }).isRequired,
  onView: _propTypes.default.func.isRequired,
  onDownload: _propTypes.default.func,
  onCopied: _propTypes.default.func,
  verifyUrl: _propTypes.default.string
};
const LockedCard = ({
  course
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const Link = (0, _LinkContext.useLinkComponent)();
  const t = (m, v) => intl.formatMessage(m, v);
  const title = (0, _i18n.localized)(course.title, intl.locale);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("article", {
    className: "cls3-certcard cls3-certcard--locked",
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      className: "cls3-certcard__thumb",
      "aria-hidden": "true",
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
        src: _icons.Lock,
        size: 44
      })
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls3-certcard__body",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
        className: "cls3-certcard__type",
        children: t(_i18n.messages.certLockedLabel)
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("h2", {
        className: "cls3-certcard__title",
        children: title
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
        className: "cls3-certcard__date",
        children: t(_i18n.messages.certLocked)
      }), course.href && /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
        className: "cls3-certcard__acts",
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(Link, {
          className: "cls3-link",
          href: course.href,
          "aria-label": t(_i18n.messages.actionLabel, {
            action: t(_i18n.messages.certGoCourse),
            title
          }),
          children: t(_i18n.messages.certGoCourse)
        })
      })]
    })]
  });
};
LockedCard.propTypes = {
  course: _propTypes.default.shape({
    title: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.shape({})]),
    href: _propTypes.default.string
  }).isRequired
};
const CertificatesView2 = ({
  items = [],
  courses = [],
  status = 'ready',
  error,
  learnerName,
  logoUrl,
  verifyUrl,
  onDownload,
  onCopied,
  onRetry
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const t = (m, v) => intl.formatMessage(m, v);
  const [kind, setKind] = (0, _react.useState)(null);
  const [open, setOpen] = (0, _react.useState)(null);
  const close = (0, _react.useCallback)(() => setOpen(null), []); // stable, so the dialog keeps the element to refocus
  const code = status === 'error' ? error?.code || 'unavailable' : null;
  const strip = /*#__PURE__*/(0, _jsxRuntime.jsx)(_PageStrip.default, {
    id: "cls3-certs-strip",
    title: t(_i18n.messages.shell3Certificates),
    children: t(_i18n.messages.pageCertsIntro)
  });
  if (status === 'loading') {
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls3-page",
      "aria-busy": "true",
      children: [strip, /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
        className: "cls3-certgrid",
        children: [0, 1, 2].map(i => /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Skeleton, {
          height: 300,
          radius: 16
        }, i))
      })]
    });
  }

  // A course certificate already earned is not shown again as locked.
  const earnedKeys = new Set(items.map(c => c.course_key).filter(Boolean));
  const locked = courses.filter(c => c.status !== 'completed' && !earnedKeys.has(c.course_key));
  const kinds = new Set(items.map(c => c.kind));
  const shown = kind ? items.filter(c => c.kind === kind) : items;
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
    className: "cls3-page",
    children: [strip, code && _HomeView.NO_ACCESS.includes(code) && /*#__PURE__*/(0, _jsxRuntime.jsxs)("section", {
      className: "cls-panel cls-noaccess",
      role: "status",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("h2", {
        children: t(_i18n.messages.noAccessTitle)
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
        children: t(_i18n.messages.noAccess)
      })]
    }), code && !_HomeView.NO_ACCESS.includes(code) && /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.Notice, {
      onRetry: onRetry,
      children: t(_i18n.messages.notAvailable)
    }), !code && /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
      children: [kinds.size > 1 && /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
        className: "cls3-pills",
        role: "group",
        "aria-label": t(_i18n.messages.filterLabel),
        children: FILTERS.map(([k, m]) => /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
          type: "button",
          className: "cls3-pill",
          "aria-pressed": kind === k,
          onClick: () => setKind(k),
          children: t(m)
        }, k || 'all'))
      }), shown.length === 0 && locked.length === 0 ? /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
        className: "cls-panel",
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Feedback.EmptyState, {
          children: t(_i18n.messages.certificatesEmpty)
        })
      }) : /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        className: "cls3-certgrid",
        children: [shown.map(c => /*#__PURE__*/(0, _jsxRuntime.jsx)(EarnedCard, {
          certificate: c,
          onView: setOpen,
          onDownload: onDownload,
          onCopied: onCopied,
          verifyUrl: verifyUrl
        }, c.code || c.course_key)), !kind && locked.map(c => /*#__PURE__*/(0, _jsxRuntime.jsx)(LockedCard, {
          course: c
        }, c.course_key))]
      })]
    }), open && /*#__PURE__*/(0, _jsxRuntime.jsx)(CertificateDialog, {
      certificate: open,
      learnerName: learnerName,
      logoUrl: logoUrl,
      onClose: close,
      onDownload: onDownload
    })]
  });
};
CertificatesView2.propTypes = {
  items: _propTypes.default.arrayOf(_propTypes.default.shape({
    kind: _propTypes.default.string,
    course_key: _propTypes.default.string
  })),
  // CA-07
  courses: _propTypes.default.arrayOf(_propTypes.default.shape({
    course_key: _propTypes.default.string,
    status: _propTypes.default.string
  })),
  // CA-11
  status: _propTypes.default.oneOf(['loading', 'ready', 'refreshing', 'error']),
  error: _propTypes.default.shape({
    code: _propTypes.default.string
  }),
  learnerName: _propTypes.default.string,
  logoUrl: _propTypes.default.string,
  verifyUrl: _propTypes.default.string,
  onDownload: _propTypes.default.func,
  onCopied: _propTypes.default.func,
  onRetry: _propTypes.default.func
};
var _default = exports.default = CertificatesView2;