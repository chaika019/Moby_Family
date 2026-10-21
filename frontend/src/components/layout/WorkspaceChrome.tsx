import { RefreshCw, Sparkles, Users } from 'lucide-react';
import { useFamily } from '../../app/FamilyProvider';
import { Brand } from '../ui';
export function WorkspaceHeader() {
  return (
    <header className="desktop-header">
      <a
        className="brand-link"
        href="/"
        aria-label="Moby Моя семья"
      >
        <Brand />
      </a>
      <div className="desktop-nav">
        <span className="active">
          Моя семья
        </span>
        <span>
          Маленькие шаги. Большое будущее.
        </span>
      </div>
      <span className="bank-label">
        самостоятельное приложение{' '}
        <strong>
          Moby Family
        </strong>
      </span>
    </header>
  );
}
export function WorkspaceIntro() {
  return (
    <div className="intro">
      <div className="eyebrow">
        <span />
        {' '}MOBY KIDS & FAMILY
      </div>
      <h1>
        Растём вместе.
        <br className="mobile-break" />
        {' '}Мечтаем по-крупному
        <span>
          .
        </span>
      </h1>
      <p>
        Первые деньги, большие мечты и спокойствие родителей.
      </p>
    </div>
  );
}
export function DemoToolbar() {
  const {
    restartDemo,mode,logout,pending,connected,connectionError
  } = useFamily();
  return (
    <div className="demo-toolbar">
      <div className="mode-label">
        <span className="pulse" />
        {' '}{mode==='server'?(connected?'СЕРВЕР · ДАННЫЕ СОХРАНЯЮТСЯ':'СЕРВЕР · ОБНОВЛЯЕМ СВЯЗЬ'):'ОФЛАЙН-ДЕМО · ДАННЫЕ ТОЛЬКО В БРАУЗЕРЕ'}{' '}
        <span className="toolbar-divider" />
        {' '}Одна семья · два мира
      </div>
      <button onClick={restartDemo} disabled={pending}>
        <RefreshCw size={14} />
        {mode==='server'?'Обновить':'Начать заново'}
      </button>
      {mode==='server'&&<button onClick={logout} disabled={pending}>Выйти</button>}
      {mode==='demo'&&<button onClick={logout}>Войти на сервер</button>}
      {connectionError&&<span role="alert">{connectionError}</span>}
    </div>
  );
}
export function RoleSwitcher() {
  const {
    role,
    state,
    changeRole,hasParent
  } = useFamily();
  return (
    <div
      className="mobile-role"
      aria-label="Режим приложения"
    >
      {hasParent&&<button
        className={
          role === 'parent'
            ? 'selected'
            : ''
        }
        onClick={() => changeRole('parent')}
      >
        <Users size={17} />
        Родитель
        {
          state.sos && <i />
        }
      </button>}
      <button
        className={
          role === 'child'
            ? 'selected'
            : ''
        }
        onClick={() => changeRole('child')}
      >
        <Sparkles size={17} />
        Ребёнок
      </button>
    </div>
  );
}
