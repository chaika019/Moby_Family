import { useEffect, useRef } from 'react';
import { usePhone } from '../../app/PhoneProvider';
import { SosBanner } from '../../features/payments/SosBanner';
import { BottomNavigation } from './BottomNavigation';
import { PageHeader } from './PageHeader';
import { PhoneHeader } from './PhoneHeader';
import { PhoneDialogs } from './PhoneDialogs';
import { PhonePage } from './PhonePage';
import { StatusBar } from './StatusBar';
import { Toast } from './Toast';
export function Phone() {
  const {
    role,
    isChild,
    tab,
    dialog,
    state,
    toast,pending
  } = usePhone();
  const scroll = useRef<HTMLDivElement>(null);
  useEffect(
    () => {
      scroll.current?.scrollTo({
        top: 0
      });
    },
    [tab]
  );
  return (
    <div
      className={`phone ${isChild
        ? 'junior'
        : 'parent-phone'}`}
      data-testid={`${role}-phone`}
    >
      <div className={`phone-screen view-${tab}`}>
        <StatusBar />
        <div
          className={`screen-scroll view-${tab}`}
          ref={scroll}
          inert={dialog !== null}
        >
          {
            tab === 'home'
              ? <PhoneHeader />
              : <PageHeader />
          }
          {
            !isChild && state.sos && <SosBanner />
          }
          <PhonePage />
        </div>
        <BottomNavigation />
        <div className="home-indicator" />
        {
          toast && <Toast message={toast} />
        }
        <PhoneDialogs />
        {pending&&<div className="command-pending" role="status">Сохраняем…</div>}
      </div>
    </div>
  );
}
