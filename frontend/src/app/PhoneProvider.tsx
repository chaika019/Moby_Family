import {createContext,useCallback,useContext,useState,type ReactNode} from 'react';
import {apiError} from '../lib/api';
import type {Command,Role,Tab,Preset} from '../lib/demo';
import {useFamily} from './FamilyProvider';
import type {Modal,ModalKind,SubmitForm} from './types';
import {serverChild,serverPresets} from '../lib/server/view';
import {lessons as localLessons} from '../data/lessons';
import {shop as localShop} from '../data/rewards';
import {Wallet,Coins,ShieldCheck,ShoppingBag,Trophy} from 'lucide-react';
function usePhoneController(role:Role) {
 const family=useFamily(),state=family.stateFor(role);
 const [tab,navigate]=useState<Tab>('home'),[dialog,setDialog]=useState<Modal>(null),[lessonId,selectLesson]=useState('budget');
 const closeModal=useCallback(()=>setDialog(null),[]),openModal=useCallback((kind:ModalKind)=>setDialog(kind),[]);
 const executeCommand=async(command:Command,message?:string)=>Boolean(await family.run(role,command,message));
 const pay=(preset:Preset)=>family.run(role,{type:'pay',preset});
 const submitForm:SubmitForm=async(event,action)=>{
   event.preventDefault();const data=new FormData(event.currentTarget);
   try {if(await action(data))closeModal();}catch(e){family.notify(role,apiError(e),true);}
 };
 const child=family.session?serverChild(family.session,role):null;
 const source=role==='parent'?family.session?.parentState:family.session?.childState;
 const icons=[Wallet,Coins,ShieldCheck,ShoppingBag,Trophy];
 const lessons=child?child.academy.lessons.map((l,i)=>({id:l.id,title:l.title,description:l.explanation,icon:icons[i%icons.length]})):localLessons;
 const shop=child?child.shop.map(i=>({id:i.id,title:i.title,description:i.rarity,cost:i.costCoins,emoji:i.itemType==='PAY_SOUND'?'🎵':i.itemType==='PARENT_CUSTOM_PERK'?'🎮':'🦊'})):localShop;
 const presets=source?serverPresets(source):undefined;
 const missing=state.sos?Math.max(0,state.sos.amount-state.balance):0;
 return {...family,state,role,isChild:role==='child',tab,navigate,dialog,openModal,closeModal,lessonId,selectLesson,executeCommand,pay,submitForm,missing,
   toast:family.toast?.role===role?family.toast:null,child,lessons,shop,presets,
   childName:state.identity?.childName||'Никита',parentName:state.identity?.parentName||'Алексей',childAge:state.identity?.age||11,cardLastFour:state.identity?.cardLastFour||'9130'};
}
const PhoneContext=createContext<ReturnType<typeof usePhoneController>|null>(null);
export function PhoneProvider({role,children}:{role:Role;children:ReactNode}){const value=usePhoneController(role);return <PhoneContext.Provider value={value}>{children}</PhoneContext.Provider>;}
export function usePhone(){const c=useContext(PhoneContext);if(!c)throw Error('PhoneProvider required');return c;}
