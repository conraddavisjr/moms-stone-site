"use client";
import {responsiveImage} from '@/lib/media';
import {useEffect,useRef,useState} from 'react';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {Carousel,CarouselContent,CarouselItem,CarouselNext,CarouselPrevious,type CarouselApi} from '@/components/ui/carousel';
import {Product,imageAlt} from '@/lib/product';
import DetailVideo from './detail-video';
import {Maximize2,ChevronDown} from 'lucide-react';
import {Collapsible,CollapsibleTrigger,CollapsibleContent} from '@/components/ui/collapsible';

type Item={src:string;type:'image'|'video';label:string};
export default function MediaGallery({product:p,onVideoPlay}:{product:Product;onVideoPlay:()=>void}){
 const cover=p.hero||p.images[0];
 const [referencesOpen,setReferencesOpen]=useState(false);
 const studio=p.studioImages??p.images;
 const mainItems:Item[]=[{src:cover,type:'image',label:'Studio portrait'},...studio.filter(src=>src!==cover).map((src,i)=>({src,type:'image' as const,label:`Studio view ${i+1}`})),...p.videos.map((src,i)=>({src,type:'video' as const,label:`Original film ${i+1}`}))];
 const references=p.images.filter(src=>src!==cover&&!studio.includes(src));
 const items:Item[]=[...mainItems,...(referencesOpen?references.map((src,i)=>({src,type:'image' as const,label:`Original reference ${i+1}`})):[])];
 const [start,setStart]=useState<number|null>(null),[position,setPosition]=useState(0),[api,setApi]=useState<CarouselApi>();
 const returnFocus=useRef<HTMLElement|null>(null),region=useRef<HTMLDivElement>(null);
 const show=(i:number)=>{returnFocus.current=document.activeElement as HTMLElement;region.current?.querySelectorAll('video').forEach(v=>v.pause());setStart(i);setPosition(i)};
 useEffect(()=>{if(!api)return;const change=()=>setPosition(api.selectedScrollSnap());change();api.on('select',change);return()=>{api.off('select',change)}},[api]);
 return <div className="detail-media" ref={region}>
 <figure className="detail-primary"><button className="gallery-open" onClick={()=>show(0)} aria-label={`Enlarge ${p.title}`}><img src={cover} {...responsiveImage(cover)} fetchPriority="high" alt={imageAlt(p)}/><span><Maximize2 size={17}/> Explore gallery</span></button><figcaption>{p.title}</figcaption></figure>
 <div className="media-grid">{mainItems.slice(1).map((item,i)=><figure key={item.src}>{item.type==='video'?<><DetailVideo src={item.src} active={start===null} poster={cover} onPlay={onVideoPlay}/><button className="gallery-film-open" onClick={()=>show(i+1)}><Maximize2 size={13}/> Open film in gallery</button></>:<button className="gallery-open" onClick={()=>show(i+1)} aria-label={`Enlarge ${item.label}`}><img {...responsiveImage(item.src)} src={item.src} alt={`${imageAlt(p)} — ${item.label}`} loading="lazy"/></button>}<figcaption>{item.label}{item.type==='image'?' · view in gallery':''}</figcaption></figure>)}</div>
 {references.length>0&&<Collapsible open={referencesOpen} onOpenChange={setReferencesOpen} className="reference-photos"><CollapsibleTrigger className="reference-toggle">Original reference photos <span>{references.length}<ChevronDown size={16}/></span></CollapsibleTrigger><CollapsibleContent><p>Compare the untouched source photographs with the staged interpretation.</p><div className="media-grid">{references.map((src,i)=><figure key={src}><button className="gallery-open" aria-label={`Open original reference ${i+1}`} onClick={()=>show(mainItems.length+i)}><img src={src} alt={`${p.title}, original reference ${i+1}`} loading="lazy"/></button><figcaption>Original reference {i+1}</figcaption></figure>)}</div></CollapsibleContent></Collapsible>}
 <Dialog open={start!==null} onOpenChange={v=>{if(!v){setStart(null);setApi(undefined)}}}><DialogContent className="stone-lightbox" onCloseAutoFocus={e=>{e.preventDefault();returnFocus.current?.focus()}} onKeyDown={e=>{if((e.target as HTMLElement).tagName==='VIDEO')return;if(e.key==='ArrowLeft'){e.preventDefault();api?.scrollPrev()}if(e.key==='ArrowRight'){e.preventDefault();api?.scrollNext()}}}><DialogTitle>{p.title}</DialogTitle><DialogDescription className="sr-only">Image and film gallery. Use the arrow buttons, left and right keys, or swipe. Escape closes the gallery.</DialogDescription>
 {start!==null&&<Carousel key={`${p.id}-${start}`} setApi={setApi} opts={{startIndex:start,loop:true}} className="lightbox-carousel" onKeyDownCapture={()=>{}}><CarouselContent>{items.map((item,i)=><CarouselItem key={item.src} aria-hidden={i!==position}><figure>{item.type==='image'?<img {...responsiveImage(item.src)} src={item.src} alt={`${p.title} — ${item.label}`} loading={i===start?'eager':'lazy'}/>:i===position?<DetailVideo src={item.src} poster={cover} onPlay={onVideoPlay}/>:<img src={cover} alt=""/>}<figcaption>{item.label}</figcaption></figure></CarouselItem>)}</CarouselContent><CarouselPrevious className="lightbox-prev"/><CarouselNext className="lightbox-next"/></Carousel>}
 <p className="lightbox-counter" aria-live="polite">{position+1} / {items.length}</p></DialogContent></Dialog>
 </div>
}
