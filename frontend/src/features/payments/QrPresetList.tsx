import { ChevronRight } from 'lucide-react';
import { presets } from '../../domain/seed';
import { formatMoney } from '../../domain/money';
import type { Preset } from '../../domain/types';

export function QrPresetList({
  onSelect
}: {
  onSelect: (preset: Preset) => void;
}) {
  return (
    <div className='qr-presets'>
      {
        presets.map(preset => <button
          key={preset.id}
          onClick={() => onSelect(preset)}
        >
          <span className='preset-emoji'>
            {preset.emoji}
          </span>
          <span>
            <strong>
              {preset.title}
            </strong>
            <small>
              {preset.subtitle}
            </small>
          </span>
          <b>
            {formatMoney(preset.amount)}
            <small>
              BYN
            </small>
          </b>
          <ChevronRight size={16} />
        </button>)
      }
    </div>
  );
}
