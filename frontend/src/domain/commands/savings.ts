import type { CommandOf } from '../types';
import type { CommandContext } from './context';
import { money } from '../money';
export function applySavingsCommand(context: CommandContext, command: CommandOf<'save'
  | 'allowance'
  | 'capital'>) {
  const {
    state,
    add,
    parentCan
  } = context;
  switch (command.type) {
    case 'save':
      {
        money(command.amount);
        if (state.frozen) throw Error('Карта на паузе. Пополнение копилки недоступно.');
        if (state.balance < command.amount) throw Error('На карте не хватает денег для копилки.');
        const match = Math.round(command.amount * .5);
        parentCan(match);
        if (state.piggy + command.amount + match > state.target) throw Error('С учётом доплаты эта сумма превысит цель. Выбери сумму поменьше.');
        state.balance -= command.amount;
        state.parent -= match;
        state.piggy += command.amount + match;
        add(
          'В копилку на велосипед',
          -command.amount,
          'saving'
        );
        break;
      }
    case 'allowance':
      money(command.amount);
      if (!Number.isInteger(command.day) || command.day < 1 || command.day > 28) throw Error('Выбери день от 1 до 28.');
      state.allowance = command.amount;
      state.allowanceDay = command.day;
      break;
    case 'capital':
      money(command.initial);
      if (!Number.isSafeInteger(command.monthly) || command.monthly < 0) throw Error('Проверь ежемесячный взнос.');
      state.capital = {
        initial: command.initial,
        monthly: command.monthly
      };
      break;
  }
}
