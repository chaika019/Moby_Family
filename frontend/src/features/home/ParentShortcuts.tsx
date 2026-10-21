import { usePhone } from "../../app/PhoneProvider";
import { IconBox } from "../../components/ui";
import {
  ShieldCheck,
  CalendarDays,
  TrendingUp,
  Wallet,
} from "lucide-react";
export function ParentShortcuts() {
  const {
    navigate,
    openModal
  } = usePhone();
  return (
    <div className="parent-shortcuts">
      <button onClick={() => navigate('family')}>
        <IconBox
          icon={ShieldCheck}
          tone="green"
        />
        <span>
          Защита
        </span>
      </button>
      <button onClick={() => openModal('allowance')}>
        <IconBox
          icon={CalendarDays}
          tone="purple"
        />
        <span>
          Карманные
        </span>
      </button>
      <button onClick={() => openModal('history')}>
        <IconBox
          icon={TrendingUp}
          tone="orange"
        />
        <span>
          Операции
        </span>
      </button>
      <button onClick={() => openModal('capital')}>
        <IconBox icon={Wallet} />
        <span>
          Накопления
        </span>
      </button>
    </div>
  );
}
