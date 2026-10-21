export interface AuthToken { accessToken: string; expiresAt: string; role: 'PARENT'|'CHILD'; familyId: string; childId: string|null }
export interface ReceiptItem { title: string; quantity: number; unitPrice: number }
export interface ServerLesson { id: string; order: number; title: string; explanation: string; questions: {prompt: string; options: string[]}[]; unlocked: boolean; completed: boolean }
export interface ServerReward { id: string; itemType: string; title: string; assetCode: string; costCoins: number; rarity: string; owned: boolean }
export interface ServerChild {
  profile: { id: string; firstName: string; age: number; cardBalance: number; mobyCoins: number; cardFrozen: boolean; privacyMode: boolean; activeMascotSkin: string; activePaySound: string; activeCardSkin: string; dailyLimit: number; monthlyLimit: number; spentToday: number; spentMonth: number; onlinePaymentsAllowed: boolean; belarusOnly: boolean; transfersAllowed: boolean; notificationsEnabled: boolean; cardType: string; cardLastFour: string };
  spendingRules: { categoryCode: string; blocked: boolean }[];
  sosRequests: { id: string; transactionId: string; merchantName: string|null; totalQrAmount: number; missingAmount: number; status: string; expiresAt: string }[];
  chores: { id: string; title: string; rewardByn: number; rewardCoins: number; status: string }[];
  piggyBanks: { id: string; title: string; targetAmount: number; currentAmount: number; parentMatchPercent: number; battle: boolean; opponentName: string|null; opponentProgress: number }[];
  capital18: { id: string; planType: string; initialDeposit: number; currentBalance: number; bufferBalance: number; parent1Monthly: number; parent2Monthly: number; interestRate: number; maturityDate: string; projectedFinalAmount: number; status: string }|null;
  splitBills: { id: string; childId: string; payerChildId: string|null; friendName: string; itemTitle: string; shareAmount: number; paid: boolean; debtorMemeBadge: string }[];
  transactions: { id: string; merchantName: string|null; amount: number; paymentMethod: string; status: string; createdAt: string; detailsHidden: boolean; receiptItems: ReceiptItem[] }[];
  shop: ServerReward[];
  allowances: { id: string; amount: number; dayOfMonth: number; nextPaymentDate: string; active: boolean }[];
  academy: { level: number; totalLevels: number; xp: number; streak: number; lessons: ServerLesson[] };
}
export interface LiveState {
  family: { id: string; familyName: string; parentMainBalance: number|null; heldBalance: number|null; availableBalance: number|null; cashbackAccumulated: number; subscriptionActive: boolean; subscriptionFee: number; insuranceActive: boolean };
  children: ServerChild[];
  qrPresets: { id: string; merchantName: string; mccCategory: string; amount: number; receiptItems: ReceiptItem[] }[];
  benefits: { code: string; title: string; description: string; coverageByn: number|null }[];
  demo: boolean; serverTime: string;
}
export interface ActionResult { id: string; status: string; amount: number|null; missingAmount: number|null; projectedFinalAmount: number|null; detail: string|null }
export interface RemoteSession {
  parentToken: AuthToken|null; childToken: AuthToken|null;
  parentState: LiveState|null; childState: LiveState|null; selectedChildId: string|null;
}
