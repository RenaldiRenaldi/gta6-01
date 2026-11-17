// Procedural coastal city geometry, materials and reusable actor factories.
import * as T from '../vendor/three.module.min.js';
import { CITY, PALETTE } from './config.js';

const material = (color, roughness = .8) => new T.MeshStandardMaterial({ color, roughness });
export function createWorld() {
  const scene = new T.Scene();
  scene.background = new T.Color(0xa4d5d6);
  scene.fog = new T.Fog(0xa4d5d6, 220, 650);
  const camera = new T.PerspectiveCamera(60, innerWidth / innerHeight, .1, 1200);
  const renderer = new T.WebGLRenderer({ antialias: true, canvas: document.querySelector('#world') });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  const hemi = new T.HemisphereLight(0xc9f0ee, 0x8b785c, 2.3);
  scene.add(hemi);
  const sun = new T.DirectionalLight(0xffdda0, 2.9);
  sun.position.set(-100, 190, 80);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -320, right: 320, top: 320, bottom: -320, near: 1, far: 550 });
  sun.shadow.bias = -.0003;
  scene.add(sun);
  const asphalt = material(0x37484b), sidewalk = material(0xd5cbb4), sand = material(0xd9c496);
  const glass = material(0x487c86, .3), white = material(0xe8e4d5), dark = material(0x243639), gold = material(0xf6d38b);
  const trunk = material(0x8b6c4b), leaf = material(0x317c60);
  const colliders = [], vehicles = [], walkers = [], particles = [], lamps = [];
  function box(w,h,d,mat,x,y,z,parent=scene) {
    const mesh = new T.Mesh(new T.BoxGeometry(w,h,d),mat);
    mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
  }
  box(700,.3,700,sand,0,-.3,0);
  box(650,.15,650,asphalt,0,-.05,0);
  const water = new T.Mesh(new T.PlaneGeometry(1800,1000), new T.MeshStandardMaterial({color:0x278f98,roughness:.28,metalness:.2}));
  water.rotation.x=-Math.PI/2;water.position.set(0,-.2,835);scene.add(water);
  const facadeColors=[0xe8d9b9,0xd5a388,0xe9dfcc,0xa7b9b2,0xc5bca5,0xd78870];
  function windowTexture(color) {
    const c=document.createElement('canvas');c.width=128;c.height=128;const g=c.getContext('2d');
    g.fillStyle=color;g.fillRect(0,0,128,128);
    for(let x=9;x<128;x+=32)for(let y=9;y<128;y+=32){g.fillStyle='#3b6972';g.fillRect(x,y,16,19);g.fillStyle='#84b1ae';g.fillRect(x+1,y+1,3,16);g.fillStyle='#c8c7ae';g.fillRect(x,y+20,18,2);}
    const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;return tex;
  }
  const textures=facadeColors.map(c=>windowTexture('#'+c.toString(16)));
  // Each block has an unbroken pavement perimeter, clear of both through lanes.
  for(let ix=-4;ix<4;ix++)for(let iz=-4;iz<4;iz++){
    const x=ix*70+35,z=iz*70+35;
    box(49,.25,49,sidewalk,x,.03,z);
    const seed=Math.abs(ix*13+iz*7+81), downtown=ix>0&&iz<1;
    const h=downtown?28+(seed%6)*12:9+(seed%5)*4;
    const w=28+(seed%3)*4,d=29+(seed%2)*5;
    const tex=textures[seed%textures.length].clone();tex.needsUpdate=true;tex.repeat.set(w/16,h/15);
    const facade=new T.MeshStandardMaterial({map:tex,roughness:.8});
    box(w,h,d,facade,x,h/2+.2,z);
    box(w+1,.6,d+1,white,x,h+.5,z);
    box(w*.3,1.2,d*.3,dark,x+4,h+1.2,z-2);
    colliders.push({x,z,w:w+1,d:d+1});
    if(seed%3===0){box(w+1,.55,2.8,material(seed%2?0xb85f47:0x267c79),x,3.2,z+d/2+1);}
  }
  // Lane dashes stop short of the intersections; crosswalks mark the big crossings.
  for(let i=-4;i<=4;i++)for(let j=-4;j<4;j++){
    for(let k=0;k<4;k++){
      const p=j*70+22+k*9;
      box(.18,.03,4,gold,i*70,.08,p);
      box(4,.03,.18,gold,p,.08,i*70);
    }
    if(i%2===0&&j%2===0)for(let q=-3;q<=3;q++){
      box(1.1,.03,3.2,white,i*70+q*2,.09,j*70+12);
      box(3.2,.03,1.1,white,i*70+12,.09,j*70+q*2);
    }
  }
  function palm(x,z,scale=1){
    const g=new T.Group();const t=new T.Mesh(new T.CylinderGeometry(.28,.52,8,7),trunk);t.position.y=4;t.rotation.z=.06;t.castShadow=true;g.add(t);
    for(let i=0;i<7;i++){const a=i/7*Math.PI*2;const f=new T.Mesh(new T.SphereGeometry(1,5,3),leaf);f.scale.set(.65,.25,3.7);f.position.set(Math.sin(a)*1.7,8+Math.cos(i)*.25,Math.cos(a)*1.7);f.rotation.y=a;f.rotation.x=.25;f.castShadow=true;g.add(f);}
    g.position.set(x,0,z);g.scale.setScalar(scale);scene.add(g);
  }
  for(let i=-4;i<=4;i++)for(let j=-3;j<=3;j++){
    palm(i*70+13,j*70+20,.9);if(i%2===0)palm(i*70-13,j*70+47,1.05);
    if(i%2===0){box(.3,7,.3,dark,i*70-12,3.5,j*70+19);const light=box(2,.23,.8,gold,i*70-11.2,7,j*70+19);lamps.push(light);}
  }
  // Coastal promenade and a working-looking marina of local skiffs.
  box(650,.2,12,sidewalk,0,.03,322);
  for(let i=-7;i<=7;i++){palm(i*42,319,1.2);if(i%2===0)box(5,.8,1.8,material(0xa08760),i*42,1,313);}
  for(let i=-3;i<=3;i++){
    box(5,.8,55,material(0x96784e),i*43,.25,352);
    const hull=new T.Mesh(new T.ConeGeometry(3.6,13,4),white);hull.rotation.x=Math.PI/2;hull.rotation.z=Math.PI/4;hull.position.set(i*43+9,.6,353);scene.add(hull);box(3,1.5,5,glass,i*43+9,1.7,353);
  }
  function sign(text,x,z){const c=document.createElement('canvas');c.width=512;c.height=128;const g=c.getContext('2d');g.fillStyle='#0b484b';g.fillRect(0,0,512,128);g.strokeStyle='#e3c78b';g.lineWidth=5;g.strokeRect(5,5,502,118);g.font='bold 39px Arial';g.textAlign='center';g.fillStyle='#f4e4bd';g.fillText(text,256,77);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const m=new T.Mesh(new T.PlaneGeometry(11,2.75),new T.MeshBasicMaterial({map:tex,side:T.FrontSide}));m.position.set(x,6,z);scene.add(m);const back=m.clone();back.rotation.y=Math.PI;back.position.z-=.02;scene.add(back);box(.25,6,.25,dark,x-5,3,z);box(.25,6,.25,dark,x+5,3,z);}
  sign('SOLMARA MARINA',0,309);sign('PALMA AVENUE',0,126);sign('OLD TOWN',-140,-13);
  function makeCar(color=0x26796d,police=false){
    const g=new T.Group();const paint=material(color,.35),window=new T.MeshStandardMaterial({color:0x244b56,roughness:.2,metalness:.4});
    box(3.6,.85,7.1,paint,0,.95,0,g);box(3.4,.3,1.8,paint,0,1.35,2.3,g);box(3.15,.95,3.25,window,0,1.75,-.1,g);box(3.25,.17,2.4,paint,0,2.3,-.3,g);
    box(3.65,.22,.2,dark,0,.7,3.58,g);box(3.65,.22,.2,dark,0,.7,-3.58,g);
    for(const x of [-1.2,1.2]){box(.65,.23,.13,new T.MeshBasicMaterial({color:0xffe9b6}),x,1.02,3.64,g);box(.65,.22,.13,new T.MeshBasicMaterial({color:0xc8453f}),x,1,-3.64,g);}
    for(const x of [-1.82,1.82])for(const z of [-2.25,2.25]){const wheel=new T.Mesh(new T.CylinderGeometry(.64,.64,.3,12),dark);wheel.rotation.z=Math.PI/2;wheel.position.set(x,.65,z);g.add(wheel);const rim=new T.Mesh(new T.CylinderGeometry(.3,.3,.32,8),white);rim.rotation.z=Math.PI/2;rim.position.copy(wheel.position);g.add(rim);}
    if(police){box(3.64,.5,2.8,white,0,1.1,0,g);for(const x of [-.7,.7]){const light=box(.6,.2,.35,new T.MeshBasicMaterial({color:x<0?0x268aff:0xff3149}),x,2.5,-.2,g);light.userData.flash=true;}}
    scene.add(g);return g;
  }
  // Batch the immutable city into instanced draws; actor meshes remain independent.
  scene.updateMatrixWorld(true);
  const batches=new Map(),statics=[];
  scene.traverse(object=>{if(object.isMesh)statics.push(object);});
  for(const mesh of statics){
    let geometry=mesh.geometry,matrix=mesh.matrixWorld.clone();
    if(geometry.type==='BoxGeometry'){
      const p=geometry.parameters;
      matrix.multiply(new T.Matrix4().makeScale(p.width,p.height,p.depth));
      geometry=new T.BoxGeometry(1,1,1);
    }
    const key=geometry.type+JSON.stringify(geometry.parameters)+mesh.material.uuid;
    if(!batches.has(key))batches.set(key,{geometry,material:mesh.material,matrices:[]});
    batches.get(key).matrices.push(matrix);mesh.parent.remove(mesh);
  }
  for(const batch of batches.values()){
    const instance=new T.InstancedMesh(batch.geometry,batch.material,batch.matrices.length);
    batch.matrices.forEach((matrix,index)=>instance.setMatrixAt(index,matrix));
    instance.castShadow=true;instance.receiveShadow=true;scene.add(instance);
  }
  const trafficCars=[];
  for(let i=0;i<CITY.traffic;i++){
    const model=makeCar([0x26796d,0xcfad69,0xbb5f48,0xd7d7c5,0x487f91,0x89705b][i%6]);
    const axis=i%2?'x':'z',dir=i%4<2?1:-1,road=(i%7-3)*70,lane=road+dir*4.2;
    model.position.set(axis==='x'?-260+(i*47)%520:lane,0,axis==='z'?-260+(i*61)%520:lane);
    const car={model,axis,lane,road,dir,speed:11+(i%6)*1.5,baseSpeed:11+(i%6)*1.5,traffic:true};vehicles.push(car);trafficCars.push(car);
  }
  function makePerson(color=0xb66f53){const g=new T.Group(),cloth=material(color),skin=material(0xb58260),pants=material(0x283f44);box(.72,.95,.4,cloth,0,1.3,0,g);const head=new T.Mesh(new T.SphereGeometry(.29,9,7),skin);head.position.y=2;g.add(head);for(const x of [-.22,.22]){box(.24,.8,.3,pants,x,.42,0,g);box(.16,.8,.18,skin,x*2.3,1.17,0,g);}scene.add(g);return g;}
  for(let i=0;i<CITY.walkers;i++){const model=makePerson([0x27545b,0xbf6c53,0xe5d7ad,0x728b6d][i%4]);const road=(i%7-3)*70;model.position.set(road+(i%2?13:-13),0,-270+(i*37)%540);walkers.push({model,angle:i%2?0:Math.PI,speed:1.4+(i%5)*.25,flee:0,axis:'z',lane:model.position.x,dir:i%2?1:-1});}
  const beaconMat=new T.MeshBasicMaterial({color:0xf4cc76,transparent:true,opacity:.65});
  const beacon=new T.Group();const beam=new T.Mesh(new T.CylinderGeometry(1.2,1.2,18,12,true),beaconMat);beam.position.y=9;beacon.add(beam);const ring=new T.Mesh(new T.TorusGeometry(7,.25,6,40),new T.MeshBasicMaterial({color:0xf4cc76}));ring.rotation.x=Math.PI/2;ring.position.y=.3;beacon.add(ring);scene.add(beacon);
  function spawnPolice(pos){const model=makeCar(0x263b42,true);model.position.copy(pos);const unit={model,speed:18,police:true};vehicles.push(unit);return unit;}
  function puff(pos,color=0xe8bd7b){const mesh=new T.Mesh(new T.SphereGeometry(.2,5,4),new T.MeshBasicMaterial({color,transparent:true}));mesh.position.copy(pos);scene.add(mesh);particles.push({mesh,life:.65});}
  function blocked(pos,radius=1){return colliders.some(b=>Math.abs(pos.x-b.x)<b.w/2+radius&&Math.abs(pos.z-b.z)<b.d/2+radius);}
  function dusk(){sun.intensity=.55;hemi.intensity=1.1;scene.background.set(0x94778d);scene.fog.color.set(0x94778d);sun.color.set(0xffae77);renderer.toneMappingExposure=1.2;}
  return {THREE:T,scene,camera,renderer,sun,hemi,vehicles,trafficCars,walkers,beacon,makeCar,makePerson,spawnPolice,puff,particles,blocked,lamps,dusk,
    resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);}};
}
