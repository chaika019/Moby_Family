import type { DemoState } from './types';
export const held = (state: DemoState) => state.heldAmount ?? state.chores.filter(chore => chore.status !== 'done').reduce(
  (value, chore) => value + chore.reward,
  0
);
export const available = (state: DemoState) => state.availableAmount ?? (state.parent - held(state));
