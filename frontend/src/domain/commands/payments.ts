import type { CommandOf } from '../types';
import type { CommandContext } from './context';
import { money } from '../money';
import { id } from '../ids';
export function applyPaymentsCommand(context: CommandContext, command: CommandOf<'topup'
  | 'pay'
  | 'sosApprove'
  | 'sosReject'>) {
  const {
    state,
    now,
    add,
    parentCan,
    canPay,
    pay
  } = context;
  switch (command.type) {
    case 'topup':
      money(command.amount);
      parentCan(command.amount);
      state.parent -= command.amount;
      state.balance += command.amount;
      add(
        'Карманные от папы',
        command.amount,
        'topup'
      );
      break;
    case 'pay':
      money(command.preset.amount);
      canPay(
        command.preset.amount,
        command.preset.mcc,
        command.preset.online,
        command.preset.country
      );
      if (state.sos) throw Error('Один чек уже ждёт родителя. Сначала завершим его.');
      if (state.balance < command.preset.amount) state.sos = {
        id: id(),
        title: command.preset.title,
        amount: command.preset.amount,
        mcc: command.preset.mcc,
        expiresAt: now.getTime() + 10 * 60 * 1000,
        online: command.preset.online,
        country: command.preset.country
      };else pay(
        command.preset.amount,
        command.preset.title
      );
      break;
    case 'sosApprove':
      {
        if (!state.sos) throw Error('Этот запрос уже обработан.');
        canPay(
          state.sos.amount,
          state.sos.mcc,
          state.sos.online,
          state.sos.country
        );
        const missing = Math.max(
          0,
          state.sos.amount - state.balance
        );
        parentCan(missing);
        state.parent -= missing;
        state.balance += missing;
        pay(
          state.sos.amount,
          state.sos.title
        );
        state.sos = null;
        break;
      }
    case 'sosReject':
      state.sos = null;
      break;
  }
}
