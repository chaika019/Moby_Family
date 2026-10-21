import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  execute,
  initialState,
  loadState,
  persistState,
  refreshState,
  storageKey,
  type Command,
} from '../lib/demo';
const REFRESH_INTERVAL_MS = 30_000;

/** Owns persistence and time-based refreshes for both phone views. */
export function useFamilyStore() {
  const [state, setState] = useState(loadState);
  const stateRef = useRef(state);
  useEffect(
    () => {
      stateRef.current = state;
      persistState(state);
    },
    [state]
  );
  useEffect(
    () => {
      function refresh() {
        const next = refreshState(stateRef.current);
        if (JSON.stringify(next) !== JSON.stringify(stateRef.current)) {
          stateRef.current = next;
          setState(next);
        }
      }
      const timer = window.setInterval(
        refresh,
        REFRESH_INTERVAL_MS
      );
      window.addEventListener(
        'focus',
        refresh
      );
      return () => {
        window.clearInterval(timer);
        window.removeEventListener(
          'focus',
          refresh
        );
      };
    },
    []
  );
  useEffect(
    () => {
      function syncStorage(event: StorageEvent) {
        if (event.key !== storageKey) return;
        const next = loadState();
        stateRef.current = next;
        setState(next);
      }
      window.addEventListener(
        'storage',
        syncStorage
      );
      return () => window.removeEventListener(
        'storage',
        syncStorage
      );
    },
    []
  );
  const runCommand = useCallback(
    (command: Command) => {
      const current = loadState(stateRef.current);
      const next = execute(
        current,
        command
      );
      persistState(next);
      stateRef.current = next;
      setState(next);
      return next;
    },
    []
  );
  const reset = useCallback(
    () => {
      const next = refreshState(initialState);
      stateRef.current = next;
      setState(next);
    },
    []
  );
  return {
    state,
    runCommand,
    reset
  };
}
