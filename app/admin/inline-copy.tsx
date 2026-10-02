"use client";
import {useRef,useState} from 'react';
import {Check,CornerDownLeft,LockKeyhole,Pencil,X} from 'lucide-react';

type Props={label:string;value:string;display?:string;multiline?:boolean;locked?:boolean;maxLength?:number;numeric?:boolean;className?:string;onSave:(value:string)=>Promise<void>;onEditing:(editing:boolean)=>void;disabled?:boolean};
export default function InlineCopy({label,value,display,multiline,locked,maxLength,numeric,className='',onSave,onEditing,disabled}:Props){
 const [editing,setEditing]=useState(false),[draft,setDraft]=useState(value),[saving,setSaving]=useState(false),[error,setError]=useState(''),[saved,setSaved]=useState(false);
 const button=useRef<HTMLButtonElement>(null);
 function close(){setEditing(false);onEditing(false);requestAnimationFrame(()=>button.current?.focus())}
 async function save(){if(saving)return;setSaving(true);setError('');try{await onSave(draft);setSaved(true);close()}catch(e){setError((e as Error).message)}finally{setSaving(false)}}
 return <div className={`studio-copy ${className} ${editing?'is-editing':''}`}>
 {editing?<form onSubmit={e=>{e.preventDefault();void save()}}>
 {multiline?<textarea aria-label={label} autoFocus value={draft} maxLength={maxLength} disabled={saving} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();if(!saving)close()}if(e.key==='Enter'&&(e.metaKey||e.ctrlKey)){e.preventDefault();void save()}}}/>:<input aria-label={label} autoFocus value={draft} type={numeric?'number':'text'} min={numeric?0:undefined} max={numeric?1000000:undefined} step={numeric?'.01':undefined} required={label==='Title'||numeric} maxLength={maxLength} disabled={saving} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Escape'&&!saving){e.preventDefault();close()}}}/>}
 <div className="studio-inline-actions"><button type="button" aria-label={`Cancel ${label}`} disabled={saving} onClick={close}><X size={15}/></button><button className="studio-inline-save" type="submit" disabled={saving} aria-label={`Save ${label}`}><CornerDownLeft size={15}/><span>{saving?'Saving':'Save'}</span></button></div>
 {error&&<p className="studio-field-error" role="alert">{error}</p>}
 </form>:<button ref={button} className="studio-copy-button" aria-label={locked?`${label} is protected`:`Edit ${label}`} disabled={locked||disabled} onClick={()=>{setDraft(value);setError('');setSaved(false);setEditing(true);onEditing(true)}}><span>{display??(value||`Add ${label.toLowerCase()}`)}</span>{locked?<LockKeyhole className="studio-copy-icon" size={13}/>:saved?<Check className="studio-saved-icon" size={14}/>:<Pencil className="studio-copy-icon" size={13}/>}</button>}
 </div>
}
