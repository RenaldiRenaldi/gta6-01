// Boot, menu state, fixed screenshot staging and the live simulation loop.
import * as T from '../vendor/three.module.min.js';
import { MISSIONS } from './config.js';
import { createWorld } from './world.js';
import { createPlayer } from './player.js';
import { createInput } from './input.js';
import { loadProfile,saveProfile } from './save.js';
import { createAudio } from './audio.js';
import { createPolice,updatePolice } from './police.js';
import { updateTraffic } from './traffic.js';
import { updatePedestrians } from './pedestrian.js';
import { createMissions,updateMission,currentMission,missionTarget } from './missions.js';
import { createCombat,updateCombat } from './combat.js';
import { createHud } from './hud.js';
import { drive,enterCar,exitCar,nearestCar } from './vehicle.js';
import { stageShot } from './shots.js';

const world=createWorld(),input=createInput(document.querySelector('#world')),audio=createAudio(),hud=createHud();
const profile=loadProfile(),player=createPlayer(world),mission=createMissions(profile),police=createPolice(world),combat=createCombat(world);
const params=new URLSearchParams(location.search),shot=params.get('shot');
let screen='title',now=0,last=performance.now(),yaw=.3,pitch=.1,frames=0,saveClock=0,bustClock=0,footClock=0;
player.model.position.set(-12,0,8);
player.cashBonus=profile.bonus||0;
for(const [x,z,rot,color] of [[-6,8,Math.PI,0x217b70],[17,70,0,0xd2ad6c],[87,-7,Math.PI/2,0xb15f47],[-157,5,Math.PI/2,0x456d84],[207,0,0,0xc6baa5],[-87,-7,Math.PI/2,0x6c7772]]){
 const model=world.makeCar(color);model.position.set(x,0,z);model.rotation.y=rot;world.vehicles.push({model,traffic:false,speed:0,baseSpeed:0});
}
function crime(message,amount=1){police.addCrime(amount,now);hud.toast(message);}
player.crime=crime;
function setScreen(name){screen=name;for(const id of ['screen','pause','end'])document.getElementById(id).classList.toggle('hidden',id!==(name==='title'?'screen':name));document.getElementById('hud').classList.toggle('hidden',name!=='play');if(name!=='play'&&document.pointerLockElement)document.exitPointerLock();}
function briefing(){if(!mission.done)hud.brief(currentMission(mission).brief);}
function begin(){setScreen('play');hud.show();briefing();audio.step();if(currentMission(mission).heat)crime('THE CITY IS LOOKING FOR YOU',currentMission(mission).heat);}
function fail(title,message){document.getElementById('end-tag').textContent='MARCO REYES / RUN ENDED';document.getElementById('end-title').textContent=title;document.getElementById('end-copy').textContent=message;profile.best=Math.max(profile.best,Math.round(now));saveProfile(profile);setScreen('end');}
function retry(){location.href=location.pathname;}
function restartStory(){profile.completed=0;profile.cash=2450;profile.bonus=0;saveProfile(profile);retry();}
for(const [id,action] of [['start',begin],['resume',()=>setScreen('play')],['restart',restartStory],['again',retry]])document.getElementById(id).addEventListener('click',action);
 if(shot){setScreen('play');hud.show();yaw=stageShot(shot,world,player,mission,police);}
function moveOnFoot(dt){
 const f=(input.down('KeyW')||input.down('ArrowUp')?1:0)-(input.down('KeyS')||input.down('ArrowDown')?1:0),s=(input.down('KeyD')||input.down('ArrowRight')?1:0)-(input.down('KeyA')||input.down('ArrowLeft')?1:0);
 player.heading=yaw+Math.PI;player.model.rotation.y=player.heading;
 if(!f&&!s)return;
 const speed=input.down('ShiftLeft')?10:5.7,move=new T.Vector3(-Math.sin(yaw)*f+Math.cos(yaw)*s,0,-Math.cos(yaw)*f-Math.sin(yaw)*s).normalize();
 const next=player.model.position.clone().addScaledVector(move,speed*dt);
 if(!world.blocked(next,.6))player.model.position.copy(next);
 player.model.position.x=T.MathUtils.clamp(player.model.position.x,-315,315);player.model.position.z=T.MathUtils.clamp(player.model.position.z,-315,321);
 player.walkPhase+=dt*speed*1.5;for(let i=2;i<6;i++)player.model.children[i].rotation.x=Math.sin(player.walkPhase+(i%2)*Math.PI)*.45;
 footClock+=dt;if(footClock>.34){audio.step();footClock=0;}
}
function updateCamera(dt,snap=false){
 const target=player.vehicle?.model.position??player.model.position,distance=player.vehicle?32:14,up=player.vehicle?13:5.2;
 const desired=new T.Vector3(target.x+Math.sin(yaw)*distance,target.y+up+pitch*8,target.z+Math.cos(yaw)*distance);
 world.camera.position.lerp(desired,snap?1:1-Math.exp(-dt*6));world.camera.lookAt(target.x,target.y+1.7,target.z);
 world.camera.fov=60+(player.vehicle?Math.min(10,Math.abs(player.vehicle.speed)*.2):0);world.camera.updateProjectionMatrix();
}
function update(dt){
 if(input.take('Escape')){if(screen==='play')setScreen('pause');else if(screen==='pause')setScreen('play');}
 if(input.take('Enter')){if(screen==='title')begin();else if(screen==='end')retry();else if(screen==='pause')setScreen('play');}
 if(screen!=='play'){updateCamera(dt);return;}
 now+=dt;saveClock+=dt;
 const [mx,my]=input.look();yaw-=mx*.0028;pitch=T.MathUtils.clamp(pitch+my*.0018,-.2,.7);
 if(input.take('KeyE')){
  if(player.vehicle){exitCar(player);hud.toast('MARCO REYES / ON FOOT');}
  else if(enterCar(player,world.vehicles)){crime('VEHICLE TAKEN / HEAT +1');audio.impact();yaw=player.vehicle.model.rotation.y+Math.PI;}
  else hud.toast('MOVE CLOSER TO A CAR / E TO TAKE IT');
 }
 if(player.vehicle){
  const speed=drive(player,input,dt,world);audio.engine(Math.abs(speed),dt);player.model.position.copy(player.vehicle.model.position);
  if(!mx&&!shot){const desired=player.vehicle.model.rotation.y+Math.PI;let delta=Math.atan2(Math.sin(desired-yaw),Math.cos(desired-yaw));yaw+=delta*dt*.7;}
  if(Math.abs(speed)>35&&police.units.some(u=>u.model.position.distanceTo(player.vehicle.model.position)<45)&&now-police.lastCrime>5)crime('SPEEDING PAST PATROL',.5);
 }else moveOnFoot(dt);
 updateTraffic(world,player,dt,now);updatePedestrians(world,player,dt);
 updateCombat(combat,player,input,world,police,audio,dt,now,currentMission(mission).combat);
 updatePolice(world,player,police,dt,now,audio);
 const target=missionTarget(mission);world.beacon.visible=!mission.done;world.beacon.position.set(...target);world.beacon.children[0].material.opacity=.45+Math.sin(now*3)*.15;
 updateMission(mission,player,profile,combat,police,dt,(message,completed)=>{hud.toast(message);audio.reward();saveProfile(profile);if(completed){briefing();if(!mission.done&&currentMission(mission).heat)crime('LEDGER RECOVERED / PURSUIT ACTIVE',3);if(!mission.done&&currentMission(mission).combat){player.ammo=12;player.reserve=Math.max(player.reserve,48);}}},message=>fail('JOB FAILED',message));
 if(player.health<=0)fail('WASTED','The city got the last word. Your completed jobs are safe.');
 const trapped=police.heat>0&&(player.vehicle?Math.abs(player.vehicle.speed)<1.2:true)&&police.units.some(u=>u.model.position.distanceTo(player.model.position)<6);
 bustClock=trapped?bustClock+dt:Math.max(0,bustClock-dt*2);if(bustClock>7)fail('BUSTED','The patrol boxed you in. Next time, break their sightline.');
 if(player.ammo===0&&player.reserve===0&&currentMission(mission).combat&&player.model.position.distanceTo(new T.Vector3(-280,0,-70))<20){player.reserve=24;hud.toast('EXCHANGE AMMO CACHE / +24');}
 profile.bonus=player.cashBonus;profile.best=Math.max(profile.best,Math.round(now));if(saveClock>8){saveClock=0;saveProfile(profile);}
 hud.update(world,player,profile,mission,police,now);updateCamera(dt);
}
function frame(t){
 requestAnimationFrame(frame);const dt=shot?1/60:Math.min(.04,(t-last)/1000);last=t;
 if(!shot||!window.__shotReady){update(dt);frames++;for(let i=world.particles.length-1;i>=0;i--){const p=world.particles[i];p.life-=dt;p.mesh.position.y+=dt;p.mesh.scale.multiplyScalar(1+dt);if(p.life<=0){world.scene.remove(p.mesh);p.mesh.geometry.dispose();p.mesh.material.dispose();world.particles.splice(i,1);}}}
 world.renderer.render(world.scene,world.camera);window.__gameReady=true;if(shot&&frames>=12)window.__shotReady=true;
}
addEventListener('resize',()=>world.resize());document.addEventListener('visibilitychange',()=>{if(document.hidden&&screen==='play'&&!shot)setScreen('pause');});
world.resize();updateCamera(1,true);requestAnimationFrame(frame);
