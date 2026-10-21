import type { DemoState, Preset } from './types';
export const presets: Preset[] = [{
  id: 'lunch',
  title: 'Школьный буфет',
  subtitle: 'Обед: суп, булочка и сок',
  amount: 450,
  mcc: 'SCHOOL_5812',
  emoji: '🥪'
}, {
  id: 'sosedi',
  title: 'Соседи',
  subtitle: 'Покупки к вечеру · попробуй SOS',
  amount: 5200,
  mcc: 'GROCERY_5411',
  emoji: '🛍️'
}, {
  id: 'books',
  title: 'Книжный магазин',
  subtitle: 'Книги и канцелярия',
  amount: 1500,
  mcc: 'BOOKS_5942',
  emoji: '📚'
}];
export const initialState: DemoState = {
  version: 1,
  parent: 145000,
  balance: 4500,
  coins: 450,
  cashback: 2450,
  frozen: false,
  dailyLimit: 10000,
  monthlyLimit: 20000,
  spentToday: 0,
  spentMonth: 6000,
  rules: {
    SCHOOL_5812: false,
    BOOKS_5942: false,
    TRANSPORT_4111: false,
    SPORT_5941: false,
    GAMING_7994: true,
    FASTFOOD_5814: false,
    CASH_6011: true,
    ADULT_18_PLUS: true,
    NIGHT_SPEND: true
  },
  safety: {
    online: false,
    belarus: true,
    notifications: true,
    transfers: true
  },
  piggy: 12000,
  target: 30000,
  chores: [{
    id: 'dishes',
    title: 'Помыть посуду',
    reward: 300,
    coins: 50,
    status: 'review'
  }, {
    id: 'book',
    title: 'Прочитать главу книги',
    reward: 500,
    coins: 80,
    status: 'assigned'
  }],
  transactions: [{
    id: 'seed1',
    title: 'Школьный буфет',
    amount: -450,
    kind: 'payment',
    time: 'Сегодня, 12:35'
  }, {
    id: 'seed2',
    title: 'Карманные от папы',
    amount: 2000,
    kind: 'topup',
    time: 'Вчера, 09:00'
  }, {
    id: 'seed3',
    title: 'В копилку на велосипед',
    amount: -1000,
    kind: 'saving',
    time: 'Вчера, 18:42'
  }],
  sos: null,
  lessons: ['intro'],
  owned: ['classic'],
  skin: 'classic',
  allowance: 2000,
  allowanceDay: 1,
  capital: {
    initial: 50000,
    monthly: 10000
  },
  splits: []
};
export const lessonOrder = ['intro', 'budget', 'safety', 'shopping', 'goals'];
export const catalog: Record<string, number> = {
  space: 300,
  sound: 150,
  gamehour: 500
};
