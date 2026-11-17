// Use a locally installed Playwright package; this helper is never loaded by the game.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1});
 page.on('pageerror',error=>{throw error;});
 for(const shot of JSON.parse(readFileSync(new URL('../shots.json',import.meta.url),'utf8'))){
  await page.goto(`http://localhost:8080/${shot.query}`);
  await page.waitForFunction(()=>window.__shotReady===true,null,{timeout:120000});
  await page.screenshot({path:new URL(`../screenshots/${shot.name}`,import.meta.url).pathname,type:'jpeg',quality:84});
  console.log(`captured ${shot.name}`);
 }
}finally{await browser.close();}
