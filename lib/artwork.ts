import type {Product} from './product';

// Upgrade legacy catalog artwork without replacing a seller's text or uploaded cover.
export function mergeCuratedArtwork(seed:Product|undefined,saved:Product):Product {
 const newerArtwork=!!seed?.stagingRevision&&(saved.stagingRevision||0)<seed.stagingRevision;
 const usesBundledCover=!saved.hero||saved.hero.startsWith('/images/catalog/')||saved.hero===seed?.hero;
 const merged={...seed,...saved};
 if(newerArtwork&&usesBundledCover&&seed?.generated){
  return {...merged,hero:seed.hero,generated:true,studioImages:seed.studioImages,stagingRevision:seed.stagingRevision};
 }
 return merged;
}
