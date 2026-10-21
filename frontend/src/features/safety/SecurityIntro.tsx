import { usePhone } from "../../app/PhoneProvider";
import { ShieldCheck } from "lucide-react";
export function SecurityIntro() {
  const {
    state
  } = usePhone();
  return (
    <div className="security-intro">
      <div
        className="mascot"
        role="img"
        aria-label="Лисёнок Moby защищает карту"
      />
      <span
        className={`security-shield ${state.frozen
          ? 'frozen'
          : ''}`}
      >
        <ShieldCheck size={36} />
      </span>
      <h2>
        {
          state.frozen
            ? 'Карта на паузе'
            : 'Всё под контролем'
        }
      </h2>
      <p>
        Безопасные границы для первых
        <br />
        самостоятельных шагов.
      </p>
    </div>
  );
}
