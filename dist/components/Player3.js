"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.flattenOutline = exports.default = exports.UnitPager = exports.PlayerTopBar3 = exports.PlayerToolbar = exports.OutlinePanel = void 0;
exports.useArrowKeys = useArrowKeys;
exports.useFullscreen = useFullscreen;
var _react = require("react");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _icons = require("@openedx/paragon/icons");
var _i18n = require("../i18n");
var _useDisplaySettings = _interopRequireWildcard(require("../player/useDisplaySettings"));
var _KitIcon = _interopRequireDefault(require("./KitIcon"));
var _LinkContext = require("./LinkContext");
var _Shell = require("./Shell3");
var _jsxRuntime = require("react/jsx-runtime");
var cache;
function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var r, c, a = Object.defineProperty, n = { __proto__: null, default: e }; if (Object(e) !== e) return n; if (cache || "function" != typeof WeakMap || (cache = new WeakMap()), cache) { if (cache.has(e)) return cache.get(e); cache.set(e, n); } for (c in e) "default" !== c && {}.hasOwnProperty.call(e, c) && ((r = a && Object.getOwnPropertyDescriptor(e, c)) && (r.get || r.set) ? a(n, c, r) : n[c] = e[c]); return n; }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, e) { if ("object" != typeof t || !t) return t; var r; if ("undefined" != typeof Symbol && void 0 !== (r = t[Symbol.toPrimitive])) { var i = r.call(t, e || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === e ? String : Number)(t); } // S-105 Course player 3 (F-136, D-81, NetAcad arrangement): own top bar (outline toggle, "‹ My Learning",
// logo, course title, the five tools), left panel with Course outline / Resources tabs, main area with
// breadcrumb + unit title + the lesson (children = the iframe), big side arrows and a footer pager.
// Outline data = the Plan 4 shape: sections → items {id, title, href, complete, current, locked}.
const clamp = v => Math.max(0, Math.min(100, Math.round(Number(v) || 0)));
const EDITABLE = /^(INPUT|TEXTAREA|SELECT)$/;
const SWITCHES = [['contrast', _i18n.messages.pl3Contrast], ['spacing', _i18n.messages.pl3Spacing], ['reduceMotion', _i18n.messages.pl3Motion]];

// sections → one flat list of units with their place (1.1, 1.2 …) and section title.
const flattenOutline = (sections = []) => sections.flatMap((s, si) => s.items.map((item, ii) => _objectSpread(_objectSpread({}, item), {}, {
  number: `${si + 1}.${ii + 1}`,
  sectionId: s.id,
  sectionTitle: s.title
})));
exports.flattenOutline = flattenOutline;
const sectionPct = s => s.items.length ? clamp(s.items.filter(i => i.complete).length / s.items.length * 100) : 0;

// ← / → move between units, unless the learner is typing or a modifier is held.
function useArrowKeys(onPrev, onNext, enabled = true) {
  (0, _react.useEffect)(() => {
    if (!enabled) {
      return undefined;
    }
    const onKey = e => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.defaultPrevented) {
        return;
      }
      const el = e.target;
      if (el && (EDITABLE.test(el.tagName) || el.isContentEditable)) {
        return;
      }
      if (e.key === 'ArrowLeft' && onPrev) {
        e.preventDefault();
        onPrev();
      }
      if (e.key === 'ArrowRight' && onNext) {
        e.preventDefault();
        onNext();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onPrev, onNext, enabled]);
}

// ---- Toolbar: dark mode, search in course, language, accessibility panel, full screen ----
const PlayerToolbar = ({
  settings,
  onChange,
  onReset,
  units = [],
  onSelectUnit,
  locale,
  onLocaleChange,
  fullscreen,
  onToggleFullscreen
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const Link = (0, _LinkContext.useLinkComponent)();
  const t = (m, v) => intl.formatMessage(m, v);
  const dd = (0, _Shell.useDropdown)();
  const [q, setQ] = (0, _react.useState)('');
  const searchId = (0, _react.useId)();
  const a11yId = (0, _react.useId)();
  const needle = q.trim().toLowerCase();
  const results = needle ? units.filter(u => !u.locked && `${u.title} ${u.sectionTitle}`.toLowerCase().includes(needle)).slice(0, 8) : [];
  const dark = settings.theme === 'dark';
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
    className: "cls3-ptools",
    ref: dd.ref,
    role: "toolbar",
    "aria-label": t(_i18n.messages.pl3Tools),
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
      type: "button",
      className: "cls3-ptool",
      "aria-pressed": dark,
      "aria-label": t(_i18n.messages.pl3Dark),
      title: t(_i18n.messages.pl3Dark),
      onClick: () => onChange({
        theme: dark ? 'light' : 'dark'
      }),
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
        src: dark ? _icons.LightMode : _icons.DarkMode,
        size: 20
      })
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls3-dd",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
        type: "button",
        className: "cls3-ptool",
        "data-dd": "psearch",
        "aria-expanded": dd.open === 'psearch',
        "aria-controls": dd.open === 'psearch' ? searchId : undefined,
        "aria-label": t(_i18n.messages.pl3Search),
        title: t(_i18n.messages.pl3Search),
        onClick: () => dd.toggle('psearch'),
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
          src: _icons.Search,
          size: 20
        })
      }), dd.open === 'psearch' && /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        className: "cls3-pop cls3-pop--wide",
        id: searchId,
        role: "search",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("label", {
          className: "cls3-filter",
          htmlFor: `${searchId}-q`,
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
            src: _icons.Search,
            size: 18
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
            className: "cls-sr",
            children: t(_i18n.messages.pl3Search)
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)("input", {
            id: `${searchId}-q`,
            type: "search",
            autoFocus: true,
            value: q,
            placeholder: t(_i18n.messages.pl3SearchPlaceholder),
            onChange: e => setQ(e.target.value)
          })]
        }), needle && results.length === 0 && /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
          className: "cls3-menu__none",
          children: t(_i18n.messages.pl3NoMatches)
        }), results.length > 0 && /*#__PURE__*/(0, _jsxRuntime.jsx)("ul", {
          className: "cls3-pop__list",
          children: results.map(u => /*#__PURE__*/(0, _jsxRuntime.jsx)("li", {
            children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(Link, {
              className: "cls3-menu__item cls3-pop__hit",
              href: u.href,
              onClick: () => {
                dd.setOpen(null);
                setQ('');
                onSelectUnit?.(u);
              },
              children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
                children: u.title
              }), /*#__PURE__*/(0, _jsxRuntime.jsx)("small", {
                children: u.sectionTitle
              })]
            })
          }, u.id))
        })]
      })]
    }), onLocaleChange && /*#__PURE__*/(0, _jsxRuntime.jsx)(_Shell.LanguageMenu, {
      dd: dd,
      locale: locale,
      onLocaleChange: onLocaleChange
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls3-dd",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
        type: "button",
        className: "cls3-ptool",
        "data-dd": "a11y",
        "aria-expanded": dd.open === 'a11y',
        "aria-controls": dd.open === 'a11y' ? a11yId : undefined,
        "aria-label": t(_i18n.messages.pl3A11y),
        title: t(_i18n.messages.pl3A11y),
        onClick: () => dd.toggle('a11y'),
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
          src: _icons.AccessibilityNew,
          size: 20
        })
      }), dd.open === 'a11y' && /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        className: "cls3-pop cls3-pop--a11y",
        id: a11yId,
        role: "group",
        "aria-label": t(_i18n.messages.pl3A11y),
        children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
          className: "cls3-pop__row",
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
            id: `${a11yId}-size`,
            children: t(_i18n.messages.pl3TextSize)
          }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
            className: "cls3-stepper",
            role: "group",
            "aria-labelledby": `${a11yId}-size`,
            children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
              type: "button",
              "aria-label": t(_i18n.messages.pl3Smaller),
              disabled: settings.textScale <= _useDisplaySettings.TEXT_SCALE.min,
              onClick: () => onChange({
                textScale: settings.textScale - _useDisplaySettings.TEXT_SCALE.step
              }),
              children: "A\u2212"
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
              className: "cls-num",
              "aria-live": "polite",
              children: `${settings.textScale}%`
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
              type: "button",
              "aria-label": t(_i18n.messages.pl3Larger),
              disabled: settings.textScale >= _useDisplaySettings.TEXT_SCALE.max,
              onClick: () => onChange({
                textScale: settings.textScale + _useDisplaySettings.TEXT_SCALE.step
              }),
              children: "A+"
            })]
          })]
        }), SWITCHES.map(([k, m]) => /*#__PURE__*/(0, _jsxRuntime.jsxs)("label", {
          className: "cls3-pop__row cls3-switch",
          htmlFor: `${a11yId}-${k}`,
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
            children: t(m)
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)("input", {
            id: `${a11yId}-${k}`,
            type: "checkbox",
            role: "switch",
            checked: settings[k],
            onChange: e => onChange({
              [k]: e.target.checked
            })
          }), /*#__PURE__*/(0, _jsxRuntime.jsx)("i", {
            "aria-hidden": "true"
          })]
        }, k)), /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
          type: "button",
          className: "cls-btn cls-btn--secondary cls-btn--sm",
          onClick: onReset,
          children: t(_i18n.messages.pl3Reset)
        })]
      })]
    }), onToggleFullscreen && /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
      type: "button",
      className: "cls3-ptool",
      "aria-pressed": Boolean(fullscreen),
      "aria-label": t(_i18n.messages.pl3Fullscreen),
      title: t(fullscreen ? _i18n.messages.pl3ExitFullscreen : _i18n.messages.pl3Fullscreen),
      onClick: onToggleFullscreen,
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
        src: fullscreen ? _icons.FullscreenExit : _icons.Fullscreen,
        size: 20
      })
    })]
  });
};
exports.PlayerToolbar = PlayerToolbar;
PlayerToolbar.propTypes = {
  settings: _propTypes.default.shape({
    theme: _propTypes.default.string,
    textScale: _propTypes.default.number,
    contrast: _propTypes.default.bool,
    spacing: _propTypes.default.bool,
    reduceMotion: _propTypes.default.bool
  }).isRequired,
  onChange: _propTypes.default.func.isRequired,
  onReset: _propTypes.default.func.isRequired,
  units: _propTypes.default.arrayOf(_propTypes.default.shape({
    id: _propTypes.default.string,
    title: _propTypes.default.string
  })),
  onSelectUnit: _propTypes.default.func,
  locale: _propTypes.default.string,
  onLocaleChange: _propTypes.default.func,
  fullscreen: _propTypes.default.bool,
  onToggleFullscreen: _propTypes.default.func
};

// ---- Left panel: tabs Course outline / Resources ----
const itemShape = _propTypes.default.shape({
  id: _propTypes.default.string.isRequired,
  title: _propTypes.default.string.isRequired,
  href: _propTypes.default.string,
  complete: _propTypes.default.bool,
  current: _propTypes.default.bool,
  locked: _propTypes.default.bool
});
const sectionShape = _propTypes.default.shape({
  id: _propTypes.default.string.isRequired,
  title: _propTypes.default.string.isRequired,
  items: _propTypes.default.arrayOf(itemShape).isRequired
});
const resourceShape = _propTypes.default.shape({
  title: _propTypes.default.string.isRequired,
  href: _propTypes.default.string.isRequired,
  type: _propTypes.default.string
});
const UnitRow = ({
  item,
  number,
  onNavigate
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const Link = (0, _LinkContext.useLinkComponent)();
  const t = m => intl.formatMessage(m);
  const state = item.locked && 'locked' || item.complete && 'done' || 'open';
  const stateText = [item.current && t(_i18n.messages.outlineHere), item.locked && t(_i18n.messages.outlineLocked) || (item.complete ? t(_i18n.messages.outlineComplete) : t(_i18n.messages.outlineNotDone))].filter(Boolean).join(', ');
  const body = /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
      className: "cls3-unit__dot",
      "aria-hidden": "true",
      children: item.locked && /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
        src: _icons.Lock,
        size: 12
      })
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
      className: "cls3-unit__num cls-num",
      "aria-hidden": "true",
      children: number
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
      className: "cls3-unit__title",
      children: item.title
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
      className: "cls-sr",
      children: ` (${stateText})`
    })]
  });
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("li", {
    className: `cls3-unit cls3-unit--${state}${item.current ? ' is-current' : ''}`,
    children: item.locked || !item.href ? /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
      className: "cls3-unit__link",
      children: body
    }) : /*#__PURE__*/(0, _jsxRuntime.jsx)(Link, {
      className: "cls3-unit__link",
      href: item.href,
      "aria-current": item.current ? 'page' : undefined,
      onClick: () => onNavigate?.(item),
      children: body
    })
  });
};
UnitRow.propTypes = {
  item: itemShape.isRequired,
  number: _propTypes.default.string.isRequired,
  onNavigate: _propTypes.default.func
};
const OutlinePanel = ({
  sections = [],
  resources = [],
  progress,
  onNavigate,
  id,
  onClose,
  overlay = false
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const t = (m, v) => intl.formatMessage(m, v);
  const [tab, setTab] = (0, _react.useState)('outline');
  const [q, setQ] = (0, _react.useState)('');
  // Open the module with the current unit (or the first one when nothing is current).
  const [open, setOpen] = (0, _react.useState)(() => {
    const hasCurrent = x => x.items.some(it => it.current);
    const any = sections.some(hasCurrent);
    return Object.fromEntries(sections.map((s, i) => [s.id, hasCurrent(s) || i === 0 && !any]));
  });
  const tabIds = {
    outline: (0, _react.useId)(),
    resources: (0, _react.useId)()
  };
  const needle = q.trim().toLowerCase();
  const pct = progress == null ? null : clamp(progress);
  const tabs = resources.length > 0 ? ['outline', 'resources'] : ['outline'];
  const onTabKey = e => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key) || tabs.length < 2) {
      return;
    }
    const next = tabs[(tabs.indexOf(tab) + 1) % tabs.length];
    setTab(next);
    document.getElementById(`${tabIds[next]}-tab`)?.focus();
  };
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("aside", {
    className: `cls-root cls3-outline${overlay ? ' cls3-outline--overlay' : ''}`,
    id: id,
    "aria-label": t(_i18n.messages.pl3Nav),
    children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls3-outline__top",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
        className: "cls3-tabs",
        role: "tablist",
        "aria-label": t(_i18n.messages.pl3Nav),
        children: tabs.map(k => /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
          type: "button",
          role: "tab",
          id: `${tabIds[k]}-tab`,
          "aria-selected": tab === k,
          "aria-controls": tabIds[k],
          tabIndex: tab === k ? 0 : -1,
          onKeyDown: onTabKey,
          onClick: () => setTab(k),
          children: t(k === 'outline' ? _i18n.messages.outlineTitle : _i18n.messages.pl3Resources)
        }, k))
      }), onClose && /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
        type: "button",
        className: "cls-icon-btn cls3-outline__close",
        onClick: onClose,
        "aria-label": t(_i18n.messages.outlineClose),
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
          src: _icons.Close,
          size: 20
        })
      })]
    }), tab === 'outline' && /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls3-outline__panel",
      role: "tabpanel",
      id: tabIds.outline,
      "aria-labelledby": `${tabIds.outline}-tab`,
      children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("label", {
        className: "cls3-filter cls3-outline__search",
        htmlFor: `${tabIds.outline}-q`,
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
          src: _icons.Search,
          size: 18
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
          className: "cls-sr",
          children: t(_i18n.messages.pl3OutlineSearch)
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("input", {
          id: `${tabIds.outline}-q`,
          type: "search",
          value: q,
          placeholder: t(_i18n.messages.pl3OutlineSearch),
          onChange: e => setQ(e.target.value)
        })]
      }), pct != null && /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
        className: "cls3-outline__overall",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
          children: t(_i18n.messages.playerProgress)
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
          className: "cls-num",
          children: `${pct}%`
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
          className: "cls3-thinbar",
          role: "progressbar",
          "aria-label": t(_i18n.messages.playerProgress),
          "aria-valuemin": 0,
          "aria-valuemax": 100,
          "aria-valuenow": pct,
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)("i", {
            style: {
              width: `${pct}%`
            }
          })
        })]
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("ul", {
        className: "cls3-mods",
        children: sections.map((s, si) => {
          const items = s.items.map((it, ii) => [it, `${si + 1}.${ii + 1}`]).filter(([it]) => !needle || `${it.title} ${s.title}`.toLowerCase().includes(needle));
          if (needle && items.length === 0) {
            return null;
          }
          const expanded = needle ? true : Boolean(open[s.id]);
          const p = sectionPct(s);
          const panelId = `${tabIds.outline}-${s.id}`;
          return /*#__PURE__*/(0, _jsxRuntime.jsxs)("li", {
            className: "cls3-mod",
            children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("button", {
              type: "button",
              className: "cls3-mod__head",
              "aria-expanded": expanded,
              "aria-controls": panelId,
              onClick: () => setOpen(o => _objectSpread(_objectSpread({}, o), {}, {
                [s.id]: !o[s.id]
              })),
              children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
                className: "cls3-mod__title",
                children: s.title
              }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
                className: "cls3-mod__pct cls-num",
                children: `${p}%`
              }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
                src: _icons.ExpandMore,
                size: 20,
                className: "cls3-mod__caret"
              })]
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
              className: "cls3-thinbar cls3-thinbar--sm",
              "aria-hidden": "true",
              children: /*#__PURE__*/(0, _jsxRuntime.jsx)("i", {
                style: {
                  width: `${p}%`
                }
              })
            }), expanded && /*#__PURE__*/(0, _jsxRuntime.jsx)("ul", {
              className: "cls3-units",
              id: panelId,
              children: items.map(([it, n]) => /*#__PURE__*/(0, _jsxRuntime.jsx)(UnitRow, {
                item: it,
                number: n,
                onNavigate: onNavigate
              }, it.id))
            })]
          }, s.id);
        })
      }), needle && sections.every(s => !s.items.some(it => it.title.toLowerCase().includes(needle)) && !s.title.toLowerCase().includes(needle)) && /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
        className: "cls3-menu__none",
        children: t(_i18n.messages.pl3NoMatches)
      })]
    }), tab === 'resources' && /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      className: "cls3-outline__panel",
      role: "tabpanel",
      id: tabIds.resources,
      "aria-labelledby": `${tabIds.resources}-tab`,
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)("ul", {
        className: "cls3-res",
        children: resources.map(r => /*#__PURE__*/(0, _jsxRuntime.jsx)("li", {
          children: /*#__PURE__*/(0, _jsxRuntime.jsxs)("a", {
            href: r.href,
            target: "_blank",
            rel: "noopener noreferrer",
            children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
              src: _icons.Description,
              size: 20
            }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("span", {
              children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("b", {
                children: r.title
              }), r.type && /*#__PURE__*/(0, _jsxRuntime.jsx)("small", {
                children: r.type
              })]
            })]
          })
        }, r.href))
      })
    })]
  });
};
exports.OutlinePanel = OutlinePanel;
OutlinePanel.propTypes = {
  sections: _propTypes.default.arrayOf(sectionShape),
  resources: _propTypes.default.arrayOf(resourceShape),
  progress: _propTypes.default.number,
  onNavigate: _propTypes.default.func,
  id: _propTypes.default.string,
  onClose: _propTypes.default.func,
  overlay: _propTypes.default.bool // learning app on phones: fixed over the lesson
};

// ---- Pager: big side arrows + footer "‹ Previous · n / N · Next ›" ----
const PagerLink = ({
  unit,
  className,
  label,
  children,
  onNavigate
}) => {
  const Link = (0, _LinkContext.useLinkComponent)();
  if (!unit || unit.locked || !unit.href) {
    return /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
      type: "button",
      className: className,
      disabled: true,
      "aria-label": label,
      children: children
    });
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(Link, {
    className: className,
    href: unit.href,
    "aria-label": label,
    onClick: () => onNavigate?.(unit),
    children: children
  });
};
PagerLink.propTypes = {
  unit: itemShape,
  className: _propTypes.default.string,
  label: _propTypes.default.string,
  children: _propTypes.default.node,
  onNavigate: _propTypes.default.func
};
const UnitPager = ({
  prev,
  next,
  index,
  total,
  onNavigate,
  variant = 'footer'
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const t = (m, v) => intl.formatMessage(m, v);
  const prevLabel = prev ? t(_i18n.messages.pl3PrevUnit, {
    title: prev.title
  }) : t(_i18n.messages.pl3Prev);
  const nextLabel = next ? t(_i18n.messages.pl3NextUnit, {
    title: next.title
  }) : t(_i18n.messages.pl3Next);
  if (variant === 'arrows') {
    return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(PagerLink, {
        unit: prev,
        className: "cls3-arrow cls3-arrow--prev",
        label: prevLabel,
        onNavigate: onNavigate,
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
          src: _icons.ChevronLeft,
          size: 32
        })
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(PagerLink, {
        unit: next,
        className: "cls3-arrow cls3-arrow--next",
        label: nextLabel,
        onNavigate: onNavigate,
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
          src: _icons.ChevronRight,
          size: 32
        })
      })]
    });
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("nav", {
    className: "cls3-pager",
    "aria-label": t(_i18n.messages.pl3Pager),
    children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(PagerLink, {
      unit: prev,
      className: "cls-btn cls-btn--secondary cls-btn--sm",
      label: prevLabel,
      onNavigate: onNavigate,
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
        src: _icons.ChevronLeft,
        size: 18
      }), t(_i18n.messages.pl3Prev)]
    }), total > 0 && index > 0 && /*#__PURE__*/(0, _jsxRuntime.jsxs)("p", {
      className: "cls3-pager__count cls-num",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        "aria-hidden": "true",
        children: `${index} / ${total}`
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        className: "cls-sr",
        children: t(_i18n.messages.unitOf, {
          i: index,
          n: total
        })
      })]
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)(PagerLink, {
      unit: next,
      className: "cls-btn cls-btn--primary cls-btn--sm",
      label: nextLabel,
      onNavigate: onNavigate,
      children: [t(_i18n.messages.pl3Next), /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
        src: _icons.ChevronRight,
        size: 18
      })]
    })]
  });
};
exports.UnitPager = UnitPager;
UnitPager.propTypes = {
  prev: itemShape,
  next: itemShape,
  index: _propTypes.default.number,
  total: _propTypes.default.number,
  onNavigate: _propTypes.default.func,
  variant: _propTypes.default.oneOf(['footer', 'arrows'])
};
const wide = () => {
  try {
    return window.matchMedia('(min-width: 1024px)').matches;
  } catch (e) {
    return true;
  }
};

// Full screen on one element (the player, or the whole page in the learning app). `getTarget` → element.
function useFullscreen(getTarget) {
  const [on, setOn] = (0, _react.useState)(false);
  (0, _react.useEffect)(() => {
    const onChange = () => setOn(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);
  const supported = typeof document !== 'undefined' && Boolean(document.fullscreenEnabled);
  const toggle = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
      return;
    }
    getTarget()?.requestFullscreen?.()?.catch?.(() => {});
  };
  return {
    on,
    toggle: supported ? toggle : undefined
  };
}

// ---- Player top bar on its own (the learning app puts it in its header slot) ----
const PlayerTopBar3 = ({
  courseTitle,
  backHref,
  logoUrl,
  outlineOpen,
  outlineId,
  onToggleOutline,
  display,
  units,
  onSelectUnit,
  locale,
  onLocaleChange,
  fullscreen,
  onToggleFullscreen
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const Link = (0, _LinkContext.useLinkComponent)();
  const t = (m, v) => intl.formatMessage(m, v);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("header", {
    className: "cls3-ptop",
    "aria-label": t(_i18n.messages.playerLabel),
    children: [onToggleOutline && /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
      type: "button",
      className: "cls3-ptool cls3-ptop__toggle",
      "aria-expanded": Boolean(outlineOpen),
      "aria-controls": outlineOpen ? outlineId : undefined,
      "aria-label": t(_i18n.messages.playerOutline),
      onClick: onToggleOutline,
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
        src: _icons.MenuOpen,
        size: 22
      })
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)(Link, {
      className: "cls3-ptop__back",
      href: backHref,
      "aria-label": t(_i18n.messages.pl3BackLabel),
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
        src: _icons.ArrowBackIos,
        size: 16
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
        children: t(_i18n.messages.shell3MyLearning)
      })]
    }), logoUrl && /*#__PURE__*/(0, _jsxRuntime.jsx)("img", {
      className: "cls3-ptop__logo",
      src: logoUrl,
      alt: t(_i18n.messages.brand)
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
      className: "cls3-ptop__title",
      title: courseTitle,
      children: courseTitle
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)(PlayerToolbar, {
      settings: display.settings,
      onChange: display.update,
      onReset: display.reset,
      units: units,
      onSelectUnit: onSelectUnit,
      locale: locale,
      onLocaleChange: onLocaleChange,
      fullscreen: fullscreen,
      onToggleFullscreen: onToggleFullscreen
    })]
  });
};
exports.PlayerTopBar3 = PlayerTopBar3;
PlayerTopBar3.propTypes = {
  courseTitle: _propTypes.default.string.isRequired,
  backHref: _propTypes.default.string.isRequired,
  logoUrl: _propTypes.default.string,
  outlineOpen: _propTypes.default.bool,
  outlineId: _propTypes.default.string,
  onToggleOutline: _propTypes.default.func,
  display: _propTypes.default.shape({
    settings: _propTypes.default.shape({}).isRequired,
    update: _propTypes.default.func.isRequired,
    reset: _propTypes.default.func.isRequired
  }).isRequired,
  units: _propTypes.default.arrayOf(_propTypes.default.shape({
    id: _propTypes.default.string
  })),
  onSelectUnit: _propTypes.default.func,
  locale: _propTypes.default.string,
  onLocaleChange: _propTypes.default.func,
  fullscreen: _propTypes.default.bool,
  onToggleFullscreen: _propTypes.default.func
};

// ---- The whole player ----
const PlayerLayout3 = ({
  courseTitle,
  backHref,
  logoUrl,
  sections = [],
  resources = [],
  progress,
  locale,
  onLocaleChange,
  onNavigate,
  onDisplayChange,
  initialDisplay,
  unitTitle,
  children
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const t = (m, v) => intl.formatMessage(m, v);
  const root = (0, _react.useRef)(null);
  const outlineId = (0, _react.useId)();
  const display = (0, _useDisplaySettings.default)(initialDisplay);
  const {
    settings
  } = display;
  const [outlineOpen, setOutlineOpen] = (0, _react.useState)(wide);
  const full = useFullscreen(() => root.current);
  const units = (0, _react.useMemo)(() => flattenOutline(sections), [sections]);
  const at = units.findIndex(u => u.current);
  const current = at >= 0 ? units[at] : null;
  const prev = at > 0 ? units[at - 1] : null;
  const next = at >= 0 && at < units.length - 1 ? units[at + 1] : null;
  (0, _react.useEffect)(() => {
    onDisplayChange?.(settings);
  }, [settings, onDisplayChange]);

  // ← / → press the side arrow links, so keys and clicks take the same (router-aware) path.
  const press = dir => root.current?.querySelector(`a.cls3-arrow--${dir}`)?.click();
  useArrowKeys(prev ? () => press('prev') : null, next ? () => press('next') : null);
  const navigated = unit => {
    if (!wide()) {
      setOutlineOpen(false);
    }
    onNavigate?.(unit);
  };
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", _objectSpread(_objectSpread({
    className: `cls-root cls3-player${outlineOpen ? ' is-outline-open' : ''}`,
    ref: root,
    lang: locale
  }, (0, _useDisplaySettings.displayAttributes)(settings)), {}, {
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(PlayerTopBar3, {
      courseTitle: courseTitle,
      backHref: backHref,
      logoUrl: logoUrl,
      outlineOpen: outlineOpen,
      outlineId: outlineId,
      onToggleOutline: () => setOutlineOpen(o => !o),
      display: display,
      units: units,
      onSelectUnit: navigated,
      locale: locale,
      onLocaleChange: onLocaleChange,
      fullscreen: full.on,
      onToggleFullscreen: full.toggle
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls3-pbody",
      children: [outlineOpen && /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
        type: "button",
        className: "cls-scrim cls3-pbody__scrim",
        "aria-label": t(_i18n.messages.outlineClose),
        tabIndex: -1,
        onClick: () => setOutlineOpen(false)
      }), outlineOpen && /*#__PURE__*/(0, _jsxRuntime.jsx)(OutlinePanel, {
        id: outlineId,
        sections: sections,
        resources: resources,
        progress: progress,
        onNavigate: navigated,
        onClose: () => setOutlineOpen(false)
      }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("main", {
        className: "cls3-pmain",
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(UnitPager, {
          variant: "arrows",
          prev: prev,
          next: next,
          onNavigate: onNavigate
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
          className: "cls3-pmain__scroll",
          children: /*#__PURE__*/(0, _jsxRuntime.jsxs)("article", {
            className: "cls3-lesson",
            children: [current?.sectionTitle && /*#__PURE__*/(0, _jsxRuntime.jsx)("p", {
              className: "cls3-lesson__crumb",
              children: current.sectionTitle
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)("h1", {
              className: "cls3-lesson__title",
              children: unitTitle || current?.title
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
              className: "cls3-lesson__frame",
              children: children
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)(UnitPager, {
              prev: prev,
              next: next,
              index: at + 1,
              total: units.length,
              onNavigate: onNavigate
            })]
          })
        })]
      })]
    })]
  }));
};
PlayerLayout3.propTypes = {
  courseTitle: _propTypes.default.string.isRequired,
  backHref: _propTypes.default.string.isRequired,
  logoUrl: _propTypes.default.string,
  sections: _propTypes.default.arrayOf(sectionShape),
  resources: _propTypes.default.arrayOf(resourceShape),
  progress: _propTypes.default.number,
  locale: _propTypes.default.string,
  onLocaleChange: _propTypes.default.func,
  onNavigate: _propTypes.default.func,
  // (unit) after a unit link is used; the links themselves navigate (LinkContext)
  onDisplayChange: _propTypes.default.func,
  // (settings) → the fork posts them to the lesson iframe (postDisplay)
  initialDisplay: _propTypes.default.shape({}),
  unitTitle: _propTypes.default.string,
  children: _propTypes.default.node
};
var _default = exports.default = PlayerLayout3;