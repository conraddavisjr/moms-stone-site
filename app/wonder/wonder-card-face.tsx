"use client";
import {useState} from 'react';
import Lotus from './lotus';
import {type WonderCard,wonderCardArt,wonderCardName} from '@/content/wonder-cards';
// Remember missing artwork for this page so moving cards never re-request a 404.
const missing=new Set<string>();
// One Wonder Card. The artwork is text-free; the number, message, divider, lotus and wordmark are real
// text laid over the calm right side of the art, sized with container units so they stay crisp at any size.
export default function WonderCardFace({card,eager=false,className=''}:{card:WonderCard;eager?:boolean;className?:string}){
 const src=wonderCardArt(card.id);
 const [failed,setFailed]=useState(()=>missing.has(src));
 return <div className={`wcf ${failed?'wcf-textonly':'wcf-art'} ${className}`} style={{['--wcf-hue' as string]:`${((card.id*37)%36)-18}deg`}}>
  <div className="wcf-ground" aria-hidden="true">{failed&&<Lotus className="wcf-ghost"/>}</div>
  {!failed&&<img className="wcf-image" src={src} alt={card.artAlt} loading={eager?'eager':'lazy'} decoding="async" draggable={false} onDragStart={e=>e.preventDefault()} onError={()=>{missing.add(src);setFailed(true)}}/>}
  <div className="wcf-shade" aria-hidden="true"/>
  <div className="wcf-text">
   <span className="wcf-number"><span className="sr-only">{wonderCardName(card.id)}: </span><span aria-hidden="true">{card.id}</span></span>
   <p className="wcf-message">{card.message}</p>
   <span className="wcf-divider" aria-hidden="true"><i/><b>✦</b><i/></span>
   <span className="wcf-mark" aria-hidden="true"><Lotus className="wcf-lotus"/><span className="wcf-word">Sacred Bloom</span></span>
  </div>
 </div>
}
