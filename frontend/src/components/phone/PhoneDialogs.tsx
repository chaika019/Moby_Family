import { usePhone } from '../../app/PhoneProvider';
import { AllowanceSheet } from '../../features/allowance/AllowanceSheet';
import { BenefitsSheet } from '../../features/benefits/BenefitsSheet';
import { CardSheet } from '../../features/cards/CardSheet';
import { NewChoreSheet } from '../../features/chores/NewChoreSheet';
import { ConnectionSheet } from '../../features/connection/ConnectionSheet';
import { CapitalSheet } from '../../features/goals/CapitalSheet';
import { SavingsSheet } from '../../features/goals/SavingsSheet';
import { HelpSheet } from '../../features/help/HelpSheet';
import { HistorySheet } from '../../features/history/HistorySheet';
import { LessonSheet } from '../../features/academy/LessonSheet';
import { NotificationsSheet } from '../../features/notifications/NotificationsSheet';
import { QrPaymentSheet } from '../../features/payments/QrPaymentSheet';
import { TopUpSheet } from '../../features/payments/TopUpSheet';
import { ShopSheet } from '../../features/rewards/ShopSheet';
import { LimitsSheet } from '../../features/safety/LimitsSheet';
import { RideSheet } from '../../features/safety/RideSheet';
import { SplitBillSheet } from '../../features/social/SplitBillSheet';
import { Sheet } from '../ui';
import { modalTitle } from './dialogTitles';
const DIALOGS = {
  topup: TopUpSheet,
  qr: QrPaymentSheet,
  save: SavingsSheet,
  limits: LimitsSheet,
  chore: NewChoreSheet,
  allowance: AllowanceSheet,
  capital: CapitalSheet,
  history: HistorySheet,
  shop: ShopSheet,
  lesson: LessonSheet,
  benefits: BenefitsSheet,
  ride: RideSheet,
  split: SplitBillSheet,
  connect: ConnectionSheet,
  notifications: NotificationsSheet,
  card: CardSheet,
  help: HelpSheet
};
export function PhoneDialogs() {
  const {
    dialog,
    isChild,
    closeModal
  } = usePhone();
  if (!dialog) return null;
  const Content = DIALOGS[dialog];
  return (
    <Sheet
      title={modalTitle(
        dialog,
        isChild
      )}
      onClose={closeModal}
    >
      <Content />
    </Sheet>
  );
}
