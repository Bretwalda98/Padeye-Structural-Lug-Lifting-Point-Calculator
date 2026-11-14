const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x=>x[1]).join('\n');
function page(){
 const elements={};const drawing=[];
 const canvas=new Proxy({}, {get:(_,key)=> (...args)=>{
  if(key==='arc') assert.ok(args[2]>=0&&Number.isFinite(args[2]),'invalid circle radius');drawing.push([key,...args]);
 },set:()=>true});
 for(const m of html.matchAll(/<input\s+id="([^"]+)"[^>]*value="([^"]*)"/g)) elements[m[1]]={value:m[2]};
 const element=id=>elements[id]??=( {} );
 const decorate=id=>{const e=element(id);Object.assign(e,{innerText:'',innerHTML:'',children:[],width:900,height:360,classList:{add(){},remove(){}},addEventListener(){},replaceChildren(){this.children=[];},appendChild(x){this.children.push(x);},getContext(){return canvas;}});return e;};
 const context={PadeyeModel:require('../calculator.js'),document:{getElementById:id=>{if(!element(id).addEventListener)decorate(id);return element(id);},createElement:()=>({}),addEventListener(){},body:{}},getComputedStyle:()=>({getPropertyValue:()=> '#aaa'}),window:{print(){}}};
 vm.createContext(context);vm.runInContext(script,context);
 return {elements,update:()=>vm.runInContext('compute()',context),drawing};
}
test('page initialises from HTML defaults and displays screening results',()=>{
 const p=page();assert.equal(p.elements.Fdl.innerText,'1950.000');assert.equal(p.elements.UGov.innerText,'0.858');
 assert.match(p.elements.rows.innerHTML,/WITHIN LIMIT/);assert.ok(p.drawing.some(x=>x[0]==='arc'));
});
for(const [name,field,value] of [['blank','Load',''],['negative','rm','-10'],['missing weld','wleg','0'],['pin/hole mismatch','dh','80']]){
 test(`${name} invalidates prior results and clears prior drawing`,()=>{
  const p=page();p.elements[field].value=value;p.update();
  assert.equal(p.elements.Fdl.innerText,'—');assert.equal(p.elements.UGov.innerText,'—');
  assert.match(p.elements.rows.innerHTML,/INVALID INPUT/);assert.doesNotMatch(p.elements.rows.innerHTML,/WITHIN LIMIT|>PASS</);
  assert.ok(p.elements.warns.children.length>0);assert.match(p.drawing.at(-1)[1],/Correct the inputs/);
  p.elements[field].value=field==='Load'?'1500':field==='rm'?'200':field==='wleg'?'12':'112';p.update();
  assert.equal(p.elements.Fdl.innerText,'1950.000');assert.match(p.elements.rows.innerHTML,/WITHIN LIMIT/);
 });
}
test('no-cheek page displays N/A instead of weld pass and hides cheek rings',()=>{
 const p=page();p.elements.tc.value='0';p.elements.wleg.value='0';p.update();
 assert.match(p.elements.rows.innerHTML,/>N\/A</);assert.match(p.elements.helpers.innerHTML,/one cheek\) = N\/A/);
});
