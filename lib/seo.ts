import type {Product} from './product';
import {sold} from './product';
import {brand} from '../content/brand';
// Preserve existing links. Enable indexing only after launch copy/prices are approved.
export const siteOrigin='https://astraea-stones.conraddavisjr.chatgpt.site';
export const indexingEnabled=false;
export function productMetadata(p:Product){
 const url=`${siteOrigin}/stone/${p.slug||p.id}`;
 const description=p.summary||p.subtitle||p.evidence||p.title;
 const image=p.hero||p.images[0];
 return {title:`${p.title} | ${brand.name}`,description,alternates:{canonical:url},robots:{index:indexingEnabled&&p.nameStatus==='locked',follow:indexingEnabled},openGraph:{title:`${p.title} | ${brand.name}`,description,url,siteName:brand.name,type:'website' as const,images:image?[{url:siteOrigin+image,alt:p.mediaAlt||p.title}]:[]},twitter:{card:'summary_large_image' as const,title:`${p.title} | ${brand.name}`,description,images:image?[siteOrigin+image]:[]}};
}
export function productStructuredData(p:Product){
 return {'@context':'https://schema.org','@type':'Product','@id':`${siteOrigin}/stone/${p.slug||p.id}#product`,name:p.title,description:p.summary||p.subtitle||p.evidence,image:[p.hero||p.images[0]].filter(Boolean).map(s=>siteOrigin+s),sku:p.id,...(p.priceStatus==='confirmed'&&p.availability!=='unconfirmed'&&p.availability?{offers:{'@type':'Offer',url:`${siteOrigin}/stone/${p.slug||p.id}`,price:p.price,priceCurrency:p.currency||'USD',availability:`https://schema.org/${sold(p)?'OutOfStock':'InStock'}`}}:{})};
}
