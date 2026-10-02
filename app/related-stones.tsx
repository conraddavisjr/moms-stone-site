"use client";
import {ArrowUpRight} from 'lucide-react';
import {responsiveImage} from '@/lib/media';
import {imageAlt,money,type Product} from '@/lib/product';
import {relatedProducts} from '@/lib/related-products';
export default function RelatedStones({current,products,onOpen}:{current:Product;products:Product[];onOpen:(p:Product)=>void}){
 const related=relatedProducts(current,products);
 if(!related.length)return null;
 return <section className="related-stones" aria-labelledby="related-stones-title">
  <div className="related-heading"><p className="eyebrow">KEEP DISCOVERING</p><h2 id="related-stones-title">Related pieces</h2><p>Let another stone catch your eye.</p></div>
  <div className="related-grid">{related.map(p=>{const cover=p.hero||p.images[0];return <a className="related-card" key={p.id} href={`/stone/${p.slug||p.id}`} onClick={e=>{if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();onOpen(p)}}>
   <div className="related-image"><img src={cover} {...responsiveImage(cover)} sizes="(max-width:600px) 44vw, (max-width:900px) 42vw, 22vw" loading="lazy" alt={imageAlt(p)} style={{objectPosition:`${p.focalX??50}% ${p.focalY??50}%`,transform:`scale(${p.zoom??1})`}}/><span aria-hidden="true"><ArrowUpRight size={20}/></span></div>
   <div className="related-caption"><h3>{p.title}</h3><span>{money(p.price)}</span></div>{p.subtitle&&<p>{p.subtitle}</p>}
  </a>})}</div>
 </section>;
}
