import fs from 'node:fs';
import path from 'node:path';
const html = fs.readFileSync(
  'dist/index.html',
  'utf8'
);
const script = html.match(/<script[^>]*src="([^"]+)"[^>]*><\/script>/)?.[1];
const style = html.match(/<link[^>]*href="([^"]+\.css)"[^>]*>/)?.[1];
if (!script
  || !style) {
  throw Error('Built assets not found');
}
const mimeTypes = {
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2'
};
const dataUrl = file => {
  const mime = mimeTypes[path.extname(file)];
  if (!mime) {
    throw Error(`Unsupported embedded asset: ${file}`);
  }
  return `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
};
const logo = dataUrl('public/favicon.svg');
const js = fs.readFileSync(
  'dist' + script,
  'utf8'
).replaceAll(
  '/favicon.svg',
  logo
).replaceAll(
  '</script',
  '<\\/script'
);
const css = fs.readFileSync(
  'dist' + style,
  'utf8'
).replace(
  /url\((['"]?)(\/[^)'"\s]+)\1\)/g,
  (_match, _quote, url) => {
    const file = path.join(
      'dist',
      url
    );
    if (!fs.existsSync(file)) {
      throw Error(`Missing preview asset: ${url}`);
    }
    return `url("${dataUrl(file)}")`;
  }
);
const result = html.replace(
  /<script[^>]*src="[^"]+"[^>]*><\/script>/,
  () => `<script type="module">${js}</script>`
).replace(
  /<link[^>]*href="[^"]+\.css"[^>]*>/,
  () => `<style>${css}</style>`
).replaceAll(
  '/favicon.svg',
  logo
);
fs.writeFileSync(
  'Moby-preview.html',
  result
);
console.log('Standalone preview created: Moby-preview.html');
