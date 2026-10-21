import { usePhone } from "../../app/PhoneProvider";
import { ChevronRight } from "lucide-react";
import { Progress } from "../../components/ui";
import { formatMoney } from "../../lib/demo";
export function DreamCard() {
  const {
    isChild,
    navigate,
    openModal,
    state
  } = usePhone();
  return (
    <button
      className="dream-card"
      onClick={() => isChild
        ? navigate('family')
        : openModal('capital')}
    >
      <div className="dream-illustration">
        {
          isChild
            ? '🚲'
            : '🌱'
        }
      </div>
      <div className="dream-copy">
        <small>
          {
            isChild
              ? 'Каждый шаг — ближе к мечте'
              : 'Большое будущее начинается сейчас'
          }
        </small>
        <strong>
          {
            isChild
              ? state.goal?.title||'На мечту'
              : 'Капитал 18'
          }
          <ChevronRight size={16} />
        </strong>
        <Progress
          value={
            isChild
              ? state.piggy / state.target * 100
              : 35
          }
          tone={
            isChild
              ? 'orange'
              : 'blue'
          }
        />
        <span>
          {
            isChild
              ? <>
                <b>
                  {formatMoney(state.piggy)}
                </b>
                {' '}из{' '}
                {formatMoney(state.target)}
                {' '}BYN
              </>
              : <>
                План накоплений к совершеннолетию
              </>
          }
        </span>
      </div>
    </button>
  );
}
