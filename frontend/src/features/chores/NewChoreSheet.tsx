import { usePhone } from "../../app/PhoneProvider";
import { parseMoney, formatMoney, available } from "../../lib/demo";
import { MoneyInput } from "../../components/ui/MoneyInput";
import { Plus } from "lucide-react";
export function NewChoreSheet() {
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
            type: 'chore',
            title: String(formData.get('title')),
            reward: parseMoney(String(formData.get('amount'))),
            coins: Number(formData.get('coins'))
          },
          'Задание появилось у ребёнка. Награда зарезервирована'
        )
      )}
    >
      <p className="sheet-description">
        Договоритесь о деле и награде. Всё по-честному.
      </p>
      <label className="field">
        Что нужно сделать?
        <input
          name="title"
          required
          maxLength={100}
          placeholder="Например, полить цветы"
        />
      </label>
      <MoneyInput
        label="Награда"
        defaultValue="5"
      />
      <label className="field">
        Бонус Moby Coins
        <input
          name="coins"
          type="number"
          min="0"
          max="100"
          step="1"
          aria-describedby="coins-hint"
          required
          defaultValue="50"
        />
      </label>
      <p id="coins-hint" className="form-note">За одно задание — от 0 до 100 Moby Coins.</p>
      <p className="form-note">
        Награда в BYN будет зарезервирована на вашем счёте до проверки.
        Доступно{' '}
        {formatMoney(available(state))}
        {' '}BYN.
      </p>
      <button className="button full">
        Добавить задание
        <Plus size={17} />
      </button>
    </form>
  );
}
