import Link from 'next/link';
import {requireChatGPTUser} from '../chatgpt-auth';
import {admin} from '@/lib/server';
import Studio from './studio';
export const dynamic='force-dynamic';
export default async function Admin(){await requireChatGPTUser('/admin');if(!await admin())return <main className="admin-shell"><Link className="brand" href="/">Sacred Bloom</Link><h1 style={{marginTop:60}}>A private space to create.</h1><p style={{marginTop:20}}>This account does not have studio access. The owner must add its email to the administrator allowlist.</p><a href="/signout-with-chatgpt?return_to=/admin">Sign in with a different account</a></main>;return <Studio/>}
