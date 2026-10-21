import { usePhone } from "../../app/PhoneProvider";
import { formatMoney } from "../../lib/demo";
import { Progress, SectionTitle } from "../../components/ui";
import { Plus, Gift } from "lucide-react";
export function DreamsPage() {
  const {
    state,
    openModal, child
  } = usePhone();
  if(child&&!child.piggyBanks.length)return <div className="tip"><span>Пока нет копилки. Родитель может создать её в настройках семьи.</span><button className="button" onClick={()=>openModal('connect')}>Настройки семьи</button></div>;
  return (
    <>
      <div className="dream-hero">
        <span className="eyebrow">
          ТВОЯ БОЛЬШАЯ ЦЕЛЬ
        </span>
        <div className="bike-art">
          🚲
          <span>
            ✦
          </span>
          <i>
            ✧
          </i>
        </div>
        <h2>
          {state.goal?.title||'На новый велосипед'}
        </h2>
        <p>
          Новые маршруты уже ждут тебя
        </p>
        <div className="goal-numbers">
          <b>
            {formatMoney(state.piggy)}
            {' '}
            <small>
              BYN
            </small>
          </b>
          <span>
            из{' '}
            {formatMoney(state.target)}
            {' '}BYN
          </span>
        </div>
        <Progress
          value={state.piggy / state.target * 100}
          tone="orange"
        />
        <button
          className="button"
          onClick={() => openModal('save')}
        >
          <Plus size={17} />
          Приблизить мечту
        </button>
      </div>
      <div className="tip">
        <Gift size={23} />
        <span>
          <strong>
            Папа поддержит твою мечту
          </strong>
          <small>
            Родитель добавляет {state.goal?.match??50}% к твоему взносу.
          </small>
        </span>
      </div>
      <SectionTitle>
        Дружеский баттл
      </SectionTitle>
      <div className="surface battle">
        <div>
          <span>
            🦊
          </span>
          <strong>
            Ты
          </strong>
          <b>
            {Math.round(state.piggy / state.target * 100)}
            %
          </b>
        </div>
        <Progress value={state.piggy / state.target * 100} />
        <div>
          <span>
            🐻
          </span>
          <strong>
            {state.goal?.opponentName||'Соперник не выбран'}
          </strong>
          <b>
            {Math.round((state.goal?.opponentProgress??9500)/state.target*100)}%
          </b>
        </div>
        <Progress
          value={(state.goal?.opponentProgress??9500)/state.target*100}
          tone="purple"
        />
        <p>
          {
            state.piggy >= 9500
              ? 'Ты впереди! Но главное — идти к своей цели 💙'
              : 'Каждый шаг важен. Ты справишься 💙'
          }
        </p>
      </div>
    </>
  );
}
