import { usePhone } from "../../app/PhoneProvider";
import { Plus, LockKeyhole } from "lucide-react";
import { SectionTitle } from "../../components/ui";
import { ChoreList } from "./ChoreList";
import { formatMoney, held } from "../../lib/demo";
export function ChoresPage() {
  const {
    openModal,
    state, childName
  } = usePhone();
  return (
    <>
      <div className="task-intro">
        <span>
          ✨
        </span>
        <h2>
          Команда начинается дома
        </h2>
        <p>
          Простые дела учат ответственности.
          <br />
          А награды делают путь приятнее.
        </p>
      </div>
      <button
        className="button full"
        onClick={() => openModal('chore')}
      >
        <Plus size={18} />
        Добавить задание
      </button>
      <SectionTitle>
        Дела · {childName}
      </SectionTitle>
      <ChoreList full />
      <div className="tip">
        <LockKeyhole size={22} />
        <span>
          <strong>
            Награда уже ждёт
          </strong>
          <small>
            За задания зарезервировано{' '}
            {formatMoney(held(state))}
            {' '}BYN. Деньги придут ребёнку после вашей проверки.
          </small>
        </span>
      </div>
    </>
  );
}
