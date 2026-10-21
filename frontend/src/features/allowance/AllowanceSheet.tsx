import { usePhone } from "../../app/PhoneProvider";
import { parseMoney } from "../../lib/demo";
import { MoneyInput } from "../../components/ui/MoneyInput";
import { Check } from "lucide-react";
export function AllowanceSheet() {
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
            type: 'allowance',
            amount: parseMoney(String(formData.get('amount'))),
            day: Number(formData.get('day'))
          },
          'Расписание сохранено'
        )
      )}
    >
      <div className="sheet-art">
        📅
      </div>
      <p className="sheet-description">
        Карманные вовремя — первый шаг к планированию.
      </p>
      <MoneyInput
        label="Каждый месяц"
        defaultValue={String(state.allowance / 100)}
      />
      <label className="field">
        День месяца
        <input
          required
          name="day"
          type="number"
          min="1"
          max="28"
          defaultValue={state.allowanceDay}
        />
      </label>
      <p className="form-note">
        Расписание сохраняется на сервере. Автоматические переводы выполняются в выбранный день месяца.
      </p>
      <button className="button full">
        Сохранить расписание
        <Check size={17} />
      </button>
    </form>
  );
}
