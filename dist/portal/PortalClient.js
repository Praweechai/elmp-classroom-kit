"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TIMEOUT_MS = exports.PortalError = exports.CACHE_MS = void 0;
exports.createPortalClient = createPortalClient;
exports.getPortalClient = getPortalClient;
exports.resetPortalClient = resetPortalClient;
exports.toPortalError = toPortalError;
var _frontendPlatform = require("@edx/frontend-platform");
var _auth = require("@edx/frontend-platform/auth");
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, e) { if ("object" != typeof t || !t) return t; var r; if ("undefined" != typeof Symbol && void 0 !== (r = t[Symbol.toPrimitive])) { var i = r.call(t, e || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === e ? String : Number)(t); }
// Classroom API v1 client (Plan 3 doc 02 §4, doc 05). Uses the app's authenticated client so the
// Open edX JWT cookie is refreshed before calls; the browser sends it to the Portal (same site).
const TIMEOUT_MS = exports.TIMEOUT_MS = 4000;
const CACHE_MS = exports.CACHE_MS = 60000;
class PortalError extends Error {
  constructor(code, status, message) {
    super(message || code);
    this.name = 'PortalError';
    // unauthenticated | unmapped | inactive | forbidden | not_found | gone | rate_limited | unavailable | disabled
    this.code = code;
    this.status = status;
  }
}
exports.PortalError = PortalError;
function toPortalError(error) {
  if (error instanceof PortalError) {
    return error;
  }
  const status = error?.response?.status;
  const apiCode = error?.response?.data?.error?.code;
  if (status === 401) {
    return new PortalError('unauthenticated', 401);
  }
  if (status === 403) {
    return new PortalError(['unmapped', 'inactive', 'origin'].includes(apiCode) ? apiCode : 'forbidden', 403);
  }
  if (status === 404) {
    return new PortalError('not_found', 404);
  }
  if (status === 410) {
    return new PortalError('gone', 410);
  }
  if (status === 429) {
    return new PortalError('rate_limited', 429);
  }
  return new PortalError('unavailable', status || 0, error?.message);
}
function createPortalClient({
  baseUrl,
  httpClient,
  enabled = true,
  now = () => Date.now()
}) {
  const cache = new Map();
  const config = (extra = {}) => _objectSpread({
    withCredentials: true,
    timeout: TIMEOUT_MS,
    headers: {
      'X-Requested-With': 'ELMP-Classroom',
      Accept: 'application/json'
    }
  }, extra);
  async function request(method, path, body) {
    if (!enabled || !baseUrl) {
      throw new PortalError('disabled', 0);
    }
    try {
      const url = `${baseUrl.replace(/\/$/, '')}${path}`;
      const response = method === 'get' ? await httpClient().get(url, config()) : await httpClient()[method](url, body ?? {}, config({
        isCsrfExempt: true
      }));
      return response.data;
    } catch (error) {
      throw toPortalError(error);
    }
  }
  async function cached(path, {
    force = false
  } = {}) {
    const hit = cache.get(path);
    if (!force && hit && now() - hit.at < CACHE_MS) {
      return hit.data;
    }
    const data = await request('get', path);
    cache.set(path, {
      at: now(),
      data
    });
    return data;
  }
  const invalidate = (prefix = '') => [...cache.keys()].filter(k => k.startsWith(prefix)).forEach(k => cache.delete(k));
  return {
    enabled: Boolean(enabled && baseUrl),
    invalidate,
    me: opts => cached('/me', opts),
    training: opts => cached('/training', opts),
    courseContext: (courseKey, opts) => cached(`/courses/${encodeURIComponent(courseKey)}/context`, opts),
    hours: (year, opts) => cached(`/hours${year ? `?year=${Number(year)}` : ''}`, opts),
    certificates: opts => cached('/certificates', opts),
    notifications: cursor => request('get', `/notifications${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`),
    unreadCount: () => request('get', '/notifications?unread_count_only=1'),
    setLocale: async locale => {
      const data = await request('put', '/me/locale', {
        locale
      });
      invalidate('/me');
      return data;
    },
    refreshProgress: async courseKey => {
      const data = await request('post', '/progress/refresh', {
        course_key: courseKey
      });
      invalidate('/training');
      invalidate('/hours');
      invalidate('/dashboard');
      return data;
    },
    // Plan 4: CA-11 home dashboard (one call, cached 60 s) and CA-12 time on task (D-67).
    dashboard: opts => cached('/dashboard', opts),
    activity: ({
      courseKey,
      seconds,
      day
    }) => request('post', '/activity', {
      course_key: courseKey,
      seconds,
      day
    }),
    activityUrl: () => enabled && baseUrl ? `${baseUrl.replace(/\/$/, '')}/activity` : null,
    certificateLink: code => request('post', `/certificates/${encodeURIComponent(code)}/link`),
    markRead: id => request('post', `/notifications/${encodeURIComponent(id)}/read`),
    markAllRead: () => request('post', '/notifications/read-all')
  };
}
let defaultClient;

// One client per app, configured from the runtime MFE config (doc 06 §2). No rebuild when hosts change.
function getPortalClient() {
  if (!defaultClient) {
    const cfg = (0, _frontendPlatform.getConfig)();
    defaultClient = createPortalClient({
      baseUrl: cfg.ELMP_PORTAL_API_URL,
      enabled: cfg.ELMP_CLASSROOM_API !== 'off',
      httpClient: _auth.getAuthenticatedHttpClient
    });
  }
  return defaultClient;
}
function resetPortalClient() {
  defaultClient = undefined;
}