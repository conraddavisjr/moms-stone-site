import {catalog} from '@/lib/server';
import {indexingEnabled,siteOrigin} from '@/lib/seo';
export default async function sitemap(){if(!indexingEnabled)return [];return [{url:siteOrigin},{url:`${siteOrigin}/catalog`},...(await catalog()).filter(p=>p.published!==false&&p.nameStatus==='locked').map(p=>({url:`${siteOrigin}/stone/${p.slug||p.id}`}))]}
