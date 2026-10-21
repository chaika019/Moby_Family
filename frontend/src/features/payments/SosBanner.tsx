import { usePhone } from "../../app/PhoneProvider";
import { formatMoney } from "../../lib/demo";
import { ArrowRight } from "lucide-react";
export function SosBanner() {
  const {
    state,
    missing,
    executeCommand, childName
  } = usePhone();
  if (!state.sos) return null;
  return (
    <div
      className="sos-banner"
      role="alert"
    >
      <div>
        <span className="sos-icon">
          !
        </span>
        <span>
          <strong>
            {childName}: нужна помощь на кассе
          </strong>
          <small>
            {state.sos.title}
            {' '}· не хватает{' '}
            {formatMoney(missing)}
            {' '}BYN
          </small>
        </span>
      </div>
      <button
        className="button"
        onClick={() => executeCommand(
          {
            type: 'sosApprove'
          },
          'Чек оплачен. Можно забирать покупки'
        )}
      >
        Добавить{' '}
        {formatMoney(missing)}
        {' '}BYN и оплатить
        <ArrowRight size={16} />
      </button>
      <button
        className="text-button"
        onClick={() => executeCommand(
          {
            type: 'sosReject'
          },
          'Запрос отклонён. Деньги не списаны'
        )}
      >
        Отклонить запрос
      </button>
    </div>
  );
}
