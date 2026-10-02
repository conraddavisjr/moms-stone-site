"use client";
import {useEffect,useLayoutEffect,useReducer,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import WonderCardFace from './wonder-card-face';
import CosmicSky from './cosmic-sky';
import {wonderCards,wonderCard,wonderCardName,wonderCopy} from '@/content/wonder-cards';
import {acceptWonderCard,WonderCardConflict} from '@/lib/wonder-card-request';

// Ritual flow: arrival → procession → reveal → (leaving → procession) | (accepting → accepted).
// Business state (the accepted card) lives with the storefront; this reducer only owns the ritual.
type Phase='arrival'|'procession'|'reveal'|'leaving'|'accepting'|'accepted';
type State={phase:Phase;selected:number|null;error:string};
type Action={type:'begin'}|{type:'select';id:number}|{type:'part'}|{type:'parted'}|{type:'accept'}|{type:'failed';error:string}|{type:'accepted'};
function ritual(s:State,a:Action):State{
 switch(a.type){
  case 'begin':return s.phase==='arrival'?{...s,phase:'procession'}:s;
  case 'select':return s.phase==='procession'?{phase:'reveal',selected:a.id,error:''}:s;
  case 'part':return s.phase==='reveal'?{...s,phase:'leaving'}:s;
  case 'parted':return s.phase==='leaving'?{phase:'procession',selected:null,error:''}:s;
  case 'accept':return s.phase==='reveal'?{...s,phase:'accepting',error:''}:s;
  case 'failed':return s.phase==='accepting'?{...s,phase:'reveal',error:a.error}:s;
  case 'accepted':return s.phase==='accepting'?{...s,phase:'accepted'}:s;
 }
}
function shuffled(){const ids=wonderCards.filter(c=>c.status==='locked').map(c=>c.id);for(let i=ids.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]]}return ids}
// Deterministic small variations so the procession feels carried, not gridded.
const lift=(id:number)=>Math.sin(id*1.7)*14,tilt=(id:number)=>Math.sin(id*2.3)*1.6,depth=(id:number)=>.94+((id*7)%5)*.015;

type Props={reduced:boolean;onAccepted:(id:number)=>void;onLanded:()=>void;onConflict:(id:number)=>void;track:(type:string,productId?:string)=>void};
export default function WonderRitual({reduced,onAccepted,onLanded,onConflict,track}:Props){
 const [state,dispatch]=useReducer(ritual,{phase:'arrival',selected:null,error:''});
 const [order]=useState(shuffled);
 const viewport=useRef<HTMLDivElement>(null),cards=useRef<Map<number,HTMLButtonElement>>(new Map());
 const hero=useRef<HTMLDivElement>(null),stage=useRef<HTMLDivElement>(null);
 const motion=useRef({x:0,v:0,seek:null as number|null,w:300,gap:330,width:1000,hover:false,entered:false});
 const restoringFocus=useRef(false);
 const accepting=useRef(false),returnFocus=useRef<number|null>(null);
 // After parting ways, give focus back to the card once the procession is interactive again.
 useEffect(()=>{if(state.phase!=='procession'||returnFocus.current===null)return;restoringFocus.current=true;cards.current.get(returnFocus.current)?.focus({preventScroll:true});restoringFocus.current=false;returnFocus.current=null},[state.phase]);
 const [announce,setAnnounce]=useState('');
 const phaseRef=useRef<Phase>('arrival');
 useEffect(()=>{phaseRef.current=state.phase},[state.phase]);

 // Arrival: let the sky settle before the cards are carried in.
 // If the page opens in a background tab, wait until it is seen.
 useEffect(()=>{let t:ReturnType<typeof setTimeout>|undefined;const start=()=>{if(document.hidden||t)return;t=setTimeout(()=>{dispatch({type:'begin'});track('wonder_card_experience_started')},reduced?150:1300)};
  start();document.addEventListener('visibilitychange',start);return()=>{document.removeEventListener('visibilitychange',start);clearTimeout(t)}},[reduced,track]);

 // The procession. Positions are written straight to transforms in one rAF loop (no React renders).
 useEffect(()=>{
  if(reduced)return;const el=viewport.current;if(!el)return;const m=motion.current;
  const measure=()=>{m.width=el.clientWidth;m.w=Math.round(1.12*(m.width<600?Math.min(m.width*.8,360):Math.min(Math.max(m.width*.24,240),400)));m.gap=Math.round(m.w*(m.width<600?1.08:1.12));el.style.setProperty('--wc-w',`${m.w}px`)};
  measure();m.x=m.width+24;const ro=new ResizeObserver(measure);ro.observe(el);
  let raf=0,last=performance.now();
  const frame=(now:number)=>{
   const dt=Math.min((now-last)/1000,.15);last=now;const phase=phaseRef.current;
   if(phase==='arrival'){m.v=0}
   else if(m.seek!==null){m.x+=(m.seek-m.x)*Math.min(1,dt*6);m.v=0}
   else{
    // Enter with momentum, then ease into a slow, graceful procession.
    if(!m.entered){m.entered=true;m.v=m.width<600?1500:2400}
    const cruise=m.width<600?34:46,goal=phase==='leaving'?cruise:phase==='procession'?(m.hover?10:cruise):5;
    m.v+=(goal-m.v)*(1-Math.exp(-dt/(m.v>goal?.8:1.6)));m.x-=m.v*dt}
   el.dataset.speed=m.v.toFixed(1);
   const total=order.length*m.gap;
   // Endless loop: keep the offset within one full cycle (positions are modulo the deck, so nothing moves).
   if(m.seek===null&&m.entered&&m.x< -total)m.x+=total;
   order.forEach((id,k)=>{const c=cards.current.get(id);if(!c)return;
    // A card returns to the right only after it has fully left on the left.
    let p=k*m.gap+m.x;if(p<-m.gap)p=((p+m.gap)%total+total)%total-m.gap;
    c.style.transform=`translate3d(${p.toFixed(1)}px,${lift(id).toFixed(1)}px,0) rotate(${tilt(id).toFixed(2)}deg) scale(${depth(id)})`});
   raf=requestAnimationFrame(frame)};
  raf=requestAnimationFrame(frame);
  return()=>{cancelAnimationFrame(raf);ro.disconnect()}
 },[reduced,order]);

 function select(id:number){if(phaseRef.current!=='procession')return;motion.current.seek=null;dispatch({type:'select',id});setAnnounce(`${wonderCardName(id)} selected.`);track('wonder_card_selected',`wonder-card-${id}`)}
 function focusCard(id:number){if(reduced||restoringFocus.current)return;const m=motion.current,c=cards.current.get(id);if(!c)return;const r=c.getBoundingClientRect(),box=viewport.current!.getBoundingClientRect();m.seek=m.x+(box.left+box.width/2)-(r.left+r.width/2)}

 // Reveal in place without carrying the card across the screen.
 useLayoutEffect(()=>{
  if(state.phase!=='reveal'||!hero.current)return;
  const steps:Animation[]=[hero.current.animate([{opacity:0},{opacity:1}],{duration:reduced?150:450,easing:'ease',fill:'backwards'})];
  stage.current?.querySelectorAll<HTMLElement>('[data-reveal]').forEach((n,i)=>{
   steps.push(n.animate([{opacity:0},{opacity:1}],{duration:reduced?150:400,delay:reduced?0:100+i*65,easing:'ease',fill:'backwards'}))});
  stage.current?.querySelector<HTMLElement>('#wonder-ritual-title')?.focus({preventScroll:true});
  return()=>steps.forEach(a=>a.cancel());
 // Only on entering the reveal; the error message re-renders inside it.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[state.phase==='reveal'&&state.selected]);

 // Restore motion immediately while the overlay fades; the source card stays in its slot.
 useEffect(()=>{
  if(state.phase!=='leaving')return;
  const id=state.selected!,s=stage.current,duration=reduced?150:400;
  let finished=false;
  const done=()=>{if(finished)return;finished=true;returnFocus.current=id;dispatch({type:'parted'});setAnnounce('The cards continue to pass.')};
  const out=s?.animate([{opacity:1},{opacity:0}],{duration,easing:'ease',fill:'forwards'});
  if(out)out.onfinish=done;
  const fallback=setTimeout(done,duration+100);
  return()=>{clearTimeout(fallback);out?.cancel()};
 },[state.phase,state.selected,reduced]);

 // Acceptance: acknowledge, then carry the card into the masthead where it stays as a keepsake.
 useEffect(()=>{
  if(state.phase!=='accepted')return;let cancelled=false;
  const t=setTimeout(()=>{if(cancelled)return;const h=hero.current,target=document.querySelector<HTMLElement>('[data-wonder-keepsake]');
   stage.current?.querySelectorAll<HTMLElement>('[data-reveal],.wonder-stage-veil').forEach(n=>n.animate([{opacity:1},{opacity:0}],{duration:500,easing:'ease',fill:'forwards'}));
   if(!h||!target||reduced){const a=h?.animate([{opacity:1},{opacity:0}],{duration:500,fill:'forwards'});if(a)a.onfinish=onLanded;else onLanded();return}
   const a=h.getBoundingClientRect(),b=target.getBoundingClientRect(),dx=b.left+b.width/2-(a.left+a.width/2),dy=b.top+b.height/2-(a.top+a.height/2),s=b.width/a.width;
   const flight=h.animate([{transform:'none',opacity:1},{transform:`translate(${dx*.45}px,${dy*.55-50}px) scale(${(1+s)/2}) rotate(-3deg)`,opacity:1,offset:.55},{transform:`translate(${dx}px,${dy}px) scale(${s})`,opacity:.9}],{duration:1250,easing:'cubic-bezier(.45,.05,.2,1)',fill:'forwards'});
   flight.onfinish=()=>onLanded()},reduced?500:950);
  return()=>{cancelled=true;clearTimeout(t)};
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[state.phase]);

 async function accept(){
  const id=state.selected;if(id===null||accepting.current||state.phase!=='reveal')return;accepting.current=true;dispatch({type:'accept'});
  try{await acceptWonderCard(id);track('wonder_card_accepted',`wonder-card-${id}`);track('wonder_card_added_to_cart',`wonder-card-${id}`);dispatch({type:'accepted'});onAccepted(id);setAnnounce(`${wonderCardName(id)} is yours. It will travel with your order.`)}
  catch(e){if(e instanceof WonderCardConflict){onConflict(e.cardId);return}dispatch({type:'failed',error:(e as Error).message})}
  finally{accepting.current=false}
 }
 function partWays(){if(state.phase!=='reveal')return;track('wonder_card_parted_ways',`wonder-card-${state.selected}`);motion.current.hover=false;motion.current.seek=null;motion.current.v=motion.current.width<600?34:46;phaseRef.current='leaving';dispatch({type:'part'})}
 useEffect(()=>{if(state.phase!=='reveal')return;const key=(e:KeyboardEvent)=>{if(e.key==='Escape')partWays()};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)});

 const chosen=wonderCard(state.selected),open=state.phase==='reveal'||state.phase==='leaving'||state.phase==='accepting'||state.phase==='accepted';
 return <div className={`wonder-ritual phase-${state.phase}${reduced?' still':''}`}>
  <CosmicSky/>
  <p className="wonder-invitation">{wonderCopy.invitation}</p>
  <div className="wonder-procession" ref={viewport} inert={open} aria-label="Wonder Cards" role="group">
   {order.map((id,k)=>{const card=wonderCard(id)!;return <button key={id} type="button" className="wc-item" ref={el=>{if(el)cards.current.set(id,el);else cards.current.delete(id)}} style={reduced?undefined:{transform:`translate3d(${2000+k*400}px,0,0)`}} aria-label={`${wonderCardName(id)}: ${card.message}`} onClick={()=>select(id)} onPointerEnter={()=>{motion.current.hover=true}} onPointerLeave={()=>{motion.current.hover=false}} onFocus={()=>focusCard(id)} onBlur={()=>{motion.current.seek=null}}>
    <WonderCardFace card={card} eager={k<6}/>
   </button>})}
  </div>
  {open&&chosen&&createPortal(<div className="wonder-stage" ref={stage} role="dialog" aria-modal="true" aria-labelledby="wonder-ritual-title" aria-describedby="wonder-ritual-message">
   <div className="wonder-stage-veil" aria-hidden="true"/>
   <div className="wonder-stage-inner">
    <h2 id="wonder-ritual-title" className="wonder-ritual-line" tabIndex={-1} data-reveal="down">{state.phase==='accepted'?wonderCopy.accepted:wonderCopy.ritual}</h2>
    <p className="wonder-whisper" data-reveal="fade">{wonderCopy.whisper}</p>
    <div className="wonder-hero" ref={hero}><WonderCardFace card={chosen} eager/></div>
    <p className="wonder-name" data-reveal="left">{wonderCardName(chosen.id)}</p>
    <p id="wonder-ritual-message" className="sr-only">{chosen.message}</p>
    <p className="wonder-choice" data-reveal="right">{wonderCopy.choice}</p>
    <div className="wonder-actions" data-reveal="up">
     <button type="button" className="wonder-part" onClick={partWays} disabled={state.phase!=='reveal'}>{wonderCopy.partWays}</button>
     <button type="button" className="wonder-accept" onClick={accept} disabled={state.phase!=='reveal'} aria-busy={state.phase==='accepting'}>{state.phase==='accepting'?wonderCopy.accepting:wonderCopy.accept}</button>
    </div>
    {state.error&&<p className="wonder-error" role="alert">{state.error}</p>}
   </div>
  </div>,document.body)}
  <p className="sr-only" role="status" aria-live="polite">{announce}</p>
 </div>
}
