import type { DemoState, Role, Preset } from '../../domain/types';
import type { LiveState, RemoteSession, ServerChild } from './types';
export const cents=(n:number)=>Math.round(n*100);
export function serverChild(s:RemoteSession, role:Role):ServerChild|null {
  const source=role==='parent'?s.parentState:s.childState;
  return source?.children.find(c=>c.profile.id===s.selectedChildId)||null;
}
export function viewState(source:LiveState, child:ServerChild):DemoState {
  const p=child.profile, goal=child.piggyBanks[0],deposit=child.capital18;
  const pending=child.sosRequests.find(s=>s.status==='PENDING'&&Date.parse(s.expiresAt)>Date.parse(source.serverTime));
  const allowance=child.allowances.find(a=>a.active);
  return {
    version:1,parent:cents(source.family.parentMainBalance??0),balance:cents(p.cardBalance),coins:p.mobyCoins,cashback:cents(source.family.cashbackAccumulated),frozen:p.cardFrozen,
    dailyLimit:cents(p.dailyLimit),monthlyLimit:cents(p.monthlyLimit),spentToday:cents(p.spentToday),spentMonth:cents(p.spentMonth),
    rules:Object.fromEntries(child.spendingRules.map(r=>[r.categoryCode,r.blocked])),safety:{online:p.onlinePaymentsAllowed,belarus:p.belarusOnly,transfers:p.transfersAllowed,notifications:p.notificationsEnabled},
    piggy:cents(goal?.currentAmount??0),target:cents(goal?.targetAmount??1),
    chores:child.chores.filter(c=>c.status!=='CANCELLED').map(c=>({id:c.id,title:c.title,reward:cents(c.rewardByn),coins:c.rewardCoins,status:c.status==='COMPLETED'?'done':c.status==='SUBMITTED_FOR_REVIEW'?'review':'assigned'})),
    transactions:child.transactions.map(t=>{
      const credit=['PARENT_TOPUP','SOS_TOPUP','CHORE_REWARD','ALLOWANCE','P2P_SPLIT_IN'].includes(t.paymentMethod);
      const done=t.status==='COMPLETED';
      return {id:t.id,title:(t.detailsHidden?'Приватная покупка':t.merchantName||'Операция')+(done?'':` · ${t.status==='PENDING_SOS'?'ожидает SOS':t.status==='EXPIRED'?'истекла':'не проведена'}`),
        amount:done?cents(t.amount)*(credit?1:-1):0,kind:t.paymentMethod==='PIGGY_DEPOSIT'?'saving':t.paymentMethod==='CHORE_REWARD'?'reward':credit?'topup':'payment',time:new Date(t.createdAt).toLocaleString('ru-RU',{timeZone:'Europe/Minsk',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})};
    }),
    sos:pending?{id:pending.id,title:pending.merchantName||'Приватная покупка',amount:cents(pending.totalQrAmount),mcc:'',expiresAt:Date.parse(pending.expiresAt)}:null,
    lessons:child.academy.lessons.filter(l=>l.completed).map(l=>l.id),owned:child.shop.filter(i=>i.owned).map(i=>i.id),skin:p.activeMascotSkin==='SPACE_FOX'?'space':'classic',
    allowance:cents(allowance?.amount??0),allowanceDay:allowance?.dayOfMonth??1,
    capital:{initial:cents(deposit?.initialDeposit??500),monthly:cents((deposit?.parent1Monthly??0)+(deposit?.parent2Monthly??0))},
    splits:child.splitBills.map(b=>({id:b.id,friend:b.friendName,title:b.itemTitle,amount:cents(b.shareAmount),paid:b.paid})),
    identity:{childName:p.firstName,age:p.age,cardLastFour:p.cardLastFour,parentName:source.family.familyName},
    heldAmount:source.family.heldBalance==null?undefined:cents(source.family.heldBalance),availableAmount:source.family.availableBalance==null?undefined:cents(source.family.availableBalance),
    goal:goal?{id:goal.id,title:goal.title,match:goal.parentMatchPercent,opponentName:goal.opponentName,opponentProgress:cents(goal.opponentProgress),battle:goal.battle}:null,
  };
}
export function serverPresets(source:LiveState):Preset[] {
  return source.qrPresets.filter(p=>!['7994','5816'].includes(p.mccCategory)).map(p=>({id:p.id,title:p.merchantName,subtitle:p.receiptItems.map(i=>i.title).join(', '),amount:cents(p.amount),mcc:p.mccCategory,emoji:p.mccCategory==='5942'?'📚':['5812','5814'].includes(p.mccCategory)?'🥪':'🛍️'}));
}
