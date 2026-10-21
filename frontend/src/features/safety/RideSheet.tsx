import { usePhone } from "../../app/PhoneProvider";
import { CarFront } from "lucide-react";
export function RideSheet() {
  const {
    executeCommand,
    closeModal
  } = usePhone();
  return (
    <>
      <div className="sheet-art">
        🚕
      </div>
      <h3 className="center">
        Дом — самое спокойное место
      </h3>
      <p className="sheet-description">
        В демо спишем 12 BYN с родительского счёта, даже если у тебя нет
        карманных. Настоящее такси не вызывается.
      </p>
      <button
        className="button full"
        onClick={
          async () => {
            if (await executeCommand(
              {
                type: 'ride'
              },
              'Демо-поездка оформлена за счёт родителя. Такси не вызывалось'
            )) closeModal();
          }
        }
      >
        <CarFront size={18} />
        Оформить демо-поездку · 12 BYN
      </button>
      <p className="form-note">
        Если тебе угрожает опасность, позвони родителям или в экстренную
        службу 112.
      </p>
    </>
  );
}
