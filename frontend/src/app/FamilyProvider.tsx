import { createContext,useCallback,useContext,useEffect,useRef,useState,type ReactNode } from 'react';
import { useFamilyStore } from '../hooks/useFamilyStore';
import { ApiError,apiError,request } from '../lib/api';
import type { Command,Role } from '../lib/demo';
import type { ActionResult,LiveState,RemoteSession } from '../lib/server/types';
import { loginParent,loginChild,selectChild,refreshSession } from '../lib/server/session';
import { sendCommand,rejected } from '../lib/server/commands';
import { serverChild,viewState } from '../lib/server/view';
import { subscribe } from '../lib/server/events';
import type { Notify,ToastMessage } from './types';
function useFamilyController() {
  const local=useFamilyStore();
  const [mode,setMode]=useState<'login'|'demo'|'server'>(()=>location.protocol==='file:'?'demo':'login');
  const [role,setRole]=useState<Role>('child');
  function changeRole(r:Role){if(r==='parent'&&mode==='server'&&!remote.current?.parentToken)return;setRole(r);}
  const [toast,setToast]=useState<ToastMessage|null>(null);
  const [session,setSession]=useState<RemoteSession|null>(null);
  const remote=useRef<RemoteSession|null>(null),generation=useRef(0),pendingRef=useRef(false);
  const [pending,setPending]=useState(false),[connected,setConnected]=useState(false),[connectionError,setConnectionError]=useState('');
  const refreshQueue=useRef<Promise<void>>(Promise.resolve());
  const notify:Notify=useCallback((role,text,error=false)=>setToast({role,text,error}),[]);
  useEffect(()=>{if(!toast)return;const timer=setTimeout(()=>setToast(null),4500);return()=>clearTimeout(timer);},[toast]);
  const publish=useCallback((s:RemoteSession)=>{remote.current=s;setSession(s);},[]);
  const logout=useCallback(()=>{generation.current++;remote.current=null;setSession(null);setConnected(false);setMode('login');},[]);
  const refresh=useCallback(async()=>{
    const version=generation.current;
    const task=refreshQueue.current.catch(()=>{}).then(async()=>{
      if(version!==generation.current||!remote.current)return;
      const next=await refreshSession(remote.current);
      if(version===generation.current){publish(next);setConnectionError('');}
    });
    refreshQueue.current=task;
    try { await task; }
    catch(error) {
      if(version!==generation.current)return;
      setConnectionError(apiError(error));
      if(error instanceof ApiError&&error.status===401){logout();setConnectionError('Сеанс истёк. Войдите снова.');}
      throw error;
    }
  },[publish,logout]);
  useEffect(()=>{
    if(mode!=='server'||!session)return;
    const auth=session.parentToken||session.childToken;if(!auth)return;
    const abort=new AbortController();
    const update=()=>{void refresh().catch(()=>{});};
    void subscribe(auth.accessToken,abort.signal,update,setConnected,()=>{logout();setConnectionError('Сеанс истёк. Войдите снова.');});
    const timer=setInterval(update,20000);window.addEventListener('focus',update);
    return()=>{abort.abort();clearInterval(timer);window.removeEventListener('focus',update);};
  },[mode,session?.parentToken?.accessToken,session?.childToken?.accessToken,refresh,logout]);
  async function exclusive<T>(action:()=>Promise<T>):Promise<T> {
    if(pendingRef.current)throw Error('Дождитесь завершения текущей операции');
    pendingRef.current=true;setPending(true);
    try {return await action();}finally{pendingRef.current=false;setPending(false);}
  }
  async function signIn(email:string,password:string,familyName?:string) {
    return exclusive(async()=>{
      const next=await loginParent(email,password,familyName);
      generation.current++;publish(next);setMode('server');setConnectionError('');
    });
  }
  async function signInChild(code:string) {
    return exclusive(async()=>{const next=await loginChild(code);generation.current++;publish(next);setMode('server');changeRole('child');setConnectionError('');});
  }
  async function switchChild(id:string) {
    return exclusive(async()=>{
      if(!remote.current)return;
      const next=await selectChild(remote.current,id);generation.current++;publish(next);
    });
  }
  async function mutate(role:Role,path:string,body?:unknown,method='POST'):Promise<ActionResult> {
    return exclusive(async()=>{
      const s=remote.current,auth=role==='parent'?s?.parentToken:s?.childToken;
      if(!auth)throw Error('Требуется вход соответствующей роли');
      const result=await request<ActionResult>(path,{body,method,key:crypto.randomUUID(),token:auth.accessToken});
      try{await refresh();}catch{notify(role,'Изменение сохранено, обновляем состояние после восстановления связи.',true);}
      return result;
    });
  }
  function manage(path:string,body?:unknown,method='POST'){return mutate('parent',path,body,method);}
  async function addChild(firstName:string,age:number) {
    return exclusive(async()=>{
      const s=remote.current;if(!s?.parentToken)throw Error('Требуется вход родителя');
      const result=await request<{childId:string}>('/onboarding/child',{body:{firstName,age},token:s.parentToken.accessToken});
      const next=await refreshSession(s);const selected=await selectChild(next,result.childId);generation.current++;publish(selected);
    });
  }
  async function run(r:Role,command:Command,message?:string):Promise<ActionResult|null> {
    try {
      return await exclusive(async()=>{
        if(mode==='demo') {
          const next=local.runCommand(command);
          if(message)notify(r,message);
          return {id:'local',status:command.type==='pay'&&next.sos?'NEED_SOS_TOPUP':'COMPLETED',amount:null,missingAmount:null,projectedFinalAmount:null,detail:null};
        }
        const s=remote.current;if(mode!=='server'||!s)throw Error('Сначала войдите в приложение');
        const result=await sendCommand(s,r,command);
        // A committed command is never replayed merely because the following read failed.
        try {
          await refresh();
        } catch {
          notify(r, 'Операция обработана сервером. Обновите состояние после восстановления связи.', true);
          return null;
        }
        const reason=rejected(result);if(reason){notify(r,reason,true);return null;}
        if(message)notify(r,message.replace('сохранено в демо','сохранено на сервере'));
        return result;
      });
    } catch(error){notify(r,apiError(error),true);if(error instanceof ApiError&&error.status===401)logout();return null;}
  }
  function startDemo(){logout();setConnectionError('');setMode('demo');}
  function restartDemo(){if(mode==='demo'){local.reset();notify(role,'Демо начато заново');}else void refresh().catch(()=>{});}
  function stateFor(r:Role){const s=session,source=r==='parent'?s?.parentState:s?.childState;const child=s?serverChild(s,r):null;return mode==='server'&&source&&child?viewState(source,child):local.state;}
  const hasParent=mode==='demo'||!!session?.parentToken;
  const source:LiveState|null=session?.parentState||session?.childState||null;
  return {mode,role,changeRole,toast,notify,run,session,live:source,state:stateFor(role),stateFor,pending,connected,connectionError,hasParent,
    signIn,signInChild,switchChild,addChild,manage,mutate,logout,startDemo,restartDemo,refresh};
}
const FamilyContext=createContext<ReturnType<typeof useFamilyController>|null>(null);
export function FamilyProvider({children}:{children:ReactNode}) {const value=useFamilyController();return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>;}
export function useFamily(){const c=useContext(FamilyContext);if(!c)throw Error('FamilyProvider required');return c;}
