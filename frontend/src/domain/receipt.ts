import type { Preset } from './types';

export interface ReceiptItem {
  title: string;
  quantity: number;
  unitPrice: number;
}

export interface Receipt {
  merchantName: string;
  mccCategory: string;
  amount: number;
  receiptItems: ReceiptItem[];
}

function cents(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw Error('В QR-чеке неверная сумма.');
  }
  const result = Math.round(value * 100);
  if (Math.abs(value * 100 - result) > 1e-7 || result > 999999999) {
    throw Error('В QR-чеке сумма должна быть в BYN с точностью до копейки.');
  }
  return result;
}

export function parseReceipt(raw: string): Receipt {
  if (raw.length > 20000) throw Error('QR-чек слишком большой.');
  let value: unknown;
  try { value = JSON.parse(raw); }
  catch { throw Error('Это не QR-чек Moby: нужен JSON с данными покупки.'); }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw Error('В QR-коде нет данных чека.');
  }
  const data = value as Record<string, unknown>;
  if (typeof data.merchant !== 'string' || !data.merchant.trim()
      || data.merchant.length > 150 || typeof data.mcc !== 'string'
      || !/^\d{4}$/.test(data.mcc) || !Array.isArray(data.items)
      || data.items.length === 0 || data.items.length > 100) {
    throw Error('QR-чек должен содержать магазин, MCC и позиции покупки.');
  }
  const items = data.items.map(item => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw Error('В QR-чеке неверная позиция.');
    }
    const row = item as Record<string, unknown>;
    if (typeof row.name !== 'string' || !row.name.trim() || row.name.length > 150) {
      throw Error('В QR-чеке неверное название товара.');
    }
    return { title: row.name.trim(), quantity: 1, unitPrice: cents(row.price) / 100 };
  });
  const total = items.reduce((sum, item) => sum + Math.round(item.unitPrice * 100), 0);
  if (cents(data.amount) !== total) {
    throw Error('Сумма позиций QR-чека не совпадает с итогом.');
  }
  return {
    merchantName: data.merchant.trim(),
    mccCategory: data.mcc,
    amount: total / 100,
    receiptItems: items
  };
}

export function receiptPreset(receipt: Receipt, id = crypto.randomUUID()): Preset {
  return {
    id, title: receipt.merchantName, subtitle: 'Чек по QR',
    amount: Math.round(receipt.amount * 100), mcc: receipt.mccCategory,
    emoji: '🧾', receiptItems: receipt.receiptItems, scanned: true
  };
}
