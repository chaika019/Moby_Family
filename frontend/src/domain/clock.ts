import type { DemoState } from './types';
function dateKeys(now: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Minsk',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(
    now
  );
  const part = (type: string) => parts.find(p => p.type === type)!.value;
  return {
    day: `${part('year')}-${part('month')}-${part('day')}`,
    month: `${part('year')}-${part('month')}`
  };
}
export function refreshState(previous: DemoState, now = new Date()): DemoState {
  const state = structuredClone(previous),
    keys = dateKeys(now);
  if (state.spendingDate && state.spendingDate !== keys.day) state.spentToday = 0;
  if (state.spendingMonth && state.spendingMonth !== keys.month) state.spentMonth = 0;
  state.spendingDate = keys.day;
  state.spendingMonth = keys.month;
  state.rules = {
    SCHOOL_5812: false,
    BOOKS_5942: false,
    TRANSPORT_4111: false,
    SPORT_5941: false,
    ...state.rules
  };
  state.safety = {
    online: false,
    belarus: true,
    notifications: true,
    transfers: true,
    ...state.safety
  };
  if (state.sos?.expiresAt && state.sos.expiresAt <= now.getTime()) state.sos = null;
  return state;
}
