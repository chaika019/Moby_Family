import type { DemoState, Transaction } from '../types';
import { refreshState } from '../clock';
import { available } from '../selectors';
import { id } from '../ids';
export function createCommandContext(previous: DemoState, now: Date) {
  const state = refreshState(
    previous,
    now
  );
  const add = (title: string, amount: number, kind: Transaction['kind']) => state.transactions.unshift({
    id: id(),
    title,
    amount,
    kind,
    time: 'Сегодня, ' + new Date().toLocaleTimeString(
      'ru-RU',
      {
        hour: '2-digit',
        minute: '2-digit'
      }
    )
  });
  const parentCan = (amount: number) => {
    if (available(state) < amount) throw Error('На доступном балансе родителя недостаточно денег.');
  };
  const canPay = (amount: number, mcc: string, online = false, country = 'BY') => {
    if (online && !state.safety.online) throw Error('Интернет-покупки выключены родителем.');
    if (state.safety.belarus && country !== 'BY') throw Error('Сейчас разрешены покупки только в Беларуси.');
    const hour = Number(new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Minsk',
      hour: '2-digit',
      hourCycle: 'h23'
    }).format(
      now
    ));
    if (state.rules.NIGHT_SPEND && (hour >= 22 || hour < 7)) throw Error('Ночные покупки выключены до 07:00.');
    if (state.frozen) throw Error('Карта на паузе. Попроси родителя включить её.');
    const mccRule: Record<string, string> = {
      '7994': 'GAMING_7994', '5816': 'GAMING_7994',
      '5814': 'FASTFOOD_5814', '5812': 'SCHOOL_5812',
      '5942': 'BOOKS_5942', '5943': 'BOOKS_5942',
      '4111': 'TRANSPORT_4111', '4131': 'TRANSPORT_4111',
      '4121': 'TRANSPORT_4111', '5941': 'SPORT_5941', '7997': 'SPORT_5941'
    };
    if (state.rules[mccRule[mcc] || mcc]) throw Error('Эта категория пока закрыта родителем. Обсудите покупку вместе.');
    if (state.spentToday + amount > state.dailyLimit) throw Error('На сегодня достигнут лимит. Родитель может изменить его в настройках.');
    if (state.spentMonth + amount > state.monthlyLimit) throw Error('Достигнут месячный лимит. Обсуди его с родителем.');
  };
  const pay = (amount: number, title: string) => {
    state.balance -= amount;
    state.spentToday += amount;
    state.spentMonth += amount;
    state.cashback += Math.round(amount * .05);
    add(
      title,
      -amount,
      'payment'
    );
  };
  return {
    state,
    now,
    add,
    parentCan,
    canPay,
    pay
  };
}
export type CommandContext = ReturnType<typeof createCommandContext>;
