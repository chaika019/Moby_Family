import { usePhone } from "../../app/PhoneProvider";
import { formatMoney } from "../../lib/demo";
import { TransactionList } from "./TransactionList";
export function HistorySheet() {
  const {
    state, childName
  } = usePhone();
  return (
    <>
      <div className="history-summary">
        <small>
          Карта · {childName}
        </small>
        <h3>
          {formatMoney(state.balance)}
          {' '}
          <small>
            BYN
          </small>
        </h3>
      </div>
      <TransactionList />
    </>
  );
}
