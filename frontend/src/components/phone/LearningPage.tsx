import { usePhone } from "../../app/PhoneProvider";
import { AcademyPage } from "../../features/academy/AcademyPage";
import { ChoresPage } from "../../features/chores/ChoresPage";
export function LearningPage() {
  const {
    isChild
  } = usePhone();
  return isChild
    ? <AcademyPage />
    : <ChoresPage />;
}
