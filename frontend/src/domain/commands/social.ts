import type { CommandOf } from '../types';
import type { CommandContext } from './context';
import { money } from '../money';
import { id } from '../ids';
export function applySocialCommand(context: CommandContext, command: CommandOf<'split' | 'splitPay' | 'splitClose'>) {
  const {
    state
  } = context;
  switch (command.type) {
    case 'split':
      if (state.frozen || !state.safety.transfers) throw Error('Переводы выключены родителем.');
      money(command.amount);
      if (!command.friend.trim() || !command.title.trim()) throw Error('Укажи друга и покупку.');
      state.splits.push({
        id: id(),
        friend: command.friend,
        title: command.title,
        amount: command.amount,
        paid: false
      });
      break;
    case 'splitClose':
    case 'splitPay':
      {
        const bill = state.splits.find(item => item.id === command.id);
        if (!bill || bill.paid) throw Error('Запрос уже закрыт.');
        bill.paid = true;
        break;
      }
  }
}
