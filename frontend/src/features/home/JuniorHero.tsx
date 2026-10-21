import { usePhone } from "../../app/PhoneProvider";
import { formatMoney } from "../../lib/demo";
import { ChevronRight, Coins } from "lucide-react";
export function JuniorHero() {
  const {
    state,
    openModal, cardLastFour
  } = usePhone();
  return (
    <section
      className={`junior-hero ${state.skin === 'space'
        ? 'space-skin'
        : ''}`}
    >
      <div className="hero-orbit one" />
      <div className="hero-orbit two" />
      <div className="hero-balance">
        <span>
          Твои деньги{' '}
          <span className="live-dot" />
        </span>
        <h2>
          {formatMoney(state.balance)}
          {' '}
          <small>
            BYN
          </small>
        </h2>
        <button
          className="card-tag"
          onClick={() => openModal('card')}
        >
          <img
            src="/favicon.svg"
            alt=""
          />
          ••{' '}
          {
            state.frozen
              ? 'На паузе'
              : cardLastFour
          }
          <ChevronRight size={13} />
        </button>
      </div>
      <div
        className="mascot"
        role="img"
        aria-label="Дружелюбный лисёнок Moby с телефоном"
      />
      <div className="mascot-bubble">
        {
          state.frozen
            ? 'Карта на паузе ❄️'
            : state.skin === 'space'
              ? 'К мечтам и звёздам! 🚀'
              : 'Твоя мечта ближе,\nчем кажется! ✨'
        }
      </div>
      <div className="hero-bottom">
        <span>
          <span className="mini-fox">
            ✦
          </span>
          {' '}Маленький шаг. Большая мечта.
        </span>
        <span className="coin-pill">
          <Coins size={14} />
          {state.coins}
        </span>
      </div>
    </section>
  );
}
