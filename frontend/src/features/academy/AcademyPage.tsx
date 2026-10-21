import { LessonNode } from './LessonNode';
import { usePhone } from "../../app/PhoneProvider";
import { AcademyHero } from "./AcademyHero";
import { SectionTitle } from "../../components/ui";

import { Coins, Gift } from "lucide-react";
export function AcademyPage() {
  const {
    openModal,lessons
  } = usePhone();
  return <>
      <AcademyHero />
      <SectionTitle>
        Твой путь к знаниям
      </SectionTitle>
      <div className="learning-path">
        {lessons.map((lesson, index) => <LessonNode key={lesson.id} lesson={lesson} index={index} />)}
      </div>
      <div className="tip">
        <Coins size={25} />
        <span>
          <strong>
            Знания приносят награды
          </strong>
          <small>
            За каждый новый урок — 100 Moby Coins. Обменяй их на что-нибудь
            классное.
          </small>
        </span>
      </div>
      <button className="button secondary full" onClick={() => openModal('shop')}>
        <Gift size={18} />
        В магазин наград
      </button>
    </>;
}
