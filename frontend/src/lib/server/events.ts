import { ApiError, baseURL } from '../api';
/** Header-authenticated SSE. Cursor survives reconnects within this session. */
export async function subscribe(token:string, signal:AbortSignal, update:()=>void, status:(connected:boolean)=>void, expired:()=>void) {
  let cursor = '', delay=500;
  while(!signal.aborted) {
    try {
      const response = await fetch(baseURL+'/family/events',{headers:{Authorization:`Bearer ${token}`,Accept:'text/event-stream',...(cursor?{'Last-Event-ID':cursor}:{})},signal});
      if(response.status===401) { expired();return; }
      if(!response.ok || !response.body) throw new ApiError('Нет потока событий');
      status(true);delay=500;
      const reader=response.body.getReader(), decoder=new TextDecoder();let buffer='';
      try {
        while(!signal.aborted) {
          const {value,done}=await reader.read();if(done)break;
          buffer+=decoder.decode(value,{stream:true}).replace(/\r/g,'');
          if(buffer.length>65536)throw Error('Неверный поток событий');
          let end:number;
          while((end=buffer.indexOf('\n\n'))>=0) {
            const frame=buffer.slice(0,end);buffer=buffer.slice(end+2);
            const lines=frame.split('\n');
            const id=lines.find(l=>l.startsWith('id:'))?.slice(3).trim();if(id)cursor=id;
            if(lines.some(l=>l.startsWith('data:')))update();
          }
        }
      } finally { await reader.cancel().catch(()=>{});reader.releaseLock(); }
    } catch { /* Reconnect with the last confirmed event id. */ }
    if(signal.aborted)return;
    status(false);
    await new Promise<void>(resolve=>{
      const finish=()=>{clearTimeout(timer);signal.removeEventListener('abort',finish);resolve();};
      const timer=setTimeout(finish,delay);signal.addEventListener('abort',finish,{once:true});
    });
    delay=Math.min(delay*2,10000);
  }
}
