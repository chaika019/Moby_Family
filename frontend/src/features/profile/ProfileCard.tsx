import { usePhone } from "../../app/PhoneProvider";
import { Coins } from "lucide-react";
export function ProfileCard() {
  const {
    isChild,
    state, childName, parentName, childAge
  } = usePhone();
  return (
    <div className="profile-card">
      <span className="avatar large">
        {
          isChild
            ? 'Н'
            : 'А'
        }
      </span>
      <h2>
        {
          isChild
            ? childName
            : parentName
        }
      </h2>
      <p>
        {
          isChild
            ? `Исследователь · ${childAge} лет`
            : 'Семья, в которой всё получается'
        }
      </p>
      {
        isChild && <span className="coin-pill">
          <Coins size={16} />
          {state.coins}
          {' '}Moby Coins
        </span>
      }
    </div>
  );
}
