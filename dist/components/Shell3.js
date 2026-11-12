"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TopBar3 = exports.SidebarNav3 = exports.SearchBox = exports.LanguageMenu = exports.ClassroomShell3 = exports.BottomTabs3 = exports.AnnouncementBanner = void 0;
exports.useDropdown = useDropdown;
exports.useSidebar3 = useSidebar3;
var _react = require("react");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _icons = require("@openedx/paragon/icons");
var _i18n = require("../i18n");
var _Header = require("./Header");
var _KitIcon = _interopRequireDefault(require("./KitIcon"));
var _LinkContext = require("./LinkContext");
var _useDisplaySettings = _interopRequireWildcard(require("../player/useDisplaySettings"));
var _jsxRuntime = require("react/jsx-runtime");
var cache;
function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var r, c, a = Object.defineProperty, n = { __proto__: null, default: e }; if (Object(e) !== e) return n; if (cache || "function" != typeof WeakMap || (cache = new WeakMap()), cache) { if (cache.has(e)) return cache.get(e); cache.set(e, n); } for (c in e) "default" !== c && {}.hasOwnProperty.call(e, c) && ((r = a && Object.getOwnPropertyDescriptor(e, c)) && (r.get || r.set) ? a(n, c, r) : n[c] = e[c]); return n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, e) { if ("object" != typeof t || !t) return t; var r; if ("undefined" != typeof Symbol && void 0 !== (r = t[Symbol.toPrimitive])) { var i = r.call(t, e || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === e ? String : Number)(t); } // Plan 5 Shell 3 (S-100…S-105, D-73…D-77): NetAcad page arrangement, page links in the left sidebar,
// thin top bar (title, Explore, search with suggestions, EN/TH, help, profile), green HR banner (CA-14),
// footer, phone bottom tabs. The Plan 4 ClassroomShell stays exported until the forks move (P5-4).
const PAGES = [['home', _icons.Home, _i18n.messages.shell3MyLearning, _i18n.messages.shell3MyLearning], ['courses', _icons.MenuBook, _i18n.messages.shell3Courses, _i18n.messages.shell3Courses], ['grades', _icons.BarChart, _i18n.messages.shell3Grades, _i18n.messages.shell3Grades], ['progress', _icons.DonutLarge, _i18n.messages.shell3Progress, _i18n.messages.shell3Progress], ['certificates', _icons.WorkspacePremium, _i18n.messages.shell3Certificates, _i18n.messages.shell3CertsShort], ['hours', _icons.Schedule, _i18n.messages.navHours, _i18n.messages.navHoursShort] // only while CE hours are on (F-112)
];
const linkShape = _propTypes.default.shape({
  home: _propTypes.default.string.isRequired,
  courses: _propTypes.default.string,
  grades: _propTypes.default.string,
  progress: _propTypes.default.string,
  certificates: _propTypes.default.string,
  hours: _propTypes.default.string,
  account: _propTypes.default.string,
  signOut: _propTypes.default.string,
  privacy: _propTypes.default.string,
  accessibility: _propTypes.default.string
});
const itemShape = _propTypes.default.shape({
  label: _propTypes.default.string.isRequired,
  href: _propTypes.default.string.isRequired
});
const userShape = _propTypes.default.shape({
  name: _propTypes.default.string.isRequired,
  email: _propTypes.default.string,
  position: _propTypes.default.string,
  department: _propTypes.default.string,
  photoUrl: _propTypes.default.string
});
const textShape = _propTypes.default.shape({
  en: _propTypes.default.string,
  th: _propTypes.default.string
});

// Shell 3 sidebar: open unless the learner collapsed it (remembered per browser, same key as Plan 4).
const SIDEBAR_KEY = 'elmp.sidebar';
function useSidebar3() {
  const [state, setState] = (0, _react.useState)(() => {
    try {
      return window.localStorage.getItem(SIDEBAR_KEY) === 'collapsed' ? 'collapsed' : 'expanded';
    } catch (e) {
      return 'expanded';
    }
  });
  const toggle = () => setState(s => {
    const next = s === 'collapsed' ? 'expanded' : 'collapsed';
    try {
      window.localStorage.setItem(SIDEBAR_KEY, next);
    } catch (e) {/* private mode: not remembered */}
    return next;
  });
  return [state, toggle];
}

// One open dropdown at a time; Esc and outside click close it and focus goes back to its button.
function useDropdown() {
  const [open, setOpen] = (0, _react.useState)(null);
  const ref = (0, _react.useRef)(null);
  (0, _react.useEffect)(() => {
    if (!open) {
      return undefined;
    }
    const close = focus => {
      setOpen(null);
      if (focus) {
        ref.current?.querySelector(`[data-dd="${open}"]`)?.focus();
      }
    };
    const onDown = e => {
      if (!ref.current?.contains(e.target)) {
        close(false);
      }
    };
    const onKey = e => {
      if (e.key === 'Escape') {
        close(true);
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  const toggle = name => setOpen(o => o === name ? null : name);
  return {
    open,
    setOpen,
    toggle,
    ref
  };
}
const SidebarNav3 = ({
  current,
  links,
  user,
  state = 'auto',
  onToggle,
  logoUrl
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const Link = (0, _LinkContext.useLinkComponent)();
  const t = m => intl.formatMessage(m);
  const collapsed = state === 'collapsed';
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("nav", {
    className: "cls3-side",
    "data-state": state,
    "aria-label": t(_i18n.messages.sidebarLabel),
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      className: "cls3-side__brand",
      children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(Link, {
        className: "cls3-side__logo",
        href: links.home,
        "aria-label": t(_i18n.messages.brandHome),
        children: [logoUrl ? /*#__PURE__*/(0, _jsxRuntime.jsx)("img", {
          src: logoUrl,
          alt: ""
        }) : /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
          className: "cls3-side__mark",
          "aria-hidden": "true",
          children: "M"
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("span", {
          className: "cls3-side__label",
          children: ["Mission Hospital ", /*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
            children: "Learning"
          })]
        })]
      })
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
      className: "cls3-side__group",
      "aria-hidden": "true",
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        className: "cls3-side__label",
        children: t(_i18n.messages.shell3Group)
      })
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("ul", {
      className: "cls3-side__list",
      children: PAGES.filter(([key]) => links[key]).map(([key, icon, label]) => /*#__PURE__*/(0, _jsxRuntime.jsx)("li", {
        children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(Link, {
          className: "cls3-side__item",
          href: links[key],
          "aria-current": current === key ? 'page' : undefined,
          title: t(label),
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
            src: icon,
            size: 22
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
            className: "cls3-side__label",
            children: t(label)
          })]
        })
      }, key))
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls3-side__foot",
      children: [user && /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        className: "cls3-side__who",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Header.Avatar, {
          user: user
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("span", {
          className: "cls3-side__label",
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
            children: user.name
          }), (user.position || user.department) && /*#__PURE__*/(0, _jsxRuntime.jsx)("small", {
            children: [user.position, user.department].filter(Boolean).join(' · ')
          })]
        })]
      }), links.signOut && /*#__PURE__*/(0, _jsxRuntime.jsxs)("a", {
        className: "cls3-side__item cls3-side__out",
        href: links.signOut,
        title: t(_i18n.messages.signOut),
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
          src: _icons.Logout,
          size: 22
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
          className: "cls3-side__label",
          children: t(_i18n.messages.signOut)
        })]
      }), onToggle && /*#__PURE__*/(0, _jsxRuntime.jsxs)("button", {
        type: "button",
        className: "cls3-side__item cls3-side__toggle",
        onClick: onToggle,
        "aria-expanded": !collapsed,
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
          src: collapsed ? _icons.ChevronRight : _icons.ChevronLeft,
          size: 22
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
          className: "cls3-side__label",
          children: t(collapsed ? _i18n.messages.shell3Expand : _i18n.messages.shell3Collapse)
        })]
      })]
    })]
  });
};
exports.SidebarNav3 = SidebarNav3;
SidebarNav3.propTypes = {
  current: _propTypes.default.oneOf(['home', 'courses', 'grades', 'progress', 'certificates', 'hours']),
  links: linkShape.isRequired,
  user: userShape,
  state: _propTypes.default.oneOf(['auto', 'collapsed', 'expanded']),
  onToggle: _propTypes.default.func,
  logoUrl: _propTypes.default.string
};

// Search box with a suggestion list (D-76). Part 1: suggestions = course titles the app already has
// (CA-11) + help items; Part 2: the app passes CA-15 results. Enter without a pick → onSearch(q).
const SearchBox = ({
  items,
  onSearch,
  dd,
  maxShown = 6
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const Link = (0, _LinkContext.useLinkComponent)();
  const [q, setQ] = (0, _react.useState)('');
  const listId = (0, _react.useId)();
  const shown = (0, _react.useMemo)(() => {
    const needle = q.trim().toLowerCase();
    return items.filter(i => !needle || i.label.toLowerCase().includes(needle)).slice(0, maxShown);
  }, [items, q, maxShown]);
  const open = dd.open === 'search';
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("form", {
    className: "cls3-search",
    role: "search",
    onSubmit: e => {
      e.preventDefault();
      dd.setOpen(null);
      onSearch?.(q.trim());
    },
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
      src: _icons.Search,
      size: 18
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("input", {
      type: "search",
      value: q,
      "data-dd": "search",
      onChange: e => {
        setQ(e.target.value);
        dd.setOpen('search');
      },
      onFocus: () => dd.setOpen('search'),
      placeholder: intl.formatMessage(_i18n.messages.shell3Search),
      "aria-label": intl.formatMessage(_i18n.messages.shell3Search),
      role: "combobox",
      "aria-expanded": open,
      "aria-controls": open ? listId : undefined,
      "aria-autocomplete": "list"
    }), open && /*#__PURE__*/(0, _jsxRuntime.jsx)("ul", {
      className: "cls3-menu cls3-menu--suggest",
      id: listId,
      "aria-label": intl.formatMessage(_i18n.messages.shell3Suggestions),
      children: shown.length === 0 ? /*#__PURE__*/(0, _jsxRuntime.jsx)("li", {
        className: "cls3-menu__none",
        children: intl.formatMessage(_i18n.messages.shell3NoSuggestions)
      }) : shown.map(i => /*#__PURE__*/(0, _jsxRuntime.jsx)("li", {
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(Link, {
          className: "cls3-menu__item",
          href: i.href,
          onClick: () => dd.setOpen(null),
          children: i.label
        })
      }, `${i.href}|${i.label}`))
    })]
  });
};
exports.SearchBox = SearchBox;
SearchBox.propTypes = {
  items: _propTypes.default.arrayOf(itemShape).isRequired,
  onSearch: _propTypes.default.func,
  dd: _propTypes.default.shape({
    open: _propTypes.default.string,
    setOpen: _propTypes.default.func
  }).isRequired,
  maxShown: _propTypes.default.number
};

// A labelled button + menu of links (Explore, Help).
const LinkMenu = ({
  name,
  dd,
  label,
  icon,
  items,
  showLabel = false,
  right = false,
  footer
}) => {
  const Link = (0, _LinkContext.useLinkComponent)();
  const open = dd.open === name;
  const menuId = (0, _react.useId)();
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
    className: "cls3-dd",
    children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("button", {
      type: "button",
      className: `cls3-tb-btn${showLabel ? ' cls3-tb-btn--label' : ''}`,
      "data-dd": name,
      "aria-haspopup": "true",
      "aria-expanded": open,
      "aria-controls": open ? menuId : undefined,
      "aria-label": showLabel ? undefined : label,
      onClick: () => dd.toggle(name),
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
        src: icon,
        size: 20
      }), showLabel && /*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
        children: label
      }), showLabel && /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
        src: _icons.KeyboardArrowDown,
        size: 18
      })]
    }), open && /*#__PURE__*/(0, _jsxRuntime.jsxs)("ul", {
      className: `cls3-menu${right ? ' cls3-menu--right' : ''}`,
      id: menuId,
      children: [items.map(i => /*#__PURE__*/(0, _jsxRuntime.jsx)("li", {
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(Link, {
          className: "cls3-menu__item",
          href: i.href,
          onClick: () => dd.setOpen(null),
          children: i.label
        })
      }, `${i.href}|${i.label}`)), footer]
    })]
  });
};
LinkMenu.propTypes = {
  name: _propTypes.default.string.isRequired,
  dd: _propTypes.default.shape({
    open: _propTypes.default.string,
    setOpen: _propTypes.default.func,
    toggle: _propTypes.default.func
  }).isRequired,
  label: _propTypes.default.string.isRequired,
  icon: _propTypes.default.elementType.isRequired,
  items: _propTypes.default.arrayOf(itemShape).isRequired,
  showLabel: _propTypes.default.bool,
  right: _propTypes.default.bool,
  footer: _propTypes.default.node
};
const LanguageMenu = ({
  dd,
  locale,
  onLocaleChange
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const lang = (0, _i18n.kitLanguage)(locale);
  const open = dd.open === 'lang';
  const listId = (0, _react.useId)();
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
    className: "cls3-dd",
    children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("button", {
      type: "button",
      className: "cls3-tb-btn cls3-tb-btn--label",
      "data-dd": "lang",
      "aria-haspopup": "listbox",
      "aria-expanded": open,
      "aria-controls": open ? listId : undefined,
      "aria-label": intl.formatMessage(_i18n.messages.languageGroup),
      onClick: () => dd.toggle('lang'),
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
        src: _icons.Language,
        size: 20
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
        children: lang.toUpperCase()
      })]
    }), open && /*#__PURE__*/(0, _jsxRuntime.jsx)("ul", {
      className: "cls3-menu cls3-menu--right",
      role: "listbox",
      id: listId,
      "aria-label": intl.formatMessage(_i18n.messages.languageGroup),
      children: [['en', 'English'], ['th', 'ไทย (Thai)']].map(([code, full]) => /*#__PURE__*/(0, _jsxRuntime.jsx)("li", {
        role: "presentation",
        children: /*#__PURE__*/(0, _jsxRuntime.jsxs)("button", {
          type: "button",
          role: "option",
          lang: code,
          "aria-selected": lang === code,
          className: "cls3-menu__item",
          onClick: () => {
            dd.setOpen(null);
            if (lang !== code) {
              onLocaleChange?.(code);
            }
          },
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
            children: full
          }), lang === code && /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
            className: "cls3-menu__tick",
            "aria-hidden": "true",
            children: "\u2713"
          })]
        })
      }, code))
    })]
  });
};
exports.LanguageMenu = LanguageMenu;
LanguageMenu.propTypes = {
  dd: _propTypes.default.shape({
    open: _propTypes.default.string,
    setOpen: _propTypes.default.func,
    toggle: _propTypes.default.func
  }).isRequired,
  locale: _propTypes.default.string,
  onLocaleChange: _propTypes.default.func
};
const ProfileMenu = ({
  dd,
  user,
  links
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const open = dd.open === 'profile';
  const menuId = (0, _react.useId)();
  const first = user.name.split(/\s+/)[0];
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
    className: "cls3-dd",
    children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("button", {
      type: "button",
      className: "cls3-profile",
      "data-dd": "profile",
      "aria-haspopup": "menu",
      "aria-expanded": open,
      "aria-controls": open ? menuId : undefined,
      "aria-label": intl.formatMessage(_i18n.messages.accountButton, {
        name: user.name
      }),
      onClick: () => dd.toggle('profile'),
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Header.Avatar, {
        user: user
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        className: "cls3-profile__name",
        "aria-hidden": "true",
        children: first
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
        src: _icons.KeyboardArrowDown,
        size: 18
      })]
    }), open && /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls3-menu cls3-menu--right cls3-menu--profile",
      id: menuId,
      children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        className: "cls3-menu__head",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
          children: user.name
        }), user.email && /*#__PURE__*/(0, _jsxRuntime.jsx)("small", {
          children: user.email
        })]
      }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        role: "menu",
        "aria-label": user.name,
        children: [links.account && /*#__PURE__*/(0, _jsxRuntime.jsx)("a", {
          role: "menuitem",
          className: "cls3-menu__item",
          href: links.account,
          children: intl.formatMessage(_i18n.messages.shell3Profile)
        }), links.signOut && /*#__PURE__*/(0, _jsxRuntime.jsx)("a", {
          role: "menuitem",
          className: "cls3-menu__item cls3-menu__item--danger",
          href: links.signOut,
          children: intl.formatMessage(_i18n.messages.signOut)
        })]
      })]
    })]
  });
};
ProfileMenu.propTypes = {
  dd: _propTypes.default.shape({
    open: _propTypes.default.string,
    toggle: _propTypes.default.func
  }).isRequired,
  user: userShape.isRequired,
  links: linkShape.isRequired
};
const TopBar3 = ({
  title,
  user,
  links,
  locale,
  onLocaleChange,
  categories = [],
  allCoursesHref,
  searchItems,
  onSearch,
  helpItems = [],
  unread = 0,
  onOpenMessages,
  dark,
  onToggleDark
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const Link = (0, _LinkContext.useLinkComponent)();
  const dd = useDropdown();
  const t = m => intl.formatMessage(m);
  const exploreFooter = allCoursesHref ? /*#__PURE__*/(0, _jsxRuntime.jsx)("li", {
    className: "cls3-menu__sep",
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(Link, {
      className: "cls3-menu__item",
      href: allCoursesHref,
      onClick: () => dd.setOpen(null),
      children: t(_i18n.messages.shell3ExploreAll)
    })
  }) : null;
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("header", {
    className: "cls3-topbar",
    children: /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls3-topbar__inner",
      ref: dd.ref,
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        className: "cls3-topbar__mark",
        "aria-hidden": "true",
        children: "M"
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("h1", {
        className: "cls3-topbar__title",
        children: title
      }), categories.length > 0 && /*#__PURE__*/(0, _jsxRuntime.jsx)(LinkMenu, {
        name: "explore",
        dd: dd,
        label: t(_i18n.messages.shell3Explore),
        icon: _icons.Apps,
        items: categories,
        showLabel: true,
        footer: exploreFooter
      }), searchItems && /*#__PURE__*/(0, _jsxRuntime.jsx)(SearchBox, {
        items: searchItems,
        onSearch: onSearch,
        dd: dd
      }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        className: "cls3-topbar__right",
        children: [onToggleDark && /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
          type: "button",
          className: "cls3-tb-btn",
          "aria-pressed": Boolean(dark),
          "aria-label": t(_i18n.messages.v2DarkOn),
          onClick: onToggleDark,
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
            src: dark ? _icons.LightMode : _icons.DarkMode,
            size: 20
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(LanguageMenu, {
          dd: dd,
          locale: locale,
          onLocaleChange: onLocaleChange
        }), helpItems.length > 0 && /*#__PURE__*/(0, _jsxRuntime.jsx)(LinkMenu, {
          name: "help",
          dd: dd,
          label: t(_i18n.messages.shell3Help),
          icon: _icons.HelpOutline,
          items: helpItems,
          right: true
        }), onOpenMessages && /*#__PURE__*/(0, _jsxRuntime.jsx)(_Header.MessagesButton, {
          unread: unread,
          onClick: onOpenMessages
        }), user && /*#__PURE__*/(0, _jsxRuntime.jsx)(ProfileMenu, {
          dd: dd,
          user: user,
          links: links
        })]
      })]
    })
  });
};
exports.TopBar3 = TopBar3;
TopBar3.propTypes = {
  title: _propTypes.default.string.isRequired,
  user: userShape,
  links: linkShape.isRequired,
  locale: _propTypes.default.string,
  onLocaleChange: _propTypes.default.func,
  categories: _propTypes.default.arrayOf(itemShape),
  allCoursesHref: _propTypes.default.string,
  searchItems: _propTypes.default.arrayOf(itemShape),
  // undefined = no search box (features.search off)
  onSearch: _propTypes.default.func,
  helpItems: _propTypes.default.arrayOf(itemShape),
  unread: _propTypes.default.number,
  onOpenMessages: _propTypes.default.func,
  dark: _propTypes.default.bool,
  onToggleDark: _propTypes.default.func // kit 2.1: dark mode button (same `elmp.display` setting as the player)
};
const DISMISS_KEY = 'elmp.announcement.dismissed';
const readDismissed = () => {
  try {
    return window.sessionStorage.getItem(DISMISS_KEY);
  } catch (e) {
    return null;
  }
};

// Green banner (D-77). `announcement` = CA-14 `data` (or null → nothing). Dismissed per browser tab, by id.
const AnnouncementBanner = ({
  announcement,
  locale
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const Link = (0, _LinkContext.useLinkComponent)();
  const [dismissed, setDismissed] = (0, _react.useState)(readDismissed);
  if (!announcement || String(announcement.id) === dismissed) {
    return null;
  }
  const lang = (0, _i18n.kitLanguage)(locale);
  const pick = v => v ? v[lang] || v.en : '';
  const dismiss = () => {
    setDismissed(String(announcement.id));
    try {
      window.sessionStorage.setItem(DISMISS_KEY, String(announcement.id));
    } catch (e) {/* private mode */}
  };
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("section", {
    className: `cls3-banner cls3-banner--${announcement.tone === 'urgent' ? 'urgent' : 'info'}`,
    "aria-label": intl.formatMessage(_i18n.messages.shell3Announcement),
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
      src: _icons.Campaign,
      size: 22
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("p", {
      children: [pick(announcement.text), announcement.link && /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
        children: [' ', /*#__PURE__*/(0, _jsxRuntime.jsx)(Link, {
          href: announcement.link.href,
          children: pick(announcement.link.label)
        })]
      })]
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
      type: "button",
      className: "cls3-banner__close",
      onClick: dismiss,
      "aria-label": intl.formatMessage(_i18n.messages.shell3Dismiss),
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
        src: _icons.Close,
        size: 20
      })
    })]
  });
};
exports.AnnouncementBanner = AnnouncementBanner;
AnnouncementBanner.propTypes = {
  announcement: _propTypes.default.shape({
    id: _propTypes.default.oneOfType([_propTypes.default.number, _propTypes.default.string]).isRequired,
    tone: _propTypes.default.oneOf(['info', 'urgent']),
    text: textShape.isRequired,
    link: _propTypes.default.shape({
      href: _propTypes.default.string.isRequired,
      label: textShape.isRequired
    })
  }),
  locale: _propTypes.default.string
};
const BottomTabs3 = ({
  current,
  links
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const Link = (0, _LinkContext.useLinkComponent)();
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("nav", {
    className: "cls3-tabs cls-root",
    "aria-label": intl.formatMessage(_i18n.messages.tabsLabel),
    children: PAGES.filter(([key]) => key !== 'hours' && links[key]).map(([key, icon,, short]) => /*#__PURE__*/(0, _jsxRuntime.jsxs)(Link, {
      href: links[key],
      "aria-current": current === key ? 'page' : undefined,
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
        src: icon,
        size: 24
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        children: intl.formatMessage(short)
      })]
    }, key))
  });
};
exports.BottomTabs3 = BottomTabs3;
BottomTabs3.propTypes = {
  current: _propTypes.default.oneOf(['home', 'courses', 'grades', 'progress', 'certificates', 'hours']),
  links: linkShape.isRequired
};
const ClassroomShell3 = ({
  current,
  title,
  links,
  user,
  locale,
  onLocaleChange,
  logoUrl,
  announcement,
  categories,
  allCoursesHref,
  searchItems,
  onSearch,
  helpItems,
  unread,
  onOpenMessages,
  pageAs = 'main',
  display,
  children
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const [state, toggle] = useSidebar3();
  const {
    settings
  } = (0, _useDisplaySettings.default)(display);
  const Page = pageAs === 'div' ? 'div' : 'main';
  // Kit 2.1: pause looping alerts while the tab is hidden (battery; doc 10 motion rules).
  (0, _react.useEffect)(() => {
    const onVisible = () => document.documentElement.classList.toggle('cls-tab-hidden', document.hidden);
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", _objectSpread(_objectSpread({
    className: "cls3-shell cls-root",
    "data-sidebar": state,
    lang: (0, _i18n.kitLanguage)(locale)
  }, (0, _useDisplaySettings.displayAttributes)(settings)), {}, {
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(AnnouncementBanner, {
      announcement: announcement,
      locale: locale
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls3-shell__frame",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(SidebarNav3, {
        current: current,
        links: links,
        user: user,
        state: state,
        onToggle: toggle,
        logoUrl: logoUrl
      }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        className: "cls3-shell__main",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(TopBar3, {
          title: title,
          user: user,
          links: links,
          locale: locale,
          onLocaleChange: onLocaleChange,
          categories: categories,
          allCoursesHref: allCoursesHref || links.courses,
          searchItems: searchItems,
          onSearch: onSearch,
          helpItems: helpItems,
          unread: unread,
          onOpenMessages: onOpenMessages
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(Page, {
          className: "cls3-shell__page",
          id: Page === 'main' ? 'main' : undefined,
          children: children
        }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("footer", {
          className: "cls3-footer",
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
            children: intl.formatMessage(_i18n.messages.shell3Footer, {
              year: new Date().getFullYear()
            })
          }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
            className: "cls3-footer__links",
            children: [links.privacy && /*#__PURE__*/(0, _jsxRuntime.jsx)("a", {
              href: links.privacy,
              children: intl.formatMessage(_i18n.messages.shell3Privacy)
            }), links.accessibility && /*#__PURE__*/(0, _jsxRuntime.jsx)("a", {
              href: links.accessibility,
              children: intl.formatMessage(_i18n.messages.shell3Accessibility)
            })]
          })]
        })]
      })]
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)(BottomTabs3, {
      current: current,
      links: links
    })]
  }));
};
exports.ClassroomShell3 = ClassroomShell3;
ClassroomShell3.propTypes = {
  current: _propTypes.default.oneOf(['home', 'courses', 'grades', 'progress', 'certificates', 'hours']),
  title: _propTypes.default.string.isRequired,
  links: linkShape.isRequired,
  user: userShape,
  locale: _propTypes.default.string,
  onLocaleChange: _propTypes.default.func,
  logoUrl: _propTypes.default.string,
  announcement: AnnouncementBanner.propTypes.announcement,
  categories: _propTypes.default.arrayOf(itemShape),
  allCoursesHref: _propTypes.default.string,
  searchItems: _propTypes.default.arrayOf(itemShape),
  onSearch: _propTypes.default.func,
  helpItems: _propTypes.default.arrayOf(itemShape),
  unread: _propTypes.default.number,
  onOpenMessages: _propTypes.default.func,
  pageAs: _propTypes.default.oneOf(['main', 'div']),
  display: _propTypes.default.shape({
    theme: _propTypes.default.oneOf(['light', 'dark'])
  }),
  // starting display settings (stories, tests)
  children: _propTypes.default.node
};