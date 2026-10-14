"use client";
import {useEffect,useId,useRef} from 'react';

const vertex=`attribute vec2 position;varying vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
const fragment=`precision mediump float;
varying vec2 uv;uniform vec2 resolution;uniform float time;uniform vec4 ripples[8];
vec2 gradient(vec2 p){
 vec2 n=vec2(cos(p.x*9.+time*.16)*cos(p.y*12.-time*.13)*1.08,-sin(p.x*9.+time*.16)*sin(p.y*12.-time*.13)*1.44);
 for(int i=0;i<8;i++){
  float age=time-ripples[i].z;
  if(age<0.||age>4.)continue;
  vec2 delta=p-ripples[i].xy;float d=max(length(delta),.001);
  float ring=d-age*.20;
  float envelope=exp(-abs(ring)*19.-age*.72)*step(0.,age);
  float slope=(cos(ring*62.)*62.-sin(ring*62.)*sign(ring)*19.)*envelope*ripples[i].w*.32;
  n+=delta/d*slope;
 }
 return n;
}
void main(){
 vec2 p=vec2(uv.x*resolution.x/resolution.y,uv.y);
 vec2 normal=gradient(p);
 vec2 q=p+normal*.009;
 float veins=sin(q.x*18.+sin(q.y*12.+time*.12)*1.8)+sin(q.y*22.-sin(q.x*9.-time*.1)*1.5);
 float caustic=pow(max(0.,1.-abs(veins)*.7),7.);
 float light=clamp(dot(normal,normalize(vec2(-.6,.8)))*.15,0.,1.);
 vec3 deep=mix(vec3(.015,.024,.036),vec3(.045,.032,.076),uv.y);
 vec3 color=deep+vec3(.22,.20,.30)*caustic*.17+vec3(.42,.34,.23)*light*.42;
 float edge=smoothstep(0.,.16,uv.y)*smoothstep(0.,.13,1.-uv.y);
 gl_FragColor=vec4(color,edge*.92);
}`;

// Decorative WebGL surface. Text remains real DOM, with a separate displacement filter;
// neither the canvas nor the text filter contains the cards.
export default function WaterSurface({reduced}:{reduced:boolean}){
 const canvas=useRef<HTMLCanvasElement>(null),displacement=useRef<SVGFEDisplacementMapElement>(null),turbulence=useRef<SVGFETurbulenceElement>(null);
 const id='water-'+useId().replace(/:/g,'');
 useEffect(()=>{
  const el=canvas.current,host=el?.closest<HTMLElement>('.discovery');if(!el||!host||reduced)return;
  const gl=el.getContext('webgl',{alpha:true,antialias:false,depth:false,powerPreference:'low-power'});if(!gl)return;
  const shaders:WebGLShader[]=[];let program:WebGLProgram|null=null,buffer:WebGLBuffer|null=null;
  function dispose(){if(buffer)gl!.deleteBuffer(buffer);if(program)gl!.deleteProgram(program);shaders.forEach(s=>gl!.deleteShader(s))}
  function compile(type:number,source:string){const shader=gl!.createShader(type);if(!shader)return null;shaders.push(shader);gl!.shaderSource(shader,source);gl!.compileShader(shader);return gl!.getShaderParameter(shader,gl!.COMPILE_STATUS)?shader:null}
  const vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment);
  if(!vs||!fs){dispose();return}
  program=gl.createProgram();if(!program){dispose();return}gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS)){dispose();return}
  gl.useProgram(program);buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  const size=gl.getUniformLocation(program,'resolution'),clock=gl.getUniformLocation(program,'time'),drops=gl.getUniformLocation(program,'ripples[0]');
  const waves=new Float32Array(32);for(let i=0;i<8;i++)waves[i*4+2]=-100;
  let width=1,height=1,raf=0,last=0,elapsed=0,slot=0,lastDrop=-100,textEnergy=0,visible=true,lost=false,previous={x:-1000,y:-1000};
  let textBounds:DOMRect[]=[],textActive=false;
  function resize(){const box=host!.getBoundingClientRect();width=box.width;height=box.height;if(!width||!height)return;const dpr=Math.min(devicePixelRatio,1,800/width);el!.width=Math.round(width*dpr);el!.height=Math.round(height*dpr);gl!.viewport(0,0,el!.width,el!.height);textBounds=[...host!.querySelectorAll('.brand-philosophy,.wonder-invitation')].map(e=>e.getBoundingClientRect());}
  function move(e:PointerEvent){if(e.pointerType==='touch'||!visible||document.hidden)return;const box=host!.getBoundingClientRect(),x=e.clientX-box.left,y=e.clientY-box.top;
   if(elapsed-lastDrop>.065&&Math.hypot(x-previous.x,y-previous.y)>5){waves.set([x/height,(height-y)/height,elapsed,.9],slot*4);slot=(slot+1)%8;lastDrop=elapsed;previous={x,y};}
   if(textBounds.some(r=>e.clientX>r.left-25&&e.clientX<r.right+25&&e.clientY>r.top-20&&e.clientY<r.bottom+20))textEnergy=1;
  }
  function draw(now:number){raf=0;if(lost||!visible||document.hidden)return;if(now-last<(elapsed-lastDrop<4?40:250)){raf=requestAnimationFrame(draw);return}const dt=Math.min((now-last)/1000,.3);last=now;elapsed+=dt;textEnergy*=Math.exp(-dt*2.2);
   gl!.uniform2f(size,width,height);gl!.uniform1f(clock,elapsed);gl!.uniform4fv(drops,waves);gl!.drawArrays(gl!.TRIANGLES,0,6);
   if(textEnergy>.01){displacement.current?.setAttribute('scale',(textEnergy*3.5).toFixed(2));if(!textActive){host!.dataset.waterTextActive='true';textActive=true}}else if(textActive){host!.removeAttribute('data-water-text-active');textActive=false}
   if(textEnergy>.01)turbulence.current?.setAttribute('baseFrequency',`${(.012+Math.sin(elapsed*.9)*.002).toFixed(4)} ${(.022+Math.cos(elapsed*.7)*.003).toFixed(4)}`);
   raf=requestAnimationFrame(draw);
  }
  function resume(){if(!raf&&visible&&!document.hidden&&!lost){last=performance.now();raf=requestAnimationFrame(draw)}}
  function visibility(){if(document.hidden){cancelAnimationFrame(raf);raf=0}else resume()}
  function contextLost(e:Event){e.preventDefault();lost=true;cancelAnimationFrame(raf);raf=0;host!.removeAttribute('data-water-ready');host!.style.removeProperty('--water-text-filter')}
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)resume();else{cancelAnimationFrame(raf);raf=0}});intersection.observe(host);
  host.style.setProperty('--water-text-filter',`url(#${id})`);host.dataset.waterReady='true';el.dataset.renderer='webgl';
  host.addEventListener('pointermove',move,{passive:true});document.addEventListener('visibilitychange',visibility);el.addEventListener('webglcontextlost',contextLost);resume();
  return()=>{cancelAnimationFrame(raf);observer.disconnect();intersection.disconnect();host.removeEventListener('pointermove',move);document.removeEventListener('visibilitychange',visibility);el.removeEventListener('webglcontextlost',contextLost);host.removeAttribute('data-water-ready');host.removeAttribute('data-water-text-active');host.style.removeProperty('--water-text-filter');delete el.dataset.renderer;dispose()};
 },[id,reduced]);
 return <><canvas className="water-surface" ref={canvas} aria-hidden="true"/><svg className="water-filter-definitions" width="0" height="0" aria-hidden="true"><defs><filter id={id} x="-8%" y="-20%" width="116%" height="140%" colorInterpolationFilters="sRGB"><feTurbulence ref={turbulence} type="fractalNoise" baseFrequency=".012 .022" numOctaves="2" seed="7" result="water"/><feDisplacementMap ref={displacement} in="SourceGraphic" in2="water" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter></defs></svg></>;
}
