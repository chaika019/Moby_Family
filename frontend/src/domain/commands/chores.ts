import type { CommandOf } from '../types';
import type { CommandContext } from './context';
import { nonnegative } from '../money';
import { id } from '../ids';
export function applyChoresCommand(context: CommandContext, command: CommandOf<'submit'
  | 'approve'
  | 'chore'>) {
  const {
    state,
    add,
    parentCan
  } = context;
  switch (command.type) {
    case 'submit':
      {
        const chore = state.chores.find(item => item.id === command.id);
        if (!chore || chore.status !== 'assigned') throw Error('Задание уже отправлено.');
        chore.status = 'review';
        break;
      }
    case 'approve':
      {
        const chore = state.chores.find(item => item.id === command.id);
        if (!chore || chore.status !== 'review') throw Error('Это задание ещё не готово к проверке.');
        nonnegative(chore.coins);
        if (chore.coins > 100) throw Error('Награда — не более 100 Moby Coins.');
        state.parent -= chore.reward;
        state.balance += chore.reward;
        state.coins += chore.coins;
        chore.status = 'done';
        add(
          chore.title,
          chore.reward,
          'reward'
        );
        break;
      }
    case 'chore':
      nonnegative(command.reward);
      nonnegative(command.coins);
      if (command.coins > 100) throw Error('Награда — не более 100 Moby Coins.');
      parentCan(command.reward);
      if (!command.title.trim()) throw Error('Добавь название задания.');
      state.chores.push({
        id: id(),
        title: command.title.trim(),
        reward: command.reward,
        coins: command.coins,
        status: 'assigned'
      });
      break;
  }
}
