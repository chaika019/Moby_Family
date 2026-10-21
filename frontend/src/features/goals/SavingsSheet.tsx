import { usePhone } from "../../app/PhoneProvider";
import { parseMoney, formatMoney } from "../../lib/demo";
import { MoneyInput } from "../../components/ui/MoneyInput";
import { Sparkles } from "lucide-react";
export function SavingsSheet() {
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
            type: 'save',
            amount: parseMoney(String(formData.get('amount')))
          },
          'Копилка пополнена с родительским матчингом'
        )
      )}
    >
      <div className="sheet-art">
        🚲
      </div>
      <p className="sheet-description">
        В копилке{' '}
        {formatMoney(state.piggy)}
        {' '}из{' '}
        {formatMoney(state.target)}
        {' '}BYN.
        <br />
        Родитель добавит ещё {state.goal?.match??50}%.
      </p>
      <MoneyInput
        label="Сколько отложим?"
        defaultValue="10"
      />
      <p className="form-note">
        На твоей карте{' '}
        {formatMoney(state.balance)}
        {' '}BYN.
        <br />
        Матчинг и взнос списываются только после подтверждения сервера.
      </p>
      <button className="button full">
        Пополнить копилку
        <Sparkles size={17} />
      </button>
    </form>
  );
}
