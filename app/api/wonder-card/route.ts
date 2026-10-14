import {db,response,failure,sameOrigin,session} from '@/lib/server';
import {isWonderCardId} from '@/content/wonder-cards';
// The accepted Wonder Card for this bag session. One per session: the primary key makes
// acceptance idempotent (repeating the same card is a no-op) and final (a different card is refused).
async function accepted(id:string){const row=await db().prepare('SELECT card_id FROM wonder_cards WHERE session=?').bind(id).first<{card_id:number}>();return row?row.card_id:null}
export async function GET(req:Request){try{const s=session(req);return response({cardId:await accepted(s.id)},200,s.cookie)}catch(e){return failure(e)}}
export async function POST(req:Request){try{sameOrigin(req);const body=await req.json().catch(()=>null) as {cardId?:unknown}|null;const cardId=body?.cardId;if(!isWonderCardId(cardId))return response({error:'Invalid Wonder Card'},400);const s=session(req);await db().prepare('INSERT INTO wonder_cards(session,card_id,accepted_at) VALUES (?,?,?) ON CONFLICT(session) DO NOTHING').bind(s.id,cardId,new Date().toISOString()).run();const kept=await accepted(s.id);if(kept!==cardId)return response({error:'A Wonder Card has already been accepted for this bag.',cardId:kept},409,s.cookie);return response({cardId:kept},200,s.cookie)}catch(e){return failure(e)}}
