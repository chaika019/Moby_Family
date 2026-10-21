import { ChevronRight } from 'lucide-react';
import { type ReactNode } from 'react';
export function SectionTitle({
  children,
  action,
  onClick
}: {
  children: ReactNode;
  action?: string;
  onClick?: () => void;
}) {
  return (
    <div className="section-title">
      <h2>
        {children}
      </h2>
      {
        action && <button
          className="text-button"
          onClick={onClick}
        >
          {action}
          <ChevronRight size={14} />
        </button>
      }
    </div>
  );
}
