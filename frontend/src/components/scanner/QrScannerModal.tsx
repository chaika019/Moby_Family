import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Camera, CameraOff, RefreshCw, ScanLine } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import type { Receipt } from '../../domain/receipt';
import { parseReceipt } from '../../domain/receipt';

interface Props {
  onReceipt: (receipt: Receipt) => Promise<boolean>;
  disabled?: boolean;
}

export function QrScannerModal({ onReceipt, disabled = false }: Props) {
  const readerId = `qr-reader-${useId().replace(/:/g, '')}`;
  const busy = useRef(false);
  const onReceiptRef = useRef(onReceipt);
  const [status, setStatus] = useState('Подключаем камеру…');
  const [active, setActive] = useState(false);
  const [attempt, setAttempt] = useState(0);
  onReceiptRef.current = onReceipt;

  const decode = useCallback(async (raw: string) => {
    if (busy.current) return;
    busy.current = true;
    try {
      const receipt = parseReceipt(raw);
      setStatus(`Считан чек: ${receipt.merchantName}`);
      const accepted = await onReceiptRef.current(receipt);
      if (!accepted) {
        setStatus('Платёж не выполнен. Проверь сообщение и попробуй ещё раз.');
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Не удалось прочитать QR-чек.');
    } finally {
      window.setTimeout(() => { busy.current = false; }, 1800);
    }
  }, []);

  useEffect(() => {
    if (disabled) return;
    let cancelled = false;
    let started = false;
    const reader = new Html5Qrcode(readerId, {
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE], verbose: false
    });
    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia || !window.isSecureContext) {
        setStatus('Камера доступна через HTTPS или localhost. Выбери демо-чек ниже.');
        return;
      }
      try {
        await reader.start(
          { facingMode: 'environment' },
          { fps: 8, qrbox: { width: 220, height: 220 }, aspectRatio: 1 },
          decoded => { void decode(decoded); },
          () => {}
        );
        started = true;
        if (!cancelled) {
          setActive(true);
          setStatus('Наведи камеру на QR-код чека.');
        }
      } catch {
        if (!cancelled) {
          setStatus('Не удалось включить камеру. Проверь разрешение или выбери демо-чек ниже.');
        }
      }
    };
    const startPromise = start();
    return () => {
      cancelled = true;
      void startPromise.finally(async () => {
        if (started) await reader.stop().catch(() => {});
        try { reader.clear(); } catch { /* Camera was never started. */ }
      });
    };
  }, [readerId, attempt, decode, disabled]);

  return (
    <section className="qr-live-scanner" aria-label="Сканер QR-чека">
      <div className="qr-viewfinder">
        <div id={readerId} className="qr-reader" />
        {!active && <div className="qr-camera-placeholder" aria-hidden="true">
          {status.startsWith('Не удалось') ? <CameraOff size={38} /> : <ScanLine size={44} />}
        </div>}
        <span className="qr-scan-line" aria-hidden="true" />
      </div>
      <p role="status" className="qr-camera-status">{status}</p>
      {!active && !disabled && <button
        type="button" className="text-button full"
        onClick={() => { setStatus('Подключаем камеру…'); setAttempt(value => value + 1); }}
      >
        <RefreshCw size={16} /> Повторить подключение
      </button>}
      <small className="qr-camera-help">
        <Camera size={14} /> Для камеры нужен доступ в браузере.
      </small>
    </section>
  );
}
