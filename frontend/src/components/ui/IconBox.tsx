import { type LucideIcon } from 'lucide-react';
export function IconBox({
  icon: Icon,
  tone = 'blue'
}: {
  icon: LucideIcon;
  tone?: string;
}) {
  return (
    <span className={`icon-box ${tone}`}>
      <Icon
        size={21}
        strokeWidth={1.8}
      />
    </span>
  );
}
