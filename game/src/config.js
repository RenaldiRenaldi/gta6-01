// City tuning and the original five-job story.
export const CITY = { block:70, road:21, extent:315, traffic:26, walkers:48 };
export const SAVE_KEY = 'solmara.profile.v1';
export const MISSIONS = [
 {title:'THE PACKAGE',brief:'ISABEL: Welcome home, Marco. That sedan at the curb is yours if you can take it. Bring my parcel to the marina. Quietly.',detail:'Take a car. Deliver Isabel’s parcel to the marina.',target:[0,0,294],car:true,reward:650},
 {title:'THE CREW',brief:'LUZ: Nico is waiting by Glass Row. Pick him up, then swing past Old Town for me. Keep the engine running.',detail:'Pick up Nico at Glass Row, then Luz in Old Town.',target:[210,0,-70],second:[-210,0,70],car:true,reward:900},
 {title:'THE EXCHANGE',brief:'NICO: The Vela crew sold us out. They have our ledger at the west exchange. Get it back. We need you on foot.',detail:'Exit your car. Defeat the Vela crew at the exchange.',target:[-280,0,-70],combat:true,reward:1200},
 {title:'THE GETAWAY',brief:'ISABEL: The ledger names half the city. Every patrol has your description. Break their line of sight, then meet me on the coast.',detail:'Lose the 3-star pursuit. Reach the coastal safehouse.',target:[140,0,294],heat:3,car:true,reward:1500},
 {title:'THE DEBT',brief:'MARCO: One final delivery. The ledger buys our freedom, but the boat leaves in ninety seconds. Nobody owns us after tonight.',detail:'Deliver the ledger to the west pier before time expires.',target:[-280,0,294],timer:90,car:true,reward:2500},
];
export const PALETTE = {asphalt:0x37484b,sand:0xd9c496,sea:0x278f98,ivory:0xf1e8d3,coral:0xd96e55,teal:0x35a69b,gold:0xf2c56b};
