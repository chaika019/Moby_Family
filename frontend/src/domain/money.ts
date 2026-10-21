export const formatMoney = (cents: number) => new Intl.NumberFormat('ru-BY', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
}).format(
  cents / 100
);
export function parseMoney(value: string): number {
  const normalized = value.trim().replace(
    ',',
    '.'
  );
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(normalized)) throw Error('Укажи сумму в BYN, например 10,50.');
  return Math.round(Number(normalized) * 100);
}
export const nonnegative = (amount: number) => {
  if (!Number.isSafeInteger(amount) || amount < 0) throw Error('Укажи неотрицательное целое число.');
};
export const money = (amount: number) => {
  if (!Number.isSafeInteger(amount) || amount <= 0) throw Error('Введи сумму больше нуля, не более двух знаков после запятой.');
};
