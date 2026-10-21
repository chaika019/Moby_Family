import { ShieldCheck, Sparkles, Users } from 'lucide-react';
import {ConnectionGate} from '../../features/connection/ConnectionSheet';
import { useFamily } from '../../app/FamilyProvider';
import { PhoneProvider } from '../../app/PhoneProvider';
import type { Role } from '../../lib/demo';
import { Phone } from '../phone/Phone';
import {
  WorkspaceHeader,
  WorkspaceIntro,
  DemoToolbar,
  RoleSwitcher,
} from './WorkspaceChrome';
const ROLES: Role[] = ['parent', 'child'];
export function Workspace() {
  const {
    role,mode,session,hasParent
  } = useFamily();
  if(mode==='login'||(mode==='server'&&!session?.selectedChildId))return <ConnectionGate/>;
  return (
    <div className="workspace">
      <WorkspaceHeader />
      <main>
        <WorkspaceIntro />
        <DemoToolbar />
        <RoleSwitcher />
        <div className="phones">
          {
            ROLES.filter(r=>r==='child'||hasParent).map(phoneRole => <section
              key={phoneRole+(session?.selectedChildId||'demo')}
              className={`device-column ${phoneRole} ${role === phoneRole
                ? 'mobile-active'
                : ''}`}
            >
              <DeviceLabel role={phoneRole} />
              <PhoneProvider role={phoneRole}>
                <Phone />
              </PhoneProvider>
            </section>)
          }
        </div>
        <footer className="workspace-footer">
          <span>
            <ShieldCheck size={15} />
            {' '}Близкие рядом. Деньги под контролем.
          </span>
          <span>
            Самостоятельное приложение · виртуальные деньги
          </span>
        </footer>
      </main>
    </div>
  );
}
function DeviceLabel({
  role
}: {
  role: Role;
}) {
  const isParent = role === 'parent';
  const Icon = isParent
    ? Users
    : Sparkles;
  return (
    <div className="device-label">
      <span className={`role-symbol ${role}`}>
        <Icon size={16} />
      </span>
      <strong>
        {
          isParent
            ? 'Для родителей'
            : 'Для детей'
        }
      </strong>
      <span>
        {
          isParent
            ? 'Спокойствие за важное'
            : 'Свобода учиться и мечтать'
        }
      </span>
    </div>
  );
}
