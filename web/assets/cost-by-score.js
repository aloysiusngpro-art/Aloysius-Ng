(function(root){
 function rank(records){
  const results=records.map(r=>{const score=Number(r.score),psf=Number(r.psf);const reason=r.missing?'Complete assessment first':!Number.isFinite(score)||score<2.5?'Disqualified · Score below 2.5':!Number.isFinite(psf)||psf<=0?'Enter a valid PSF':'';return {...r,eligible:!reason,reason,ratio:reason?null:psf/score,rank:null}});
  const eligible=results.filter(r=>r.eligible).sort((a,b)=>a.ratio-b.ratio);eligible.forEach((r,i)=>{r.rank=i+1});return results;
 }
 root.anhCost={rank};if(typeof module!=='undefined')module.exports={rank};
})(typeof window!=='undefined'?window:globalThis);
