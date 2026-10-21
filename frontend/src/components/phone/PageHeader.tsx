import { usePhone } from "../../app/PhoneProvider";
import { Coins } from "lucide-react";
export function PageHeader() {
  const {
    isChild,
    state,
    tab
  } = usePhone();
  const titles = isChild
    ? {
      home: 'Главная',
      family: 'Мои мечты',
      academy: 'Академия',
      more: 'Мой мир'
    }
    : {
      home: 'Моя семья',
      family: 'Защита ребёнка',
      academy: 'Семейные дела',
      more: 'Больше для семьи'
    };
  const title = titles[tab];
  return (
    <header className="page-header">
      <div>
        <small>
          {
            isChild
              ? 'MOBY JUNIOR'
              : 'МОЯ СЕМЬЯ'
          }
        </small>
        <h1>
          {title}
        </h1>
      </div>
      {
        isChild
          ? <span className="coin-pill">
            <Coins size={17} />
            {state.coins}
          </span>
          : <span className="avatar small">
            Н
          </span>
      }
    </header>
  );
}
