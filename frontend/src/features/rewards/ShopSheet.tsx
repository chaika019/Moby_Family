import {usePhone} from '../../app/PhoneProvider';
import {Coins} from 'lucide-react';
export function ShopSheet(){
 const {state,executeCommand,shop,child}=usePhone();
 return <><div className="shop-wallet"><Coins/><strong>{state.coins}</strong><span>Moby Coins</span></div><p className="sheet-description">Награды за знания и семейные дела.</p>
 <div className="shop-list">{shop.map(item=>{
   const serverItem=child?.shop.find(i=>i.id===item.id),owned=state.owned.includes(item.id);
   const isSkin=serverItem?['MASCOT_SKIN','CARD_SKIN','PAY_SOUND'].includes(serverItem.itemType):item.id==='space';
   return <div className="shop-card" key={item.id}><span>{item.emoji}</span><div><strong>{item.title}</strong><small>{item.description}</small>
    <button className="small-button" disabled={owned&&!isSkin} onClick={()=>{
      if(owned)void executeCommand({type:'skin',id:serverItem?item.id:state.skin===item.id?'classic':item.id},'Награда активирована');
      else void executeCommand({type:'buy',id:item.id,cost:item.cost},'Награда открыта!');
    }}>{owned?isSkin?'Активировать':'Уже твоя':<>{item.cost} <Coins size={14}/></>}</button>
   </div></div>;
 })}</div><p className="form-note">Moby Coins — игровые награды, отдельно от BYN. Покупка сохраняется в профиле ребёнка.</p></>;
}
