// Explicit job phases, completion conditions, rewards and timed failure.
import { MISSIONS } from './config.js';
export function createMissions(profile){return {index:Math.min(profile.completed,MISSIONS.length-1),done:profile.completed>=MISSIONS.length,elapsed:0,phase:0,failed:false};}
export function currentMission(state){return MISSIONS[Math.min(state.index,MISSIONS.length-1)];}
export function missionTarget(state){const m=currentMission(state);return state.phase&&m.second?m.second:m.target;}
export function updateMission(state,player,profile,combat,police,dt,onComplete,onFail){
 if(state.done||state.failed)return;
 state.elapsed+=dt;
 const m=currentMission(state),p=player.vehicle?.model.position??player.model.position,t=new p.constructor(...missionTarget(state));
 if(m.timer&&state.elapsed>m.timer){state.failed=true;onFail('The boat left without you. The debt is still yours.');return;}
 let complete=p.distanceTo(t)<13&&(!m.car||!!player.vehicle);
 if(m.combat)complete=!player.vehicle&&combat.crew.every(e=>!e.active);
 if(m.heat)complete=complete&&police.heat===0;
 if(!complete)return;
 if(m.second&&state.phase===0){state.phase=1;onComplete('NICO IS IN / Pick up Luz in Old Town.',false);return;}
 profile.completed=Math.max(profile.completed,state.index+1);profile.cash+=m.reward;state.index++;state.phase=0;state.elapsed=0;
 if(state.index>=MISSIONS.length)state.done=true;
 onComplete(state.done?'CITY OF OPEN ROADS / STORY COMPLETE':`JOB COMPLETE +$${m.reward.toLocaleString()} / ${currentMission(state).title}`,true);
}
