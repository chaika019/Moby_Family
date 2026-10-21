import {type DemoState,parseMoney} from '../../lib/demo';
import type {ServerChild} from '../../lib/server/types';
import {useState} from 'react';
import {formatMoney} from '../../lib/demo';
export function CapitalForm({state,onSubmit,plan}:{state:DemoState;onSubmit:(initial:number,monthly:number)=>void|Promise<void>;plan?:ServerChild['capital18']}){
 const [initial,setInitial]=useState(String(state.capital.initial/100)),[monthly,setMonthly]=useState(String(state.capital.monthly/100));
 const years=Math.max(0,18-(state.identity?.age??11)),rate=.115/12,months=years*12;
 const first=Number(initial.replace(',','.')),month=Number(monthly.replace(',','.'));
 const estimate=first*Math.pow(1+rate,months)+month*(Math.pow(1+rate,months)-1)/rate;
 const saved=!!plan&&first===plan.initialDeposit&&month===plan.parent1Monthly+plan.parent2Monthly;
 const valid=Number.isFinite(estimate)&&first>0&&month>=0;
 return <form onSubmit={e=>{e.preventDefault();if(valid)void onSubmit(parseMoney(initial),month===0?0:parseMoney(monthly));}}>
 <div className="capital-intro"><span>🌱</span><h3>Капитал 18</h3><p>План накоплений к совершеннолетию</p></div>
 {plan&&<div className="tip"><span>Уже накоплено: <b>{formatMoney(Math.round((plan.currentBalance+plan.bufferBalance)*100))} BYN</b><small>Включая буфер ежемесячных взносов</small></span></div>}
 <label className="field">Первый взнос, BYN<input required inputMode="decimal" readOnly={!!plan} value={initial} onChange={e=>setInitial(e.target.value)} maxLength={10} pattern="[0-9]{1,7}([.,][0-9]{1,2})?"/></label>
 <label className="field">Каждый месяц, BYN<input required inputMode="decimal" value={monthly} onChange={e=>setMonthly(e.target.value)} maxLength={10} pattern="[0-9]{1,7}([.,][0-9]{1,2})?"/></label>
 <div className="capital-projection"><small>{saved?'ПРОГНОЗ СЕРВЕРА':'ПРЕДВАРИТЕЛЬНЫЙ РАСЧЁТ'} К 18 ГОДАМ</small><strong>{valid?Math.round(saved?plan!.projectedFinalAmount:estimate).toLocaleString('ru-RU'):'—'} <span>BYN</span></strong><small>Ставка 11,5% · капитализация ежемесячно</small></div>
 <p className="form-note">{plan?'Стартовый взнос уже внесён; сохраняются будущие ежемесячные взносы.':'При открытии плана стартовый взнос списывается с семейного кошелька.'} Все средства виртуальные.</p>
 <button className="button full" disabled={!valid}>Сохранить план</button>
 </form>;
}
