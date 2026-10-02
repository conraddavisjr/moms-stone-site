// Canonical Sacred Bloom Wonder Cards (lush forest deck). This file is the single source of truth.
// Messages are protected wording copied from the supplied deck; do not rewrite them.
// Card 9 is unconfirmed: its number was cut off in the supplied crop. Confirm before launch.
// Artwork is text-free. Drop each final image at public/images/wonder-cards/NN.webp (for example 07.webp);
// the card renders its number, message, divider, lotus and wordmark in HTML over the right side of the art.
export type WonderCardStatus='locked'|'unconfirmed';
export type WonderCard={id:number;message:string;artAlt:string;status:WonderCardStatus};
export const wonderCards:readonly WonderCard[]=[
 {id:1,message:"You are Safe, Supported and Exactly Where You Need to Be.",artAlt:"Clear quartz crystal points with soft pink lotus blossoms on moss in a sunlit forest.",status:'locked'},
 {id:2,message:"Your Energy Creates Your Reality.",artAlt:"A tall faceted emerald-green crystal with small pink and white flowers in a sunlit forest.",status:'locked'},
 {id:3,message:"You Are More Powerful Than You Realize.",artAlt:"A radiant clear quartz point glowing from within beside white star-shaped flowers in a sunlit forest.",status:'locked'},
 {id:4,message:"Trust the Divine Timing of Your Life.",artAlt:"A translucent rose-quartz heart among white blossoms in a sunlit forest.",status:'locked'},
 {id:5,message:"Healing Is a Return to Wholeness.",artAlt:"A cluster of clear and blush crystals with pale pink flowers in a sunlit forest.",status:'locked'},
 {id:6,message:"Your Intuition Is a Sacred Guidance System.",artAlt:"A violet amethyst crystal cluster framed by ferns in a sunlit forest.",status:'locked'},
 {id:7,message:"You Are Divinely Guided and Never Alone.",artAlt:"A softly glowing lantern on a mossy stone path winding into the forest in a sunlit forest.",status:'locked'},
 {id:8,message:"Your Heart Knows the Way.",artAlt:"A glowing clear crystal heart among white flowers and ferns in a sunlit forest.",status:'locked'},
 {id:9,message:"You Are a Divine Expression of Love.",artAlt:"Soft pink crystal lotus petals glowing on moss in a sunlit forest.",status:'unconfirmed'},
 {id:10,message:"Release What No Longer Serves You.",artAlt:"A gentle forest waterfall over smooth stones with white flowers in a sunlit forest.",status:'locked'},
 {id:11,message:"Small Steps Create Extraordinary Change.",artAlt:"Flat mossy stepping stones leading through a sunlit forest in a sunlit forest.",status:'locked'},
 {id:12,message:"You Are Enough Just as You Are.",artAlt:"A clear quartz point surrounded by pink lotus flowers in a sunlit forest.",status:'locked'},
 {id:13,message:"Transformation Brings You Closer to Your True Self.",artAlt:"A green crystal beside unfurling fern fiddleheads in a sunlit forest.",status:'locked'},
 {id:14,message:"Abundance Flows to You with Ease.",artAlt:"A sparkling clear crystal cluster with curling ferns in a sunlit forest.",status:'locked'},
 {id:15,message:"Your Light Inspires Others.",artAlt:"A glowing pink crystal lotus in soft warm light in a sunlit forest.",status:'locked'},
 {id:16,message:"You Are Always Becoming — and That Is Beautiful.",artAlt:"A clear crystal with pink flowers and a delicate golden butterfly in a sunlit forest.",status:'locked'},
 {id:17,message:"Let Nature Remind You of Your Magic.",artAlt:"A cascading forest waterfall with a small clear crystal on moss in a sunlit forest.",status:'locked'},
 {id:18,message:"Peace Begins Within You.",artAlt:"A balanced cairn of smooth stones beside a still forest pool in a sunlit forest.",status:'locked'},
 {id:19,message:"You Have the Courage to Choose Differently.",artAlt:"A clear crystal beside large white flowers in a sunlit forest.",status:'locked'},
 {id:20,message:"Gratitude Opens the Door to More.",artAlt:"A glowing crystal amid warm golden light and moss in a sunlit forest.",status:'locked'},
 {id:21,message:"Everything You Need Is Already Within You.",artAlt:"A tall clear quartz point with pink flowers in a sunlit forest.",status:'locked'},
 {id:22,message:"You Are Part of Something Beautiful and Greater.",artAlt:"A crystal sphere among pink blossoms in a sunlit forest.",status:'locked'},
 {id:23,message:"Trust Yourself. You Are Wiser Than You Know.",artAlt:"A clear quartz point with a white lotus flower in a sunlit forest.",status:'locked'},
 {id:24,message:"Your Presence Makes a Positive Difference in This World.",artAlt:"A winding forest stream with ferns in a sunlit forest.",status:'locked'},
 {id:25,message:"You Are a Sacred Bloom — Always.",artAlt:"A large luminous pink crystal lotus on moss in a sunlit forest.",status:'locked'},
];
export const wonderCardIds=wonderCards.map(c=>c.id);
export function wonderCard(id:number|null|undefined){return wonderCards.find(c=>c.id===id)||null}
export function wonderCardName(id:number){return `Wonder Card ${id}`}
export function wonderCardNumber(id:number){return String(id).padStart(2,'0')}
export function wonderCardArt(id:number){return `/images/wonder-cards/${wonderCardNumber(id)}.webp`}
export function isWonderCardId(v:unknown):v is number{return typeof v==='number'&&Number.isInteger(v)&&v>=1&&v<=wonderCards.length}
// Interface language for the ritual. New copy, written sparingly; it is editable (not part of the deck).
export const wonderCopy={
 invitation:'One of these is yours. You will know it when you notice it.',
 ritual:'This is your card.',
 whisper:'You found it. Or perhaps it found you.',
 choice:'Keep it, and it travels with your order as a gift. Or let it go, and the cards will keep passing.',
 partWays:'Part ways',
 accept:'Accept',
 accepting:'Keeping your card…',
 accepted:'It is yours now.',
 keepsake:'Your Wonder Card',
 gift:'A gift from Sacred Bloom · Complimentary',
 travels:'This card will travel with your order.',
 reserved:'Your card is reserved. It will travel with the first stone you choose.',
 wander:'Wander the stones instead',
 returnToCards:'Return to the cards',
} as const;
