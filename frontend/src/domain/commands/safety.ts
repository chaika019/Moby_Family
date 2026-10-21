import type { CommandOf } from '../types';
import type { CommandContext } from './context';
import { nonnegative } from '../money';
export function applySafetyCommand(context: CommandContext, command: CommandOf<'freeze'
  | 'rule'
  | 'safety'
  | 'limits'
  | 'ride'>) {
  const {
    state,
    parentCan
  } = context;
  switch (command.type) {
    case 'freeze':
      state.frozen = !state.frozen;
      break;
    case 'rule':
      if (!Object.hasOwn(
        state.rules,
        command.key
      )) throw Error('Неизвестная категория.');
      state.rules[command.key] = !state.rules[command.key];
      break;
    case 'safety':
      if (!Object.hasOwn(
        state.safety,
        command.key
      )) throw Error('Неизвестная настройка.');
      state.safety[command.key] = !state.safety[command.key];
      break;
    case 'limits':
      nonnegative(command.daily);
      nonnegative(command.monthly);
      if (command.daily > command.monthly) throw Error('Дневной лимит не может быть больше месячного.');
      state.dailyLimit = command.daily;
      state.monthlyLimit = command.monthly;
      break;
    case 'ride':
      parentCan(1200);
      state.parent -= 1200;
      break;
  }
}
