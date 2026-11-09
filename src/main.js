import * as THREE from 'three';
import './style.css';

const $ = (id) => document.getElementById(id);
const canvas = $('game-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#a9b5b2');
scene.fog = new THREE.FogExp2('#a9b5b2', 0.0125);
const camera = new THREE.PerspectiveCamera(54, innerWidth / innerHeight, 0.1, 260);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.65));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.13;

scene.add(new THREE.HemisphereLight('#e4f0e9', '#5a6254', 2.0));
const sun = new THREE.DirectionalLight('#ffe3b1', 3.2);
sun.position.set(-32, 54, 25); sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024); sun.shadow.camera.left = -48; sun.shadow.camera.right = 48; sun.shadow.camera.top = 48; sun.shadow.camera.bottom = -48; sun.shadow.bias = -0.0004;
scene.add(sun);
const fill = new THREE.DirectionalLight('#aec8d2', 1.1); fill.position.set(35, 18, -35); scene.add(fill);

const mats = {
  ground: new THREE.MeshStandardMaterial({ color: '#66736b', roughness: 1 }),
  stone: ['#9b9786','#aaa18b','#817f73','#b4a58c','#8b8b7e','#a49c88'].map(color => new THREE.MeshStandardMaterial({ color, roughness: .94 })),
  roof: ['#655f53','#716451','#5c5b52','#84755d'].map(color => new THREE.MeshStandardMaterial({ color, roughness: .9 })),
  wood: new THREE.MeshStandardMaterial({ color: '#59483a', roughness: .88 }),
  trim: new THREE.MeshStandardMaterial({ color: '#d3c7ac', roughness: .85 }),
  cloth: new THREE.MeshStandardMaterial({ color: '#e7e2d4', roughness: .88 }),
  cape: new THREE.MeshStandardMaterial({ color: '#6f855e', roughness: .9 }),
  leather: new THREE.MeshStandardMaterial({ color: '#4b4037', roughness: .88 }),
  metal: new THREE.MeshStandardMaterial({ color: '#b5c2bc', metalness: .68, roughness: .32 }),
  skin: new THREE.MeshStandardMaterial({ color: '#d4a47f', roughness: .78 }),
};
const boxGeo = new THREE.BoxGeometry(1,1,1);
const mat = (color, roughness=.8) => new THREE.MeshStandardMaterial({ color, roughness });
function meshBox(parent, x,y,z, sx,sy,sz, material, cast=true) {
  const o = new THREE.Mesh(boxGeo, material); o.position.set(x,y,z); o.scale.set(sx,sy,sz); o.castShadow=cast; o.receiveShadow=true; parent.add(o); return o;
}
function cylinder(parent, x,y,z, rt,rb,h, material, segments=8) {
  const o=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,segments),material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;
}

// A compact, hand-built old town gives the rooftops readable silhouettes on mobile.
const ground = new THREE.Mesh(new THREE.PlaneGeometry(190,190), mats.ground); ground.rotation.x=-Math.PI/2; ground.position.y=-.12; ground.receiveShadow=true; scene.add(ground);
const roadMat=mat('#766e5e'), pathMat=mat('#918773');
meshBox(scene,0,-.045,0,9,.04,150,roadMat,false); meshBox(scene,0,-.04,0,150,.04,9,roadMat,false);
for(let lane=-70;lane<75;lane+=9){meshBox(scene,lane,-.015,0,.13,.025,7,pathMat,false);meshBox(scene,0,-.015,lane,7,.025,.13,pathMat,false)}
const buildings=[];
for(let ix=-5;ix<=5;ix++) for(let iz=-5;iz<=5;iz++) {
  if ((Math.abs(ix)<=1&&Math.abs(iz)<=1) || (Math.abs(ix)<=1&&Math.abs(iz)<=3&&Math.abs(iz)%2===1) || (Math.abs(iz)<=1&&Math.abs(ix)<=3&&Math.abs(ix)%2===1)) continue;
  const x=ix*12+(Math.random()-.5)*1.5, z=iz*12+(Math.random()-.5)*1.5;
  const w=6.2+Math.random()*2, d=6.2+Math.random()*2, h=5+Math.random()*5.6;
  const b=new THREE.Group();b.position.set(x,0,z);scene.add(b);
  const bodyMat=mats.stone[Math.floor(Math.random()*mats.stone.length)], roofMat=mats.roof[Math.floor(Math.random()*mats.roof.length)];
  meshBox(b,0,h/2,0,w,h,d,bodyMat); meshBox(b,0,h+.25,0,w+.3,.45,d+.3,roofMat);
  const roofType=Math.random();
  if(roofType<.48){
    const ridge=meshBox(b,0,h+.9,0,w+.4,1.05,d*.48,roofMat);ridge.rotation.x=.4;
    const ridge2=meshBox(b,0,h+.9,0,w+.4,1.05,d*.48,roofMat);ridge2.rotation.x=-.4;
  } else if(roofType<.7){meshBox(b,0,h+.72,0,w*.45,.9,d*.44,roofMat)}
  // Recessed windows and lintels on each facade.
  const windowMat=mat('#3b4947');
  for(const side of [-1,1]) for(let row=0;row<2;row++) for(let col=-1;col<=1;col++) {
    const wy=1.5+row*2.15, wx=col*w*.27;
    meshBox(b,wx,wy,side*(d/2+.012),.58,.82,.055,windowMat,false);
    meshBox(b,wx,wy+.48,side*(d/2+.045),.76,.12,.08,mats.trim,false);
  }
  for(const side of [-1,1]) for(let row=0;row<2;row++) for(let col=-1;col<=1;col++) {
    const wz=col*d*.27, wy=1.5+row*2.15;
    meshBox(b,side*(w/2+.012),wy,wz,.055,.82,.58,windowMat,false);
  }
  if(Math.random()<.48){meshBox(b,(Math.random()-.5)*w,h*.55,d/2+.09,.12,h*.75,.1,mats.wood);}
  // corner columns
  for(const cx of [-1,1])for(const cz of [-1,1])meshBox(b,cx*(w/2-.13),h/2,cz*(d/2-.13),.18,h,.18,mats.trim,false);
  buildings.push({x,z,w,d,h,group:b});
}
// Wall towers on the horizon, flags and a distant tree line.
const towerMat=mat('#a59b83');
for(const x of [-58,58])for(const z of [-54,0,54]){
  cylinder(scene,x,5,z,4.2,4.6,10,towerMat,12);cylinder(scene,x,10.5,z,4.7,4.1,1.2,mats.roof[1],12);
  cylinder(scene,x,12,z,1.1,1.25,2.2,towerMat,10);
}
for(let i=0;i<45;i++){
  const x=(Math.random()-.5)*155,z=(Math.random()-.5)*155;
  if(Math.abs(x)<45&&Math.abs(z)<45)continue;
  cylinder(scene,x,.9,z,.14,.26,1.8,mat(i%2?'#505c4b':'#657258'),6);
  const crown=new THREE.Mesh(new THREE.ConeGeometry(1.05,3,7),mat(i%2?'#637456':'#788365'));crown.position.set(x,2.7,z);crown.castShadow=true;scene.add(crown);
}

// Scout avatar: cloak, harness, twin blades, and small gas canisters.
const player=new THREE.Group();scene.add(player);
const avatar=new THREE.Group();player.add(avatar);
const torso=meshBox(avatar,0,1.22,0,.52,.7,.32,mats.cloth);
meshBox(avatar,0,.89,0,.54,.24,.35,mats.leather);
const cape=meshBox(avatar,0,1.12,-.29,.62,.9,.09,mats.cape);cape.rotation.x=-.14;
const head=new THREE.Mesh(new THREE.SphereGeometry(.19,12,10),mats.skin);head.position.set(0,1.78,0);head.castShadow=true;avatar.add(head);
meshBox(avatar,0,1.59,0,.37,.09,.38,mat('#51483d'));
for(const side of [-1,1]){
  const arm=meshBox(avatar,side*.38,1.24,0,.17,.55,.18,mats.cloth);arm.rotation.z=-side*.13;
  meshBox(avatar,side*.38,.86,0,.2,.11,.21,mats.leather);
  const leg=meshBox(avatar,side*.16,.47,0,.2,.73,.23,mat('#665b4a'));leg.rotation.z=-side*.03;
  meshBox(avatar,side*.16,.1,.07,.24,.18,.38,mats.leather);
  meshBox(avatar,side*.31,.89,-.04,.12,.14,.48,mats.metal);
  const hilt=meshBox(avatar,side*.48,1.05,-.03,.12,.12,.22,mats.leather);
  const blade=meshBox(avatar,side*.51,.98,-.38,.075,.08,.72,mats.metal);blade.rotation.x=-.1;
  cylinder(avatar,side*.31,1.05,-.05,.07,.07,.38,mats.metal,8).rotation.z=Math.PI/2;
}
player.position.set(0,3.8,13);

// The wandering giant has a distinct silhouette and readable nape.
const giant=new THREE.Group();scene.add(giant);giant.position.set(0,0,-23);
const giantSkin=mat('#bd8069'), giantLight=mat('#d39779'), shadowSkin=mat('#87584e'), hairMat=mat('#403b36');
const giantBody=new THREE.Group();giant.add(giantBody);
const chest=meshBox(giantBody,0,5.25,0,2.35,3.2,1.25,giantSkin);chest.rotation.z=-.03;
meshBox(giantBody,0,4.35,0,1.7,1.4,1.05,giantSkin);
meshBox(giantBody,0,7.05,0,1.15,.42,.9,giantLight);
const gHead=new THREE.Mesh(new THREE.SphereGeometry(.66,16,14),giantLight);gHead.position.set(0,7.85,.02);gHead.scale.set(.82,1.15,.78);gHead.castShadow=true;giantBody.add(gHead);
const hair=new THREE.Mesh(new THREE.SphereGeometry(.67,12,10),hairMat);hair.position.set(0,8.35,-.07);hair.scale.set(.9,.55,.9);hair.castShadow=true;giantBody.add(hair);
for(const side of [-1,1]){
  const leg=meshBox(giantBody,side*.61,1.95,.02,.72,3.6,.79,giantSkin);leg.rotation.z=-side*.045;
  meshBox(giantBody,side*.62,.28,.14,.8,.42,1.05,shadowSkin);
  const upper=meshBox(giantBody,side*1.52,5.48,0,.72,2.45,.76,giantSkin);upper.rotation.z=-side*.13;
  const fore=meshBox(giantBody,side*1.72,3.95,.12,.58,1.55,.61,giantLight);fore.rotation.z=side*.035;
  const hand=new THREE.Mesh(new THREE.SphereGeometry(.34,10,8),giantSkin);hand.position.set(side*1.75,3.05,.15);hand.castShadow=true;giantBody.add(hand);
  for(let f=0;f<3;f++){const finger=meshBox(giantBody,side*1.75+(f-1)*.16,2.78,.26,.12,.48,.13,giantSkin);finger.rotation.x=-.18;}
  const eye=new THREE.Mesh(new THREE.SphereGeometry(.09,8,6),mat('#f1d9b6'));eye.position.set(side*.24,7.95,.55);giantBody.add(eye);
  const pupil=new THREE.Mesh(new THREE.SphereGeometry(.04,8,6),mat('#3b2927'));pupil.position.set(side*.24,7.95,.625);giantBody.add(pupil);
}
meshBox(giantBody,0,7.52,.55,.35,.075,.08,shadowSkin,false);
// glowing nape marker sits high on the far side of the neck
const napeMat=new THREE.MeshStandardMaterial({color:'#e4c081',emissive:'#976329',emissiveIntensity:.75,roughness:.5});
const nape=new THREE.Mesh(new THREE.SphereGeometry(.24,12,8),napeMat);nape.position.set(0,7.08,-.58);nape.scale.set(1,.75,.45);giantBody.add(nape);

// Hook cables are drawn as crisp, animated lines from the harness to an anchor.
function makeCable(){const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]);const line=new THREE.Line(geo,new THREE.LineBasicMaterial({color:'#d8e2d6',transparent:true,opacity:.9}));line.visible=false;scene.add(line);return line}
const cables=[makeCable(),makeCable()];
const hookDots=[];
for(let i=0;i<2;i++){const o=new THREE.Mesh(new THREE.SphereGeometry(.105,8,8),mat('#d6c18f'));o.visible=false;scene.add(o);hookDots.push(o)}

const timer=new THREE.Timer();
timer.connect(document);
const input={forward:0,back:0,left:0,right:0,boost:false,grapple:false,attack:false};
let started=false, complete=false, gas=100, health=100, blades=4, elapsed=0, toastTimer=0, grappleTimer=0, attackCooldown=0, hurtCooldown=0, slashFlash=0;
let swingTarget=null, speed=0, moveX=0, moveZ=0, attacks=0;
const velocity=new THREE.Vector3(), cameraTarget=new THREE.Vector3(), desiredCam=new THREE.Vector3();
const moveDir=new THREE.Vector3(), forwardVec=new THREE.Vector3(), rightVec=new THREE.Vector3();
const raycaster=new THREE.Raycaster();
const toast=$('toast'), toastText=$('toast-text');
function notify(text, duration=1600){toastText.textContent=text;toast.classList.add('show');toastTimer=duration}
function setStatus(text, ready=false){$('status-text').textContent=text;$('status-text').className=ready?'status-ready':'';}
function updateHud(){
  $('gas-bar').style.width=`${Math.max(0,gas)}%`; $('gas-value').textContent=`${Math.round(gas)}%`;
  $('blade-value').textContent=String(blades).padStart(2,'0');
  document.querySelectorAll('.blade-pips i').forEach((pip,index)=>{pip.style.opacity=index<blades?'1':'.2'});
  const dx=player.position.x-giant.position.x,dz=player.position.z-giant.position.z;
  $('distance-readout').textContent=`${Math.max(1,Math.round(Math.hypot(dx,dz)))} M`;
  $('boss-health').style.width=`${health}%`; $('boss-health-label').innerHTML=`VITALITY <b>${Math.ceil(health)}%</b>`;
}
function getHookPoint(){
  // Aim for the nearest rooftop in the direction of travel; a central ring makes aerial combat possible.
  const dir=new THREE.Vector3(moveX,0,moveZ);
  if(dir.lengthSq()<.02){camera.getWorldDirection(dir);dir.y=0;}
  dir.normalize();
  let best=null,bestScore=Infinity;
  for(const b of buildings){
    const dx=b.x-player.position.x,dz=b.z-player.position.z,dist=Math.hypot(dx,dz);
    if(dist<3||dist>33)continue;
    const dot=(dx*dir.x+dz*dir.z)/dist;
    if(dot<-.28)continue;
    const score=dist-dot*7;
    if(score<bestScore){bestScore=score;best=new THREE.Vector3(b.x,b.h+2,b.z);}
  }
  if(!best){const p=player.position.clone().addScaledVector(dir,14);best=new THREE.Vector3(p.x,11,p.z);}
  return best;
}
function beginGrapple(){
  if(!started||complete||gas<2)return;
  if(grappleTimer>0)return;
  swingTarget=getHookPoint();grappleTimer=1.2;gas=Math.max(0,gas-1.6);speed=Math.max(speed,13);
  input.grapple=true;
  cables.forEach((c,i)=>{c.visible=true;hookDots[i].visible=true;});
  notify('ANCHORS LOCKED · SWING THROUGH',1000);updateHud();
}
function releaseGrapple(){input.grapple=false;}
function attack(){
  if(!started||complete||attackCooldown>0)return;
  if(blades<=0){notify('BLADES REARMING · STAY CLEAR',900);return;}
  attackCooldown=.56;slashFlash=.24;blades--;attacks++;
  const dx=player.position.x-giant.position.x,dz=player.position.z-giant.position.z,dist=Math.hypot(dx,dz);
  const toPlayer=new THREE.Vector3(dx,0,dz).normalize();
  const facing=new THREE.Vector3(Math.sin(giant.rotation.y),0,Math.cos(giant.rotation.y));
  const behind=facing.dot(toPlayer)<-.34;
  if(dist<4.7&&Math.abs(player.position.y-7)<3.7&&behind){
    attacks=Math.max(0,attacks-1);
    const damage=34;health=Math.max(0,health-damage);napeMat.emissiveIntensity=2.2;
    notify('NAPE STRIKE · TARGET WOUNDED',1100);
    if(health<=0){finishMission();}
  }else if(dist<5.4&&Math.abs(player.position.y-7)<4){
    notify('BLOCKED · GET BEHIND THE TARGET',1300);
  }else{notify('NO CONTACT · CLOSE THE DISTANCE',950)}
  if(blades===0){notify('BLADES SPENT · REARMING',1100);setTimeout(()=>{if(started&&!complete){blades=4;updateHud();}},2500)}
  updateHud();
}
function finishMission(){complete=true;input.grapple=false;releaseGrapple();$('mission-complete').classList.add('visible');$('final-score').textContent=`FIELD RATING · ${attacks<=4?'S':'A'}  /  ${attacks} STRIKES`;}
function startGame(){
  if(started)return;started=true;$('intro').classList.add('hidden');$('game-root').classList.remove('intro-active');$('boss-bar').classList.add('visible');notify('SWING BEHIND THE GIANT · STRIKE THE NAPE',2400);setStatus('IN FIELD');
}
$('launch-button').addEventListener('click',startGame);
$('replay-button').addEventListener('click',()=>location.reload());
$('sound-toggle').addEventListener('click',()=>{const icon=$('sound-icon');icon.textContent=icon.textContent==='♪'?'×':'♪';notify(icon.textContent==='×'?'AMBIENCE MUTED':'AMBIENCE ON',900)});
window.addEventListener('keydown',e=>{
  if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
  if(e.code==='KeyW'||e.code==='ArrowUp'){input.forward=1;if(!started)startGame()}if(e.code==='KeyS'||e.code==='ArrowDown')input.back=1;
  if(e.code==='KeyA'||e.code==='ArrowLeft')input.left=1;if(e.code==='KeyD'||e.code==='ArrowRight')input.right=1;
  if(e.code==='ShiftLeft'||e.code==='ShiftRight')input.boost=true;
  if(e.code==='KeyE'&&!e.repeat)beginGrapple();if(e.code==='Space'&&!e.repeat)attack();
});
window.addEventListener('keyup',e=>{
  if(e.code==='KeyW'||e.code==='ArrowUp')input.forward=0;if(e.code==='KeyS'||e.code==='ArrowDown')input.back=0;
  if(e.code==='KeyA'||e.code==='ArrowLeft')input.left=0;if(e.code==='KeyD'||e.code==='ArrowRight')input.right=0;
  if(e.code==='ShiftLeft'||e.code==='ShiftRight')input.boost=false;if(e.code==='KeyE')releaseGrapple();
});
const joy=$('joystick'),knob=$('joy-knob');let joyPointer=null;
function joyMove(e){if(joyPointer!==e.pointerId)return;const r=joy.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let x=e.clientX-cx,y=e.clientY-cy;const max=r.width*.31,len=Math.hypot(x,y);if(len>max){x=x/len*max;y=y/len*max}knob.style.transform=`translate(${x}px,${y}px)`;moveX=x/max;moveZ=y/max;input.left=Math.max(0,-moveX);input.right=Math.max(0,moveX);input.forward=Math.max(0,-moveZ);input.back=Math.max(0,moveZ)}
joy.addEventListener('pointerdown',e=>{joyPointer=e.pointerId;joy.setPointerCapture(e.pointerId);joyMove(e)});
joy.addEventListener('pointermove',joyMove);
function joyEnd(e){if(e.pointerId!==joyPointer)return;joyPointer=null;knob.style.transform='';moveX=moveZ=0;input.left=input.right=input.forward=input.back=0}
joy.addEventListener('pointerup',joyEnd);joy.addEventListener('pointercancel',joyEnd);
function holdButton(el,down,up){el.addEventListener('pointerdown',e=>{e.preventDefault();el.classList.add('pressed');down();});for(const ev of ['pointerup','pointercancel','pointerleave'])el.addEventListener(ev,()=>{el.classList.remove('pressed');up?.()})}
holdButton($('grapple-button'),()=>{input.grapple=true;beginGrapple()},releaseGrapple);
holdButton($('attack-button'),attack);
holdButton($('boost-button'),()=>input.boost=true,()=>input.boost=false);

function update(dt){
  elapsed+=dt;attackCooldown=Math.max(0,attackCooldown-dt);hurtCooldown=Math.max(0,hurtCooldown-dt);slashFlash=Math.max(0,slashFlash-dt);
  if(toastTimer>0){toastTimer-=dt*1000;if(toastTimer<=0)toast.classList.remove('show')}
  if(!started){
    camera.position.set(12+Math.sin(elapsed*.12)*1.3,10,18);camera.lookAt(0,4.2,-11);
    giant.rotation.y=Math.sin(elapsed*.25)*.08;
    return;
  }
  if(complete)return;
  // The giant stalks the scout but pauses just outside striking distance.
  const gx=player.position.x-giant.position.x,gz=player.position.z-giant.position.z,gdist=Math.hypot(gx,gz);
  if(gdist>8.5){giant.position.x+=(gx/gdist)*dt*.48;giant.position.z+=(gz/gdist)*dt*.48;}
  const facingTarget=Math.atan2(gx,gz);
  const turnError=THREE.MathUtils.euclideanModulo(facingTarget-giant.rotation.y+Math.PI,Math.PI*2)-Math.PI;
  giant.rotation.y+=THREE.MathUtils.clamp(turnError,-.9*dt,.9*dt);
  giantBody.position.y=Math.sin(elapsed*2.1)*.045;
  napeMat.emissiveIntensity=slashFlash>0?2.2:.68+Math.sin(elapsed*2)*.16;
  const forward=(input.forward-input.back),side=(input.right-input.left);
  camera.getWorldDirection(forwardVec);forwardVec.y=0;forwardVec.normalize();rightVec.crossVectors(forwardVec,new THREE.Vector3(0,1,0)).normalize().negate();
  moveDir.set(0,0,0).addScaledVector(forwardVec,forward).addScaledVector(rightVec,side);
  if(moveDir.lengthSq()>1)moveDir.normalize();
  moveX=moveDir.x;moveZ=moveDir.z;
  const boosting=input.boost&&gas>0;
  if(boosting)gas=Math.max(0,gas-12*dt);else gas=Math.min(100,gas+3.4*dt);
  const maxSpeed=boosting?18:input.grapple&&grappleTimer>0?14:7.2;
  const acceleration=moveDir.lengthSq()?16:8;
  velocity.x=THREE.MathUtils.damp(velocity.x,moveDir.x*maxSpeed,acceleration,dt);
  velocity.z=THREE.MathUtils.damp(velocity.z,moveDir.z*maxSpeed,acceleration,dt);
  if(grappleTimer>0&&swingTarget){
    grappleTimer=Math.max(0,grappleTimer-dt);
    const pull=new THREE.Vector3(swingTarget.x-player.position.x,0,swingTarget.z-player.position.z);
    if(pull.lengthSq()>.1){pull.normalize();velocity.addScaledVector(pull,dt*11);}
    player.position.y=THREE.MathUtils.damp(player.position.y,Math.min(10,swingTarget.y+1.4),2.2,dt);
    if(grappleTimer<=0){cables.forEach(c=>c.visible=false);hookDots.forEach(h=>h.visible=false);swingTarget=null;}
  }else player.position.y=THREE.MathUtils.damp(player.position.y,3.8,1.6,dt);
  player.position.x+=velocity.x*dt;player.position.z+=velocity.z*dt;
  player.position.x=THREE.MathUtils.clamp(player.position.x,-68,68);player.position.z=THREE.MathUtils.clamp(player.position.z,-68,68);
  speed=Math.hypot(velocity.x,velocity.z);
  $('speed-lines').classList.toggle('active',speed>11);
  if(speed>.25){player.rotation.y=Math.atan2(velocity.x,velocity.z);avatar.rotation.z=THREE.MathUtils.damp(avatar.rotation.z,-velocity.x*.008,.8,dt)}
  // Keep the camera close enough to read the scout while preserving the skyline.
  desiredCam.set(player.position.x-velocity.x*.25,player.position.y+4.5,player.position.z+10.5);
  camera.position.lerp(desiredCam,1-Math.exp(-dt*3.1));
  cameraTarget.set(player.position.x+velocity.x*.33,player.position.y+2.3,player.position.z-8);
  camera.lookAt(cameraTarget);
  if(swingTarget){
    for(let i=0;i<2;i++){const start=player.position.clone().add(new THREE.Vector3(i===0?-.3:.3,1.05,-.04));const end=swingTarget.clone();cables[i].geometry.setFromPoints([start,end]);hookDots[i].position.copy(end)}
  }
  // The city gives a soft collision boundary instead of trapping the player at corners.
  for(const b of buildings){const dx=player.position.x-b.x,dz=player.position.z-b.z;const px=b.w/2+.65, pz=b.d/2+.65;if(Math.abs(dx)<px&&Math.abs(dz)<pz&&player.position.y<b.h+1){const ox=px-Math.abs(dx),oz=pz-Math.abs(dz);if(ox<oz)player.position.x+=Math.sign(dx||1)*ox;else player.position.z+=Math.sign(dz||1)*oz;}}
  if(gdist<4.5&&player.position.y<5&&hurtCooldown<=0){hurtCooldown=2.2;gas=Math.max(0,gas-17);velocity.add(new THREE.Vector3(gx,0,gz).normalize().multiplyScalar(5));player.position.y+=1.3;notify('GIANT SWIPE · EVASIVE ACTION',1200)}
  if(gas<=0&&speed<2&&Math.random()<dt*.55){gas=12;notify('EMERGENCY GAS RESERVE',1100)}
  updateHud();
}
function animate(){requestAnimationFrame(animate);timer.update();const dt=Math.min(timer.getDelta(),.04);update(dt);renderer.render(scene,camera)}
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.65))});
setTimeout(()=>$('loading').classList.add('done'),700);
updateHud();animate();
