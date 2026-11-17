// Marco’s visible rig and mutable on-foot state.
export function createPlayer(world){
 const model=world.makePerson(0xb96d4f);
 return {model,health:100,heading:Math.PI,vehicle:null,ammo:12,reserve:48,cooldown:0,walkPhase:0,cashBonus:0,reload:0};
}
