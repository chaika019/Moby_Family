import { usePhone } from '../../app/PhoneProvider';
import { HomePage } from '../../features/home/HomePage';
import { MorePage } from '../../features/profile/MorePage';
import { FamilyPage } from './FamilyPage';
import { LearningPage } from './LearningPage';
export function PhonePage() {
  const {
    tab
  } = usePhone();
  switch (tab) {
    case 'home':
      return (
        <HomePage />
      );
    case 'family':
      return (
        <FamilyPage />
      );
    case 'academy':
      return (
        <LearningPage />
      );
    case 'more':
      return (
        <MorePage />
      );
  }
}
