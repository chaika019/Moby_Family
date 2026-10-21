import type { Chore, DemoState, Transaction } from './types';
import { held } from './selectors';

type SplitBill = DemoState['splits'][number];
type SosRequest = NonNullable<DemoState['sos']>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function isPositiveInteger(value: unknown): value is number {
  return isNonNegativeInteger(value) && value > 0;
}

function isBooleanMap(value: unknown) {
  return isRecord(value) && Object.values(value).every(item => typeof item === 'boolean');
}

function isStringList(value: unknown) {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

function isChore(value: unknown): value is Chore {
  if (!isRecord(value)) return false;
  return typeof value.id === 'string'
    && typeof value.title === 'string'
    && isNonNegativeInteger(value.reward)
    && isNonNegativeInteger(value.coins)
    && typeof value.status === 'string'
    && ['assigned', 'review', 'done'].includes(value.status);
}

function isTransaction(value: unknown): value is Transaction {
  if (!isRecord(value)) return false;
  return typeof value.id === 'string'
    && typeof value.title === 'string'
    && Number.isSafeInteger(value.amount)
    && typeof value.time === 'string'
    && typeof value.kind === 'string'
    && ['payment', 'topup', 'reward', 'saving'].includes(value.kind);
}

function isSplitBill(value: unknown): value is SplitBill {
  if (!isRecord(value)) return false;
  return typeof value.id === 'string'
    && typeof value.friend === 'string'
    && typeof value.title === 'string'
    && isPositiveInteger(value.amount)
    && typeof value.paid === 'boolean';
}

function isSosRequest(value: unknown): value is SosRequest {
  if (!isRecord(value)) return false;
  return typeof value.id === 'string'
    && typeof value.title === 'string'
    && typeof value.mcc === 'string'
    && isPositiveInteger(value.amount);
}

function isCapitalPlan(value: unknown) {
  return isRecord(value)
    && isPositiveInteger(value.initial)
    && isNonNegativeInteger(value.monthly);
}

/** Reject partial or corrupted browser saves before they reach the UI. */
export function validState(value: unknown): value is DemoState {
  if (!isRecord(value)) return false;
  const state = value as unknown as DemoState;
  const amounts = [
    state.parent,
    state.balance,
    state.coins,
    state.cashback,
    state.dailyLimit,
    state.monthlyLimit,
    state.spentToday,
    state.spentMonth,
    state.piggy,
    state.target,
    state.allowance,
  ];

  return state.version === 1
    && amounts.every(isNonNegativeInteger)
    && state.target > 0
    && typeof state.frozen === 'boolean'
    && isBooleanMap(state.rules)
    && isBooleanMap(state.safety)
    && Array.isArray(state.chores)
    && state.chores.every(isChore)
    && Array.isArray(state.transactions)
    && state.transactions.every(isTransaction)
    && isStringList(state.lessons)
    && isStringList(state.owned)
    && typeof state.skin === 'string'
    && Number.isInteger(state.allowanceDay)
    && state.allowanceDay >= 1
    && state.allowanceDay <= 28
    && isCapitalPlan(state.capital)
    && Array.isArray(state.splits)
    && state.splits.every(isSplitBill)
    && (state.sos === null || isSosRequest(state.sos))
    && state.parent >= held(state);
}
