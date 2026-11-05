"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.OutlineDrawer = void 0;
var _react = require("react");
var _propTypes = _interopRequireDefault(require("prop-types"));
var _icons = require("@openedx/paragon/icons");
var _i18n = require("../i18n");
var _KitIcon = _interopRequireDefault(require("./KitIcon"));
var _LinkContext = require("./LinkContext");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, e) { if ("object" != typeof t || !t) return t; var r; if ("undefined" != typeof Symbol && void 0 !== (r = t[Symbol.toPrimitive])) { var i = r.call(t, e || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === e ? String : Number)(t); }
const hasCurrent = section => section.items.some(item => item.current);
const stateOf = item => {
  if (item.locked) {
    return 'locked';
  }
  return item.complete ? 'complete' : 'open';
};

// One accordion section: header button (title + "3 / 5 done" + chevron) and its rows.
const OutlineSection = ({
  section,
  open,
  onToggle,
  HeadingTag,
  onNavigate
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const Link = (0, _LinkContext.useLinkComponent)();
  const panelId = (0, _react.useId)();
  const done = section.items.filter(item => item.complete).length;
  const total = section.items.length;
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("li", {
    className: `cls-outline__section${open ? ' is-open' : ''}`,
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(HeadingTag, {
      className: "cls-outline__heading",
      children: /*#__PURE__*/(0, _jsxRuntime.jsxs)("button", {
        type: "button",
        className: "cls-outline__toggle",
        "aria-expanded": open,
        "aria-controls": panelId,
        onClick: onToggle,
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
          className: "cls-outline__title",
          children: section.title
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
          className: "cls-outline__count cls-num",
          children: intl.formatMessage(_i18n.messages.outlineDone, {
            done,
            total
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
          src: _icons.ExpandMore,
          className: "cls-outline__chevron"
        })]
      })
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("ol", {
      id: panelId,
      className: "cls-outline__items",
      hidden: !open,
      children: section.items.map(item => {
        const state = stateOf(item);
        const icon = {
          locked: _icons.Lock,
          complete: _icons.CheckCircle,
          open: _icons.RadioButtonUnchecked
        }[state];
        const statusText = intl.formatMessage({
          locked: _i18n.messages.outlineLocked,
          complete: _i18n.messages.outlineComplete,
          open: _i18n.messages.outlineNotDone
        }[state]);
        const body = /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
            src: icon,
            size: 20,
            className: `cls-outline__state cls-outline__state--${state}`
          }), /*#__PURE__*/(0, _jsxRuntime.jsxs)("span", {
            className: "cls-outline__label",
            children: [item.title, /*#__PURE__*/(0, _jsxRuntime.jsxs)("span", {
              className: "cls-sr",
              children: [`, ${statusText}`, item.current ? `, ${intl.formatMessage(_i18n.messages.outlineHere)}` : '']
            })]
          }), item.minutes > 0 && /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
            className: "cls-outline__time cls-num",
            children: intl.formatMessage(_i18n.messages.minutes, {
              n: item.minutes
            })
          })]
        });
        const cls = `cls-outline__row${item.current ? ' is-current' : ''}${item.locked ? ' is-locked' : ''}`;
        return /*#__PURE__*/(0, _jsxRuntime.jsx)("li", {
          children: item.href && !item.locked ? /*#__PURE__*/(0, _jsxRuntime.jsx)(Link, {
            className: cls,
            href: item.href,
            "aria-current": item.current ? 'location' : undefined,
            onClick: onNavigate ? event => onNavigate(item, event) : undefined,
            children: body
          }) : /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
            className: cls,
            children: body
          })
        }, item.id);
      })
    })]
  });
};
OutlineSection.propTypes = {
  section: _propTypes.default.shape({
    id: _propTypes.default.string.isRequired,
    title: _propTypes.default.string.isRequired,
    items: _propTypes.default.arrayOf(_propTypes.default.shape({})).isRequired
  }).isRequired,
  open: _propTypes.default.bool.isRequired,
  onToggle: _propTypes.default.func.isRequired,
  HeadingTag: _propTypes.default.elementType.isRequired,
  onNavigate: _propTypes.default.func
};

// Course outline for S-75 (course home) and the S-76 drawer (doc 04 §5.11).
// Sections open by default when they hold the current item (or `open: true`); "Expand all" toggles every one.
const CourseOutline = ({
  sections,
  title,
  headingLevel = 2,
  showExpandAll = true,
  onNavigate,
  variant = 'page'
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const initial = () => Object.fromEntries(sections.map(s => [s.id, Boolean(s.open || hasCurrent(s))]));
  const [openIds, setOpenIds] = (0, _react.useState)(initial);
  const sectionKey = sections.map(s => s.id).join('|');
  // New course data (e.g. after a refresh) → keep what the learner opened, open new current sections.
  (0, _react.useEffect)(() => {
    setOpenIds(prev => _objectSpread(_objectSpread({}, initial()), prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionKey]);
  const allOpen = sections.length > 0 && sections.every(s => openIds[s.id]);
  const HeadingTag = `h${Math.min(6, headingLevel + 1)}`;
  const TitleTag = `h${headingLevel}`;
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("section", {
    className: `cls-outline cls-outline--${variant}`,
    "aria-label": title ? undefined : intl.formatMessage(_i18n.messages.outlineTitle),
    children: [(title || showExpandAll) && /*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls-outline__top",
      children: [title && /*#__PURE__*/(0, _jsxRuntime.jsx)(TitleTag, {
        className: "cls-outline__name",
        children: title
      }), showExpandAll && sections.length > 1 && /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
        type: "button",
        className: "cls-btn cls-btn--ghost cls-btn--sm",
        onClick: () => setOpenIds(Object.fromEntries(sections.map(s => [s.id, !allOpen]))),
        children: intl.formatMessage(allOpen ? _i18n.messages.outlineCollapseAll : _i18n.messages.outlineExpandAll)
      })]
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)("ol", {
      className: "cls-outline__list",
      children: sections.map(section => /*#__PURE__*/(0, _jsxRuntime.jsx)(OutlineSection, {
        section: section,
        open: Boolean(openIds[section.id]),
        onToggle: () => setOpenIds(prev => _objectSpread(_objectSpread({}, prev), {}, {
          [section.id]: !prev[section.id]
        })),
        HeadingTag: HeadingTag,
        onNavigate: onNavigate
      }, section.id))
    })]
  });
};
CourseOutline.propTypes = {
  sections: _propTypes.default.arrayOf(_propTypes.default.shape({
    id: _propTypes.default.string.isRequired,
    title: _propTypes.default.string.isRequired,
    open: _propTypes.default.bool,
    items: _propTypes.default.arrayOf(_propTypes.default.shape({
      id: _propTypes.default.string.isRequired,
      title: _propTypes.default.string.isRequired,
      href: _propTypes.default.string,
      complete: _propTypes.default.bool,
      current: _propTypes.default.bool,
      locked: _propTypes.default.bool,
      minutes: _propTypes.default.number
    })).isRequired
  })).isRequired,
  title: _propTypes.default.string,
  headingLevel: _propTypes.default.number,
  showExpandAll: _propTypes.default.bool,
  onNavigate: _propTypes.default.func,
  variant: _propTypes.default.oneOf(['page', 'drawer'])
};

// S-76 drawer (doc 04 §6.6): a 320 px column next to the unit on wide screens; a full-screen sheet on
// small ones (`overlay`). Esc closes the sheet.
const OutlineDrawer = ({
  sections,
  onClose,
  onNavigate,
  overlay = false
}) => {
  const intl = (0, _i18n.useClassroomIntl)();
  const titleId = (0, _react.useId)();
  (0, _react.useEffect)(() => {
    if (!overlay || !onClose) {
      return undefined;
    }
    const onKey = event => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [overlay, onClose]);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("nav", {
    className: `cls-drawer${overlay ? ' cls-drawer--overlay' : ''}`,
    "aria-labelledby": titleId,
    children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)("div", {
      className: "cls-drawer__top",
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("h2", {
        id: titleId,
        className: "cls-drawer__title",
        children: intl.formatMessage(_i18n.messages.outlineTitle)
      }), onClose && /*#__PURE__*/(0, _jsxRuntime.jsx)("button", {
        type: "button",
        className: "cls-icon-btn",
        "aria-label": intl.formatMessage(_i18n.messages.outlineClose),
        onClick: onClose,
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_KitIcon.default, {
          src: _icons.Close
        })
      })]
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)(CourseOutline, {
      sections: sections,
      variant: "drawer",
      showExpandAll: false,
      headingLevel: 2,
      onNavigate: onNavigate
    })]
  });
};
exports.OutlineDrawer = OutlineDrawer;
OutlineDrawer.propTypes = {
  sections: CourseOutline.propTypes.sections,
  onClose: _propTypes.default.func,
  onNavigate: _propTypes.default.func,
  overlay: _propTypes.default.bool
};
var _default = exports.default = CourseOutline;