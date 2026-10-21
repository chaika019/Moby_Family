import {usePhone} from '../../app/PhoneProvider';
import {formatMoney,parseMoney} from '../../lib/demo';
import {apiError} from '../../lib/api';
import {MoneyInput,SectionTitle,Empty} from '../../components/ui';
export function SplitBillSheet(){
 const {state,executeCommand,notify,role,child,live,session}=usePhone();
 const others=live?.children.filter(c=>c.profile.id!==session?.selectedChildId)||[];
 return <><p className="sheet-description">Разделите покупку с ребёнком этой семьи или сохраните договорённость с другом.</p>
 <form onSubmit={async e=>{e.preventDefault();const form=e.currentTarget,data=new FormData(form);try{
   if(await executeCommand({type:'split',friend:String(data.get('friend')),title:String(data.get('title')),amount:parseMoney(String(data.get('amount'))),payerChildId:String(data.get('payer')||'')||undefined},'Договорённость сохранена'))form.reset();
 }catch(error){notify(role,apiError(error),true);}}}>
  <label className="field">Имя друга<input name="friend" required maxLength={100}/></label><label className="field">На что скидываемся?<input name="title" required maxLength={150}/></label>
  {!!others.length&&<label className="field">Кто оплатит долю?<select name="payer"><option value="">Друг вне приложения — только договорённость</option>{others.map(p=><option key={p.profile.id} value={p.profile.id}>{p.profile.firstName}</option>)}</select></label>}
  <MoneyInput label="Доля друга" defaultValue="5"/><button className="button full">Создать договорённость</button>
 </form><SectionTitle>Наши договорённости</SectionTitle>
 {state.splits.length?state.splits.map(b=>{const server=child?.splitBills.find(x=>x.id===b.id);const canPay=server?.payerChildId===child?.profile.id&&!!server?.payerChildId;const canClose=!server?.payerChildId;return <div className="split-item" key={b.id}>
 <span><strong>{b.friend} · {b.title}</strong><small>{formatMoney(b.amount)} BYN · {b.paid?'Закрыто':'Ожидает'}</small></span>
 <button className="small-button" disabled={b.paid||(!canPay&&!canClose)} onClick={()=>void executeCommand({type:canPay?'splitPay':'splitClose',id:b.id},canPay?'Доля оплачена':'Договорённость закрыта без перевода')}>{b.paid?'Закрыто':canPay?'Оплатить долю':canClose?'Закрыть':'Ждём оплату'}</button>
 </div>}):<Empty>Здесь появятся совместные планы</Empty>}
 <p className="form-note">Перевод выполняется только между участниками этой семьи. Закрытие внешней договорённости деньги не переводит.</p></>;
}
