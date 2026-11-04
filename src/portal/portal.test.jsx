import { act, renderHook, waitFor } from '@testing-library/react';

import * as fx from '../__fixtures__/portal';
import {
  CACHE_MS, PortalError, TIMEOUT_MS, createPortalClient, toPortalError,
} from './PortalClient';
import usePortal from './usePortal';

const BASE = 'http://portal.local.openedx.io/api/classroom/v1';

const fakeHttp = (impl) => {
  const http = {
    get: jest.fn(impl || (() => Promise.resolve({ data: fx.training }))),
    post: jest.fn(() => Promise.resolve({ data: { data: { refreshed: true } } })),
    put: jest.fn(() => Promise.resolve({ data: { data: { locale: 'th' } } })),
  };
  return { http, httpClient: () => http };
};

const httpError = (status, code) => Object.assign(new Error(`HTTP ${status}`), {
  response: { status, data: code ? { error: { code } } : {} },
});

describe('PortalClient', () => {
  it('sends credentials, the ELMP header and a 4 s timeout (doc 02 §4)', async () => {
    const { http, httpClient } = fakeHttp();
    const client = createPortalClient({ baseUrl: `${BASE}/`, httpClient });

    await expect(client.training()).resolves.toEqual(fx.training);

    const [url, config] = http.get.mock.calls[0];
    expect(url).toBe(`${BASE}/training`);
    expect(config).toMatchObject({ withCredentials: true, timeout: TIMEOUT_MS, headers: { 'X-Requested-With': 'ELMP-Classroom' } });
  });

  it('marks POST/PUT CSRF-exempt so the Open edX CSRF fetch is skipped (Portal checks Origin)', async () => {
    const { http, httpClient } = fakeHttp();
    const client = createPortalClient({ baseUrl: BASE, httpClient });

    await client.refreshProgress('course-v1:MHB+INF101+2026');
    await client.setLocale('th');

    expect(http.post).toHaveBeenCalledWith(`${BASE}/progress/refresh`, { course_key: 'course-v1:MHB+INF101+2026' }, expect.objectContaining({ isCsrfExempt: true }));
    expect(http.put).toHaveBeenCalledWith(`${BASE}/me/locale`, { locale: 'th' }, expect.objectContaining({ isCsrfExempt: true }));
  });

  it('caches GETs for 60 s, and refresh invalidates training (F-99)', async () => {
    let t = 0;
    const { http, httpClient } = fakeHttp();
    const client = createPortalClient({ baseUrl: BASE, httpClient, now: () => t });

    await client.training();
    await client.training();
    expect(http.get).toHaveBeenCalledTimes(1);

    t = CACHE_MS + 1;
    await client.training();
    expect(http.get).toHaveBeenCalledTimes(2);

    await client.refreshProgress('course-v1:MHB+INF101+2026');
    await client.training();
    expect(http.get).toHaveBeenCalledTimes(3);

    await client.training({ force: true });
    expect(http.get).toHaveBeenCalledTimes(4);
  });

  it('encodes course keys and certificate codes in paths', async () => {
    const { http, httpClient } = fakeHttp();
    const client = createPortalClient({ baseUrl: BASE, httpClient });
    await client.courseContext('course-v1:MHB+INF101+2026');
    await client.certificateLink('ELMP-2026-7KQ4-9XTD');
    expect(http.get.mock.calls[0][0]).toBe(`${BASE}/courses/course-v1%3AMHB%2BINF101%2B2026/context`);
    expect(http.post.mock.calls[0][0]).toBe(`${BASE}/certificates/ELMP-2026-7KQ4-9XTD/link`);
  });

  it.each([
    [httpError(401), 'unauthenticated'],
    [httpError(403, 'unmapped'), 'unmapped'],
    [httpError(403, 'inactive'), 'inactive'],
    [httpError(403), 'forbidden'],
    [httpError(404), 'not_found'],
    [httpError(410), 'gone'],
    [httpError(429), 'rate_limited'],
    [httpError(503), 'unavailable'],
    [Object.assign(new Error('timeout of 4000ms exceeded'), { code: 'ECONNABORTED' }), 'unavailable'],
  ])('maps %s to "%s" (doc 02 §4 error handling)', async (error, code) => {
    const { httpClient } = fakeHttp(() => Promise.reject(error));
    const client = createPortalClient({ baseUrl: BASE, httpClient });
    await expect(client.me()).rejects.toMatchObject({ name: 'PortalError', code });
  });

  it('does nothing when the Classroom API is switched off (D-57)', async () => {
    const { http, httpClient } = fakeHttp();
    const client = createPortalClient({ baseUrl: BASE, httpClient, enabled: false });
    expect(client.enabled).toBe(false);
    await expect(client.training()).rejects.toMatchObject({ code: 'disabled' });
    expect(http.get).not.toHaveBeenCalled();
  });

  it('keeps PortalError instances as they are', () => {
    const e = new PortalError('unmapped', 403);
    expect(toPortalError(e)).toBe(e);
  });
});

describe('usePortal', () => {
  it('goes loading → ready', async () => {
    const { result } = renderHook(() => usePortal(() => Promise.resolve(fx.me)));
    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.data).toBe(fx.me);
  });

  it('reports errors without throwing and keeps old data on reload failure (NFR-C8)', async () => {
    const fetcher = jest.fn()
      .mockResolvedValueOnce(fx.training)
      .mockRejectedValueOnce(new PortalError('unavailable', 503));
    const { result } = renderHook(() => usePortal(fetcher));
    await waitFor(() => expect(result.current.status).toBe('ready'));

    await act(async () => { result.current.reload(); });

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error.code).toBe('unavailable');
    expect(result.current.data).toBe(fx.training);
    expect(fetcher).toHaveBeenLastCalledWith({ force: true });
  });
});
