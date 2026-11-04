import {
  useCallback, useEffect, useRef, useState,
} from 'react';

// Tiny data hook (doc 02 §4: no new library). Portal failures never throw into the page (NFR-C8):
// the caller gets `error.code` and shows its own unavailable state.
export default function usePortal(fetcher, deps = []) {
  const [state, setState] = useState({ status: 'loading', data: undefined, error: undefined });
  const alive = useRef(true);
  const seq = useRef(0);

  const load = useCallback(async (opts) => {
    seq.current += 1;
    const mine = seq.current;
    setState((s) => ({ ...s, status: s.data === undefined ? 'loading' : 'refreshing', error: undefined }));
    try {
      const data = await fetcher(opts);
      if (alive.current && mine === seq.current) { setState({ status: 'ready', data, error: undefined }); }
    } catch (error) {
      if (alive.current && mine === seq.current) { setState((s) => ({ status: 'error', data: s.data, error })); }
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    alive.current = true;
    load();
    return () => { alive.current = false; };
  }, [load]);

  return { ...state, reload: () => load({ force: true }) };
}
