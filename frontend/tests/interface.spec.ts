import { test, expect, type Page } from 'playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const url = pathToFileURL(resolve('Moby-preview.html')).href;
async function showRole(page: Page, role: 'parent' | 'child') {
  if ((page.viewportSize()?.width
    || 0) <= 700) {
    await page.getByRole(
      'button',
      {
        name: role === 'parent'
          ? 'Родитель'
          : 'Ребёнок',
        exact: true
      }
    ).click(
    );
  }
}
test.beforeEach(async ({
  page
}) => {
  await page.clock.setFixedTime(new Date('2026-10-20T09:00:00Z'));
  await page.goto(url);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});
test(
  'QR SOS updates both roles and preserves exact balances',
  async ({
    page
  }) => {
    const child = page.getByTestId('child-phone'),
      parent = page.getByTestId('parent-phone');
    await expect(parent.getByTestId('parent-own-balance')).toHaveText(
      'Ваш баланс: 1 450,00 BYN'
    );
    await expect(child.locator('.hero-balance h2')).toHaveText('45,00 BYN');
    await child.getByRole(
      'button',
      {
        name: 'Оплатить QR',
        exact: true
      }
    ).click(
    );
    await expect(child.getByRole('region', { name: 'Сканер QR-чека' })).toBeVisible();
    await child.getByRole(
      'button',
      {
        name: /Супермаркет \(52,00 BYN\)/
      }
    ).click(
    );
    await expect(child.getByRole(
      'heading',
      {
        name: 'Папа, выручай!'
      }
    )).toBeVisible(
    );
    await child.getByRole(
      'button',
      {
        name: 'На экран родителя',
        exact: true
      }
    ).click(
    );
    await expect(parent.getByRole('alert')).toContainText('7,00 BYN');
    await parent.getByRole(
      'button',
      {
        name: /Добавить 7,00 BYN и оплатить/
      }
    ).click(
    );
    await expect(parent.getByTestId('parent-own-balance')).toHaveText(
      'Ваш баланс: 1 443,00 BYN'
    );
    await expect(parent.locator('.parent-balance-card h2')).toHaveText('0,00 BYN');
    await expect(parent.locator('.cashback-banner')).toContainText('27,10');
    await showRole(
      page,
      'child'
    );
    await expect(child.locator('.hero-balance h2')).toHaveText('0,00 BYN');
    await expect(child.locator('.waiting-card')).toHaveCount(0);
  }
);
test(
  'blocked gaming QR shows a clear reason, card remains unchanged',
  async ({
    page
  }) => {
    const child = page.getByTestId('child-phone');
    await child.getByRole(
      'button',
      {
        name: 'Оплатить QR',
        exact: true
      }
    ).click(
    );
    await child.getByRole(
      'button',
      {
        name: /Игры \/ Донат \(15,00 BYN\)/
      }
    ).click(
    );
    await expect(child.getByRole('alert')).toContainText('категория');
    await child.getByRole(
      'button',
      {
        name: 'Закрыть',
        exact: true
      }
    ).click(
    );
    await expect(child.locator('.hero-balance h2')).toContainText('45,00');
  }
);
test(
  'savings apply parent matching and task review synchronizes reward',
  async ({
    page
  }) => {
    const child = page.getByTestId('child-phone'),
      parent = page.getByTestId('parent-phone');
    await child.getByRole(
      'button',
      {
        name: 'Мечты',
        exact: true
      }
    ).click(
    );
    await child.getByRole(
      'button',
      {
        name: 'Приблизить мечту'
      }
    ).click(
    );
    await child.getByLabel('Сколько отложим?').fill(
      '10'
    );
    await child.getByRole(
      'button',
      {
        name: 'Пополнить копилку'
      }
    ).click(
    );
    await expect(child.locator('.goal-numbers')).toContainText('135,00');
    await showRole(
      page,
      'parent'
    );
    await parent.getByRole(
      'button',
      {
        name: 'Дела',
        exact: true
      }
    ).click(
    );
    await parent.getByRole(
      'button',
      {
        name: 'Проверить',
        exact: true
      }
    ).click(
    );
    await showRole(
      page,
      'child'
    );
    await child.getByRole(
      'button',
      {
        name: 'Главная',
        exact: true
      }
    ).click(
    );
    await expect(child.locator('.hero-balance h2')).toContainText('38,00');
  }
);
test(
  'mobile screens and dialogs fit viewport; all main sections open',
  async ({
    page
  }, info) => {
    const child = page.getByTestId('child-phone');
    for (const name of ['Мечты', 'Академия', 'Ещё', 'Главная']) {
      await child.getByRole(
        'button',
        {
          name,
          exact: true
        }
      ).click(
      );
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    expect(overflow).toBe(false);
    await page.screenshot({
      path: info.outputPath('home.png'),
      fullPage: true
    });
    await child.getByRole(
      'button',
      {
        name: 'Оплатить QR',
        exact: true
      }
    ).click(
    );
    await expect(child.getByRole('dialog')).toBeVisible();
    await expect(child.getByRole('link', { name: /Скачать QR: Супермаркет/ }))
      .toHaveAttribute('href', /^data:image\/svg\+xml/);
    const bounds = await child.getByRole('dialog').boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    await page.screenshot({
      path: info.outputPath('qr.png'),
      fullPage: true
    });
  }
);
test(
  'demo survives reload and reset restores seed data',
  async ({
    page
  }) => {
    const child = page.getByTestId('child-phone');
    await child.getByRole(
      'button',
      {
        name: 'Оплатить QR',
        exact: true
      }
    ).click(
    );
    await child.getByRole(
      'button',
      {
        name: /Школьный буфет \(4,50 BYN\)/
      }
    ).click(
    );
    await child.getByRole(
      'button',
      {
        name: 'Отлично!',
        exact: true
      }
    ).click(
    );
    await page.reload();
    await expect(child.locator('.hero-balance h2')).toContainText('40,50');
    await page.getByRole(
      'button',
      {
        name: 'Начать заново',
        exact: true
      }
    ).click(
    );
    await expect(child.locator('.hero-balance h2')).toContainText('45,00');
  }
);

test('freeze is managed in safety and syncs to the child', async ({ page }, info) => {
  const parent = page.getByTestId('parent-phone');
  const child = page.getByTestId('child-phone');
  await showRole(page, 'parent');
  await expect(parent.getByRole('button', { name: 'Поставить карту на паузу' })).toHaveCount(0);
  await parent.getByLabel('Навигация родителя').getByRole('button', { name: 'Защита', exact: true }).click();
  await expect(parent.getByText('Игры и донаты')).toHaveCount(0);
  for (const name of ['Школьное питание', 'Книги и канцелярия', 'Транспорт', 'Спорт',
    'Детские кафе и фастфуд']) {
    await expect(parent.getByRole('switch', { name: `Разрешить: ${name}` })).toBeChecked();
  }
  const freeze = parent.getByRole('switch', { name: 'Заморозить карту' });
  await freeze.click();
  await expect(freeze).toBeChecked();
  await page.screenshot({ path: info.outputPath('safety.png'), fullPage: true });
  await showRole(page, 'child');
  await expect(child.locator('.card-tag')).toContainText('На паузе');
  await showRole(page, 'parent');
  await freeze.click();
  await expect(freeze).not.toBeChecked();
  await showRole(page, 'child');
  await expect(child.locator('.card-tag')).not.toContainText('На паузе');
});

test('chore form rejects 101 Coins and accepts 100', async ({ page }, info) => {
  await showRole(page, 'parent');
  const parent = page.getByTestId('parent-phone');
  await parent.getByRole('button', { name: 'Дела', exact: true }).click();
  await parent.getByRole('button', { name: 'Добавить задание', exact: true }).click();
  const dialog = parent.getByRole('dialog');
  await dialog.getByLabel('Что нужно сделать?').fill('Полить цветы');
  const coins = dialog.getByLabel('Бонус Moby Coins');
  await coins.fill('101');
  await dialog.getByRole('button', { name: 'Добавить задание' }).click();
  await expect(dialog).toBeVisible();
  expect(await coins.evaluate((el: HTMLInputElement) => el.validity.rangeOverflow)).toBe(true);
  await coins.fill('100');
  await page.screenshot({ path: info.outputPath('chore.png'), fullPage: true });
  await dialog.getByRole('button', { name: 'Добавить задание' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(parent.getByText('Полить цветы', { exact: true })).toBeVisible();
});
