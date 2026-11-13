(function(){
const currentYear=()=>Number(new Intl.DateTimeFormat('en',{timeZone:'Asia/Singapore',year:'numeric'}).format(new Date()));
function rentalCosts(rental={}){
 const rentalEnabled=rental?.rentalEnabled===true,rentalMonths=Number(rental?.rentalMonths??0),rentalMonthly=Number(String(rental?.rentalMonthly??0).replace(/[$,\s]/g,'')),rentalSQFT=Number(rental?.rentalSQFT??0);
 if(rentalEnabled&&(!Number.isInteger(rentalMonths)||rentalMonths<0||rentalMonths>48))return {error:'Choose rental months from 0 to 48.'};
 if(rentalEnabled&&(!Number.isFinite(rentalMonthly)||rentalMonthly<0))return {error:'Enter a monthly rent of SGD $0 or more.'};
 if(rentalEnabled&&(!Number.isFinite(rentalSQFT)||rentalSQFT<=0))return {error:'Enter a unit size greater than 0 sqft to include rental.'};
 const totalRent=rentalEnabled?rentalMonths*rentalMonthly:0,rentalPSF=rentalEnabled?totalRent/rentalSQFT:0;
 if(!Number.isFinite(totalRent)||!Number.isFinite(rentalPSF))return {error:'Enter smaller rental figures.'};
 return {rentalEnabled,rentalMonths,rentalMonthly,rentalSQFT,totalRent,rentalPSF};
}
function calculate(psf,topYear,year=currentYear(),harmonise=false,rental={}){
 psf=Number(psf);topYear=Number(topYear);year=Number(year);
 if(!Number.isFinite(psf)||psf<=0)return {error:'Enter a PSF greater than 0.'};
 if(!Number.isInteger(topYear)||topYear<1900||topYear>year)return {error:'Enter a valid TOP year no later than '+year+'.'};
 const elapsed=year-topYear,remaining=99-elapsed;
 if(remaining<=0)return {error:'The TOP year must be less than 99 years ago.'};
 const value=psf/remaining*99;if(!Number.isFinite(value)||!Number.isFinite(value*1.07))return {error:'Enter a smaller PSF.'};
 const baseFinalPSF=harmonise===true?value*1.07:value,rentalEnabled=rental?.rentalEnabled===true;
 const rentalMonths=Number(rental?.rentalMonths??0),rentalMonthly=Number(String(rental?.rentalMonthly??0).replace(/[$,\s]/g,'')),rentalSQFT=Number(rental?.rentalSQFT??0);
 if(rentalEnabled&&(!Number.isInteger(rentalMonths)||rentalMonths<0||rentalMonths>48))return {error:'Choose rental months from 0 to 48.'};
 if(rentalEnabled&&(!Number.isFinite(rentalMonthly)||rentalMonthly<0))return {error:'Enter a monthly rent of SGD $0 or more.'};
 if(rentalEnabled&&(!Number.isFinite(rentalSQFT)||rentalSQFT<=0))return {error:'Enter a unit size greater than 0 sqft to include rental.'};
 const totalRent=rentalEnabled?rentalMonths*rentalMonthly:0,rentalPSF=rentalEnabled?totalRent/rentalSQFT:0,finalPSF=baseFinalPSF+rentalPSF;
 if(!Number.isFinite(totalRent)||!Number.isFinite(finalPSF))return {error:'Enter smaller rental figures.'};
 return {psf,topYear,calculationYear:year,elapsed,remaining,todaysPSF:value,baseFinalPSF,finalPSF,harmonise:harmonise===true,harmonisedPSF:harmonise===true?value*1.07:null,rentalEnabled,rentalMonths,rentalMonthly,rentalSQFT,totalRent,rentalPSF};
}
const money=value=>'$'+Number(value).toLocaleString('en-SG',{minimumFractionDigits:2,maximumFractionDigits:2});
window.anhLease={calculate,rentalCosts,currentYear,money};
})();
