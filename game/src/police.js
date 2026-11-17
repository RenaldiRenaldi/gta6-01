// Patrol pursuit, obstruction-aware sight, officers and heat decay.
export function createPolice(world){return {heat:0,units:[],officers:[],lastCrime:0,hidden:0,addCrime(amount,now){this.heat=Math.min(5,this.heat+amount);this.lastCrime=now;this.hidden=0;}};}
function sight(world,a,b){const delta=b.clone().sub(a),steps=Math.ceil(delta.length()/7);for(let i=1;i<steps;i++){const p=a.clone().addScaledVector(delta,i/steps);if(world.blocked(p,.1))return false;}return true;}
export function updatePolice(world,player,police,dt,now,audio){
 const target=player.vehicle?.model??player.model;
 while(police.units.length<Math.ceil(police.heat/1.4)){
  const i=police.units.length,pos=target.position.clone();pos.x+=[-4,4,-6,6][i%4];pos.z+=14+i*6;
  const u=world.spawnPolice(pos);u.alert=now;police.units.push(u);
 }
 let seen=false;
 for(const [i,u] of police.units.entries()){
  for(const m of u.model.children)if(m.userData.flash)m.visible=Math.sin(now*18+i+(m.position.x<0?0:Math.PI))>-.3;
  const delta=target.position.clone().sub(u.model.position);delta.y=0;const d=delta.length();const visible=d<95&&sight(world,u.model.position,target.position);
  if(visible){seen=true;u.alert=now;u.last=target.position.clone();}
  if(police.heat>0&&now-u.alert<10&&d>5){const destination=visible?target.position:(u.last??target.position);let goal=destination.clone();
   const p=u.model.position;const rx=Math.round(p.x/70)*70,rz=Math.round(p.z/70)*70;
   if(!sight(world,p,goal)){if(Math.abs(p.x-rx)>10){goal.set(p.x,0,rz);}else if(Math.abs(p.z-rz)>10){goal.set(rx,0,p.z);}else if(Math.abs(goal.x-p.x)>35){goal.set(Math.round(goal.x/70)*70,0,rz);}else goal.set(rx,0,Math.round(goal.z/70)*70);}
   const dir=goal.sub(p);if(dir.lengthSq()>1){dir.normalize();const next=p.clone().addScaledVector(dir,dt*(16+police.heat*2));if(!world.blocked(next,1.6))p.copy(next);u.model.rotation.y=Math.atan2(dir.x,dir.z);}
  }
  if(player.vehicle&&d<6&&police.heat>0){player.vehicle.speed*=Math.exp(-dt*.8);player.health=Math.max(0,player.health-dt*3);}
  if(!player.vehicle&&d<35&&police.officers.length<Math.ceil(police.heat)){const model=world.makePerson(0x2d5273);model.position.copy(u.model.position);police.officers.push({model});}
 }
 for(const o of police.officers){const delta=target.position.clone().sub(o.model.position),d=delta.length();if(police.heat&&d<80){delta.normalize();const next=o.model.position.clone().addScaledVector(delta,dt*5.5);if(!world.blocked(next,.6))o.model.position.copy(next);o.model.rotation.y=Math.atan2(delta.x,delta.z);if(d<2.8&&!player.vehicle)player.health=Math.max(0,player.health-dt*12);}}
 if(police.heat&&now-police.lastCrime>6&&!seen){police.hidden+=dt;if(police.hidden>5){police.heat=Math.max(0,police.heat-dt*.28);if(police.heat<.08){police.heat=0;police.hidden=0;}}}else if(seen)police.hidden=0;
 if(!police.heat){for(const u of police.units){world.scene.remove(u.model);world.vehicles.splice(world.vehicles.indexOf(u),1);}for(const o of police.officers)world.scene.remove(o.model);police.units=[];police.officers=[];}
 audio.siren(police.heat>0&&seen,dt);
}
