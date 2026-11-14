/* Padeye preliminary screening model. Units: mm, kN, N/mm² (MPa).
 * Legacy coefficients are retained; this is not a design-code implementation.
 * The factor 2 on per-cheek weld load is retained explicitly, not a count of welds.
 */
(function (root) {
  'use strict';
  function calculatePadeye(p) {
    const errors = [], notes = [];
    const fail = message => errors.push(message);
    const fields = {dp:'Pin diameter dp',dh:'Hole diameter dh',rm:'Main plate radius rm',rc:'Cheek radius rc',tm:'Main plate thickness tm',tc:'Cheek thickness tc',w:'Cheek weld leg w',ell:'Total c–c shear-path length ℓ',fy:'Yield strength fy',Load:'Load',v:'Load factor v',ang:'Arrow angle'};
    for (const [key,label] of Object.entries(fields)) {
      if (typeof p[key] !== 'number' || !Number.isFinite(p[key])) fail(`${label}: enter a finite number.`);
    }
    const invalid = () => ({valid:false,errors,notes,rows:[],governing:null});
    if (errors.length) return invalid();
    for (const key of ['dp','dh','rm','tm','ell','fy']) if(p[key]<=0) fail(`${fields[key]} must be greater than zero.`);
    for (const key of ['rc','tc','w','Load']) if(p[key]<0) fail(`${fields[key]} must not be negative.`);
    if (p.v<1) fail('Load factor v must be at least 1; this input is not a load reduction factor.');
    if (p.dp>p.dh) fail('Pin diameter dp must not exceed hole diameter dh.');
    if (p.rm<=p.dh/2) fail('Main plate radius rm must exceed dh/2 to leave a positive ligament.');
    if (p.tc>0) {
      if(p.rc<=p.dh/2) fail('With cheeks fitted, rc must exceed dh/2 to leave a positive cheek ligament.');
      if(p.rc>p.rm) fail('Cheek radius rc must not exceed rm in this concentric plate model.');
      if(p.w<=0) fail('With cheeks fitted, a positive cheek weld leg w is required.');
    }
    if(errors.length) return invalid();
    if(p.dp===p.dh) notes.push('Zero nominal clearance: confirm the fit and tolerances with the shackle manufacturer.');
    notes.push('Confirm pin/hole clearance and shackle jaw fit against manufacturer and project requirements.');
    const {dp,dh,rm,rc,tm,tc,w,ell,fy,Load,v}=p;
    const Fdl=Load*v, totalT=tm+2*tc;
    const Aa=(rm-dh/2)*tm+(tc>0?2*(rc-dh/2)*tc:0), Ab=2*Aa, Acc=tm*ell;
    const Aw=tc>0?2*Math.PI*rc*(w/Math.SQRT2):null;
    const Fp_kN=tc>0?(tc/totalT)*Fdl:0;
    const rows=[
      {name:'Bearing at contact (dp·(tm+2tc))',demand:Fdl*1000/(dp*totalT),allow:0.9*fy},
      {name:'Shear at a–a (1.1·0.5 Fdl / Aₐ′)',demand:1.1*0.5*Fdl*1000/Aa,allow:0.4*fy},
      {name:'Net tension at b–b (Fdl / A_b′)',demand:Fdl*1000/Ab,allow:0.45*fy},
      {name:'Cheek weld screening (2·F′ / A_w)',demand:tc>0?2*Fp_kN*1000/Aw:null,allow:tc>0?0.4*fy:null,na:tc===0},
      {name:'Tear-out at c–c (Fdl / (tm·ℓ))',demand:Fdl*1000/Acc,allow:0.4*fy}
    ];
    const positiveDerived=[totalT,dp*totalT,Aa,Ab,Acc,...rows.filter(r=>!r.na).map(r=>r.allow)];
    if(tc>0) positiveDerived.push(Aw);
    if(!Number.isFinite(Fdl)||!Number.isFinite(Fp_kN)||positiveDerived.some(x=>!Number.isFinite(x)||x<=0)||rows.some(r=>!r.na&&(!Number.isFinite(r.demand)||r.demand<0))) {
      fail('The entered values exceed the numeric range or produce an invalid area or stress. Check units and dimensions.');return invalid();
    }
    for(const r of rows){
      r.uc=r.na?null:r.demand/r.allow;
      r.status=r.na?'N/A':r.uc<=1?'WITHIN LIMIT':'EXCEEDS LIMIT';
    }
    if(rows.some(r=>!r.na&&!Number.isFinite(r.uc))){fail('The utilisation is outside the numeric range. Check units and dimensions.');return invalid();}
    return {valid:true,errors,notes,Fdl,Aa,Ab,Acc,Aw,Fp_kN,rows,governing:Math.max(...rows.filter(r=>!r.na).map(r=>r.uc))};
  }
  if(typeof module!=='undefined'&&module.exports) module.exports={calculatePadeye};
  else root.PadeyeModel={calculatePadeye};
})(typeof globalThis!=='undefined'?globalThis:this);
