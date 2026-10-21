import { ArrowRight, Check } from 'lucide-react';
import { usePhone } from '../../app/PhoneProvider';
import { formatMoney } from '../../domain/money';

export function CheckoutSuccess() {
  const {
    closeModal
  } = usePhone();
  return (
    <div className='result-screen'>
      <span className='success-circle'>
        <Check size={37} />
      </span>
      <h3>
        Готово, оплачено!
      </h3>
      <p>
        Покупка уже в истории.
        <br />
        А семейный кешбэк стал чуть больше.
      </p>
      <button
        className='button full'
        onClick={closeModal}
      >
        Отлично!
      </button>
    </div>
  );
}

export function SosCheckoutStatus() {
  const {
    state,
    missing,
    changeRole,
    closeModal
  } = usePhone();
  const description = state.sos
    ? `На покупку в «${state.sos.title}» не хватает ${formatMoney(missing)} BYN. `
    + 'Запрос уже на экране родителя.'
    : 'Родитель обработал запрос. Проверь баланс и историю операций.';
  function showParent() {
    changeRole('parent');
    closeModal();
  }
  return (
    <div className='result-screen'>
      <div className='sheet-art'>
        💙
      </div>
      <h3>
        {
          state.sos
            ? 'Папа, выручай!'
            : 'Покупка больше не ждёт'
        }
      </h3>
      <p>
        {description}
      </p>
      {
        state.sos
          && <div className='waiting-dots'>
            <i />
            <i />
            <i />
          </div>
      }
      <button
        className='button full'
        onClick={showParent}
      >
        На экран родителя
        <ArrowRight size={17} />
      </button>
      <button
        className='text-button full'
        onClick={closeModal}
      >
        Вернуться на главную
      </button>
    </div>
  );
}
