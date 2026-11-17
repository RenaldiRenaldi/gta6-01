// Screenshot presets initialize real simulation entities; the normal loop renders each view.
export function stageShot(name,world,player,mission,police){
 let yaw=.35;
 if(name==='cover'||name==='night'){
  player.vehicle=world.vehicles.find(v=>!v.traffic&&!v.police);player.vehicle.traffic=false;player.vehicle.speed=name==='cover'?31:18;
  player.vehicle.model.position.set(0,0,name==='cover'?155:225);player.vehicle.model.rotation.y=Math.PI;player.model.position.copy(player.vehicle.model.position);player.model.visible=false;
  police.heat=name==='cover'?3:5;police.lastCrime=0;mission.index=3;
  for(let i=0;i<Math.ceil(police.heat/1.4);i++){
   const pos=player.vehicle.model.position.clone();pos.x+=[-4,4,-6,6][i%4];pos.z-=16+i*6;
   const unit=world.spawnPolice(pos);unit.alert=100;unit.last=pos.clone();police.units.push(unit);
  }
  for(let i=0;i<Math.min(world.trafficCars.length,8);i++){
   const car=world.trafficCars[i],lane=[-8,-4,4,8][i%4];car.model.position.set(lane,0,120+i*24);car.axis='z';car.dir=i%2?1:-1;car.speed=car.baseSpeed=8;
  }
  if(name==='night')world.dusk();
 }else if(name==='foot'){
  player.model.position.set(210,0,-25);player.heading=Math.PI;player.model.rotation.y=Math.PI;mission.index=1;
  world.walkers[0].model.position.set(222.5,0,-42);world.walkers[0].lane=222.5;world.walkers[1].model.position.set(197.5,0,-52);world.walkers[1].lane=197.5;world.vehicles[0].model.position.set(214,0,-89);world.vehicles[0].axis="z";world.vehicles[0].dir=1;
  yaw=.42;
 }else{
  player.vehicle=world.vehicles.find(v=>!v.traffic&&!v.police);player.vehicle.model.position.set(0,0,257);player.vehicle.model.rotation.y=0;player.vehicle.speed=9;player.model.position.copy(player.vehicle.model.position);player.model.visible=false;mission.index=0;yaw=Math.PI+.4;
 }
 mission.done=false;mission.elapsed=0;
 world.camera.position.copy(player.vehicle?.model.position??player.model.position);
 return yaw;
}
