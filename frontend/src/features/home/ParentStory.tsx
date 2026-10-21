import { usePhone } from "../../app/PhoneProvider";
import { ChevronRight, ShieldCheck } from "lucide-react";
export function ParentStory() {
  const {
    navigate, childName, childAge
  } = usePhone();
  return (
    <section className="parent-story">
      <div className="story-copy">
        <span className="eyebrow">
          МОЯ СЕМЬЯ
        </span>
        <h2>
          Большая забота.
          <br />
          Маленькие шаги.
        </h2>
        <p>
          Помогайте мечтать,
          <br />
          учиться и становиться
          <br />
          самостоятельнее.
        </p>
      </div>
      <div className="family-selector">
        <div className="child-avatar">
          Н
          <span>
            👋
          </span>
        </div>
        <span>
          <strong>
            {childName}{' '}
            <span>
              {childAge} лет
            </span>
          </strong>
          <small>
            <span className="green-dot" />
            {' '}Moby Junior · всё в порядке
          </small>
        </span>
        <button
          aria-label={`Открыть настройки: ${childName}`}
          className="icon-button"
          onClick={() => navigate('family')}
        >
          <ChevronRight size={19} />
        </button>
      </div>
      <div
        className="mascot"
        role="img"
        aria-label="Лисёнок Moby помогает заботиться о ребёнке"
      />
      <div className="parent-bubble">
        <ShieldCheck size={14} />
        <span>
          Всё под контролем!
          <small>
            А впереди — новые открытия.
          </small>
        </span>
      </div>
    </section>
  );
}
