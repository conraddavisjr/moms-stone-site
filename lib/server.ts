import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '@/app/chatgpt-auth';
import seed from '@/app/data/catalog.json';
import {Product} from './product';
import {mergeCuratedArtwork} from './artwork';
import {z} from 'zod';
export function db(){if(!env.DB)throw Error('Storage is temporarily unavailable');return env.DB}
export async function catalog(){const rows=await db().prepare('SELECT id, data, revision FROM products').all<{id:string,data:string,revision:number}>();const m=new Map((seed as Product[]).map(p=>[p.id,p]));for(const row of rows.results)m.set(row.id,{...mergeCuratedArtwork(m.get(row.id),JSON.parse(row.data)),revision:row.revision});return Array.from(m.values())}
export async function admin(){const u=await getChatGPTUser();if(!u)return null;const allowed=(env.ADMIN_EMAILS||'').toLowerCase().split(',').map(s=>s.trim()).filter(Boolean);return allowed.includes(u.email.toLowerCase())?u:null}
export function sameOrigin(req:Request){const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)throw Error('Cross-origin request rejected')}
export function session(req:Request){const raw=req.headers.get('cookie')?.match(/(?:^|;\s*)astraea_session=([a-f0-9-]{36})(?:;|$)/)?.[1];const id=raw||crypto.randomUUID();return {id,cookie:`astraea_session=${id}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000${new URL(req.url).protocol==='https:'?'; Secure':''}`}}
export function response(data:unknown,status=200,cookie?:string){return Response.json(data,{status,headers:{'Cache-Control':'no-store',...(cookie?{'Set-Cookie':cookie}:{})}})}
export function failure(e:unknown,status=503){console.error('Astraea request failed',e instanceof Error?e.message:'unknown');return response({error:status===503?'Storage is temporarily unavailable. Please try again.':e instanceof Error?e.message:'Request could not be completed'},status)}
const local=z.string().max(500).regex(/^\/(?:images|videos|media)\/[a-zA-Z0-9/_.-]+$/).refine(v=>!v.includes('..'));
export const productSchema=z.object({id:z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(90),title:z.string().trim().min(1).max(150),subtitle:z.string().max(250),summary:z.string().max(600),description:z.string().max(12000),mineral:z.string().max(250),confidence:z.string().max(100),evidence:z.string().max(2000),price:z.number().min(0).max(1000000),images:z.array(local).max(60),videos:z.array(local).max(25),hero:local.optional(),studioImages:z.array(local).max(60).optional(),stagingRevision:z.number().int().min(0).optional(),generated:z.boolean().optional(),kind:z.enum(['product','collection']).optional(),published:z.boolean().optional(),revision:z.number().int().min(0).optional(),focalX:z.number().min(0).max(100).optional(),focalY:z.number().min(0).max(100).optional(),zoom:z.number().min(1).max(3).optional()}).passthrough();
