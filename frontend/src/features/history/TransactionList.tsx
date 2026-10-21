import { usePhone } from '../../app/PhoneProvider';
import { TransactionRow } from './TransactionRow';
export function TransactionList({
  compact = false
}: {
  compact?: boolean;
}) {
  const {
    state
  } = usePhone();
  const transactions = compact
    ? state.transactions.slice(
      0,
      2
    )
    : state.transactions;
  return (
    <div
      className={
        compact
          ? 'surface'
          : 'transactions'
      }
    >
      {
        transactions.map(transaction => <TransactionRow
          key={transaction.id}
          transaction={transaction}
          compact={compact}
        />)
      }
    </div>
  );
}
