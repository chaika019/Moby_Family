import { Check, CheckCheck, Coins } from 'lucide-react';
import { usePhone } from '../../app/PhoneProvider';
import { formatMoney } from '../../domain/money';
import type { Chore } from '../../domain/types';
const STATUS_LABELS = {
  review: 'На проверке',
  done: 'Готово',
  assigned: 'Твоё задание'
};
const CHORE_EMOJI: Record<string, string> = {
  book: '📚',
  dishes: '🫧'
};
export function ChoreCard({
  chore
}: {
  chore: Chore;
}) {
  const completed = chore.status === 'done';
  return (
    <div
      className={`chore-card ${completed
        ? 'completed'
        : ''}`}
    >
      <div className="chore-top">
        <span className="chore-emoji">
          {
            CHORE_EMOJI[chore.id] ?? '✨'
          }
        </span>
        <span className={`status-chip ${chore.status}`}>
          {STATUS_LABELS[chore.status]}
        </span>
      </div>
      <strong>
        {chore.title}
      </strong>
      <div className="chore-bottom">
        <span>
          <b>
            +
            {formatMoney(chore.reward)}
            {' '}BYN
          </b>
          <small>
            +
            {chore.coins}
            {' '}
            <Coins size={12} />
          </small>
        </span>
        {
          completed
            ? <CheckCheck
              className="positive"
              size={22}
            />
            : <ChoreAction chore={chore} />
        }
      </div>
    </div>
  );
}
function ChoreAction({
  chore
}: {
  chore: Chore;
}) {
  const {
    isChild,
    executeCommand
  } = usePhone();
  const reviewing = chore.status === 'review';
  const disabled = isChild
    ? reviewing
    : !reviewing;
  const label = isChild
    ? reviewing
      ? 'Ждём папу'
      : 'Готово'
    : reviewing
      ? 'Проверить'
      : 'В процессе';
  function handleClick() {
    if (isChild) {
      executeCommand(
        {
          type: 'submit',
          id: chore.id
        },
        'Отправлено родителю на проверку'
      );
    } else {
      executeCommand(
        {
          type: 'approve',
          id: chore.id
        },
        'Отлично! Награда уже у ребёнка'
      );
    }
  }
  return (
    <button
      className="small-button"
      disabled={disabled}
      onClick={handleClick}
    >
      {label}
      {
        !disabled && <Check size={14} />
      }
    </button>
  );
}
