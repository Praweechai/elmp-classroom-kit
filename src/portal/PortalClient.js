import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

// Classroom API v1 client (Plan 3 doc 02 §4, doc 05). Uses the app's authenticated client so the
// Open edX JWT cookie is refreshed before calls; the browser sends it to the Portal (same site).
export const TIMEOUT_MS = 4000;
export const CACHE_MS = 60000;

export class PortalError extends Error {
  constructor(code, status, message) {
    super(message || code);
    this.name = 'PortalError';
    // unauthenticated | unmapped | inactive | forbidden | not_found | gone | rate_limited | unavailable | disabled
    this.code = code;
    this.status = status;
  }
}

export function toPortalError(error) {
  if (error instanceof PortalError) { return error; }
  const status = error?.response?.status;
  const apiCode = error?.response?.data?.error?.code;
  if (status === 401) { return new PortalError('unauthenticated', 401); }
  if (status === 403) {
    return new PortalError(['unmapped', 'inactive', 'origin'].includes(apiCode) ? apiCode : 'forbidden', 403);
  }
  if (status === 404) { return new PortalError('not_found', 404); }
  if (status === 410) { return new PortalError('gone', 410); }
  if (status === 429) { return new PortalError('rate_limited', 429); }
  return new PortalError('unavailable', status || 0, error?.message);
}

export function createPortalClient({
  baseUrl, httpClient, enabled = true, now = () => Date.now(),
}) {
  const cache = new Map();
  const config = (extra = {}) => ({
    withCredentials: true,
    timeout: TIMEOUT_MS,
    headers: { 'X-Requested-With': 'ELMP-Classroom', Accept: 'application/json' },
    ...extra,
  });

  async function request(method, path, body) {
    if (!enabled || !baseUrl) { throw new PortalError('disabled', 0); }
    try {
      const url = `${baseUrl.replace(/\/$/, '')}${path}`;
      const response = method === 'get'
        ? await httpClient().get(url, config())
        : await httpClient()[method](url, body ?? {}, config({ isCsrfExempt: true }));
      return response.data;
    } catch (error) {
      throw toPortalError(error);
    }
  }

  async function cached(path, { force = false } = {}) {
    const hit = cache.get(path);
    if (!force && hit && now() - hit.at < CACHE_MS) { return hit.data; }
    const data = await request('get', path);
    cache.set(path, { at: now(), data });
    return data;
  }

  const invalidate = (prefix = '') => [...cache.keys()].filter((k) => k.startsWith(prefix)).forEach((k) => cache.delete(k));

  return {
    enabled: Boolean(enabled && baseUrl),
    invalidate,
    me: (opts) => cached('/me', opts),
    training: (opts) => cached('/training', opts),
    courseContext: (courseKey, opts) => cached(`/courses/${encodeURIComponent(courseKey)}/context`, opts),
    hours: (year, opts) => cached(`/hours${year ? `?year=${Number(year)}` : ''}`, opts),
    certificates: (opts) => cached('/certificates', opts),
    notifications: (cursor) => request('get', `/notifications${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`),
    unreadCount: () => request('get', '/notifications?unread_count_only=1'),
    setLocale: async (locale) => {
      const data = await request('put', '/me/locale', { locale });
      invalidate('/me');
      return data;
    },
    refreshProgress: async (courseKey) => {
      const data = await request('post', '/progress/refresh', { course_key: courseKey });
      invalidate('/training');
      invalidate('/hours');
      invalidate('/dashboard');
      return data;
    },
    // Plan 4: CA-11 home dashboard (one call, cached 60 s) and CA-12 time on task (D-67).
    dashboard: (opts) => cached('/dashboard', opts),
    activity: ({ courseKey, seconds, day }) => request('post', '/activity', { course_key: courseKey, seconds, day }),
    activityUrl: () => (enabled && baseUrl ? `${baseUrl.replace(/\/$/, '')}/activity` : null),
    certificateLink: (code) => request('post', `/certificates/${encodeURIComponent(code)}/link`),
    markRead: (id) => request('post', `/notifications/${encodeURIComponent(id)}/read`),
    markAllRead: () => request('post', '/notifications/read-all'),
    // Learner v2 (doc 10 §7, built in V-6): CA-16 grades rows + CA-17 "Am I up to date?" (cached 60 s).
    grades: (opts) => cached('/grades', opts),
    compliance: (opts) => cached('/compliance', opts),
    // Plan 5 Part 2 (doc 02 §5): CA-13 achievements, CA-14 HR banner, CA-15 catalogue (+ search suggestions).
    achievements: (opts) => cached('/achievements', opts),
    announcement: (opts) => cached('/announcement', opts),
    catalogue: (params, opts) => {
      const {
        q = '', category = '', page = 1, perPage = 20,
      } = params || {};
      const qs = new URLSearchParams();
      if (q) { qs.set('q', q); }
      if (category) { qs.set('category', category); }
      if (page > 1) { qs.set('page', String(page)); }
      if (perPage !== 20) { qs.set('per_page', String(perPage)); }
      const s = qs.toString();
      return cached(`/catalogue${s ? `?${s}` : ''}`, opts);
    },
  };
}

let defaultClient;

// One client per app, configured from the runtime MFE config (doc 06 §2). No rebuild when hosts change.
export function getPortalClient() {
  if (!defaultClient) {
    const cfg = getConfig();
    defaultClient = createPortalClient({
      baseUrl: cfg.ELMP_PORTAL_API_URL,
      enabled: cfg.ELMP_CLASSROOM_API !== 'off',
      httpClient: getAuthenticatedHttpClient,
    });
  }
  return defaultClient;
}

export function resetPortalClient() { defaultClient = undefined; }
