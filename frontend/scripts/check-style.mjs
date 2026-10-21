import fs from 'node:fs';
import path from 'node:path';

const MAX_LINE_LENGTH = 100;
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.css', '.mjs']);

function sourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(file);
    return SOURCE_EXTENSIONS.has(path.extname(file)) ? [file] : [];
  });
}

const issues = [];
const files = [
  ...['src', 'tests', 'scripts'].flatMap(sourceFiles),
  'index.html',
  'vite.config.ts',
  'playwright.config.ts',
  'tsconfig.json',
  'package.json',
];
for (const file of files) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, index) => {
    if (line.length > MAX_LINE_LENGTH) {
      issues.push(`${file}:${index + 1}: ${line.length} characters (maximum 100)`);
    }
    if (/\t|[ \t]+$/.test(line)) {
      issues.push(`${file}:${index + 1}: use spaces without trailing whitespace`);
    }
  });
}

if (issues.length) {
  console.error(issues.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Source style: all lines are at most 100 characters; whitespace is clean.');
}
