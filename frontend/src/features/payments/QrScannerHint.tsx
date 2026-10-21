import { ScanLine } from "lucide-react";
export function QrScannerHint() {
  return (
    <div className="qr-camera">
      <span />
      <ScanLine size={54} />
      <p>
        Выбери чек для демо-оплаты
      </p>
      <small>
        Камера не используется в демо
      </small>
    </div>
  );
}
