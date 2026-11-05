"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LanguageToggle = exports.ClassroomHeader = exports.BottomTabs = exports.Avatar = exports.AccountMenu = void 0;
var _react = require("react");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _icons = require("@openedx/paragon/icons");
var _i18n = require("../i18n");
var _KitIcon = _interopRequireDefault(require("./KitIcon"));
var _LinkContext = require("./LinkContext");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const linkShape = _propTypes.default.shape({
  home: _propTypes.default.string.isRequired,
  certificates: _propTypes.default.string.isRequired,
  hours: _propTypes.default.string,
  // Plan 4 F-112: no link = CE hours switched off, no tab
  account: _propTypes.default.string,
  signOut: _propTypes.default.string,
  portal: _propTypes.default.string
});
const userShape = _propTypes.default.shape({
  name: _propTypes.default.string.isRequired,
  position: _propTypes.default.string,
  department: _propTypes.default.string,
  photoUrl: _propTypes.default.string
});
const initials = (name = '') => name.trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase();
const Avatar = ({
  user,
  large = false
}) => user.photoUrl ? /*#__PURE__*/(0, _jsxRuntime.jsx)("img", {
  className: `cls-avatar${large ? ' cls-avatar--lg' : ''}`,
  src: user.photoUrl,
  alt: ""
}) : /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
  className: `cls-avatar${large ? ' cls-avatar--lg' : ''}`,
  "aria-hidden": "true",
  children: initials(user.name)
});
exports.Avatar = Avatar;
Avatar.propTypes = {
  user: userShape.isRequired,
  large: _propTypes.default.bool
};
const LanguageToggle = ({
  value,
  onChange
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const lang = (0, _i18n.kitLanguage)(value);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
    className: "cls-seg",
    role: "group",
    "aria-label": intl.formatMessage(_i18n.messages.languageGroup),
    children: [['th', 'TH', 'ไทย'], ['en', 'EN', 'English']].map(([code, short, full]) => /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
      type: "button",
      lang: code,
      "aria-pressed": lang === code,
      "aria-label": full,
      onClick: () => lang !== code && onChange?.(code),
      children: short
    }, code))
  });
};
exports.LanguageToggle = LanguageToggle;
LanguageToggle.propTypes = {
  value: _propTypes.default.string,
  onChange: _propTypes.default.func
};

// Account menu popover (doc 04 §6.8, S-78): Esc and outside click close, focus returns to the trigger.
const AccountMenu = ({
  user,
  links,
  locale,
  onLocaleChange
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const [open, setOpen] = (0, _react.useState)(false);
  const anchor = (0, _react.useRef)(null);
  const trigger = (0, _react.useRef)(null);
  const menuId = 'cls-account-menu';
  (0, _react.useEffect)(() => {
    if (!open) {
      return undefined;
    }
    anchor.current?.querySelector('[role="menu"] a, [role="menu"] button')?.focus();
    const onKey = e => {
      if (e.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    const onClick = e => {
      if (!anchor.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);
  const meta = [user.position, user.department].filter(Boolean).join(' · ');
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
    className: "cls-menu-anchor",
    ref: anchor,
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
      ref: trigger,
      type: "button",
      className: "cls-avatar-btn",
      "aria-haspopup": "menu",
      "aria-expanded": open,
      "aria-controls": open ? menuId : undefined,
      "aria-label": intl.formatMessage(_i18n.messages.accountButton, {
        name: user.name
      }),
      onClick: () => setOpen(!open),
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(Avatar, {
        user: user
      })
    }), open && /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls-menu",
      id: menuId,
      children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        className: "cls-menu__who",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(Avatar, {
          user: user,
          large: true
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("span", {
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
            children: user.name
          }), meta && /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
            children: meta
          })]
        })]
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("hr", {}), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        role: "menu",
        "aria-label": user.name,
        children: [links.account && /*#__PURE__*/(0, _jsxRuntime.jsxs)("a", {
          role: "menuitem",
          className: "cls-menu__item",
          href: links.account,
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
            src: _icons.Settings,
            size: 20
          }), intl.formatMessage(_i18n.messages.accountSettings)]
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
          className: "cls-menu__item",
          role: "none",
          children: [intl.formatMessage(_i18n.messages.language), /*#__PURE__*/(0, _jsxRuntime.jsx)(LanguageToggle, {
            value: locale,
            onChange: onLocaleChange
          })]
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("hr", {}), links.signOut && /*#__PURE__*/(0, _jsxRuntime.jsxs)("a", {
          role: "menuitem",
          className: "cls-menu__item cls-menu__item--danger",
          href: links.signOut,
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
            src: _icons.Logout,
            size: 20
          }), intl.formatMessage(_i18n.messages.signOut)]
        })]
      })]
    })]
  });
};
exports.AccountMenu = AccountMenu;
AccountMenu.propTypes = {
  user: userShape.isRequired,
  links: linkShape.isRequired,
  locale: _propTypes.default.string,
  onLocaleChange: _propTypes.default.func
};
const MessagesButton = ({
  unread,
  onClick,
  className = ''
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("button", {
    type: "button",
    className: `cls-icon-btn ${className}`.trim(),
    onClick: onClick,
    "aria-label": intl.formatMessage(_i18n.messages.messagesButton, {
      count: unread
    }),
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
      src: _icons.Notifications,
      size: 22
    }), unread > 0 && /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
      className: "cls-badge",
      "aria-hidden": "true",
      children: unread > 9 ? '9+' : unread
    })]
  });
};
MessagesButton.propTypes = {
  unread: _propTypes.default.number,
  onClick: _propTypes.default.func,
  className: _propTypes.default.string
};

// Classroom header (doc 04 §5.1, F-98). Never shows the platform name (A3-6).
const ClassroomHeader = ({
  current,
  links,
  user,
  unread = 0,
  locale,
  onLocaleChange,
  onOpenMessages,
  logoUrl
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const Link = (0, _LinkContext.useLinkComponent)();
  const [scrolled, setScrolled] = (0, _react.useState)(false);
  (0, _react.useEffect)(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll, {
      passive: true
    });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const nav = [['home', links.home, _i18n.messages.navHome], ['certificates', links.certificates, _i18n.messages.navCertificates], ['hours', links.hours, _i18n.messages.navHours]].filter(([, href]) => Boolean(href));
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("header", {
    className: `cls-header cls-root${scrolled ? ' is-scrolled' : ''}`,
    children: /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls-header__in",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(Link, {
        className: "cls-logo",
        href: links.home,
        "aria-label": intl.formatMessage(_i18n.messages.brandHome),
        children: [logoUrl && /*#__PURE__*/(0, _jsxRuntime.jsx)("img", {
          src: logoUrl,
          alt: ""
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("span", {
          children: ["Mission Hospital ", /*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
            children: "Learning"
          })]
        })]
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("nav", {
        className: "cls-header__nav",
        "aria-label": intl.formatMessage(_i18n.messages.navLabel),
        children: nav.map(([key, href, label]) => /*#__PURE__*/(0, _jsxRuntime.jsx)(Link, {
          href: href,
          "aria-current": current === key ? 'page' : undefined,
          children: intl.formatMessage(label)
        }, key))
      }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        className: "cls-header__right",
        children: [links.portal && /*#__PURE__*/(0, _jsxRuntime.jsx)("a", {
          className: "cls-btn cls-btn--ghost cls-btn--sm cls-header__portal",
          href: links.portal,
          children: intl.formatMessage(_i18n.messages.portalLink)
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(LanguageToggle, {
          value: locale,
          onChange: onLocaleChange
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(MessagesButton, {
          unread: unread,
          onClick: onOpenMessages
        }), user && /*#__PURE__*/(0, _jsxRuntime.jsx)(AccountMenu, {
          user: user,
          links: links,
          locale: locale,
          onLocaleChange: onLocaleChange
        })]
      })]
    })
  });
};
exports.ClassroomHeader = ClassroomHeader;
ClassroomHeader.propTypes = {
  current: _propTypes.default.oneOf(['home', 'certificates', 'hours']),
  links: linkShape.isRequired,
  user: userShape,
  unread: _propTypes.default.number,
  locale: _propTypes.default.string,
  onLocaleChange: _propTypes.default.func,
  onOpenMessages: _propTypes.default.func,
  logoUrl: _propTypes.default.string
};

// Phone tab bar < 768 px (doc 04 §5.2); hidden in the player.
const BottomTabs = ({
  current,
  links,
  unread = 0,
  onOpenMessages
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const Link = (0, _LinkContext.useLinkComponent)();
  const tabs = [['home', links.home, _icons.Home, _i18n.messages.navHomeShort], ['certificates', links.certificates, _icons.WorkspacePremium, _i18n.messages.navCertificates], ['hours', links.hours, _icons.Schedule, _i18n.messages.navHoursShort]].filter(([, href]) => Boolean(href));
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("nav", {
    className: "cls-tabs cls-root",
    "aria-label": intl.formatMessage(_i18n.messages.tabsLabel),
    children: [tabs.map(([key, href, icon, label]) => /*#__PURE__*/(0, _jsxRuntime.jsxs)(Link, {
      href: href,
      "aria-current": current === key ? 'page' : undefined,
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
        src: icon,
        size: 24
      }), intl.formatMessage(label)]
    }, key)), /*#__PURE__*/(0, _jsxRuntime.jsxs)("button", {
      type: "button",
      onClick: onOpenMessages,
      "aria-label": intl.formatMessage(_i18n.messages.messagesButton, {
        count: unread
      }),
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
        src: _icons.Notifications,
        size: 24
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        "aria-hidden": "true",
        children: intl.formatMessage(_i18n.messages.navMessages)
      }), unread > 0 && /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        className: "cls-badge",
        "aria-hidden": "true",
        children: unread > 9 ? '9+' : unread
      })]
    })]
  });
};
exports.BottomTabs = BottomTabs;
BottomTabs.propTypes = {
  current: _propTypes.default.oneOf(['home', 'certificates', 'hours']),
  links: linkShape.isRequired,
  unread: _propTypes.default.number,
  onOpenMessages: _propTypes.default.func
};