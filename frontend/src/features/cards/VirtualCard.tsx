import {usePhone} from "../../app/PhoneProvider";
import { Brand } from "../../components/ui";
import { Wifi } from "lucide-react";
export function VirtualCard() {
  const {childName,cardLastFour}=usePhone();
  return (
    <div className="virtual-card">
      <Brand junior />
      <span>
        JUNIOR · BYN
      </span>
      <Wifi size={27} />
      <strong>
        •••• •••• •••• {cardLastFour}
      </strong>
      <small>
        {childName.toUpperCase()}
      </small>
      <b>
        VISA
      </b>
    </div>
  );
}
