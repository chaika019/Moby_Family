import { before, test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
let execute, rawExecute, initialState, presets, held, available;
let parseMoney, refreshState, loadState;
before(async () => {
  const result = await build({
    entryPoints: [fileURLToPath(new URL('../src/lib/demo.ts', import.meta.url))],
    bundle: true,
    write: false,
    platform: 'node',
    format: 'esm',
    target: 'es2022'
  });
  const encoded = Buffer.from(result.outputFiles[0].text).toString('base64');
  ({
    execute: rawExecute,
    initialState,
    presets,
    held,
    available,
    parseMoney,
    refreshState,
    loadState
  } = await import('data:text/javascript;base64,' + encoded));
  execute = (s, c) => rawExecute(
    s,
    c,
    new Date('2026-10-20T09:00:00Z')
  );
});
const fresh = () => structuredClone(initialState);
test(
  'QR payment preserves parent funds and credits exact 5% cashback',
  () => {
    const s = execute(
      fresh(),
      {
        type: 'pay',
        preset: presets[0]
      }
    );
    assert.equal(
      s.balance,
      4050
    );
    assert.equal(
      s.parent,
      145000
    );
    assert.equal(
      s.cashback,
      2473
    );
    assert.equal(
      s.spentToday,
      450
    );
    assert.equal(
      s.transactions[0].amount,
      -450
    );
  }
);
test(
  'SOS atomically adds only the missing amount then completes checkout once',
  () => {
    let s = execute(
      fresh(),
      {
        type: 'pay',
        preset: presets[1]
      }
    );
    assert.equal(
      s.balance,
      4500
    );
    assert.ok(s.sos);
    s = execute(
      s,
      {
        type: 'sosApprove'
      }
    );
    assert.equal(
      s.balance,
      0
    );
    assert.equal(
      s.parent,
      144300
    );
    assert.equal(
      s.cashback,
      2710
    );
    assert.equal(
      s.spentToday,
      5200
    );
    assert.equal(
      s.sos,
      null
    );
    assert.throws(() => execute(
      s,
      {
        type: 'sosApprove'
      }
    ));
  }
);
test(
  'SOS approval rechecks changed card rules, funds and daily limits',
  () => {
    let s = execute(
      fresh(),
      {
        type: 'pay',
        preset: presets[1]
      }
    );
    assert.throws(
      () => execute(
        {
          ...s,
          frozen: true
        },
        {
          type: 'sosApprove'
        }
      ),
      /паузе/
    );
    assert.throws(
      () => execute(
        {
          ...s,
          parent: 100
        },
        {
          type: 'sosApprove'
        }
      ),
      /недостаточно/
    );
    assert.throws(
      () => execute(
        {
          ...s,
          dailyLimit: 1000
        },
        {
          type: 'sosApprove'
        }
      ),
      /лимит/
    );
  }
);
test(
  'SOS rejection leaves all balances and receipts unchanged',
  () => {
    let s = execute(
      fresh(),
      {
        type: 'pay',
        preset: presets[1]
      }
    );
    s = execute(
      s,
      {
        type: 'sosReject'
      }
    );
    assert.equal(
      s.balance,
      4500
    );
    assert.equal(
      s.parent,
      145000
    );
    assert.equal(
      s.transactions.length,
      3
    );
  }
);
test(
  'frozen card, blocked games and exceeded daily/monthly limits reject payments',
  () => {
    assert.throws(
      () => execute(
        fresh(),
        {
          type: 'pay',
          preset: { ...presets[2], mcc: 'GAMING_7994' }
        }
      ),
      /категория/
    );
    assert.throws(
      () => execute(
        {
          ...fresh(),
          frozen: true
        },
        {
          type: 'pay',
          preset: presets[0]
        }
      ),
      /паузе/
    );
    assert.throws(
      () => execute(
        {
          ...fresh(),
          dailyLimit: 400
        },
        {
          type: 'pay',
          preset: presets[0]
        }
      ),
      /лимит/
    );
    assert.throws(
      () => execute(
        {
          ...fresh(),
          spentMonth: 19900
        },
        {
          type: 'pay',
          preset: presets[0]
        }
      ),
      /лимит/
    );
  }
);
test(
  'savings combine child contribution and 50% parent match without '
  + 'creating money',
  () => {
    const before = fresh();
    const s = execute(
      before,
      {
        type: 'save',
        amount: 1000
      }
    );
    assert.equal(
      s.balance,
      3500
    );
    assert.equal(
      s.parent,
      144500
    );
    assert.equal(
      s.piggy,
      13500
    );
    assert.equal(
      before.balance,
      4500
    );
    assert.equal(
      s.parent + s.balance + s.piggy,
      before.parent + before.balance + before.piggy
    );
  }
);
test(
  'savings reject missing matching funds, insufficient child funds '
  + 'and goal overflow',
  () => {
    assert.throws(
      () => execute(
        fresh(),
        {
          type: 'save',
          amount: 5000
        }
      ),
      /не хватает/
    );
    assert.throws(
      () => execute(
        {
          ...fresh(),
          parent: 850
        },
        {
          type: 'save',
          amount: 1000
        }
      ),
      /недостаточно/
    );
    assert.throws(
      () => execute(
        {
          ...fresh(),
          piggy: 29900
        },
        {
          type: 'save',
          amount: 1000
        }
      ),
      /превысит/
    );
  }
);
test(
  'task rewards stay reserved until review and cannot be paid twice',
  () => {
    let s = fresh();
    assert.equal(
      held(s),
      800
    );
    assert.equal(
      available(s),
      144200
    );
    assert.throws(() => execute(
      s,
      {
        type: 'approve',
        id: 'book'
      }
    ));
    s = execute(
      s,
      {
        type: 'approve',
        id: 'dishes'
      }
    );
    assert.equal(
      s.balance,
      4800
    );
    assert.equal(
      s.parent,
      144700
    );
    assert.equal(
      s.coins,
      500
    );
    assert.equal(
      held(s),
      500
    );
    assert.throws(() => execute(
      s,
      {
        type: 'approve',
        id: 'dishes'
      }
    ));
  }
);
test(
  'task submission and creation preserve reward reservation',
  () => {
    let s = execute(
      fresh(),
      {
        type: 'chore',
        title: 'Полить цветы',
        reward: 200,
        coins: 20
      }
    );
    assert.equal(
      held(s),
      1000
    );
    assert.equal(
      s.parent,
      145000
    );
    s = execute(
      s,
      {
        type: 'submit',
        id: 'book'
      }
    );
    assert.equal(
      s.chores.find(c => c.id === 'book').status,
      'review'
    );
    assert.throws(() => execute(
      s,
      {
        type: 'submit',
        id: 'book'
      }
    ));
  }
);
test(
  'money input handles decimal comma and rejects negatives, invalid cents, NaN',
  () => {
    assert.equal(
      parseMoney('10,50'),
      1050
    );
    assert.equal(
      parseMoney('0.01'),
      1
    );
    for (const x of ['-1', '0.001', 'NaN', '1e5', 'Infinity']) assert.throws(() => parseMoney(x));
    for (const x of [NaN, 1.5, -2, 0, Infinity]) assert.throws(() => execute(
      fresh(),
      {
        type: 'topup',
        amount: x
      }
    ));
  }
);
test(
  'quiz and shop cannot grant or charge rewards twice',
  () => {
    let s = execute(
      fresh(),
      {
        type: 'quiz',
        id: 'budget'
      }
    );
    assert.equal(
      s.coins,
      550
    );
    assert.throws(() => execute(
      s,
      {
        type: 'quiz',
        id: 'budget'
      }
    ));
    s = execute(
      s,
      {
        type: 'buy',
        id: 'space',
        cost: 300
      }
    );
    assert.equal(
      s.coins,
      250
    );
    assert.throws(() => execute(
      s,
      {
        type: 'buy',
        id: 'space',
        cost: 300
      }
    ));
    assert.throws(() => execute(
      s,
      {
        type: 'buy',
        id: 'gamehour',
        cost: 500
      }
    ));
  }
);
test(
  'parent transfers cannot spend funds reserved for tasks',
  () => {
    assert.throws(
      () => execute(
        fresh(),
        {
          type: 'topup',
          amount: 144500
        }
      ),
      /недостаточно/
    );
    const s = execute(
      fresh(),
      {
        type: 'topup',
        amount: 2000
      }
    );
    assert.equal(
      s.balance,
      6500
    );
    assert.equal(
      s.parent,
      143000
    );
  }
);
test(
  'emergency ride uses parent funds even with frozen empty child account',
  () => {
    const s = execute(
      {
        ...fresh(),
        balance: 0,
        frozen: true
      },
      {
        type: 'ride'
      }
    );
    assert.equal(
      s.balance,
      0
    );
    assert.equal(
      s.parent,
      143800
    );
  }
);
test(
  'spending counters reset in Minsk timezone on a new day and month',
  () => {
    let s = refreshState(
      {
        ...fresh(),
        spentToday: 900,
        spentMonth: 2000
      },
      new Date('2026-10-20T20:59:59Z')
    );
    s = refreshState(
      s,
      new Date('2026-10-20T21:00:00Z')
    );
    assert.equal(
      s.spentToday,
      0
    );
    assert.equal(
      s.spentMonth,
      2000
    );
    s = refreshState(
      s,
      new Date('2026-10-31T21:00:00Z')
    );
    assert.equal(
      s.spentToday,
      0
    );
    assert.equal(
      s.spentMonth,
      0
    );
  }
);
test(
  'online, country and night restrictions affect matching payments',
  () => {
    assert.throws(
      () => execute(
        fresh(),
        {
          type: 'pay',
          preset: {
            ...presets[0],
            online: true
          }
        }
      ),
      /Интернет/
    );
    assert.throws(
      () => execute(
        fresh(),
        {
          type: 'pay',
          preset: {
            ...presets[0],
            country: 'PL'
          }
        }
      ),
      /Беларуси/
    );
    assert.throws(
      () => rawExecute(
        fresh(),
        {
          type: 'pay',
          preset: presets[0]
        },
        new Date('2026-10-20T20:00:00Z')
      ),
      /Ночные/
    );
  }
);
test(
  'frozen savings, invalid coins, prices and locked lessons are rejected',
  () => {
    assert.throws(
      () => execute(
        {
          ...fresh(),
          frozen: true
        },
        {
          type: 'save',
          amount: 1000
        }
      ),
      /паузе/
    );
    assert.throws(() => execute(
      fresh(),
      {
        type: 'chore',
        title: 'Дело',
        reward: 100,
        coins: -1
      }
    ));
    assert.throws(() => execute(
      fresh(),
      {
        type: 'buy',
        id: 'space',
        cost: -300
      }
    ));
    assert.throws(() => execute(
      fresh(),
      {
        type: 'quiz',
        id: 'unknown'
      }
    ));
    assert.throws(
      () => execute(
        fresh(),
        {
          type: 'quiz',
          id: 'shopping'
        }
      ),
      /предыдущий/
    );
  }
);
test(
  'SOS expires and zero limits intentionally block purchases',
  () => {
    const now = new Date('2026-10-20T09:00:00Z');
    let s = rawExecute(
      fresh(),
      {
        type: 'pay',
        preset: presets[1]
      },
      now
    );
    assert.equal(
      refreshState(
        s,
        new Date(now.getTime() + 600001)
      ).sos,
      null
    );
    s = execute(
      fresh(),
      {
        type: 'limits',
        daily: 0,
        monthly: 0
      }
    );
    assert.throws(
      () => execute(
        s,
        {
          type: 'pay',
          preset: presets[0]
        }
      ),
      /лимит/
    );
  }
);
test(
  'broken saved state recovers without crashing the app',
  () => {
    const previous = globalThis.localStorage;
    globalThis.localStorage = {
      getItem: () => JSON.stringify({
        version: 1,
        parent: 100,
        chores: []
      })
    };
    try {
      assert.equal(
        loadState().balance,
        4500
      );
      assert.equal(
        loadState().parent,
        145000
      );
    } finally {
      globalThis.localStorage = previous;
    }
  }
);

test('Coins cap rejects creation and legacy payout above 100 without changing balances', () => {
  const original = fresh();
  for (const coins of [101, -1, 1.5]) {
    assert.throws(() => execute(original, { type: 'chore', title: 'Дело', reward: 100, coins }));
  }
  const created = execute(original, { type: 'chore', title: 'Дело', reward: 100, coins: 100 });
  assert.equal(created.chores.at(-1).coins, 100);
  const legacy = fresh();
  legacy.chores[0].coins = 101;
  assert.throws(() => execute(legacy, { type: 'approve', id: legacy.chores[0].id }), /100/);
  assert.equal(legacy.balance, original.balance);
  assert.equal(legacy.coins, original.coins);
});
