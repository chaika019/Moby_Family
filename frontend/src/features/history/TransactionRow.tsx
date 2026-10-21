import { ArrowDownLeft, Bike, Utensils } from 'lucide-react';
import { IconBox } from '../../components/ui';
import { formatMoney } from '../../domain/money';
import type { Transaction } from '../../domain/types';
interface TransactionRowProps {
  transaction: Transaction;
  compact?: boolean;
}
export function TransactionRow({
  transaction,
  compact = false
}: TransactionRowProps) {
  const incoming = transaction.amount > 0;
  const icon = transaction.kind === 'payment'
    ? Utensils
    : !compact && transaction.kind === 'saving'
      ? Bike
      : ArrowDownLeft;
  return (
    <div className="transaction">
      <IconBox
        icon={icon}
        tone={
          incoming
            ? 'green'
            : 'neutral'
        }
      />
      <span className="row-copy">
        <strong>
          {transaction.title}
        </strong>
        <small>
          {transaction.time}
        </small>
      </span>
      <b
        className={
          incoming
            ? 'positive'
            : ''
        }
      >
        {
          incoming
            ? '+'
            : '−'
        }
        {formatMoney(Math.abs(transaction.amount))}
        <small>
          BYN
        </small>
      </b>
    </div>
  );
}
