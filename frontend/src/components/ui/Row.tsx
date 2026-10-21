import { IconBox } from './IconBox';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';
export function Row({
  icon,
  title,
  subtitle,
  onClick,
  tone = 'blue',
  end
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  tone?: string;
  end?: ReactNode;
}) {
  const content = <>
    <IconBox
      icon={icon}
      tone={tone}
    />
    <span className="row-copy">
      <strong>
        {title}
      </strong>
      {
        subtitle && <small>
          {subtitle}
        </small>
      }
    </span>
    {
      end ?? <ChevronRight
        size={17}
        className="muted"
      />
    }
  </>;
  return onClick
    ? <button
      className="row"
      onClick={onClick}
    >
      {content}
    </button>
    : <div className="row">
      {content}
    </div>;
}
