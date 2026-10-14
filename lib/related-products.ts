import {sold,type Product} from './product';

// Use the catalog's existing descriptions for affinity, without asserting new mineral facts.
const mineralTerms=(p:Product)=>new Set(p.mineral.toLowerCase().match(/quartz|agate|jasper|chalcedony|calcite|sodalite|rutile|moss|plume|smoky|clear|blue|included/g)||[]);
export function relatedProducts(current:Product,products:Product[],limit=4):Product[]{
 const terms=mineralTerms(current);
 return products.filter(p=>p.id!==current.id&&p.published!==false&&p.kind!=='collection'&&!sold(p))
  .map((p,index)=>({p,index,score:[...mineralTerms(p)].reduce((score,term)=>score+(terms.has(term)?1:0),0)}))
  .sort((a,b)=>b.score-a.score||a.index-b.index).slice(0,limit).map(({p})=>p);
}
