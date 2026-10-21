import type { Command,Role } from '../../domain/types';
import { request } from '../api';
import { serverChild } from './view';
import { tokenFor } from './session';
import type { ActionResult,RemoteSession } from './types';
export async function sendCommand(session:RemoteSession,role:Role,command:Command):Promise<ActionResult> {
  const token=tokenFor(session,role),child=serverChild(session,role);
  if(!token || !child)throw Error('Сначала войдите и выберите ребёнка');
  const childId=child.profile.id,p=child.profile,key=crypto.randomUUID();
  const post=(path:string,body?:unknown,method='POST')=>request<ActionResult>(path,{body,method,token:token.accessToken,key});
  switch(command.type) {
    case 'pay': {
      const source=(role==='parent'?session.parentState:session.childState)!;
      if (command.preset.scanned) {
        const receipt = command.preset;
        return post('/qr-payment/scan', {
          childId, merchantName: receipt.title, mccCategory: receipt.mcc,
          amount: receipt.amount / 100, receiptItems: receipt.receiptItems,
          secretGiftMode: false, countryCode: 'BY', online: false
        });
      }
      const preset=source.qrPresets.find(i=>i.id===command.preset.id);
      if(!preset)throw Error('QR-чек не найден на сервере');
      return post('/qr-payment/scan',{childId,merchantName:preset.merchantName,mccCategory:preset.mccCategory,amount:preset.amount,receiptItems:preset.receiptItems,secretGiftMode:false,countryCode:'BY',online:false});
    }
    case 'topup':return post('/parent/top-up',{childId,amount:command.amount/100});
    case 'sosApprove':case 'sosReject': {
      const sos=child.sosRequests.find(s=>s.status==='PENDING');if(!sos)throw Error('Нет активного SOS');
      return post(`/sos/${sos.id}/${command.type==='sosApprove'?'approve':'reject'}`);
    }
    case 'freeze':return post('/parent/card-freeze',{childId,frozen:!p.cardFrozen});
    case 'limits':return post('/parent/limits',{childId,dailyLimit:command.daily/100,monthlyLimit:command.monthly/100},'PATCH');
    case 'rule':return post('/parent/mcc-rules',{childId,categoryCode:command.key,blocked:!child.spendingRules.find(r=>r.categoryCode===command.key)?.blocked},'PATCH');
    case 'safety': {
      const settings={online:p.onlinePaymentsAllowed,belarus:p.belarusOnly,notifications:p.notificationsEnabled,transfers:p.transfersAllowed};
      if(!(command.key in settings))throw Error('Настройка не найдена');
      settings[command.key as keyof typeof settings]=!settings[command.key as keyof typeof settings];
      return post('/parent/safety-settings',{childId,onlinePaymentsAllowed:settings.online,belarusOnly:settings.belarus,notificationsEnabled:settings.notifications,transfersAllowed:settings.transfers},'PATCH');
    }
    case 'chore':return post('/chores',{childId,title:command.title,rewardByn:command.reward/100,rewardCoins:command.coins});
    case 'submit':return post(`/chores/${command.id}/submit`,{});
    case 'approve':return post(`/chores/${command.id}/approve`);
    case 'save': {
      const goal=child.piggyBanks[0];if(!goal)throw Error('Попросите родителя создать копилку в настройках семьи');
      return post(`/piggy/${goal.id}/deposit`,{amount:command.amount/100});
    }
    case 'quiz': {
      if(!command.answers)throw Error('Выберите ответ на серверный вопрос');
      return post('/gamification/quiz-complete',{childId,quizId:command.id,answers:command.answers});
    }
    case 'buy':return post(`/gamification/shop/${command.id}/buy`,{childId});
    case 'skin':return post(`/gamification/shop/${command.id}/activate`,{childId});
    case 'capital':return post('/deposits/capital18/configure',{childId,planType:child.capital18?.planType||'MONTHLY_500_PLUS_50',initialAmount:command.initial/100,parent1Monthly:command.monthly/100,parent2Monthly:0});
    case 'allowance':return post('/parent/allowances',{childId,amount:command.amount/100,dayOfMonth:command.day,active:true});
    case 'split':return post('/social/split-bill',{childId,payerChildId:command.payerChildId||null,friendName:command.friend,itemTitle:command.title,shareAmount:command.amount/100});
    case 'splitPay':return post(`/social/split-bill/${command.id}/pay`);
    case 'splitClose':return post(`/social/split-bill/${command.id}/close`);
    case 'ride':return post('/safety/panic-ride',{childId});
  }
}
export function rejected(result:ActionResult):string|null {
  const reasons:Record<string,string>={DECLINED_MCC:'Эта категория закрыта родителем.',DECLINED_FROZEN:'Карта на паузе. Родитель может её включить.',DECLINED_LIMIT:'Достигнут дневной или месячный лимит.',DECLINED_ONLINE:'Интернет-покупки запрещены.',DECLINED_COUNTRY:'Покупки разрешены только в Беларуси.',QUIZ_FAILED:'Ответ неверный. Попробуйте ещё раз.',EXPIRED:'Запрос истёк; создайте новую оплату.'};
  return reasons[result.status]||(result.status.startsWith('DECLINED')?'Оплата отклонена':null);
}
