import {before,test} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
let api,commands,views;
async function module(path){const r=await build({entryPoints:[fileURLToPath(new URL(path,import.meta.url))],bundle:true,write:false,format:'esm',platform:'node',target:'es2022'});return import('data:text/javascript;base64,'+Buffer.from(r.outputFiles[0].text).toString('base64'));}
before(async()=>{api=await module('../src/lib/api.ts');commands=await module('../src/lib/server/commands.ts');views=await module('../src/lib/server/view.ts');});
const child=()=>({profile:{id:'server-child-uuid',firstName:'Макс',age:15,cardBalance:45,mobyCoins:450,cardFrozen:false,dailyLimit:100,monthlyLimit:500,spentToday:0,spentMonth:0,activeMascotSkin:'SPACE_FOX',onlinePaymentsAllowed:true,belarusOnly:true,transfersAllowed:true,notificationsEnabled:true,cardLastFour:'1234'},spendingRules:[],sosRequests:[],chores:[],piggyBanks:[],capital18:null,splitBills:[],transactions:[],shop:[],allowances:[],academy:{lessons:[],level:1,totalLevels:8,xp:0,streak:0}});
const snapshot=c=>({family:{id:'family',familyName:'Семья',parentMainBalance:1500,heldBalance:5,availableBalance:1495,cashbackAccumulated:1.25},children:[c],qrPresets:[{id:'buffet',merchantName:'Школьный буфет',mccCategory:'5814',amount:4.5,receiptItems:[]}],serverTime:'2026-10-20T09:00:00Z'});
test('server snapshot maps exact cents, identity and holds without local seed balances',()=>{const c=child(),v=views.viewState(snapshot(c),c);assert.equal(v.balance,4500);assert.equal(v.availableAmount,149500);assert.equal(v.heldAmount,500);assert.equal(v.identity.childName,'Макс');assert.equal(v.identity.cardLastFour,'1234');assert.equal(v.goal,null);assert.equal(v.transactions.length,0);});
test('declined or pending records do not look like completed debits',()=>{const c=child();c.transactions=[{id:'t',merchantName:null,amount:52,paymentMethod:'QR_CODE',status:'PENDING_SOS',createdAt:'2026-10-20T09:00:00Z',detailsHidden:true}];const v=views.viewState(snapshot(c),c);assert.equal(v.transactions[0].amount,0);assert.match(v.transactions[0].title,/Приватная/);});
test('network retries reuse the same idempotency key and request body',async()=>{const original=globalThis.fetch,calls=[];globalThis.fetch=async(url,init)=>{calls.push({url,init});if(calls.length===1)throw new TypeError('offline');return Response.json({status:'COMPLETED'});};try{await api.request('/qr-payment/scan',{body:{amount:4.5},key:'test-retry-123',token:'token'});assert.equal(calls.length,2);assert.equal(calls[0].init.body,calls[1].init.body);assert.equal(calls[0].init.headers['Idempotency-Key'],calls[1].init.headers['Idempotency-Key']);}finally{globalThis.fetch=original;}});
test('authorization rejection is reported once without a local fallback',async()=>{const original=globalThis.fetch;let calls=0;globalThis.fetch=async()=>{calls++;return Response.json({code:'FORBIDDEN',message:'Нет прав'},{status:403});};try{await assert.rejects(api.request('/parent/top-up',{body:{amount:4.5},key:'test-no-retry'}),/Нет прав/);assert.equal(calls,1);}finally{globalThis.fetch=original;}});
test('payment uses server UUID, server receipt and child token',async()=>{const c=child(),s=snapshot(c),session={selectedChildId:c.profile.id,parentToken:{accessToken:'parent-token'},childToken:{accessToken:'child-token'},parentState:s,childState:s};const original=globalThis.fetch;let sent;globalThis.fetch=async(url,init)=>{sent={url,init};return Response.json({id:'t',status:'COMPLETED'});};try{await commands.sendCommand(session,'child',{type:'pay',preset:{id:'buffet',amount:999999,mcc:'demo-category'}});const body=JSON.parse(sent.init.body);assert.equal(body.childId,'server-child-uuid');assert.equal(body.amount,4.5);assert.equal(body.mccCategory,'5814');assert.equal(sent.init.headers.Authorization,'Bearer child-token');assert.ok(sent.init.headers['Idempotency-Key']);}finally{globalThis.fetch=original;}});
test('decline results have clear messages and are never successful payments',()=>{assert.match(commands.rejected({status:'DECLINED_MCC'}),/категория/);assert.equal(commands.rejected({status:'COMPLETED'}),null);});

test('scanned receipt sends exact merchant, MCC and items through child API',async()=>{
  const c=child(),s=snapshot(c),session={selectedChildId:c.profile.id,parentToken:null,
    childToken:{accessToken:'child-token'},parentState:null,childState:s};
  const original=globalThis.fetch;let sent;
  globalThis.fetch=async(url,init)=>{sent={url,init};return Response.json({status:'NEED_SOS_TOPUP'});};
  try {
    await commands.sendCommand(session,'child',{type:'pay',preset:{id:'scanned',title:'Соседи',
      subtitle:'Чек',amount:5200,mcc:'5411',emoji:'🧾',scanned:true,
      receiptItems:[{title:'Продукты',quantity:1,unitPrice:7},
        {title:'Канцелярия',quantity:1,unitPrice:45}]}});
    assert.match(sent.url,/\/qr-payment\/scan$/);
    const body=JSON.parse(sent.init.body);
    assert.equal(body.merchantName,'Соседи');
    assert.equal(body.mccCategory,'5411');
    assert.equal(body.amount,52);
    assert.equal(body.receiptItems.reduce((n,i)=>n+i.unitPrice*i.quantity,0),52);
    assert.equal(body.childId,c.profile.id);
    assert.equal(sent.init.headers.Authorization,'Bearer child-token');
  } finally { globalThis.fetch=original; }
});
