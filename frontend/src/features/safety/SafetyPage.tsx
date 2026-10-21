import { spendingCategories } from '../../data/spendingCategories';
import { usePhone } from "../../app/PhoneProvider";
import { SecurityIntro } from "./SecurityIntro";
import { SectionTitle, Row, Toggle } from "../../components/ui";
import {
  Snowflake,
  Settings2,
  ShieldCheck,
  Globe,
  MapPin,
  Bell,
  Heart,
} from "lucide-react";
import { formatMoney } from "../../lib/demo";
export function SafetyPage() {
  const {
    state,
    executeCommand,
    openModal
  } = usePhone();
  return (
    <>
      <SecurityIntro />
      <SectionTitle>
        Карта и лимиты
      </SectionTitle>
      <div className="surface">
        <Row
          icon={Snowflake}
          title="Пауза для карты"
          subtitle={
            state.frozen
              ? 'Покупки временно недоступны'
              : 'Можно включить в любой момент'
          }
          end={<Toggle
            label="Заморозить карту"
            checked={state.frozen}
            onChange={() => executeCommand({
              type: 'freeze'
            })}
          />}
        />
        <Row
          icon={Settings2}
          title="Лимиты на покупки"
          subtitle={`${formatMoney(state.dailyLimit)} BYN в день`}
          onClick={() => openModal('limits')}
        />
      </div>
      <SectionTitle>
        Где можно тратить
      </SectionTitle>
      <div className="surface">
        {
          spendingCategories.map(
            item => <Row
              key={item.key}
              icon={item.icon}
              tone={item.tone}
              title={item.title}
              subtitle={item.subtitle}
              end={<Toggle
                label={`Разрешить: ${item.title}`}
                checked={!state.rules[item.key]}
                onChange={() => executeCommand({
                  type: 'rule',
                  key: item.key
                })}
              />}
            />
          )
        }
      </div>
      <div className="inline-note">
        <ShieldCheck size={16} />
        Категория 18+ всегда заблокирована в детском профиле.
      </div>
      <SectionTitle>
        Дополнительная защита
      </SectionTitle>
      <div className="surface">
        <Row
          icon={Globe}
          title="Интернет-покупки"
          end={<Toggle
            label="Интернет-покупки"
            checked={state.safety.online}
            onChange={() => executeCommand({
              type: 'safety',
              key: 'online'
            })}
          />}
        />
        <Row
          icon={MapPin}
          title="Только в Беларуси"
          end={<Toggle
            label="Только в Беларуси"
            checked={state.safety.belarus}
            onChange={() => executeCommand({
              type: 'safety',
              key: 'belarus'
            })}
          />}
        />
        <Row
          icon={Bell}
          title="Уведомлять о покупках"
          end={<Toggle
            label="Уведомления о покупках"
            checked={state.safety.notifications}
            onChange={() => executeCommand({
              type: 'safety',
              key: 'notifications'
            })}
          />}
        />
      </div>
      <div className="tip">
        <Heart size={23} />
        <span>
          <strong>
            Контроль с доверием
          </strong>
          <small>
            Обсуждайте правила вместе. Для подростков 14–17 лет ТЗ
            предусматривает приватность чеков.
          </small>
        </span>
      </div>
    </>
  );
}
