import { usePhone } from "../../app/PhoneProvider";
import { VirtualCard } from "./VirtualCard";
import { Row } from "../../components/ui";
import { CreditCard, ShieldCheck, Check } from "lucide-react";
export function CardSheet() {
  const {
    state
  } = usePhone();
  return (
    <>
      <VirtualCard />
      <div className="surface">
        <Row
          icon={CreditCard}
          title={
            state.frozen
              ? 'Карта на паузе'
              : 'Виртуальная карта активна'
          }
          subtitle="Демонстрационная карта"
          end={<span
            className={`green-dot ${state.frozen
              ? 'gray'
              : ''}`}
          />}
        />
        <Row
          icon={ShieldCheck}
          title="Защита включена"
          subtitle="Родитель помогает с безопасностью"
          end={<Check size={18} />}
        />
      </div>
      <p className="form-note">
        Карта изображена для демонстрации. Реальные реквизиты и выпуск
        карты доступны только через банковскую интеграцию.
      </p>
    </>
  );
}
