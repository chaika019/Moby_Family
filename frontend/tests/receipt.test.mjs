import { before, test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
let parseReceipt, receiptPreset;
before(async () => {
  const result = await build({ entryPoints: [fileURLToPath(new URL(
    '../src/domain/receipt.ts', import.meta.url))], bundle: true, write: false,
    platform: 'node', format: 'esm', target: 'es2022' });
  ({ parseReceipt, receiptPreset } = await import('data:text/javascript;base64,'
    + Buffer.from(result.outputFiles[0].text).toString('base64')));
});
const presets = JSON.parse(fs.readFileSync(new URL(
  '../src/data/receiptPresets.json', import.meta.url)));
test('all three demonstration QR receipts parse to exact cents and backend items', () => {
  for (const entry of presets) {
    const receipt = parseReceipt(JSON.stringify(entry));
    const preset = receiptPreset(receipt, entry.id);
    assert.equal(preset.amount, Math.round(entry.amount * 100));
    assert.equal(preset.receiptItems.reduce((n, item) => n
      + Math.round(item.unitPrice * 100) * item.quantity, 0), preset.amount);
    assert.equal(preset.mcc, entry.mcc);
  }
});
test('invalid and altered QR totals are rejected before payment', () => {
  assert.throws(() => parseReceipt('not json'), /JSON/);
  const altered = structuredClone(presets[1]);
  altered.amount = 53;
  assert.throws(() => parseReceipt(JSON.stringify(altered)), /не совпадает/);
  altered.amount = 52;
  altered.mcc = '7994x';
  assert.throws(() => parseReceipt(JSON.stringify(altered)), /MCC/);
  altered.mcc = '5411';
  altered.items[0].price = 7.001;
  assert.throws(() => parseReceipt(JSON.stringify(altered)), /копейки/);
});
