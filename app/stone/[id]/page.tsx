import {notFound} from 'next/navigation';
import {catalog} from '@/lib/server';
import {productMetadata,productStructuredData} from '@/lib/seo';
import Storefront from '../../storefront';
export const dynamic='force-dynamic';
async function findStone(id:string){return (await catalog()).find(p=>(p.slug||p.id)===id&&p.published!==false)}
export async function generateMetadata({params}:{params:Promise<{id:string}>}){const {id}=await params;const p=await findStone(id);if(!p)return {title:'Stone not found | Sacred Bloom',robots:{index:false}};return productMetadata(p)}
export default async function Stone({params}:{params:Promise<{id:string}>}){const {id}=await params;const p=await findStone(id);if(!p)notFound();return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(productStructuredData(p)).replace(/</g,'\\u003c')}}/><Storefront initialView="catalog" initialId={p.id} initialProduct={p}/></>}
