/** Public domain facade retained for existing consumers. */
export type { Role, Tab, Chore, Transaction, Preset, DemoState, Command } from '../domain/types';
export { initialState, presets, lessonOrder } from '../domain/seed';
export { formatMoney, parseMoney } from '../domain/money';
export { available, held } from '../domain/selectors';
export { refreshState } from '../domain/clock';
export { loadState, persistState, storageKey } from '../domain/storage';
export { execute } from '../domain/commands/execute';
