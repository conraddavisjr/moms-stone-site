import variants from '../app/data/image-variants.json';
export function responsiveImage(src:string){return {srcSet:(variants as Record<string,string[]>)[src]?.join(', '),sizes:'(max-width: 600px) 88vw, (max-width: 1000px) 48vw, 640px'}}
