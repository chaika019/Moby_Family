import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
export function Sheet({
  title,
  children,
  onClose
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(
    () => {
      const previous = document.activeElement as HTMLElement | null;
      const element = ref.current;
      const first = element?.querySelector<HTMLElement>('button, input, select, [tabindex="0"]');
      first?.focus();
      const handle = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'Tab' && element) {
          const items = Array.from(element.querySelectorAll<HTMLElement>('button:not(:disabled), input, select, [tabindex="0"]'));
          const first = items[0],
            last = items.at(-1);
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      };
      element?.addEventListener('keydown', handle);
      return () => {
        element?.removeEventListener('keydown', handle);
        previous?.focus();
      };
    },
    [onClose]
  );
  return (
    <div
      className="sheet-backdrop"
      onClick={
        e => {
          if (e.target === e.currentTarget) onClose();
        }
      }
    >
      <div
        ref={ref}
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="sheet-handle" />
        <header>
          <h2>
            {title}
          </h2>
          <button
            className="icon-button close"
            aria-label="Закрыть"
            onClick={onClose}
          >
            <X size={21} />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}
