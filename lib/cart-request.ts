export type CartItems=Record<string,number>;
type Options={fetcher?:typeof fetch;timeoutMs?:number};
export class CartRequestTimeout extends Error {
 constructor(){super('Your bag update could not be confirmed. Please check My Bag before trying again.');this.name='CartRequestTimeout'}
}
// Bound the entire response, including JSON parsing—not only the response headers.
async function requestCart(init:RequestInit,{fetcher=fetch,timeoutMs=12000}:Options):Promise<CartItems>{
 const controller=new AbortController();let timer:ReturnType<typeof setTimeout>|undefined;
 const request=(async()=>{
  const r=await fetcher('/api/cart',{...init,signal:controller.signal,redirect:'error'});
  const data:unknown=await r.json();
  if(!r.ok)throw Error(data&&typeof data==='object'&&'error' in data&&typeof data.error==='string'?data.error:'Could not save your bag. Please try again.');
  const items=data&&typeof data==='object'&&'items' in data?data.items:null;
  if(!items||typeof items!=='object'||Array.isArray(items)||Object.values(items).some(n=>typeof n!=='number'||!Number.isInteger(n)||n<0))throw Error('Your bag update could not be confirmed. Please check My Bag before trying again.');
  return items as CartItems;
 })();
 const deadline=new Promise<never>((_,reject)=>{timer=setTimeout(()=>{reject(new CartRequestTimeout());controller.abort()},timeoutMs)});
 try{return await Promise.race([request,deadline])}finally{clearTimeout(timer)}
}
export function updateBag(productId:string,delta:number,options:Options={}){return requestCart({method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({productId,delta})},options)}
export function readBag(options:Options={}){return requestCart({method:'GET'},options)}
