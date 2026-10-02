"use client";
import WonderCardFace from './wonder-card-face';
import Lotus from './lotus';
import {Sheet,SheetContent,SheetTitle,SheetDescription} from '@/components/ui/sheet';
import {wonderCard,wonderCardName,wonderCopy} from '@/content/wonder-cards';
// The accepted card, travelling with the customer in the masthead. It is a keepsake, not a control:
// it opens a quiet recollection view and never offers a replacement.
export function WonderKeepsake({cardId,landed,onOpen}:{cardId:number;landed:boolean;onOpen:()=>void}){
 const card=wonderCard(cardId);if(!card)return null;
 return <button type="button" className={`wonder-keepsake${landed?' landed':''}`} data-wonder-keepsake onClick={onOpen} aria-label={`${wonderCopy.keepsake}: ${wonderCardName(card.id)}`}>
  <span className="wonder-keepsake-card"><WonderCardFace card={card} eager className="wcf-mini"/></span>
  <span className="wonder-keepsake-label" aria-hidden="true">{wonderCopy.keepsake}</span>
 </button>
}
export function WonderRecollection({cardId,open,onOpenChange}:{cardId:number|null;open:boolean;onOpenChange:(v:boolean)=>void}){
 const card=wonderCard(cardId);
 return <Sheet open={open&&!!card} onOpenChange={onOpenChange}><SheetContent className="wonder-recollection">{card&&<>
  <Lotus className="wonder-recollection-lotus"/>
  <SheetTitle className="wonder-recollection-title">{wonderCopy.keepsake}</SheetTitle>
  <SheetDescription className="wonder-recollection-name">{wonderCardName(card.id)}</SheetDescription>
  <div className="wonder-recollection-card"><WonderCardFace card={card} eager/></div>
  <p className="wonder-recollection-gift">{wonderCopy.gift}</p>
  <p className="wonder-recollection-note">{wonderCopy.travels}</p>
 </>}</SheetContent></Sheet>
}
export function WonderBagLine({cardId,hasPieces}:{cardId:number;hasPieces:boolean}){
 const card=wonderCard(cardId);if(!card)return null;
 return <section className="wonder-bag-line" aria-label={wonderCopy.keepsake}>
  <div className="wonder-bag-card"><WonderCardFace card={card} eager/></div>
  <div className="wonder-bag-copy">
   <p className="eyebrow">{wonderCopy.keepsake}</p>
   <h3>{wonderCardName(card.id)}</h3>
   <p className="wonder-bag-gift">{wonderCopy.gift}</p>
   <p className="wonder-bag-price"><span>$0.00</span><span className="sr-only"> (no charge)</span></p>
   <p className="wonder-bag-note">{hasPieces?wonderCopy.travels:wonderCopy.reserved}</p>
  </div>
 </section>
}
