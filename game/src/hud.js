// DOM instruments and a player-centered live street map.
import { MISSIONS } from './config.js';
import { currentMission,missionTarget } from './missions.js';
export function createHud(){
 const $=id=>document.getElementById(id),ctx=$('map').getContext('2d');let toastUntil=0,briefUntil=0;
 function toast(message){$('toast').textContent=message;toastUntil=performance.now()+4500;$('status').textContent=message;}
 return {show(){$('hud').classList.remove('hidden');$('screen').classList.add('hidden');},toast,brief(message){$('radio-copy').textContent=message;briefUntil=performance.now()+12000;},
 update(world,player,profile,mission,police,now){
  const m=currentMission(mission),target=missionTarget(mission),pos=player.vehicle?.model.position??player.model.position,distance=Math.round(Math.hypot(target[0]-pos.x,target[2]-pos.z));
  $('mission-title').textContent=mission.done?'SOLMARA, YOURS':m.title;
  $('mission-index').textContent=`${String(Math.min(mission.index+1,MISSIONS.length)).padStart(2,'0')} / ${String(MISSIONS.length).padStart(2,'0')}`;
  let objective=mission.done?'Story complete. The coast is yours. Explore, survive and build your best score.':m.detail;
  if(m.second&&mission.phase)objective='Nico is in. Pick up Luz in Old Town.';
  if(m.heat&&police.heat>0)objective='Break line of sight. Lose the pursuit before reaching the safehouse.';
  if(m.timer)objective+=` ${Math.max(0,Math.ceil(m.timer-mission.elapsed))}s LEFT`;
  $('objective').textContent=objective; $('distance').textContent=mission.done?'FREE ROAM':`${distance} M TO OBJECTIVE`;
  $('cash').textContent='$'+(profile.cash+player.cashBonus).toLocaleString();
  $('stars').textContent='★'.repeat(Math.ceil(police.heat))+'☆'.repeat(5-Math.ceil(police.heat));
  $('heat-label').textContent=police.heat?(police.hidden>1?'SEARCHING':'IN PURSUIT'):'HEAT';
  $('health-fill').style.width=Math.max(0,player.health)+'%';$('ammo').textContent=player.reload>0?'RELOADING':`${player.ammo} / ${player.reserve}`;
  $('speed').innerHTML=`${Math.round(Math.abs(player.vehicle?.speed||0)*3.6)} <small>KM/H</small>`;
  $('vehicle-name').textContent=player.vehicle?'CORMORANT / STOLEN':'MARCO REYES / ON FOOT';
  const minutes=Math.floor(16*60+42+now*.12)%1440;$('time').textContent=`${String(Math.floor(minutes/60)).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}`;
  $('district').textContent=pos.z>245?'MARINA / 04':pos.x>70?'GLASS ROW / 02':pos.x< -120?'OLD TOWN / 01':'PALMA AVENUE / 03';
  $('toast').style.opacity=performance.now()<toastUntil?'1':'0';$('radio').classList.toggle('hidden',performance.now()>briefUntil);
  $('crosshair').classList.toggle('hidden',!!player.vehicle);
  $('hint').innerHTML=player.vehicle?'WASD DRIVE <em>·</em> SPACE HANDBRAKE <em>·</em> E EXIT':'WASD MOVE <em>·</em> SHIFT RUN <em>·</em> E TAKE CAR <em>·</em> CLICK FIRE <em>·</em> R RELOAD';
  drawMap(ctx,world,player,target,mission.done,police);
 }};
}
function drawMap(ctx,world,player,target,done,police){
 const w=ctx.canvas.width,c=w/2,scale=.29,pos=player.vehicle?.model.position??player.model.position;
 ctx.clearRect(0,0,w,w);ctx.save();ctx.beginPath();ctx.arc(c,c,c-2,0,Math.PI*2);ctx.clip();ctx.fillStyle='#132d35';ctx.fillRect(0,0,w,w);
 const point=(x,z)=>[c+(x-pos.x)*scale,c+(z-pos.z)*scale];
 ctx.fillStyle='#2c7581';const coast=point(0,325)[1];ctx.fillRect(0,coast,w,w);
 ctx.strokeStyle='#728983';ctx.lineWidth=3.2;
 for(let i=-4;i<=4;i++){const x=point(i*70,0)[0],y=point(0,i*70)[1];ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,w);ctx.stroke();ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
 for(const v of world.vehicles){const [x,y]=point(v.model.position.x,v.model.position.z);ctx.fillStyle=v.police?'#ff6e6b':'#e1daca';ctx.fillRect(x-1.7,y-1.7,v.police?5:3,v.police?5:3);}
 if(!done){let [x,y]=point(target[0],target[2]);const dx=x-c,dy=y-c,d=Math.hypot(dx,dy);if(d>c-12){x=c+dx/d*(c-12);y=c+dy/d*(c-12);}ctx.fillStyle='#ffd480';ctx.save();ctx.translate(x,y);ctx.rotate(Math.PI/4);ctx.fillRect(-4,-4,8,8);ctx.restore();}
 ctx.save();ctx.translate(c,c);ctx.rotate(-(player.vehicle?.model.rotation.y??player.heading));ctx.fillStyle='#7df5d1';ctx.beginPath();ctx.moveTo(0,7);ctx.lineTo(-4,-4);ctx.lineTo(4,-4);ctx.closePath();ctx.fill();ctx.restore();ctx.fillStyle='#ebeadb';ctx.font='bold 11px Arial';ctx.fillText('N',c-4,15);ctx.restore();
}
