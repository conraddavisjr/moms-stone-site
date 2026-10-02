import {isWonderCardId} from '@/content/wonder-cards';
type Options={fetcher?:typeof fetch;timeoutMs?:number};
export class WonderCardConflict extends Error{constructor(message:string,public cardId:number){super(message);this.name='WonderCardConflict'}}
// Bounded like the bag request: an uncertain response is reported, never silently retried.
async function request(init:RequestInit,{fetcher=fetch,timeoutMs=12000}:Options):Promise<number|null>{
 const controller=new AbortController();let timer:ReturnType<typeof setTimeout>|undefined;
 const run=(async()=>{
  const r=await fetcher('/api/wonder-card',{...init,signal:controller.signal,redirect:'error'});
  const data=await r.json() as {cardId?:unknown;error?:unknown};
  if(r.status===409&&isWonderCardId(data.cardId))throw new WonderCardConflict(typeof data.error==='string'?data.error:'A Wonder Card is already yours.',data.cardId);
  if(!r.ok)throw Error(typeof data.error==='string'?data.error:'Your Wonder Card could not be kept. Please try again.');
  if(data.cardId===null)return null;
  if(!isWonderCardId(data.cardId))throw Error('Your Wonder Card could not be confirmed. Please try again.');
  return data.cardId;
 })();
 const deadline=new Promise<never>((_,reject)=>{timer=setTimeout(()=>{reject(Error('Your Wonder Card could not be confirmed. Please check again in a moment.'));controller.abort()},timeoutMs)});
 try{return await Promise.race([run,deadline])}finally{clearTimeout(timer)}
}
export function readWonderCard(options:Options={}){return request({method:'GET'},options)}
export function acceptWonderCard(cardId:number,options:Options={}){return request({method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cardId})},options)}
