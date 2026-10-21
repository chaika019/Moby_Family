import { usePhone } from "../../app/PhoneProvider";
import { ScanLine, ArrowDownLeft, Bike } from "lucide-react";
export function QuickActions() {
  const {
    openModal,
    navigate
  } = usePhone();
  return (
    <div className="quick-actions">
      <button
        className="quick-action primary"
        onClick={() => openModal('qr')}
      >
        <ScanLine size={24} />
        <span>
          Оплатить QR
        </span>
      </button>
      <button
        className="quick-action"
        onClick={() => openModal('topup')}
      >
        <ArrowDownLeft size={24} />
        <span>
          Попросить денег
        </span>
      </button>
      <button
        className="quick-action"
        onClick={() => navigate('family')}
      >
        <Bike size={24} />
        <span>
          На мечту
        </span>
      </button>
    </div>
  );
}
