// Slow atmospheric light behind the Wonder Cards: nebula blooms, a faint aurora and rare shooting
// stars. Pure CSS layers (transform/opacity only); the existing starfield sits beneath it.
export default function CosmicSky(){
 return <div className="cosmic-sky" aria-hidden="true">
  <span className="nebula nebula-fuchsia"/><span className="nebula nebula-indigo"/><span className="nebula nebula-gold"/>
  <span className="aurora"/>
  <span className="shooting-star s1"/><span className="shooting-star s2"/><span className="shooting-star s3"/>
 </div>
}
