const test = require('node:test');
const assert = require('node:assert/strict');
const { calculatePadeye } = require('../calculator.js');
const base = {dp:108, dh:112, rm:200, rc:175, tm:40, tc:20, w:12, ell:400, fy:355, Load:1500, v:1.3, ang:20};
const close = (a,b) => assert.ok(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)), `${a} != ${b}`);

test('default hand calculation preserves the five legacy screening equations', () => {
 const r=calculatePadeye(base); assert.equal(r.valid,true); close(r.Fdl,1950);
 close(r.Aa,10520); close(r.Ab,21040); close(r.Acc,16000);
 close(r.rows[0].demand,1950000/8640);
 close(r.rows[1].demand,1072500/10520);
 close(r.rows[2].demand,1950000/21040);
 close(r.rows[3].demand,975000/(2*Math.PI*175*12/Math.SQRT2));
 close(r.rows[4].demand,1950000/16000);
 close(r.governing,(1950000/16000)/142);
});
for(const [label,change] of [
 ['missing cheek weld',{w:0}],['negative load',{Load:-1500}],['negative yield',{fy:-355}],
 ['zero main plate thickness',{tm:0}],['hole larger than main plate',{rm:10}],
 ['cheek ligament zero',{rc:56}],['pin larger than hole',{dp:113}],
 ['cheek beyond main plate',{rc:201}],['zero c-c path',{ell:0}],
 ['load factor below unity',{v:0.5}],['negative cheek thickness',{tc:-1}],
 ['blank numeric field',{Load:NaN}],['nonfinite number',{w:Infinity}],
 ['overflowed load',{Load:1e308,v:2}],['overflowed area',{tm:1e308,rm:1e308,rc:175}],
 ['negative radius with no cheeks',{tc:0,rc:-1}],
]) test(`blocks ${label} without utilisation or success statuses`,()=>{
 const r=calculatePadeye({...base,...change}); assert.equal(r.valid,false);assert.ok(r.errors.length>0);
 assert.equal(r.governing,null); assert.deepEqual(r.rows,[]);
});
test('no cheeks needs no cheek weld and excludes N/A from governing utilisation',()=>{
 const r=calculatePadeye({...base,tc:0,rc:0,w:0});assert.equal(r.valid,true);
 assert.equal(r.rows[3].status,'N/A');assert.equal(r.rows[3].uc,null);
 close(r.Aa,5760);close(r.governing,(1950000/4320)/(0.9*355));
});
test('zero load is a valid zero-demand screening case',()=>{
 const r=calculatePadeye({...base,Load:0});assert.equal(r.valid,true);close(r.governing,0);
 assert.ok(r.rows.every(x=>x.uc===0));
});
test('load scaling doubles stress and utilisation',()=>{
 const a=calculatePadeye(base),b=calculatePadeye({...base,Load:3000});
 for(let i=0;i<a.rows.length;i++){close(b.rows[i].demand,2*a.rows[i].demand);close(b.rows[i].uc,2*a.rows[i].uc);}
 assert.ok(b.rows.some(x=>x.status==='EXCEEDS LIMIT'));
});
test('arrow rotation does not masquerade as an inclined-load calculation',()=>{
 assert.deepEqual(calculatePadeye({...base,ang:90}).rows,calculatePadeye({...base,ang:0}).rows);
});
test('clearance under 4 mm is accepted geometrically without invented universal rule',()=>{
 const r=calculatePadeye({...base,dh:110});assert.equal(r.valid,true);
 assert.ok(r.notes.every(x=>!x.includes('4 mm')));
});
test('zero nominal clearance is disclosed without being presented as a fit check',()=>{
 const r=calculatePadeye({...base,dh:108});assert.equal(r.valid,true);
 assert.ok(r.notes.some(x=>x.includes('Zero nominal clearance')));
});
