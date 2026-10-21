import { usePhone } from "../../app/PhoneProvider";
import { Heart, ArrowRight } from "lucide-react";
import {
  parseMoney,
  formatMoney,
  available,
  held,
} from "../../lib/demo";
import { MoneyInput } from "../../components/ui/MoneyInput";
export function TopUpSheet() {
  const {
    isChild,
    changeRole,
    closeModal,
    submitForm,
    executeCommand,
    state, childName, cardLastFour, hasParent
  } = usePhone();
  return isChild
    ? <>
      <div className="sheet-art">
        💌
      </div>
      <p className="sheet-description">
        Нужны карманные? Вместе с папой всё решится.
      </p>
      <div className="tip">
        <Heart size={22} />
        <span>
          <strong>
            Самый быстрый путь
          </strong>
          <small>
            Папа может пополнить твою карту на своём экране. А если не хватает
            на покупку, открой QR — Moby отправит SOS.
          </small>
        </span>
      </div>
      <button
        className="button full"
        onClick={
          () => {
            if(hasParent)changeRole('parent');
            closeModal();
          }
        }
      >
        {hasParent?'Перейти на экран родителя':'Закрыть'}
        <ArrowRight size={17} />
      </button>
    </>
    : <form
      onSubmit={event => submitForm(
        event,
        formData => executeCommand(
          {
            type: 'topup',
            amount: parseMoney(String(formData.get('amount')))
          },
          'Готово! Деньги уже на карте ребёнка'
        )
      )}
    >
      <div className="recipient">
        <span className="avatar">
          Н
        </span>
        <span>
          <strong>
            Карта · {childName}
          </strong>
          <small>
            Moby Junior · •• {cardLastFour}
          </small>
        </span>
      </div>
      <MoneyInput
        label="Сумма пополнения"
        defaultValue="20"
      />
      <div className="preset-amounts">
        {
          [5, 10, 20, 50].map(amount => <button
            key={amount}
            type="button"
            onClick={
              event => {
                const input = event.currentTarget.form?.elements.namedItem('amount') as HTMLInputElement;
                input.value = String(amount);
              }
            }
          >
            {amount}
            {' '}BYN
          </button>)
        }
      </div>
      <div className="form-note">
        Доступно:{' '}
        {formatMoney(available(state))}
        {' '}BYN
        <br />
        В резерве за задания:{' '}
        {formatMoney(held(state))}
        {' '}BYN
      </div>
      <button
        className="button full"
        type="submit"
      >
        Пополнить карту
        <ArrowRight size={17} />
      </button>
    </form>;
}
