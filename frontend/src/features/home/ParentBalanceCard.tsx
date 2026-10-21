import { usePhone } from "../../app/PhoneProvider";
import {
  CreditCard,
  Plus,
  ChevronRight,
} from "lucide-react";
import { formatMoney } from "../../lib/demo";
import { Progress } from "../../components/ui";
export function ParentBalanceCard() {
  const {
    openModal,
    state,
    childName
  } = usePhone();
  return (
    <section className="parent-balance-card">
      <div className="balance-label">
        <span>
          Карта · {childName}
        </span>
        <button
          className="icon-button"
          aria-label="Информация о карте"
          onClick={() => openModal('card')}
        >
          <CreditCard size={19} />
        </button>
      </div>
      <h2>
        {formatMoney(state.balance)}
        {' '}
        <small>
          BYN
        </small>
      </h2>
      <p data-testid="parent-own-balance">
        Ваш баланс: {formatMoney(state.parent)} BYN
      </p>
      <div className="balance-actions">
        <button
          className="button"
          onClick={() => openModal('topup')}
        >
          <Plus size={17} />
          Пополнить
        </button>

      </div>
      <div className="monthly-progress">
        <span>
          Потрачено за месяц
          <strong>
            {formatMoney(state.spentMonth)}
            {' '}
            <small>
              /{' '}
              {formatMoney(state.monthlyLimit)}
              {' '}BYN
            </small>
          </strong>
        </span>
        <Progress
          value={state.spentMonth / state.monthlyLimit * 100}
        />
        <button onClick={() => openModal('limits')}>
          Настроить лимиты
          <ChevronRight size={13} />
        </button>
      </div>
    </section>
  );
}
