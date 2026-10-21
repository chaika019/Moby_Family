import {apiError} from "../../lib/api";
import { usePhone } from "../../app/PhoneProvider";
import { Row } from "../../components/ui";
import {
  TrendingUp,
  Check,
  ShieldCheck,
  Heart,
  Gamepad2,
  Gift,
  Sparkles,
} from "lucide-react";
import { formatMoney } from "../../lib/demo";
export function BenefitsSheet() {
  const {
    state,live,isChild,manage,notify,role
  } = usePhone();
  return (
    <>
      <div className="benefits-head">
        <span>
          💙
        </span>
        <h3>
          Хорошо быть семьёй
        </h3>
        <p>
          Больше заботы в одной подписке
        </p>
        <b>
          6,99{' '}
          <small>
            BYN / месяц
          </small>
        </b>
      </div>
      <div className="surface">
        <Row
          icon={TrendingUp}
          title="Семейный кешбэк"
          subtitle={`${formatMoney(state.cashback)} BYN накоплено`}
          tone="green"
          end={<Check size={18} />}
        />
        <Row
          icon={ShieldCheck}
          title="Школьный щит 24/7"
          subtitle="Концепция защиты ребёнка из ТЗ"
          end={<Heart size={18} />}
        />
        <Row
          icon={Gamepad2}
          title="Кибер-щит"
          subtitle="Концепция защиты от онлайн-обмана"
          tone="purple"
          end={<ShieldCheck size={18} />}
        />
        <Row
          icon={Gift}
          title="Бонусы для всей семьи"
          subtitle="Предложения партнёров и Халвы"
          tone="orange"
          end={<Sparkles size={18} />}
        />
      </div>
      {live&&!isChild&&<button className="button full" onClick={()=>void manage('/parent/subscription/'+!live.family.subscriptionActive).catch(e=>notify(role,apiError(e),true))}>{live.family.subscriptionActive?'Отключить подписку':'Подключить подписку · 6,99 BYN'}</button>}
      {live&&<p className="form-note">Подписка: {live.family.subscriptionActive?'активна':'не подключена'}. Страховой сценарий: {live.family.insuranceActive?'включён':'выключен'}.</p>}
      <p className="form-note">
        Условия показаны по продуктовому ТЗ для демонстрации. Это не
        оферта, страховой полис или подтверждённый тариф МТБанка.
      </p>
    </>
  );
}
