export function MoneyInput({
  label,
  name = 'amount',
  defaultValue
}: {
  label: string;
  name?: string;
  defaultValue: string;
}) {
  return (
    <label className="field">
      {label}
      <span className="money-input">
        <input
          name={name}
          inputMode="decimal"
          required
          autoComplete="off"
          defaultValue={defaultValue}
          maxLength={10}
        />
        <b>
          BYN
        </b>
      </span>
    </label>
  );
}
