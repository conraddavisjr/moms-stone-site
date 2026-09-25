"use client";
import {useEffect,useRef,useState} from 'react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {Carousel,CarouselContent,CarouselItem,CarouselNext,CarouselPrevious,type CarouselApi} from '@/components/ui/carousel';
import {Product} from '@/lib/product';
import {Maximize2} from 'lucide-react';

type Item={src:string;type:'image'|'video';label:string};
export default function MediaGallery({product:p,onVideoPlay}:{product:Product;onVideoPlay:()=>void}){
 const cover=p.hero||p.images[0];
 const items:Item[]=[{src:cover,type:'image',label:p.generated?'AI-staged interpretation':'Original specimen photograph'},...p.videos.map((src,i)=>({src,type:'video' as const,label:`Original film ${i+1}`})),...p.images.filter(src=>src!==cover).map((src,i)=>({src,type:'image' as const,label:`Original view ${i+1}`}))];
 const [start,setStart]=useState<number|null>(null),[position,setPosition]=useState(0),[api,setApi]=useState<CarouselApi>();
 const returnFocus=useRef<HTMLElement|null>(null),region=useRef<HTMLDivElement>(null);
 const show=(i:number)=>{returnFocus.current=document.activeElement as HTMLElement;region.current?.querySelectorAll('video').forEach(v=>v.pause());setStart(i);setPosition(i)};
 useEffect(()=>{if(!api)return;const change=()=>setPosition(api.selectedScrollSnap());change();api.on('select',change);return()=>{api.off('select',change)}},[api]);
 return <div className="detail-media" ref={region}>
 <figure className="detail-primary"><button className="gallery-open" onClick={()=>show(0)} aria-label={`Enlarge ${p.title}`}><img src={cover} alt={p.title}/><span><Maximize2 size={17}/> Explore gallery</span></button><figcaption>{p.generated?'AI-staged interpretation · compare the original media below':'Original specimen photograph'}</figcaption></figure>
 <div className="media-grid">{items.slice(1).map((item,i)=><figure key={item.src}>{item.type==='video'?<><video src={item.src} controls playsInline preload="none" poster={p.images[0]} onPlay={onVideoPlay}/><button className="gallery-film-open" onClick={()=>show(i+1)}><Maximize2 size={13}/> Open film in gallery</button></>:<button className="gallery-open" onClick={()=>show(i+1)} aria-label={`Enlarge ${item.label}`}><img src={item.src} alt={`${p.title}, ${item.label.toLowerCase()}`} loading="lazy"/></button>}<figcaption>{item.label}{item.type==='image'?' · view in gallery':''}</figcaption></figure>)}</div>
 <Dialog open={start!==null} onOpenChange={v=>{if(!v){setStart(null);setApi(undefined)}}}><DialogContent className="stone-lightbox" onCloseAutoFocus={e=>{e.preventDefault();returnFocus.current?.focus()}} onKeyDown={e=>{if((e.target as HTMLElement).tagName==='VIDEO')return;if(e.key==='ArrowLeft'){e.preventDefault();api?.scrollPrev()}if(e.key==='ArrowRight'){e.preventDefault();api?.scrollNext()}}}><DialogTitle>{p.title}</DialogTitle><DialogDescription className="sr-only">Image and film gallery. Use the arrow buttons, left and right keys, or swipe. Escape closes the gallery.</DialogDescription>
 {start!==null&&<Carousel key={`${p.id}-${start}`} setApi={setApi} opts={{startIndex:start,loop:true}} className="lightbox-carousel" onKeyDownCapture={()=>{}}><CarouselContent>{items.map((item,i)=><CarouselItem key={item.src} aria-hidden={i!==position}><figure>{item.type==='image'?<img src={item.src} alt={`${p.title} — ${item.label}`} loading={i===start?'eager':'lazy'}/>:<GalleryVideo src={item.src} active={i===position} onPlay={onVideoPlay}/>}<figcaption>{item.label}</figcaption></figure></CarouselItem>)}</CarouselContent><CarouselPrevious className="lightbox-prev"/><CarouselNext className="lightbox-next"/></Carousel>}
 <p className="lightbox-counter" aria-live="polite">{position+1} / {items.length}</p></DialogContent></Dialog>
 </div>
}
function GalleryVideo({src,active,onPlay}:{src:string;active:boolean;onPlay:()=>void}){const ref=useRef<HTMLVideoElement>(null);useEffect(()=>{if(!active)ref.current?.pause()},[active]);return <video ref={ref} src={active?src:undefined} controls playsInline preload="none" onPlay={onPlay} tabIndex={active?0:-1}/>}
