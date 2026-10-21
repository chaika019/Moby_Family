import {apiError} from "../../lib/api";
import { usePhone } from "../../app/PhoneProvider";
import { ProfileCard } from "./ProfileCard";
import { SectionTitle, Row } from "../../components/ui";
import { ChoreList } from "../chores/ChoreList";
import {
  Gift,
  Users,
  CarFront,
  CreditCard,
  Wallet,
  CalendarDays,
  TrendingUp,
  Heart,
  Link,
  CircleHelp,
} from "lucide-react";
import { formatMoney, available } from "../../lib/demo";
export function MorePage() {
  const {
    isChild,
    openModal,
    state,
    live,child,mutate,notify,role
  } = usePhone();
  return (
    <>
      <ProfileCard />
      {
        isChild
          ? <>
            <SectionTitle>
              Твои дела
            </SectionTitle>
            <ChoreList full />
            <SectionTitle>
              Твой Moby
            </SectionTitle>
            <div className="surface">
              <Row
                icon={Gift}
                title="Магазин наград"
                subtitle="Образы, звуки и приятные бонусы"
                tone="purple"
                onClick={() => openModal('shop')}
              />
              <Row
                icon={Users}
                title="Скинуться с друзьями"
                subtitle="На пиццу или что-нибудь вкусное"
                tone="orange"
                onClick={() => openModal('split')}
              />
              <Row
                icon={CarFront}
                title="Мне нужно домой"
                subtitle="Попросить помощь с поездкой"
                tone="green"
                onClick={() => openModal('ride')}
              />
              <Row
                icon={CreditCard}
                title="Моя карта"
                subtitle="Твоя первая финансовая свобода"
                onClick={() => openModal('card')}
              />
            </div>
          </>
          : <>
            <SectionTitle>
              Семейные финансы
            </SectionTitle>
            <div className="surface">
              <Row
                icon={Wallet}
                title="Мой счёт"
                subtitle={`Доступно ${formatMoney(available(state))} BYN`}
                onClick={() => openModal('topup')}
              />
              <Row
                icon={CalendarDays}
                title="Карманные по расписанию"
                subtitle={`${formatMoney(state.allowance)} BYN · ${state.allowanceDay}-го числа`}
                tone="purple"
                onClick={() => openModal('allowance')}
              />
              <Row
                icon={TrendingUp}
                title="Капитал 18"
                subtitle="План большого будущего"
                tone="green"
                onClick={() => openModal('capital')}
              />
              <Row
                icon={Heart}
                title="Подписка «Моя семья»"
                subtitle="Бонусы и забота о близких"
                tone="pink"
                onClick={() => openModal('benefits')}
              />
            </div>
          </>
      }
      {isChild&&child&&child.profile.age>=14&&<button className="button secondary full" onClick={()=>void mutate('child','/children/privacy',{childId:child.profile.id,privacyMode:!child.profile.privacyMode},'PATCH').catch(e=>notify(role,apiError(e),true))}>Приватность чеков: {child.profile.privacyMode?'включена':'выключена'}</button>}
      <SectionTitle>
        Всегда рядом
      </SectionTitle>
      <div className="surface">
        <Row
          icon={Link}
          title="Подключение к backend"
          subtitle={
            live
              ? 'Подключён · все операции на сервере'
              : 'Демо · тестовые деньги'
          }
          onClick={() => openModal('connect')}
        />
        <Row
          icon={CircleHelp}
          title="Помощь и о приложении"
          subtitle="Разберёмся вместе"
          onClick={() => openModal('help')}
        />
      </div>
      <p className="version-label">
        Moby Kids & Family · v0.1
        <br />
        Сделано для маленьких шагов и больших мечт
      </p>
    </>
  );
}
