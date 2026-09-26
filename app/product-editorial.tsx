import type {Product} from '@/lib/product';
import {brand} from '@/content/brand';
export function ProductFacts({product:p}:{product:Product}){
 const f=p.facts;
 const rows=[['Material',f?.material],['Dimensions',f?.dimensions],['Weight',f?.weight],['Origin',f?.origin]].filter(([,v])=>v);
 if(!rows.length&&!f?.features?.length&&!f?.notes?.length)return null;
 return <section className="specimen-note"><div><h3>{brand.labels.note}</h3>{rows.length>0&&<dl className="specimen-facts">{rows.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>}{f?.features?.length? <ul>{f.features.map(v=><li key={v}>{v}</li>)}</ul>:null}{f?.notes?.map((v,i)=><p key={i}>{v}</p>)}</div></section>;
}
export function WonderCard({product:p}:{product:Product}){
 const card=p.wonderCard;if(!card?.title&&!card?.body)return null;
 return <section className="wonder-card" aria-label={brand.labels.wonder}><p className="eyebrow">{brand.labels.wonder}</p>{card.title&&<h3>{card.title}</h3>}{card.body&&<p className="wonder-reflection">{card.body}</p>}</section>;
}
