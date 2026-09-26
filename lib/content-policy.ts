import type {Product,ProtectedField} from './product';
const fields:ProtectedField[]=['title','subtitle','summary','description','facts','wonderCard'];
export function protectedFields(p:Product):ProtectedField[]{
 return [...new Set([...(p.protectedFields||[]),...(p.copyStatus==='locked'?['title','subtitle','summary','description'] as const:[]),...(p.nameStatus==='locked'?['title'] as const:[]),...(p.storyStatus==='locked'?['description'] as const:[]),...(p.facts?.status==='locked'||p.factsStatus==='locked'?['facts'] as const:[]),...(p.wonderCard?.status==='locked'?['wonderCard'] as const:[])])];
}
export function lockedCopyViolation(current:Product|undefined,next:Product):string|undefined{
 if(!current)return;
 for(const field of protectedFields(current)){
  if(JSON.stringify(current[field])!==JSON.stringify(next[field])||!protectedFields(next).includes(field))return `SACRED BLOOM LOCKED COPY: ${field} requires explicit editorial approval before replacement.`;
 }
}
// Adopt the content system without discarding saved seller edits or older backups.
export function migrateContent(seed:Product|undefined,saved:Product):Product{
 if(!seed||saved.contentVersion)return {...seed,...saved};
 const merged={...seed,...saved,contentVersion:1,prototypeContent:saved.prototypeContent||{title:saved.title,subtitle:saved.subtitle,summary:saved.summary,description:saved.description}};
 for(const field of fields){
  if(seed.protectedFields?.includes(field)||((field==='title'||field==='subtitle'||field==='summary'||field==='description')&&saved[field]===seed.prototypeContent?.[field]))Object.assign(merged,{[field]:seed[field]});
 }
 return merged;
}
