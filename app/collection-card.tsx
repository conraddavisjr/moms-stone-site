"use client";
import {responsiveImage} from '@/lib/media';
import {useEffect,useMemo,useRef,useState,useCallback} from 'react';
import {ArrowUpRight,Play} from 'lucide-react';
import {Product,money,imageAlt,sold} from '@/lib/product';

import {brand} from '@/content/brand';
type Media={src:string;type:'image'|'video'};
export default function CollectionCard({product:p,onOpen,reduced,priority=false}:{product:Product;onOpen:()=>void;reduced:boolean;priority?:boolean}){
 const [hover,setHover]=useState(false),[focus,setFocus]=useState(false),[visible,setVisible]=useState(true),[cursor,setCursor]=useState(0),[ready,setReady]=useState(false),[previous,setPrevious]=useState<Media|null>(null);
 const cover=p.hero||p.images[0],images=useMemo(()=>Array.from(new Set([cover,...(p.studioImages??p.images)].filter(Boolean))),[cover,p.images,p.studioImages]);
 const media=useMemo<Media[]>(()=>[...p.videos.map(src=>({src,type:'video' as const})),...images.map(src=>({src,type:'image' as const}))],[p.videos,images]);
 const active=(hover||focus)&&visible&&!reduced;
 const current=active?media[cursor%media.length]:null;
 const video=useRef<HTMLVideoElement>(null),last=useRef<Media|null>(null);
 useEffect(()=>{const change=()=>setVisible(!document.hidden);document.addEventListener('visibilitychange',change);return()=>document.removeEventListener('visibilitychange',change)},[]);
 // Reset the media player session when its hover/focus activation changes.
 // eslint-disable-next-line react-hooks/set-state-in-effect
 useEffect(()=>{setCursor(0);setReady(false);setPrevious(null);last.current=null},[active]);
 // Keep the previous decoded frame during the next media item’s crossfade.
 // eslint-disable-next-line react-hooks/set-state-in-effect
 useEffect(()=>{setReady(false);setPrevious(last.current);last.current=current;const t=setTimeout(()=>setPrevious(null),450);return()=>clearTimeout(t)},[current]);
 const next=useCallback(()=>setCursor(i=>(i+1)%Math.max(media.length,1)),[media.length]);
 useEffect(()=>{if(!active||media.length<2)return;if(current?.type==='image'&&ready){const t=setTimeout(()=>setCursor(i=>(i+1)%media.length),2200);return()=>clearTimeout(t)}if(!ready){const t=setTimeout(()=>setCursor(i=>(i+1)%media.length),8000);return()=>clearTimeout(t)}},[active,current,ready,media.length]);
 useEffect(()=>{if(current?.type!=='video')return;const v=video.current;if(!v)return;let cancelled=false;v.play().catch(()=>{if(!cancelled)next()});return()=>{cancelled=true;v.pause()}},[current,next]);
 return <article className="product-card" onPointerEnter={e=>{if(e.pointerType==='mouse')setHover(true)}} onPointerLeave={()=>setHover(false)} onFocusCapture={()=>setFocus(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setFocus(false)}}>
 <button className={`card-image ${active?'is-previewing':''} ${images.length===1&&!p.videos.length?'single-image':''}`} onClick={onOpen} aria-label={`${brand.labels.meet}: ${p.title}`}>
 <img className="card-cover" loading={priority?'eager':'lazy'} src={cover} {...responsiveImage(cover)} sizes="(max-width: 900px) 44vw, 29vw" alt={imageAlt(p)} style={{objectPosition:`${p.focalX??50}% ${p.focalY??50}%`,transform:`scale(${p.zoom??1})`}}/>
 {[...(previous&&previous.src!==current?.src?[{item:previous,isCurrent:false}]:[]),...(current&&!(media.length===1&&current.type==='image')?[{item:current,isCurrent:true}]:[])].map(({item,isCurrent})=><div key={item.src} className={`preview-layer ${isCurrent?(ready?'preview-ready':''):'preview-previous'}`}>
 {item.type==='video'?<video ref={isCurrent?video:undefined} src={item.src} muted playsInline preload={isCurrent?'auto':'none'} onPlaying={()=>{if(isCurrent)setReady(true)}} onEnded={()=>{if(isCurrent)next()}} onError={()=>{if(isCurrent)next()}} onStalled={()=>{if(isCurrent)setReady(false)}} onWaiting={()=>{if(isCurrent)setReady(false)}} aria-label={`${p.title} film preview`}/>:<img src={item.src} alt="" onLoad={()=>{if(isCurrent)setReady(true)}} onError={()=>{if(isCurrent)next()}}/>}
 </div>)}
 <span className="card-arrow"><ArrowUpRight size={21}/></span>{p.videos.length>0&&<span className="video-tag"><Play size={12}/>{active&&current?.type==='video'?'Playing preview':'Film available'}</span>}
 </button><div className="card-title"><button onClick={onOpen}><h2>{p.title}</h2></button><span>{p.kind==='collection'?'Collection study':sold(p)?'Sold out':money(p.price)}</span></div><p className="card-subtitle">{p.subtitle}</p><p className="card-summary">{p.summary}</p>
 </article>
}
