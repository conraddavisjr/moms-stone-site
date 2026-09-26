export type CopyStatus='locked'|'editable'|'draft'|'needs_fact_check'|'placeholder';
export type Facts={material?:string;weight?:string;dimensions?:string;origin?:string;features?:string[];notes?:string[];status:CopyStatus};
export type ProtectedField='title'|'subtitle'|'summary'|'description'|'facts'|'wonderCard';
export type Product = { id:string; slug?:string; title:string; nameStatus?:CopyStatus; subtitle:string; summary:string; description:string; copyStatus?:CopyStatus; storyStatus?:CopyStatus; factsStatus?:CopyStatus; protectedFields?:ProtectedField[]; contentVersion?:number; prototypeContent?:{title:string;subtitle:string;summary:string;description:string}; price:number; currency?:string; priceStatus?:string; inventory?:number; availability?:'available'|'sold'|'unconfirmed'; unique?:boolean; facts?:Facts; wonderCard?:{title?:string;body?:string;status:CopyStatus}; audioNarration?:{url?:string;transcript?:string;duration?:number;available?:boolean}; mediaAlt?:string; mineral:string; confidence:string; evidence:string; images:string[]; videos:string[]; hero?:string; studioImages?:string[]; stagingRevision?:number; generated?:boolean; kind?:string; published?:boolean; revision?:number; focalX?:number; focalY?:number; zoom?:number; };
export const money = (n:number,currency='USD') => new Intl.NumberFormat('en-US',{style:'currency',currency,maximumFractionDigits:2}).format(n);
export const sold=(p:Product)=>p.availability==='sold'||p.inventory===0;
export const quantityLimit=(p:Product)=>sold(p)?0:Math.min(p.unique?1:20,p.inventory??20);
export const canAdd=(p:Product,quantity=0)=>p.published!==false&&p.kind!=='collection'&&!sold(p)&&quantity<quantityLimit(p);
export const imageAlt=(p:Product)=>p.mediaAlt||p.evidence||p.title;
