import { usePhone } from "../../app/PhoneProvider";
import {
  ShieldCheck,
  ShoppingBag,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

export function MissionGrid() {
  const {
    state,
    navigate,
    notify,
    role,
    selectLesson,
    openModal,lessons,child
  } = usePhone();
  return (
    <div className="mission-grid">
      {
        [{
          id: 'safety',
          title: 'Как защититься от мошенников?',
          icon: ShieldCheck,
          tone: 'blue'
        }, {
          id: 'shopping',
          title: 'Умные покупки',
          icon: ShoppingBag,
          tone: 'orange'
        }, {
          id: 'budget',
          title: 'Планируем бюджет',
          icon: TrendingUp,
          tone: 'pink'
        }].map(
          mission => <button
            key={mission.id}
            className={`mission-card ${mission.tone}`}
            onClick={
              () => {
                const target=child&&mission.id==='safety'?'security':mission.id;const index = lessons.findIndex(lesson => lesson.id === target);
                if (index > 0 && !state.lessons.includes(lessons[index - 1].id)) {
                  navigate('academy');
                  notify(
                    role,
                    'Сначала заверши предыдущий урок — он поможет с этой миссией'
                  );
                } else {
                  selectLesson(target);
                  openModal('lesson');
                }
              }
            }
          >
            <mission.icon
              size={27}
              strokeWidth={1.9}
            />
            <ChevronRight
              className="mission-chevron"
              size={16}
            />
            <strong>
              {mission.title}
            </strong>
            <span>
              +100{' '}
              <span aria-hidden="true">
                ⭐
              </span>
            </span>
          </button>
        )
      }
    </div>
  );
}
