"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = usePortal;
var _react = require("react");
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, e) { if ("object" != typeof t || !t) return t; var r; if ("undefined" != typeof Symbol && void 0 !== (r = t[Symbol.toPrimitive])) { var i = r.call(t, e || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === e ? String : Number)(t); }
// Tiny data hook (doc 02 §4: no new library). Portal failures never throw into the page (NFR-C8):
// the caller gets `error.code` and shows its own unavailable state.
function usePortal(fetcher, deps = []) {
  const [state, setState] = (0, _react.useState)({
    status: 'loading',
    data: undefined,
    error: undefined
  });
  const alive = (0, _react.useRef)(true);
  const seq = (0, _react.useRef)(0);
  const load = (0, _react.useCallback)(async opts => {
    seq.current += 1;
    const mine = seq.current;
    setState(s => _objectSpread(_objectSpread({}, s), {}, {
      status: s.data === undefined ? 'loading' : 'refreshing',
      error: undefined
    }));
    try {
      const data = await fetcher(opts);
      if (alive.current && mine === seq.current) {
        setState({
          status: 'ready',
          data,
          error: undefined
        });
      }
    } catch (error) {
      if (alive.current && mine === seq.current) {
        setState(s => ({
          status: 'error',
          data: s.data,
          error
        }));
      }
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  (0, _react.useEffect)(() => {
    alive.current = true;
    load();
    return () => {
      alive.current = false;
    };
  }, [load]);
  return _objectSpread(_objectSpread({}, state), {}, {
    reload: () => load({
      force: true
    })
  });
}