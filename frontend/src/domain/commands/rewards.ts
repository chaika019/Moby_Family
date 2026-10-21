import type { CommandOf } from '../types';
import type { CommandContext } from './context';
import { catalog, lessonOrder } from '../seed';
export function applyRewardsCommand(context: CommandContext, command: CommandOf<'quiz'
  | 'buy'
  | 'skin'>) {
  const {
    state
  } = context;
  switch (command.type) {
    case 'quiz':
      if (!lessonOrder.includes(command.id)) throw Error('Урок не найден.');
      if (lessonOrder.indexOf(command.id) > 0 && !state.lessons.includes(lessonOrder[lessonOrder.indexOf(command.id) - 1])) throw Error('Сначала пройди предыдущий урок.');
      if (state.lessons.includes(command.id)) throw Error('Ты уже получил награду за этот урок.');
      state.lessons.push(command.id);
      state.coins += 100;
      break;
    case 'buy':
      if (!Object.hasOwn(
        catalog,
        command.id
      ) || catalog[command.id] !== command.cost) throw Error('Цена награды изменилась.');
      if (state.owned.includes(command.id)) throw Error('Эта награда уже твоя.');
      if (state.coins < command.cost) throw Error('Пока не хватает Moby Coins. Пройди урок или выполни задание.');
      state.coins -= command.cost;
      state.owned.push(command.id);
      break;
    case 'skin':
      if (!state.owned.includes(command.id)) throw Error('Сначала открой этот образ.');
      state.skin = command.id;
      break;
  }
}
