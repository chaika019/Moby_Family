export function Progress({
  value,
  tone = 'blue'
}: {
  value: number;
  tone?: string;
}) {
  const bounded = Number.isFinite(value)
    ? Math.min(
      100,
      Math.max(
        0,
        value
      )
    )
    : 0;
  return (
    <div
      className={`progress ${tone}`}
      role="progressbar"
      aria-label="Прогресс"
      aria-valuenow={Math.round(bounded)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span style={
        {
          width: `${bounded}%`
        }
      } />
    </div>
  );
}
