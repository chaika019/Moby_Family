import { type Modal } from "../../app/types";
export function modalTitle(mission: Exclude<Modal, null>, child: boolean) {
  return {
    topup: child
      ? 'Попросить карманные'
      : 'Пополнить карту',
    qr: 'Оплата по QR',
    save: 'Ещё ближе к мечте',
    limits: 'Лимиты на покупки',
    chore: 'Новое семейное дело',
    allowance: 'Карманные по расписанию',
    capital: 'Капитал 18',
    shop: 'Магазин наград',
    lesson: 'Твоя суперсила',
    history: 'История операций',
    benefits: 'Моя семья',
    ride: 'Мне нужно домой',
    split: 'Скинуться с друзьями',
    connect: 'Подключение к backend',
    notifications: 'Что нового',
    help: 'Moby рядом',
    card: 'Карта Moby Junior'
  }[mission];
}
