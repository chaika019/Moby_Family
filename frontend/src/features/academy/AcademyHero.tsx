import { usePhone } from "../../app/PhoneProvider";
import { Flame } from "lucide-react";
import { Progress } from "../../components/ui";
export function AcademyHero() {
  const {
    state,child,lessons
  } = usePhone();
  return (
    <section className="academy-hero">
      <div>
        <span className="eyebrow">
          НОВЫЙ ДЕНЬ — НОВЫЙ НАВЫК
        </span>
        <h2>
          Прокачай свою
          <br />
          суперсилу
        </h2>
        <p>
          Деньги понятнее, когда играешь
        </p>
      </div>
      <div
        className="academy-art mascot"
        role="img"
        aria-label="Лисёнок Moby приглашает в академию"
      />
      <div className="academy-progress">
        <strong>
          Уровень{' '}
          {Math.min(
            lessons.length,
            state.lessons.length + 1
          )}
          {' '}
          <small>
            из {lessons.length}
          </small>
        </strong>
        <span>
          <Flame size={15} />
          {' '}{child?.academy.streak??0} дней
        </span>
        <Progress value={state.lessons.length / lessons.length * 100} />
        <small>
          {state.lessons.length * 100}
          {' '}XP · ты отлично справляешься!
        </small>
      </div>
    </section>
  );
}
