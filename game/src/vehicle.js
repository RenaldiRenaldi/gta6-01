// Theft, exit placement, steering and collision response.
export function nearestCar(player,cars){let best=null,d=8;for(const c of cars){if(c.police)continue;const n=c.model.position.distanceTo(player.model.position);if(n<d){d=n;best=c;}}return best;}
export function enterCar(player,cars){const c=nearestCar(player,cars);if(!c)return false;player.vehicle=c;c.traffic=false;c.speed=0;player.model.visible=false;return true;}
export function exitCar(player){if(!player.vehicle)return false;const c=player.vehicle;player.model.position.copy(c.model.position);player.model.position.x+=Math.cos(c.model.rotation.y)*4;player.model.position.z-=Math.sin(c.model.rotation.y)*4;player.heading=c.model.rotation.y;player.vehicle=null;player.model.visible=true;return true;}
export function drive(player,input,dt,world){
 const c=player.vehicle;if(!c)return 0;
 const accel=input.down('KeyW')||input.down('ArrowUp'),brake=input.down('KeyS')||input.down('ArrowDown');
 const steer=(input.down('KeyD')||input.down('ArrowRight')?1:0)-(input.down('KeyA')||input.down('ArrowLeft')?1:0);
 c.speed+=((accel?22:0)-(brake?30:0)-c.speed*.25)*dt;
 if(!accel&&!brake)c.speed*=Math.exp(-dt*.45);
 if(input.down('Space')){c.speed*=Math.exp(-dt*2.8);if(Math.abs(c.speed)>10)world.puff(c.model.position.clone(),0x788080);}
 c.speed=Math.max(-10,Math.min(46,c.speed));
 c.model.rotation.y-=steer*dt*(.55+Math.min(25,Math.abs(c.speed))*.035)*Math.sign(c.speed||1);
 const old=c.model.position.clone();
 c.model.position.x+=Math.sin(c.model.rotation.y)*c.speed*dt;
 c.model.position.z+=Math.cos(c.model.rotation.y)*c.speed*dt;
 if(world.blocked(c.model.position,2)){c.model.position.copy(old);if(Math.abs(c.speed)>12){player.health-=Math.abs(c.speed)*.12;world.puff(old,0xffd18a);}c.speed*=-.25;}
 c.model.position.x=Math.max(-315,Math.min(315,c.model.position.x));c.model.position.z=Math.max(-315,Math.min(310,c.model.position.z));
 return c.speed;
}
