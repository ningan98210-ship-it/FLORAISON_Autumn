/* FLORAISON AW27 motion layer: falling leaves, cursor ring, click sparks, scroll reveal */
(function(){
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const HOVER=matchMedia('(hover:hover) and (pointer:fine)').matches;
const css=document.createElement('style');
css.textContent=`
#fxLeaves{position:fixed;inset:0;pointer-events:none;z-index:40}
#fxRing{position:fixed;left:0;top:0;width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;border:1.5px solid var(--acc,#E3C98F);pointer-events:none;z-index:99;
  transition:width .25s,height .25s,margin .25s,background .25s,border-color .4s,opacity .3s;mix-blend-mode:normal;opacity:0}
#fxRing.on{opacity:1}
#fxRing.big{width:64px;height:64px;margin:-32px 0 0 -32px;background:color-mix(in srgb,var(--acc,#E3C98F) 16%,transparent)}
#fxDot{position:fixed;left:0;top:0;width:6px;height:6px;margin:-3px 0 0 -3px;border-radius:50%;background:var(--acc,#E3C98F);pointer-events:none;z-index:99;opacity:0;transition:opacity .3s}
#fxDot.on{opacity:1}
.fxSpark{position:fixed;width:7px;height:7px;border-radius:2px;pointer-events:none;z-index:98;animation:fxS .8s cubic-bezier(.2,.7,.3,1) forwards}
@keyframes fxS{to{transform:translate(var(--dx),var(--dy)) rotate(var(--r));opacity:0}}
.rv{opacity:0;translate:0 26px;scale:.97;transition:opacity .7s ease,translate .8s cubic-bezier(.2,.8,.2,1),scale .8s cubic-bezier(.2,.8,.2,1),transform .25s ease,box-shadow .3s}
.rv.in{opacity:1;translate:none;scale:none}
@media(prefers-reduced-motion:reduce){.rv{opacity:1;translate:none;scale:none}}`;
document.head.appendChild(css);

/* scroll reveal, re-scannable */
const io='IntersectionObserver' in window?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){const el=e.target;setTimeout(()=>el.classList.add('in'),+(el.dataset.d||0));io.unobserve(el)}}),{threshold:.08,rootMargin:'0px 0px -5% 0px'}):null;
window.FX={reveal(root){(root||document).querySelectorAll('.rv:not(.in)').forEach((el,i)=>{if(!el.dataset.d)el.dataset.d=Math.min(i,14)*45;io?io.observe(el):el.classList.add('in')})},
  replay(root){(root||document).querySelectorAll('.rv').forEach(el=>{el.classList.remove('in')});this.reveal(root)},
  colors:['#C9A15A','#D97C5B','#9C3302','#B2643C','#7A1E2C','#E0A458']};
document.addEventListener('DOMContentLoaded',()=>FX.reveal());
if(RM)return;

/* leaves */
const cv=document.createElement('canvas');cv.id='fxLeaves';const c=cv.getContext('2d');
let W,H,dpr=Math.min(2,devicePixelRatio||1);
function size(){W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;c.setTransform(dpr,0,0,dpr,0,0)}
addEventListener('resize',size);
const N=Math.round(Math.min(26,Math.max(10,innerWidth/60)));
const mk=(top)=>({x:Math.random()*innerWidth,y:top?-30-Math.random()*innerHeight:Math.random()*innerHeight,s:6+Math.random()*9,vy:.35+Math.random()*.6,ph:Math.random()*6.28,sw:.6+Math.random()*1.2,
  r:Math.random()*6.28,vr:(Math.random()-.5)*.03,flip:Math.random()*6.28,k:Math.random()<.55?0:(Math.random()<.5?1:2),c:FX.colors[Math.floor(Math.random()*FX.colors.length)],a:.55+Math.random()*.35,vx:0});
let L=[],mx=-999,my=-999,pmx=0,wind=0;
function leaf(l){c.save();c.translate(l.x,l.y);c.rotate(l.r);c.scale(Math.cos(l.flip),1);c.globalAlpha=l.a;c.fillStyle=l.c;const s=l.s;c.beginPath();
  if(l.k===0){/* maple */const pts=[[0,-1],[.22,-.55],[.62,-.75],[.48,-.3],[1,-.18],[.55,.1],[.7,.48],[.2,.32],[0,.62],[-.2,.32],[-.7,.48],[-.55,.1],[-1,-.18],[-.48,-.3],[-.62,-.75],[-.22,-.55]];
    pts.forEach(([x,y],i)=>i?c.lineTo(x*s,y*s):c.moveTo(x*s,y*s));c.closePath();c.fill();c.strokeStyle='rgba(0,0,0,.18)';c.lineWidth=.8;c.beginPath();c.moveTo(0,.62*s);c.lineTo(0,1.1*s);c.stroke()}
  else if(l.k===1){/* oval leaf */c.ellipse(0,0,s*.45,s,0,0,6.28);c.fill();c.strokeStyle='rgba(0,0,0,.16)';c.lineWidth=.7;c.beginPath();c.moveTo(0,-s);c.lineTo(0,s);c.stroke()}
  else{/* petal */c.moveTo(0,-s*.8);c.quadraticCurveTo(s*.7,-s*.2,0,s*.8);c.quadraticCurveTo(-s*.7,-s*.2,0,-s*.8);c.fill()}
  c.restore()}
let last=performance.now(),run=true;
function tick(t){const dt=Math.min(3,(t-last)/16.7);last=t;c.clearRect(0,0,W,H);wind*=.96;
  for(const l of L){l.ph+=.02*dt;l.y+=l.vy*dt;l.x+=(Math.sin(l.ph)*l.sw*.5+wind+l.vx)*dt;l.vx*=.95;l.r+=l.vr*dt;l.flip+=.03*dt;
    const dx=l.x-mx,dy=l.y-my,d2=dx*dx+dy*dy;if(d2<6400){const d=Math.sqrt(d2)||1;l.vx+=dx/d*1.6;l.y+=dy/d*1.2}
    if(l.y>H+30||l.x<-40||l.x>W+40)Object.assign(l,mk(true),{y:-20});leaf(l)}
  if(run)requestAnimationFrame(tick)}
function start(){document.body.appendChild(cv);size();L=Array.from({length:N},()=>mk(false));requestAnimationFrame(tick)}
document.addEventListener('visibilitychange',()=>{run=!document.hidden;if(run){last=performance.now();requestAnimationFrame(tick)}});
addEventListener('mousemove',e=>{wind+=(e.clientX-pmx)*.002;wind=Math.max(-2,Math.min(2,wind));pmx=e.clientX;mx=e.clientX;my=e.clientY},{passive:true});
window.FX.leaves=(cols,alpha)=>{if(cols&&cols.length){FX.colors=cols;L.forEach((l,i)=>{l.c=cols[i%cols.length]})}cv.style.opacity=alpha==null?1:alpha};

/* cursor ring */
if(HOVER){const ring=document.createElement('div');ring.id='fxRing';const dot=document.createElement('div');dot.id='fxDot';
  let rx=0,ry=0,tx=0,ty=0;
  addEventListener('mousemove',e=>{tx=e.clientX;ty=e.clientY;dot.style.transform=`translate(${tx}px,${ty}px)`;ring.classList.add('on');dot.classList.add('on');
    ring.classList.toggle('big',!!e.target.closest('a,button,[role=button],.tile,.chip,.env,.row,.mc,.kstop,img[data-go],li[data-go]'))},{passive:true});
  document.addEventListener('mouseleave',()=>{ring.classList.remove('on');dot.classList.remove('on')});
  (function f(){rx+=(tx-rx)*.18;ry+=(ty-ry)*.18;ring.style.transform=`translate(${rx}px,${ry}px)`;requestAnimationFrame(f)})();
  document.addEventListener('DOMContentLoaded',()=>{document.body.append(ring,dot)});if(document.body)document.body.append(ring,dot)}

/* click sparks */
addEventListener('pointerdown',e=>{if(!e.target.closest('a,button,[role=button],.tile,.chip,.env,.kstop,.pal button'))return;
  for(let i=0;i<10;i++){const s=document.createElement('i');s.className='fxSpark';const a=Math.random()*6.28,d=30+Math.random()*40;
    s.style.cssText=`left:${e.clientX}px;top:${e.clientY}px;background:${FX.colors[i%FX.colors.length]};--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d}px;--r:${Math.random()*360}deg`;
    document.body.appendChild(s);setTimeout(()=>s.remove(),850)}},{passive:true});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
