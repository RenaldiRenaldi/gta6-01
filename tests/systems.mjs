// Mission progression regression checks, independent of WebGL.
import assert from 'node:assert/strict';
import {createMissions,updateMission,missionTarget} from '../game/src/missions.js';
import {createInput} from '../game/src/input.js';
class Position{constructor(x=0,y=0,z=0){Object.assign(this,{x,y,z});}distanceTo(o){return Math.hypot(this.x-o.x,this.y-o.y,this.z-o.z);}}
const profile={completed:0,cash:2450},mission=createMissions(profile),player={vehicle:{model:{position:new Position(0,0,294)}}},police={heat:0},combat={crew:[{active:true}]};let successes=0,failed=false;
const step=dt=>updateMission(mission,player,profile,combat,police,dt,()=>successes++,()=>failed=true);
step(.1);assert.equal(mission.index,1);assert.equal(profile.cash,3100);
player.vehicle.model.position=new Position(210,0,-70);step(.1);assert.equal(mission.phase,1);assert.equal(mission.index,1);assert.deepEqual(missionTarget(mission),[-210,0,70]);
player.vehicle.model.position=new Position(-210,0,70);step(.1);assert.equal(mission.index,2);
player.model={position:new Position(-280,0,-70)};player.vehicle=null;step(.1);assert.equal(mission.index,2);combat.crew[0].active=false;step(.1);assert.equal(mission.index,3);
player.vehicle={model:{position:new Position(140,0,294)}};police.heat=1;step(.1);assert.equal(mission.index,3);police.heat=0;step(.1);assert.equal(mission.index,4);
player.vehicle.model.position=new Position(0,0,0);step(91);assert.equal(failed,true);assert.equal(mission.failed,true);assert.equal(profile.completed,4);
const restored=createMissions({completed:5});assert.equal(restored.done,true);assert.equal(successes,5);
console.log('PASS: delivery reward, both pickups, rival encounter, wanted requirement, timer failure, saved progression');
