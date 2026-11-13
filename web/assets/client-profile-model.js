(function(root){'use strict';
const money=n=>'S$'+Number(n).toLocaleString('en-SG',{minimumFractionDigits:2,maximumFractionDigits:2});
function payment(principal,rate,years){const r=rate/1200,n=Math.max(1,years)*12;return principal<=0?0:r===0?principal/n:principal*r/(1-Math.pow(1+r,-n));}
function capacity(monthly,rate,years){return monthly/payment(1,rate,years);}
function bsd(price){let left=price,total=0;for(const [size,rate] of [[180000,.01],[180000,.02],[640000,.03],[500000,.04],[1500000,.05],[Infinity,.06]]){const part=Math.max(0,Math.min(left,size));total+=part*rate;left-=part;if(left<=0)break;}return Math.max(1,Math.floor(total));}
function projectReturn(p){const price=Number(p.price)||0,months=Number(p.holdMonths)||48,growth=Number(p.growth)||1,valuation=price*Math.pow(1+growth/100,months/12),duty=price>0?(Number.isFinite(p.dutyOverride)&&p.dutyOverride>=0?p.dutyOverride:bsd(Math.max(price,Number(p.valuation)||0))):0,rentTotal=(Number(p.rentMonths)||0)*(Number(p.rentMonthly)||0),absdAmount=Math.max(0,Number(p.absdAmount)||0),totalDownpayment=price*.25+duty+absdAmount,expenses=duty+absdAmount+rentTotal+(Number(p.bankInterest)||0)+(Number(p.maintenance)||0)+(Number(p.renovation)||0)+(Number(p.furniture)||0)+(Number(p.additionalExpenses)||0)+(Number(p.purchaseLegal)||0),profit=valuation-price-expenses,equity=Number(p.equity)||0;return {...p,projectedValuation:valuation,duty,absdAmount,totalDownpayment,rentTotal,totalExpenses:expenses,netProfit:profit,roe:equity>0&&price>0?profit/equity*100:null};}
function analyseProjection(data){const sale=data.sale.enabled?data.sale:null,refundTotal=sale?(sale.cpfUsed||0)+(sale.cpfInterest||0):0,saleCash=sale?sale.price-sale.loan-refundTotal-(sale.other||0):0,cash=data.cash+saleCash,totalCPF=data.applicants.reduce((n,a)=>n+a.cpfOA,0);const plans=data.plans.map((p,index)=>({...projectReturn(p),index,status:data.missingInputs?.length?'Assessment incomplete':'Projection only',direction:p.price>0?'At '+p.growth+'% annual growth over '+p.holdMonths/12+' years, '+p.name+' has an estimated net profit of '+money(projectReturn(p).netProfit)+' after the entered expenses. Compare the equity required and test a lower growth rate before deciding.':'Enter a purchase price to calculate this plan.',issues:p.type==='hdb'?['Projection horizon is not permission to sell. Confirm the applicable HDB minimum occupation period.']:[]}));const summary=data.missingInputs?.length?'This profile is incomplete. Complete the listed inputs to review the projections.':'Compare projected growth, total costs and equity for each alternative. These are estimates based on your chosen assumptions, not guaranteed returns.';return {cash,totalCPF,saleCash,saleCosts:sale?.other||0,refundTotal,plans,preferred:null,summary,actions:['Confirm the purchase price, available financing and equity contribution.','Review annual growth and all holding-period expenses under a lower-return scenario.','Enter applicable ABSD in its dedicated field. Include SSD, legal and selling costs under Additional expenses before relying on net profit.','Use the Project Scorecard to assess quality and exit demand alongside these projections.']};}
function analyse(data){if(data.plans.some(p=>p.schema===2))return analyseProjection(data);const applicants=data.applicants, sale=data.sale.enabled?data.sale:null;
 const refunds=sale?applicants.map(a=>a.cpfUsed+a.cpfInterest):applicants.map(()=>0);
 const refundTotal=sale&&typeof sale.cpfUsed==='number'?sale.cpfUsed+sale.cpfInterest:refunds.reduce((a,b)=>a+b,0);
 const saleCosts=sale?sale.price*sale.agencyRate/100+sale.legal+sale.levies+sale.other:0;
 const saleCash=sale?sale.price-sale.loan-refundTotal-saleCosts:0;
 const cash=data.cash+saleCash, totalCPF=applicants.reduce((s,a)=>s+a.cpfOA+(sale?a.usableRefund:0),0);
 const plans=data.plans.map((p,index)=>{const selected=p.borrowers==='joint'?applicants:[applicants[Number(p.borrowers)]];
 const income=selected.reduce((s,a)=>s+a.salary+a.variableAnnual/12*.7,0),gross=selected.reduce((s,a)=>s+a.salary+a.variableAnnual/12,0);
 const debts=selected.reduce((s,a)=>s+a.cards+a.car+a.other+a.housing,0),housing=selected.reduce((s,a)=>s+a.housing,0);
 const age=income?selected.reduce((s,a)=>s+a.age*(a.salary+a.variableAnnual/12*.7),0)/income:Math.max(...selected.map(a=>a.age));
 const publicHome=p.type==='hdb',msr=publicHome||p.type==='ec';
 const maxTenure=publicHome?30:35,tenure=Math.min(p.tenure||25,maxTenure),lower=tenure>(publicHome?25:30)||age+tenure>65;
 const loans=p.existingLoans,ltv=([lower?55:75,lower?25:45,lower?15:35][Math.min(loans,2)])/100;
 const minCashRate=loans>0?.25:lower?.10:.05,stressRate=Math.max(4,p.thereafterRate,p.rate);
 const monthlyRoom=Math.max(0,Math.min(income*.55-debts,msr?income*.30-housing:Infinity));
 const manualLoans=selected.map(a=>a.loan).filter(v=>typeof v==='number'&&Number.isFinite(v));const loanCapacity=manualLoans.length===selected.length?Math.min(capacity(monthlyRoom,stressRate,tenure),manualLoans.reduce((sum,v)=>sum+v,0)):capacity(monthlyRoom,stressRate,tenure),valuationBase=Math.min(p.price,p.valuation||p.price);
 const requested=valuationBase*ltv,loan=Math.max(0,Math.min(requested,loanCapacity));
 const stampBase=Math.max(p.price,p.valuation||p.price),duty=stampBase>0?bsd(stampBase):0,absd=stampBase*p.absd/100;
 const down=p.price-loan,eligibleCosts=down+duty+absd;
 const cpf=selected.reduce((s,a)=>s+a.cpfOA+(sale?a.usableRefund:0),0),cashOnly=p.legal+p.renovation+p.other;
 // Valuation shortfall is additional cash: minimum cash on the valuation base + shortfall.
 const cashFloor=minCashRate*valuationBase+Math.max(0,p.price-valuationBase);
 const cpfUsed=Math.min(cpf,Math.max(0,eligibleCosts-cashFloor)),cashNeeded=eligibleCosts-cpfUsed+cashOnly;
 const balance=cash-cashNeeded,reserveBalance=balance-data.reserve,upfront=eligibleCosts+cashOnly;
 const instalment=payment(loan,p.rate,tenure),stressInstalment=payment(loan,stressRate,tenure);
 const oa=selected.reduce((s,a)=>s+a.monthlyOA,0),cashMortgage=Math.max(0,instalment-oa-p.rent);
 const takehomeKnown=selected.every(a=>a.takehome!==null),takehome=selected.reduce((s,a)=>s+(a.takehome||0),0);
 const monthlyBalance=takehomeKnown?takehome-debts-data.living-cashMortgage-p.running:null;
 const tdsr=income?(stressInstalment+debts)/income:null,msrRatio=income?(stressInstalment+housing)/income:null;
 let status='Within entered assumptions',direction=`${p.name} fits the entered funding figures. Keep ${money(data.reserve)} ring-fenced, seek bank approval in principle, and compare project quality and exit demand before committing.`;
 const issues=[];
 if(!income){status='Income review needed';issues.push('No recognised income has been entered.');}
 if(reserveBalance<-.01){status='Funding gap';issues.push(`An additional ${money(-reserveBalance)} is needed to fund this plan and retain the chosen cash reserve.`);}
 if(monthlyBalance!==null&&monthlyBalance<0){status='Cashflow pressure';issues.push(`The monthly household cashflow is short by ${money(-monthlyBalance)} under the entered assumptions.`);}
 if(!takehomeKnown)issues.push('Enter take-home income to complete the monthly living-cost check.');
 if(loan<requested-1)issues.push(`${manualLoans.length===selected.length?'The entered loan limit or income servicing limits':'Income servicing limits'} reduce the modelled loan by ${money(requested-loan)} below the LTV ceiling; this increases the upfront contribution.`);
 if(lower)issues.push('Age or tenure triggers the lower LTV tier.');
 if(sale&&refundTotal>sale.price-sale.loan-saleCosts)issues.push('Sale proceeds do not cover all entered loan, refund and cost deductions. Confirm the actual CPF refund and any shortfall with CPF and your solicitor.');
 if(sale&&selected.some(a=>a.usableRefund>a.cpfUsed+a.cpfInterest))issues.push('Usable CPF refund exceeds the entered refund; review before relying on this plan.');
 if(status==='Funding gap')direction=`Right-size ${p.name} before proceeding. Reduce the purchase budget or release confirmed funds to close the ${money(-reserveBalance)} gap while preserving your cash reserve. Obtain a bank assessment before paying a deposit.`;
 if(status==='Cashflow pressure')direction=`Prioritise monthly breathing room. ${p.name} needs lower repayments, reduced debt or a smaller purchase budget. Do not rely on projected rent to cover essential repayments; test the plan with zero rent and a higher interest rate.`;
 if(status==='Income review needed')direction='Confirm documented income and the lender’s recognised income first. A purchase budget cannot be established reliably from the current entries.';
 if(status==='Within entered assumptions'&&!takehomeKnown){status='Cashflow check pending';direction=`${p.name} fits the entered upfront funding figures, but monthly affordability remains unconfirmed. Add take-home income and household spending, then obtain bank approval before shortlisting.`;}
 if(p.type==='new')issues.push('New-launch repayment shown at full drawdown. Construction-stage payments, temporary accommodation and payment timing need a separate schedule.');
 if(data.missingInputs?.length){status='Assessment incomplete';direction='Complete the missing inputs listed above, then regenerate this report to review your funding and property direction.';issues.unshift('Financial figures are provisional because required inputs are missing.');}
 return {index,...p,income,gross,debts,age,tenure,ltv,minCashRate,loanCapacity,requested,loan,down,duty,absd,cpf,cpfUsed,cashNeeded,balance,reserveBalance,upfront,instalment,stressInstalment,stressRate,tdsr,msrRatio,monthlyBalance,cashMortgage,status,direction,issues};});
 const viable=plans.filter(p=>p.status==='Within entered assumptions').sort((a,b)=>b.reserveBalance-a.reserveBalance);
 const preferred=viable[0]||null;
 const summary=data.missingInputs?.length?'This profile is incomplete. Fill in the missing inputs before using the financial estimates or choosing a purchase plan.':preferred?`${data.client}: ${preferred.name} provides the strongest cash reserve among the plans that pass the entered funding and monthly cashflow checks. This is a starting point for your ${data.goal.toLowerCase()} plan, subject to financing, tax and property eligibility confirmation.`:`${data.client}: complete or resolve the funding and cashflow checks before committing to your ${data.goal.toLowerCase()} plan. The comparison below shows which constraints need attention first.`;
 const actions=[preferred?`Use ${preferred.name} as the working budget, not as a loan approval.`:'Resolve the highlighted gaps or missing information, then rerun the scenarios.','Obtain bank approval in principle using income documents, credit commitments and the planned ownership structure.',sale?'Confirm sale price, mortgage redemption and CPF refund; align sale completion with the next purchase before relying on proceeds.':'Confirm available cash and usable CPF OA before paying the purchase deposit.','Confirm BSD, ABSD, any seller duties and eligibility with your solicitor; review renovation and moving costs.','Shortlist suitable homes using the Project Scorecard, then review location, layout and an achievable exit strategy.'];
 return {cash,totalCPF,saleCash,saleCosts,refundTotal,plans,preferred,summary,actions};
}
function loanSummary(applicants=[]){const values=applicants.map(a=>a.loan!=null&&Number.isFinite(Number(a.loan))&&Number(a.loan)>0?Number(a.loan):null),entered=values.filter(v=>v!==null).length,amount=values.reduce((sum,v)=>sum+(v||0),0);return {amount,entered,count:values.length,complete:entered===values.length&&entered>0,text:entered?money(amount):'Not entered',note:entered&&entered<values.length?'Partial total: '+entered+' of '+values.length+' applicant loan amounts entered.':'Entered applicant loan amounts.'};}
const api={money,payment,capacity,bsd,projectReturn,analyse,loanSummary};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ANHClientModel=api;
})(typeof window!=='undefined'?window:globalThis);
