import { useEffect, type RefObject } from 'react';

const FOCUSABLE = 'button:not(:disabled), input, select, [tabindex="0"]';

const INITIAL_FOCUS = 'button, input, select, [tabindex="0"]';

/** Keeps keyboard focus in an open dialog and restores it on close. */
export function useDialogFocus(ref: RefObject<HTMLDivElement | null>, onClose: () => void) {
  useEffect(
    () => {
      const previous = document.activeElement as HTMLElement | null;
      const element = ref.current;
      element?.querySelector<HTMLElement>(INITIAL_FOCUS)?.focus();
      function handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
          onClose();
        }
        if (event.key !== 'Tab'
          || !element) {
          return;
        }
        const items = Array.from(element.querySelectorAll<HTMLElement>(FOCUSABLE));
        const first = items[0];
        const last = items.at(-1);
        if (event.shiftKey
          && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey
          && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
      element?.addEventListener('keydown', handleKeyDown);
      return () => {
        element?.removeEventListener('keydown', handleKeyDown);
        previous?.focus();
      };
    },
    [ref, onClose]
  );
}
