import { usePhone } from "../../app/PhoneProvider";
import { JuniorHero } from "./JuniorHero";
import { QuickActions } from "./QuickActions";
import { Heart, ChevronRight } from "lucide-react";
import { SectionTitle } from "../../components/ui";
import { DreamCard } from "../goals/DreamCard";
import { MissionGrid } from "./MissionGrid";
import { ChoreList } from "../chores/ChoreList";
export function ChildHome() {
  const {
    state,
    openModal,
    navigate
  } = usePhone();
  return (
    <>
      <JuniorHero />
      <QuickActions />
      {
        state.sos && <button
          className="waiting-card"
          onClick={
            () => {
              openModal('qr');
            }
          }
        >
          <Heart size={19} />
          <span>
            Запрос отправлен папе
            <small>
              Ждём помощь на кассе
            </small>
          </span>
          <ChevronRight size={17} />
        </button>
      }
      <SectionTitle
        action="Все мечты"
        onClick={() => navigate('family')}
      >
        Мечта становится ближе
      </SectionTitle>
      <DreamCard />
      <SectionTitle
        action="Все"
        onClick={() => navigate('academy')}
      >
        Миссии от Moby
      </SectionTitle>
      <MissionGrid />
      <SectionTitle
        action="Все дела"
        onClick={
          () => {
            navigate('more');
          }
        }
      >
        Дела с наградой
      </SectionTitle>
      <ChoreList />
    </>
  );
}
