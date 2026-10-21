import { LockKeyhole } from 'lucide-react';
import { usePhone } from '../../app/PhoneProvider';
import { SectionTitle } from '../../components/ui';
import { TransactionList } from '../history/TransactionList';
import { ChildHome } from './ChildHome';
import { ParentHome } from './ParentHome';
export function HomePage() {
  const {
    isChild,
    openModal
  } = usePhone();
  return (
    <>
      {
        isChild
          ? <ChildHome />
          : <ParentHome />
      }
      <SectionTitle
        action="Все"
        onClick={() => openModal('history')}
      >
        Последние операции
      </SectionTitle>
      <TransactionList compact />
      <div className="app-bottom-note">
        <LockKeyhole size={12} />
        {' '}Демо Moby · МТБанк
      </div>
    </>
  );
}
