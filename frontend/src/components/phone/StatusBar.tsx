import { Signal, Wifi, BatteryFull } from "lucide-react";
export function StatusBar() {
  return (
    <div className="statusbar">
      <strong>
        9:41
      </strong>
      <span className="dynamic-island" />
      <span>
        <Signal size={14} />
        <Wifi size={14} />
        <BatteryFull size={20} />
      </span>
    </div>
  );
}
