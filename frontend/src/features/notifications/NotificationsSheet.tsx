import { usePhone } from "../../app/PhoneProvider";
import { Heart, CheckCheck, Gift } from "lucide-react";
import { formatMoney } from "../../lib/demo";
import { Row } from "../../components/ui";
export function NotificationsSheet() {
  const {
    isChild,
    state,
    missing,
    closeModal,
    navigate
  } = usePhone();
  return (
    <>
      {
        !isChild && state.sos && <div className="tip">
          <Heart size={23} />
          <span>
            <strong>
              Нужна помощь на кассе
            </strong>
            <small>
              {state.sos.title}
              {' '}·{' '}
              {formatMoney(missing)}
              {' '}BYN
            </small>
          </span>
        </div>
      }
      {
        !isChild && state.chores.filter(chore => chore.status === 'review').map(chore => <Row
          key={chore.id}
          icon={CheckCheck}
          title={chore.title}
          subtitle="Задание ждёт вашей проверки"
          onClick={
            () => {
              closeModal();
              navigate('academy');
            }
          }
        />)
      }
      <Row
        icon={Gift}
        title={
          isChild
            ? 'Время новых открытий'
            : 'Вы отличная команда'
        }
        subtitle={
          isChild
            ? 'За урок в академии получишь 100 Coins'
            : 'Поддерживайте маленькие шаги каждый день'
        }
        onClick={
          () => {
            closeModal();
            navigate('academy');
          }
        }
      />
    </>
  );
}
