import {useEffect,useState,type FormEvent} from 'react';
import {useFamily} from '../../app/FamilyProvider';
import {apiError,request} from '../../lib/api';
import {Brand} from '../../components/ui';
export function ConnectionSheet() {
 const family=useFamily();
 const [kind,setKind]=useState<'login'|'register'|'child'>('login'),[error,setError]=useState(''),[code,setCode]=useState('');
 useEffect(()=>setCode(''),[family.session?.selectedChildId]);
 async function form(event:FormEvent<HTMLFormElement>,action:(data:FormData)=>Promise<unknown>) {
   event.preventDefault();const data=new FormData(event.currentTarget);setError('');try{await action(data);}catch(e){setError(apiError(e));}
 }
 if(family.mode!=='server')return <div className="connection-panel">
   <Brand/><h2>Вся семья на связи</h2><p>Войдите, чтобы балансы, покупки и задания сохранялись в приложении.</p>
   <div className="preset-amounts">{(['login','register','child'] as const).map(k=><button key={k} type="button" aria-pressed={kind===k} onClick={()=>{setKind(k);setError('');}}>{k==='login'?'Вход родителя':k==='register'?'Новая семья':'Вход ребёнка'}</button>)}</div>
   {kind==='child'?<form onSubmit={e=>form(e,d=>family.signInChild(String(d.get('code'))))}>
     <label className="field">Одноразовый код от родителя<input name="code" required autoComplete="off" maxLength={100}/></label>
     <p className="form-note">Родитель выдаёт код в настройках семьи. Он действует 5 минут и используется один раз.</p>
     <button className="button full" disabled={family.pending}>Войти ребёнком</button>
   </form>:<form onSubmit={e=>form(e,d=>family.signIn(String(d.get('email')),String(d.get('password')),kind==='register'?String(d.get('familyName')):undefined))}>
     {kind==='register'&&<label className="field">Название семьи<input name="familyName" required maxLength={100}/></label>}
     <label className="field">Email<input name="email" type="email" required autoComplete="username" defaultValue={kind==='login'?'parent@moby.local':''}/></label>
     <label className="field">Пароль<input name="password" type="password" required minLength={kind==='register'?10:1} autoComplete={kind==='register'?'new-password':'current-password'}/></label>
     {kind==='login'&&<details className="form-note"><summary>Данные тестовой семьи</summary><p>parent@moby.local · demo-parent-2026!</p></details>}
     <button className="button full" disabled={family.pending}>{family.pending?'Подключаемся…':kind==='register'?'Создать семью':'Войти в семью'}</button>
   </form>}
   {(error||family.connectionError)&&<p role="alert" className="connection-error">{error||family.connectionError}</p>}
   <button className="text-button full" onClick={family.startDemo}>Попробовать локальное демо</button>
 </div>;
 const session=family.session!,selected=session.selectedChildId;
 return <div className="connection-panel">
   <h2>{family.live?.family.familyName}</h2><p>{family.connected?'Обновления в реальном времени включены':'Восстанавливаем соединение; доступно обновление вручную'}</p>
   {family.connectionError&&<p role="alert" className="connection-error">{family.connectionError}</p>}
   {family.hasParent&&<>
     {!!family.live?.children.length&&<label className="field">Ребёнок<select aria-label="Выбрать ребёнка" value={selected||''} disabled={family.pending} onChange={e=>{setError('');void family.switchChild(e.target.value).catch(e=>setError(apiError(e)));}}>{family.live.children.map(c=><option key={c.profile.id} value={c.profile.id}>{c.profile.firstName} · {c.profile.age} лет</option>)}</select></label>}
     <details open={!selected}><summary>Добавить ребёнка</summary><form onSubmit={e=>form(e,d=>family.addChild(String(d.get('name')),Number(d.get('age'))))}>
       <label className="field">Имя ребёнка<input name="name" required maxLength={80}/></label><label className="field">Возраст<input name="age" type="number" min="7" max="17" required defaultValue="11"/></label><button className="button full" disabled={family.pending}>Добавить ребёнка</button>
     </form></details>
     <details><summary>Пополнить виртуальный кошелёк</summary><form onSubmit={e=>form(e,d=>family.manage('/parent/wallet/fund',{amount:Number(String(d.get('amount')).replace(',','.'))}))}>
       <label className="field">Сумма, BYN<input name="amount" inputMode="decimal" required pattern="[0-9]+([.,][0-9]{1,2})?" defaultValue="100"/></label><button className="button full" disabled={family.pending}>Добавить виртуальные средства</button>
     </form></details>
     {selected&&<>
       <button className="button secondary full" disabled={family.pending} onClick={async()=>{try{const result=await request<{qrAuthToken:string}>(`/parent/children/${selected}/login-qr`,{method:'POST',token:session.parentToken!.accessToken});setCode(result.qrAuthToken);}catch(e){setError(apiError(e));}}}>Выдать код входа ребёнку</button>
       {code&&<label className="field">Одноразовый код на 5 минут<input readOnly value={code} aria-label="Код входа ребёнка" onFocus={e=>e.currentTarget.select()}/></label>}
       {!family.live?.children.find(c=>c.profile.id===selected)?.piggyBanks.length&&<details><summary>Создать копилку</summary><form onSubmit={e=>form(e,d=>family.manage('/piggy',{childId:selected,title:String(d.get('title')),targetAmount:Number(d.get('target')),parentMatchPercent:50}))}>
         <label className="field">Название цели<input name="title" required defaultValue="На мечту"/></label><label className="field">Цель, BYN<input name="target" type="number" min="1" required defaultValue="300"/></label><button className="button full" disabled={family.pending}>Создать копилку</button>
       </form></details>}
     </>}
   </>}
   {error&&<p role="alert" className="connection-error">{error}</p>}
   <button className="button secondary full" disabled={family.pending} onClick={()=>void family.refresh().catch(e=>setError(apiError(e)))}>Обновить состояние</button>
   <button className="text-button full" disabled={family.pending} onClick={family.logout}>Выйти из семьи</button>
   <p className="form-note">Средства виртуальные. Данные хранятся на сервере; подключения к МТБанку нет.</p>
 </div>;
}
export function ConnectionGate(){return <main className="connection-gate"><ConnectionSheet/></main>;}
