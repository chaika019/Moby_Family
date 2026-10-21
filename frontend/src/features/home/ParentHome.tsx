import { usePhone } from "../../app/PhoneProvider";
import { ParentStory } from "./ParentStory";
import { ParentBalanceCard } from "./ParentBalanceCard";
import { ParentShortcuts } from "./ParentShortcuts";
import { SectionTitle } from "../../components/ui";
import { ChoreList } from "../chores/ChoreList";
import { CashbackBanner } from "./CashbackBanner";
import { DreamCard } from "../goals/DreamCard";
export function ParentHome() {
  const {
    navigate,
    state,
    openModal
  } = usePhone();
  return (
    <>
      <ParentStory />
      <ParentBalanceCard />
      <ParentShortcuts />
      <SectionTitle
        action="Все дела"
        onClick={() => navigate('academy')}
      >
        Маленькие победы{' '}
        <span className="count">
          {state.chores.filter(chore => chore.status === 'review').length}
        </span>
      </SectionTitle>
      <ChoreList />
      <SectionTitle
        action="Подробнее"
        onClick={() => openModal('benefits')}
      >
        Выгодно быть семьёй
      </SectionTitle>
      <CashbackBanner />
      <SectionTitle
        action="Открыть"
        onClick={() => openModal('capital')}
      >
        Забота о будущем
      </SectionTitle>
      <DreamCard />
    </>
  );
}
