// Sidewalk routes and short-lived flight responses to danger.
export function updatePedestrians(world,player,dt){
 const origin=player.vehicle?.model.position??player.model.position;
 for(const p of world.walkers){
  const d=p.model.position.distanceTo(origin);
  if(d<15&&(player.vehicle||player.cooldown>.1))p.flee=2.6;else p.flee=Math.max(0,p.flee-dt);
  if(p.flee>0){const away=p.model.position.clone().sub(origin);away.y=0;if(away.lengthSq()>.1){away.normalize();const next=p.model.position.clone().addScaledVector(away,dt*5.8);if(!world.blocked(next,.5))p.model.position.copy(next);p.model.rotation.y=Math.atan2(away.x,away.z);}}
  else{p.model.position.z+=p.dir*p.speed*dt;p.model.position.x+=(p.lane-p.model.position.x)*dt*.8;if(p.model.position.z>305)p.dir=-1;if(p.model.position.z< -305)p.dir=1;p.model.rotation.y=p.dir>0?0:Math.PI;}
  p.model.children[2].rotation.x=Math.sin(performance.now()*.006+p.model.id)*.2;
  if(player.vehicle&&d<2.8&&Math.abs(player.vehicle.speed)>12&&p.flee<4){p.flee=7;world.puff(p.model.position.clone(),0xe8d3b4);player.vehicle.speed*=.78;player.crime('PEDESTRIAN STRUCK / HEAT +1');p.model.position.x+=4;}
 }
}
