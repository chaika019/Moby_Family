import { usePhone } from "../../app/PhoneProvider";
import { Bell } from "lucide-react";
export function PhoneHeader() {
  const {
    isChild,
    openModal,
    state, childName, parentName
  } = usePhone();
  return (
    <header className="app-header">
      <div className="avatar">
        {
          isChild
            ? childName[0]
            : parentName[0]
        }
        <span />
      </div>
      <div className="greeting">
        <small>
          {
            isChild
              ? 'Сегодня отличный день ✨'
              : 'Хорошо, когда все рядом'
          }
        </small>
        <strong>
          {
            isChild
              ? `Привет, ${childName}!`
              : `Привет, ${parentName}`
          }
        </strong>
      </div>
      <button
        className="icon-button notification"
        aria-label="Уведомления"
        onClick={() => openModal('notifications')}
      >
        <Bell size={21} />
        {
          (!isChild && state.chores.some(chore => chore.status === 'review') || state.sos) && <i />
        }
      </button>
    </header>
  );
}
