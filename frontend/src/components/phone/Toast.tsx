import { Check, CircleHelp } from 'lucide-react';
import type { ToastMessage } from '../../app/types';
export function Toast({
  message
}: {
  message: ToastMessage;
}) {
  const Icon = message.error
    ? CircleHelp
    : Check;
  return (
    <div
      className={`toast ${message.error
        ? 'error'
        : ''}`}
      role={
        message.error
          ? 'alert'
          : 'status'
      }
    >
      <Icon size={19} />
      <span>
        {message.text}
      </span>
    </div>
  );
}
