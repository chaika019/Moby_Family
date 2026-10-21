import { usePhone } from "../../app/PhoneProvider";
import { DreamsPage } from "../../features/goals/DreamsPage";
import { SafetyPage } from "../../features/safety/SafetyPage";
export function FamilyPage() {
  const {
    isChild
  } = usePhone();
  return isChild
    ? <DreamsPage />
    : <SafetyPage />;
}
