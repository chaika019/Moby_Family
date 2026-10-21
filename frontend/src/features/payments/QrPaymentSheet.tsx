import { useState } from 'react';
import { ArrowRight, Check, ShieldCheck } from 'lucide-react';
import { usePhone } from '../../app/PhoneProvider';
import { QrScannerModal } from '../../components/scanner/QrScannerModal';
import { parseReceipt, receiptPreset, type Receipt } from '../../domain/receipt';
import demoReceipts from '../../data/receiptPresets.json';
import { demoQrSvg } from '../../data/generatedQr';
import { formatMoney } from '../../lib/demo';
import { playSound } from '../../lib/audio';

export function QrPaymentSheet() {
  const { closeModal, state, missing, changeRole, pay, hasParent, pending } = usePhone();
  const [paymentResult, setPaymentResult] = useState<'paid' | 'sos' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState('');

  async function submitReceipt(receipt: Receipt): Promise<boolean> {
    if (submitting || pending) return false;
    setSubmitting(true);
    setNotice('');
    try {
      const result = await pay(receiptPreset(receipt));
      if (!result) {
        setNotice('Платёж отклонён. Проверь сообщение и выбери другой чек.');
        return false;
      }
      if (result.status === 'NEED_SOS_TOPUP') setPaymentResult('sos');
      else if (result.status === 'COMPLETED') {
        playSound();
        setPaymentResult('paid');
      } else {
        setNotice(`Результат оплаты: ${result.status}`);
        return false;
      }
      return true;
    } finally { setSubmitting(false); }
  }

  return paymentResult === 'paid'
    ? <div className="result-screen">
      <span className="success-circle"><Check size={37} /></span>
      <h3>Готово, оплачено!</h3>
      <p>Покупка уже в истории. Семейный кешбэк стал чуть больше.</p>
      <button className="button full" onClick={closeModal}>Отлично!</button>
    </div>
    : state.sos || paymentResult === 'sos'
      ? <div className="result-screen">
        <div className="sheet-art">💙</div>
        <h3>{state.sos ? 'Папа, выручай!' : 'Покупка больше не ждёт'}</h3>
        <p>{state.sos
          ? `На покупку в «${state.sos.title}» не хватает ${formatMoney(missing)} BYN. `
            + 'Запрос уже на экране родителя.'
          : 'Родитель обработал запрос. Проверь баланс и историю операций.'}</p>
        {state.sos && <div className="waiting-dots"><i /><i /><i /></div>}
        <button className="button full" onClick={() => {
          if (hasParent) changeRole('parent');
          closeModal();
        }}>
          {hasParent ? 'На экран родителя' : 'Вернуться'} <ArrowRight size={17} />
        </button>
        <button className="text-button full" onClick={closeModal}>Вернуться на главную</button>
      </div>
      : <>
        <QrScannerModal onReceipt={submitReceipt} disabled={submitting} />
        <p className="sheet-description">Наведи камеру на чек или выбери демо-чек.</p>
        {notice && <p className="inline-note" role="status">{notice}</p>}
        <div className="qr-demo-heading">Демо-чеки для быстрой проверки</div>
        <div className="qr-presets">
          {demoReceipts.map(entry => <div className="qr-demo-row" key={entry.id}>
            <button type="button" disabled={submitting} onClick={() => {
              void submitReceipt(parseReceipt(JSON.stringify(entry)));
            }}>
              <span className="preset-emoji">{entry.emoji}</span>
              <span><strong>{entry.label}</strong><small>{entry.merchant}</small></span>
            </button>
            <a href={demoQrSvg[entry.id]} download={`${entry.id}.svg`}
              aria-label={`Скачать QR: ${entry.label}`}>
              QR
            </a>
          </div>)}
        </div>
        <div className="inline-note"><ShieldCheck size={15} />
          Проверяем баланс, ограничения и лимиты.
        </div>
      </>;
}
