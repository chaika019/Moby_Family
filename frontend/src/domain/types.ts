export type Role = 'parent' | 'child';
export type Tab = 'home'
  | 'family'
  | 'academy'
  | 'more';
export interface Chore {
  id: string;
  title: string;
  reward: number;
  coins: number;
  status: 'assigned'
    | 'review'
    | 'done';
}
export interface Transaction {
  id: string;
  title: string;
  amount: number;
  kind: 'payment'
    | 'topup'
    | 'reward'
    | 'saving';
  time: string;
}
export interface Preset {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  mcc: string;
  emoji: string;
  online?: boolean;
  country?: string;
  scanned?: boolean;
  receiptItems?: { title: string; quantity: number; unitPrice: number }[];
}
export interface DemoState {
  identity?: { childName:string; age:number; cardLastFour:string; parentName:string };
  heldAmount?: number;
  availableAmount?: number;
  goal?: { id:string; title:string; match:number; opponentName:string|null; opponentProgress:number; battle:boolean }|null;
  version: 1;
  parent: number;
  balance: number;
  coins: number;
  cashback: number;
  frozen: boolean;
  dailyLimit: number;
  monthlyLimit: number;
  spentToday: number;
  spentMonth: number;
  rules: Record<string, boolean>;
  safety: Record<string, boolean>;
  piggy: number;
  target: number;
  chores: Chore[];
  transactions: Transaction[];
  sos: null | {
    id: string;
    title: string;
    amount: number;
    mcc: string;
    expiresAt?: number;
    online?: boolean;
    country?: string;
  };
  spendingDate?: string;
  spendingMonth?: string;
  lessons: string[];
  owned: string[];
  skin: string;
  allowance: number;
  allowanceDay: number;
  capital: {
    initial: number;
    monthly: number;
  };
  splits: {
    id: string;
    friend: string;
    title: string;
    amount: number;
    paid: boolean;
  }[];
}
export type Command = {
    type: 'topup';
    amount: number;
  }
  | {
    type: 'pay';
    preset: Preset;
  }
  | {
    type: 'sosApprove';
  }
  | {
    type: 'sosReject';
  }
  | {
    type: 'freeze';
  }
  | {
    type: 'rule';
    key: string;
  }
  | {
    type: 'safety';
    key: string;
  }
  | {
    type: 'limits';
    daily: number;
    monthly: number;
  }
  | {
    type: 'save';
    amount: number;
  }
  | {
    type: 'submit';
    id: string;
  }
  | {
    type: 'approve';
    id: string;
  }
  | {
    type: 'chore';
    title: string;
    reward: number;
    coins: number;
  }
  | {
    type: 'quiz';
    id: string;
    answers?: number[];
  }
  | {
    type: 'buy';
    id: string;
    cost: number;
  }
  | {
    type: 'skin';
    id: string;
  }
  | {
    type: 'allowance';
    amount: number;
    day: number;
  }
  | {
    type: 'capital';
    initial: number;
    monthly: number;
  }
  | {
    type: 'split';
    payerChildId?: string;
    friend: string;
    title: string;
    amount: number;
  }
  | {
    type: 'splitClose';
    id: string;
  }
  | {
    type: 'splitPay';
    id: string;
  }
  | {
    type: 'ride';
  };
export type CommandOf<T extends Command['type']> = Extract<Command, {
  type: T;
}>;
