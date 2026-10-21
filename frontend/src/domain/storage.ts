import type { DemoState } from './types';
import { initialState } from './seed';
import { refreshState } from './clock';
import { validState } from './validation';
const KEY = 'moby-family-demo-v1';
export function loadState(fallback: DemoState = initialState): DemoState {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (validState(raw)) return refreshState(raw);
  } catch {/* Start a fresh demo if storage is unavailable. */}
  return refreshState(fallback);
}
export function persistState(state: DemoState) {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify(state)
    );
  } catch {/* The current session remains usable without storage. */}
}
export const storageKey = KEY;
