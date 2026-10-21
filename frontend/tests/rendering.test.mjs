import { after, before, test } from 'node:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import { build } from 'esbuild';

const cases = [
  ['safety/SafetyPage', 'parent', 'Лимиты на покупки'],
  ['academy/AcademyPage', 'child', 'Деньги любят план'],
  ['chores/ChoresPage', 'parent', 'Добавить задание'],
  ['profile/MorePage', 'child', 'Магазин наград'],
  ['profile/MorePage', 'parent', 'Семейные финансы'],
  ['goals/DreamsPage', 'child', 'На новый велосипед'],
  ['payments/QrPaymentSheet', 'child', 'Выбери чек для демо-оплаты'],
  ['payments/TopUpSheet', 'parent', 'Сумма пополнения'],
  ['payments/TopUpSheet', 'child', 'Перейти на экран родителя'],
  ['goals/SavingsSheet', 'child', 'Сколько отложим?'],
  ['safety/LimitsSheet', 'parent', 'В день'],
  ['chores/NewChoreSheet', 'parent', 'Что нужно сделать?'],
  ['allowance/AllowanceSheet', 'parent', 'День месяца'],
  ['goals/CapitalSheet', 'parent', 'ПРИМЕРНО ЧЕРЕЗ 7 ЛЕТ'],
  ['history/HistorySheet', 'child', 'Школьный буфет'],
  ['rewards/ShopSheet', 'child', 'Космо-лис'],
  ['academy/LessonSheet', 'child', 'Тебе подарили 20 BYN.'],
  ['benefits/BenefitsSheet', 'parent', 'Хорошо быть семьёй'],
  ['safety/RideSheet', 'child', 'Дом — самое спокойное место'],
  ['social/SplitBillSheet', 'child', 'Имя друга'],
  ['connection/ConnectionSheet', 'parent', 'Email'],
  ['notifications/NotificationsSheet', 'parent', 'Помыть посуду'],
  ['cards/CardSheet', 'child', 'Виртуальная карта активна'],
  ['help/HelpSheet', 'child', 'Давай разберёмся вместе'],
];

let renderFeature;
let temporaryDirectory;

after(async () => {
  if (temporaryDirectory) {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
});

before(async () => {
  const modules = [...new Set(cases.map(([module]) => module))];
  const imports = modules.map(module => {
    const name = module.split('/').at(-1);
    return `import { ${name} } from './src/features/${module}';`;
  });
  const components = modules.map(module => module.split('/').at(-1));
  const source = `
    import React from 'react';
    import { renderToString } from 'react-dom/server';
    import { FamilyProvider } from './src/app/FamilyProvider';
    import { PhoneProvider } from './src/app/PhoneProvider';
    ${imports.join('\n')}
    const components = { ${components.join(', ')} };
    export function renderFeature(name, role) {
      const Feature = components[name];
      return renderToString(
        <FamilyProvider>
          <PhoneProvider role={role}><Feature /></PhoneProvider>
        </FamilyProvider>
      );
    }
  `;
  temporaryDirectory = await mkdtemp(join(tmpdir(), 'moby-rendering-'));
  const output = join(temporaryDirectory, 'features.cjs');
  await build({
    stdin: { contents: source, loader: 'tsx', resolveDir: process.cwd() },
    bundle: true,
    outfile: output,
    platform: 'node',
    format: 'cjs',
    target: 'es2022',
    define: { 'import.meta.env.VITE_API_BASE_URL': '""' },
  });
  const { default: compiled } = await import(pathToFileURL(output).href);
  renderFeature = compiled.renderFeature;
});

for (const [module, role, expectedText] of cases) {
  test(`${module} renders for ${role} with real family and phone providers`, () => {
    const html = renderFeature(module.split('/').at(-1), role);
    const text = html.replace(/<!--.*?-->/g, '');
    assert.ok(text.includes(expectedText), `Missing expected text: ${expectedText}`);
    assert.ok(!text.includes('NaN'), 'Invalid numeric content reached the view');
  });
}
