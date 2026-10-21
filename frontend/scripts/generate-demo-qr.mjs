import fs from 'node:fs';
import path from 'node:path';
import QRCode from 'qrcode';

const presets = JSON.parse(fs.readFileSync('src/data/receiptPresets.json', 'utf8'));
const output = 'public/demo-qr';
const inline = ['export const demoQrSvg: Record<string, string> = {'];
fs.mkdirSync(output, { recursive: true });
for (const preset of presets) {
  const { id, label, emoji, ...receipt } = preset;
  const payload = JSON.stringify(receipt);
  const svg = await QRCode.toString(payload,
    { type: 'svg', errorCorrectionLevel: 'M', margin: 3 });
  fs.writeFileSync(path.join(output, `${id}.svg`), svg);
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  const chunks = dataUrl.match(/.{1,72}/g) || [];
  inline.push(`  ${JSON.stringify(id)}: [`);
  for (const chunk of chunks) inline.push(`    ${JSON.stringify(chunk)},`);
  inline.push(`  ].join(''),`);
  await QRCode.toFile(path.join(output, `${id}.png`), payload,
    { type: 'png', errorCorrectionLevel: 'M', margin: 3, width: 720 });
}
inline.push('};', '');
fs.writeFileSync('src/data/generatedQr.ts', inline.join('\n'));
console.log('Generated three demo receipt QR codes (SVG + PNG).');
