export function updateTraffic(world,player,dt,now){
 for(const c of world.vehicles){
  if(c.police||c===player.vehicle||!c.traffic)continue;
  const p=c.model.position,axis=c.axis,front=world.vehicles.some(v=>v!==c&&Math.abs(v.model.position[axis]-p[axis])<13&&Math.abs(v.model.position[axis==='x'?'z':'x']-p[axis==='x'?'z':'x'])<3&&Math.sign(v.model.position[axis]-p[axis])===c.dir);
  const crossing=Math.abs(p[axis]/70-Math.round(p[axis]/70))*70;
  const red=c.axis==='x'?now%14<6:now%14>8;
  let desired=c.baseSpeed;if(front)desired=1.5;if(red&&crossing>9&&crossing<17)desired=1.5;
  c.speed+=(desired-c.speed)*Math.min(1,dt*2.5);p[axis]+=c.dir*c.speed*dt;
  if(p[axis]>310)p[axis]=-310;if(p[axis]<-310)p[axis]=310;
  c.model.rotation.y=axis==='x'?(c.dir>0?Math.PI/2:-Math.PI/2):(c.dir>0?0:Math.PI);
  if(player.vehicle&&p.distanceTo(player.vehicle.model.position)<4.5&&Math.abs(player.vehicle.speed)>10){player.vehicle.speed*=.85;world.puff(p.clone(),0xe8cf9b);player.health=Math.max(0,player.health-2);}
 }
}
