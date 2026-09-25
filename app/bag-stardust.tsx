"use client";
import {createPortal} from 'react-dom';
import {Sparkles,Check} from 'lucide-react';
export default function BagStardust({phase}:{phase:'pending'|'complete'}){
 return createPortal(<div className={`bag-stardust ${phase}`} role="status" aria-live="polite">
  <span className="bag-star-orbit" aria-hidden="true">{Array.from({length:8},(_,i)=><i key={i} style={{transform:`rotate(${i*45}deg) translateY(-38px)`}}>✧</i>)}</span>
  <span className="bag-star-core" aria-hidden="true">{phase==='complete'?<Check size={25}/>:<Sparkles size={25}/>}</span>
  <span className="sr-only">{phase==='complete'?'Added to your bag':'Adding to your bag'}</span>
 </div>,document.body);
}
