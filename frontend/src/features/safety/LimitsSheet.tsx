import { usePhone } from "../../app/PhoneProvider";
import { parseMoney, formatMoney } from "../../lib/demo";
import { MoneyInput } from "../../components/ui/MoneyInput";
import { Check } from "lucide-react";
export function LimitsSheet() {
  const {
    submitForm,
    executeCommand,
    state
  } = usePhone();
  return (
    <form
      onSubmit={event => submitForm(
        event,
        formData => executeCommand(
          {
            type: 'limits',
            daily: parseMoney(String(formData.get('daily'))),
            monthly: parseMoney(String(formData.get('monthly')))
          },
          'Новые лимиты сохранены'
        )
      )}
    >
      <p className="sheet-description">
        Правила, которые дают свободу и помогают учиться планировать.
      </p>
      <MoneyInput
        name="daily"
        label="В день"
        defaultValue={String(state.dailyLimit / 100)}
      />
      <MoneyInput
        name="monthly"
        label="В месяц"
        defaultValue={String(state.monthlyLimit / 100)}
      />
      <p className="form-note">
        Уже потрачено сегодня:{' '}
        {formatMoney(state.spentToday)}
        {' '}BYN. Изменения действуют и для SOS-оплаты.
      </p>
      <button className="button full">
        Сохранить лимиты
        <Check size={17} />
      </button>
    </form>
  );
}
