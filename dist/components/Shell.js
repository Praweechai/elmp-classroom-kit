"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TopBar = exports.SidebarNav = exports.ClassroomShell = void 0;
exports.useSidebarState = useSidebarState;
var _react = require("react");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _icons = require("@openedx/paragon/icons");
var _i18n = require("../i18n");
var _Header = require("./Header");
var _KitIcon = _interopRequireDefault(require("./KitIcon"));
var _LinkContext = require("./LinkContext");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// Plan 4 shell (F-115, D-61): left sidebar ≥ 768 px, top bar, bottom tabs on phones.
// Sidebar width: 248 px ≥ 1280, 72 px (icons) 768–1279 unless the learner chose otherwise (remembered per browser).
const SIDEBAR_KEY = 'elmp.sidebar';
const WIDE = '(min-width: 1280px)';
const readSidebar = () => {
  try {
    const v = window.localStorage.getItem(SIDEBAR_KEY);
    return v === 'collapsed' || v === 'expanded' ? v : 'auto';
  } catch (e) {
    return 'auto';
  }
};

// 'auto' follows the screen width (CSS); a click stores the learner's choice.
function useSidebarState() {
  const [state, setState] = (0, _react.useState)(readSidebar);
  const toggle = (0, _react.useCallback)(() => {
    setState(s => {
      let collapsed = s === 'collapsed';
      if (s === 'auto') {
        collapsed = !(typeof window.matchMedia === 'function' && window.matchMedia(WIDE).matches);
      }
      const next = collapsed ? 'expanded' : 'collapsed';
      try {
        window.localStorage.setItem(SIDEBAR_KEY, next);
      } catch (e) {/* not remembered in private mode */}
      return next;
    });
  }, []);
  return [state, toggle];
}
const linkShape = _propTypes.default.shape({
  home: _propTypes.default.string.isRequired,
  courses: _propTypes.default.string,
  certificates: _propTypes.default.string.isRequired,
  hours: _propTypes.default.string,
  account: _propTypes.default.string,
  help: _propTypes.default.string,
  signOut: _propTypes.default.string,
  portal: _propTypes.default.string
});
const userShape = _propTypes.default.shape({
  name: _propTypes.default.string.isRequired,
  photoUrl: _propTypes.default.string
});
const SidebarNav = ({
  current,
  links,
  unread = 0,
  onOpenMessages,
  state = 'auto',
  onToggle,
  logoUrl
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const Link = (0, _LinkContext.useLinkComponent)();
  const label = m => intl.formatMessage(m);
  const main = [['home', links.home, _icons.Home, _i18n.messages.navHomeShort], ['courses', links.courses, _icons.MenuBook, _i18n.messages.navCourses], ['certificates', links.certificates, _icons.WorkspacePremium, _i18n.messages.navCertificates], ['hours', links.hours, _icons.Schedule, _i18n.messages.navHours] // only while CE hours are switched on (F-112)
  ].filter(([, href]) => Boolean(href));
  const other = [['settings', links.account, _icons.Settings, _i18n.messages.navSettings], ['help', links.help, _icons.HelpOutline, _i18n.messages.navHelp]].filter(([, href]) => Boolean(href));
  const item = ([key, href, icon, text]) => /*#__PURE__*/(0, _jsxRuntime.jsx)("li", {
    children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(Link, {
      className: "cls-side__item",
      href: href,
      "aria-current": current === key ? 'page' : undefined,
      title: label(text),
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
        src: icon,
        size: 22
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        className: "cls-side__label",
        children: label(text)
      })]
    })
  }, key);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("nav", {
    className: "cls-side",
    "data-state": state,
    "aria-label": label(_i18n.messages.sidebarLabel),
    children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(Link, {
      className: "cls-side__brand",
      href: links.home,
      "aria-label": label(_i18n.messages.brandHome),
      children: [logoUrl ? /*#__PURE__*/(0, _jsxRuntime.jsx)("img", {
        src: logoUrl,
        alt: ""
      }) : /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        className: "cls-side__mark",
        "aria-hidden": "true",
        children: "M"
      }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("span", {
        className: "cls-side__label",
        children: ["Mission Hospital ", /*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
          children: "Learning"
        })]
      })]
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
      className: "cls-side__group",
      "aria-hidden": "true",
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        className: "cls-side__label",
        children: label(_i18n.messages.navMain)
      })
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("ul", {
      children: [main.map(item), /*#__PURE__*/(0, _jsxRuntime.jsx)("li", {
        children: /*#__PURE__*/(0, _jsxRuntime.jsxs)("button", {
          type: "button",
          className: "cls-side__item",
          onClick: onOpenMessages,
          title: label(_i18n.messages.navMessages),
          "aria-label": intl.formatMessage(_i18n.messages.messagesButton, {
            count: unread
          }),
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
            src: _icons.Notifications,
            size: 22
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
            className: "cls-side__label",
            "aria-hidden": "true",
            children: label(_i18n.messages.navMessages)
          }), unread > 0 && /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
            className: "cls-side__badge cls-num",
            "aria-hidden": "true",
            children: unread > 9 ? '9+' : unread
          })]
        })
      })]
    }), other.length > 0 && /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
        className: "cls-side__group",
        "aria-hidden": "true",
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
          className: "cls-side__label",
          children: label(_i18n.messages.navOther)
        })
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("ul", {
        children: other.map(item)
      })]
    }), onToggle && /*#__PURE__*/(0, _jsxRuntime.jsxs)("button", {
      type: "button",
      className: "cls-side__item cls-side__toggle",
      onClick: onToggle,
      "aria-expanded": state !== 'collapsed',
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
        src: _icons.ChevronLeft,
        size: 22,
        className: "cls-side__toggle-in"
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
        src: _icons.ChevronRight,
        size: 22,
        className: "cls-side__toggle-out"
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        className: "cls-side__label",
        children: label(_i18n.messages.navCollapse)
      })]
    })]
  });
};
exports.SidebarNav = SidebarNav;
SidebarNav.propTypes = {
  current: _propTypes.default.oneOf(['home', 'courses', 'certificates', 'hours', 'settings', 'help']),
  links: linkShape.isRequired,
  unread: _propTypes.default.number,
  onOpenMessages: _propTypes.default.func,
  state: _propTypes.default.oneOf(['auto', 'collapsed', 'expanded']),
  onToggle: _propTypes.default.func,
  logoUrl: _propTypes.default.string
};
const PortalLabel = () => {
  const intl = (0, _i18n.useClassroomIntl)();
  return intl.formatMessage(_i18n.messages.portalLink);
};

// 64 px top bar: page title, language, bell, avatar + name menu (doc 04-design §4).
const TopBar = ({
  title,
  user,
  links,
  unread = 0,
  locale,
  onLocaleChange,
  onOpenMessages
}) => /*#__PURE__*/(0, _jsxRuntime.jsxs)("header", {
  className: "cls-topbar",
  children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
    className: "cls-topbar__mark",
    "aria-hidden": "true",
    children: "M"
  }), /*#__PURE__*/(0, _jsxRuntime.jsx)("h1", {
    className: "cls-topbar__title",
    children: title
  }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
    className: "cls-topbar__right",
    children: [links.portal && /*#__PURE__*/(0, _jsxRuntime.jsx)("a", {
      className: "cls-btn cls-btn--ghost cls-btn--sm cls-topbar__portal",
      href: links.portal,
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(PortalLabel, {})
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
      className: "cls-topbar__lang",
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Header.LanguageToggle, {
        value: locale,
        onChange: onLocaleChange
      })
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Header.MessagesButton, {
      unread: unread,
      onClick: onOpenMessages
    }), user && /*#__PURE__*/(0, _jsxRuntime.jsx)(_Header.AccountMenu, {
      user: user,
      links: links,
      locale: locale,
      onLocaleChange: onLocaleChange,
      showName: true
    })]
  })]
});
exports.TopBar = TopBar;
TopBar.propTypes = {
  title: _propTypes.default.string.isRequired,
  user: userShape,
  links: linkShape.isRequired,
  unread: _propTypes.default.number,
  locale: _propTypes.default.string,
  onLocaleChange: _propTypes.default.func,
  onOpenMessages: _propTypes.default.func
};

// The whole frame: sidebar + top bar + page + phone tabs. Apps put a view inside.
const ClassroomShell = ({
  current,
  title,
  links,
  user,
  unread = 0,
  locale,
  onLocaleChange,
  onOpenMessages,
  logoUrl,
  children
}) => {
  const [state, toggle] = useSidebarState();
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
    className: "cls-shell cls-root",
    "data-sidebar": state,
    lang: locale,
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(SidebarNav, {
      current: current,
      links: links,
      unread: unread,
      onOpenMessages: onOpenMessages,
      state: state,
      onToggle: toggle,
      logoUrl: logoUrl
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls-shell__main",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(TopBar, {
        title: title,
        user: user,
        links: links,
        unread: unread,
        locale: locale,
        onLocaleChange: onLocaleChange,
        onOpenMessages: onOpenMessages
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("main", {
        className: "cls-shell__page",
        id: "main",
        children: children
      })]
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Header.BottomTabs, {
      current: ['home', 'courses', 'certificates', 'hours'].includes(current) ? current : undefined,
      links: links,
      unread: unread,
      onOpenMessages: onOpenMessages
    })]
  });
};
exports.ClassroomShell = ClassroomShell;
ClassroomShell.propTypes = {
  current: _propTypes.default.oneOf(['home', 'courses', 'certificates', 'hours', 'settings', 'help']),
  title: _propTypes.default.string.isRequired,
  links: linkShape.isRequired,
  user: userShape,
  unread: _propTypes.default.number,
  locale: _propTypes.default.string,
  onLocaleChange: _propTypes.default.func,
  onOpenMessages: _propTypes.default.func,
  logoUrl: _propTypes.default.string,
  children: _propTypes.default.node
};