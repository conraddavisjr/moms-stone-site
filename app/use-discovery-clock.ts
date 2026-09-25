"use client";
import {useEffect,useRef} from 'react';

// One clock drives both the ring and the advance; manual navigation gets a full turn.
export function useDiscoveryClock(index:number,running:boolean,onAdvance:()=>void){
 const ring=useRef<SVGCircleElement>(null),elapsed=useRef(0),advance=useRef(onAdvance);
 advance.current=onAdvance;
 useEffect(()=>{elapsed.current=0;ring.current?.setAttribute('stroke-dashoffset','1')},[index]);
 useEffect(()=>{
  if(!running)return;
  let frame=0,last=performance.now();
  const tick=(now:number)=>{
   elapsed.current+=now-last;last=now;
   const progress=Math.min(elapsed.current/3200,1);
   ring.current?.setAttribute('stroke-dashoffset',String(1-progress));
   if(progress===1){elapsed.current=0;advance.current();return}
   frame=requestAnimationFrame(tick);
  };
  frame=requestAnimationFrame(tick);
  return()=>cancelAnimationFrame(frame);
 },[index,running]);
 return ring;
}
