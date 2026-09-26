"use client";
import {useEffect,useRef,useState} from 'react';
import {Play} from 'lucide-react';

export default function DetailVideo({src,poster,active=true,label='Stone in changing light',onPlay}:{src:string;poster?:string;active?:boolean;label?:string;onPlay:()=>void}){
 const video=useRef<HTMLVideoElement>(null),userPaused=useRef(false),systemPaused=useRef(false);
 const [mobileMotion,setMobileMotion]=useState(false),[inView,setInView]=useState(false),[visible,setVisible]=useState(true),[blocked,setBlocked]=useState(false),[failed,setFailed]=useState(false);
 useEffect(()=>{
  const mobile=matchMedia('(max-width: 900px), (pointer: coarse)'),motion=matchMedia('(prefers-reduced-motion: reduce)');
  const change=()=>setMobileMotion(mobile.matches&&!motion.matches),visibility=()=>setVisible(!document.hidden);
  change();visibility();mobile.addEventListener('change',change);motion.addEventListener('change',change);document.addEventListener('visibilitychange',visibility);
  const observer=new IntersectionObserver(([entry])=>setInView(entry.isIntersecting&&entry.intersectionRatio>=.25),{threshold:[0,.25]});
  if(video.current)observer.observe(video.current);
  return()=>{observer.disconnect();mobile.removeEventListener('change',change);motion.removeEventListener('change',change);document.removeEventListener('visibilitychange',visibility)};
 },[]);
 useEffect(()=>{
  const v=video.current;if(!v)return;let cancelled=false;
  if(!active||!visible||!inView){systemPaused.current=true;v.pause()}
  else if(mobileMotion&&!userPaused.current){systemPaused.current=false;v.muted=true;v.play().catch(()=>{if(!cancelled)setBlocked(true)})}
  return()=>{cancelled=true};
 },[active,visible,inView,mobileMotion,src]);
 return <div className="detail-film"><video aria-label={label} ref={video} src={src} controls muted playsInline preload="auto" poster={poster} tabIndex={active?0:-1}
  onPlay={()=>{systemPaused.current=false;userPaused.current=false;setBlocked(false);onPlay()}}
  onPause={()=>{if(!systemPaused.current)userPaused.current=true}}
  onError={()=>{setFailed(true);setBlocked(false)}}/>
  {blocked&&!failed&&<button className="film-play-fallback" onClick={()=>{userPaused.current=false;video.current?.play().catch(()=>setBlocked(true))}}><Play size={18}/> Play film</button>}
  {failed&&<p className="film-error">This film couldn’t load. <button onClick={()=>{setFailed(false);video.current?.load()}}>Try again</button></p>}
 </div>;
}
