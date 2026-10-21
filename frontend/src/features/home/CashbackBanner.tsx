import { usePhone } from "../../app/PhoneProvider";
import { formatMoney } from "../../lib/demo";
import { ArrowUpRight } from "lucide-react";
export function CashbackBanner() {
  const {
    openModal,
    state
  } = usePhone();
  return (
    <button
      className="cashback-banner"
      onClick={() => openModal('benefits')}
    >
      <span className="cashback-art">
        ✳
      </span>
      <span>
        <small>
          ВАШ СЕМЕЙНЫЙ КЕШБЭК
        </small>
        <strong>
          {formatMoney(state.cashback)}
          {' '}
          <span>
            BYN
          </span>
        </strong>
        <small>
          Больше приятного для всех
        </small>
      </span>
      <ArrowUpRight size={21} />
    </button>
  );
}
