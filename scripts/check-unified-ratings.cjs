const assert=require('node:assert/strict'),g=require('../web/assets/scorecard-grading.js');
for(const [score,letter] of [[0,'F'],[2.4999,'F'],[2.5,'D'],[2.9999,'D'],[3,'C'],[3.4999,'C'],[3.5,'B'],[3.995,'B'],[4,'A'],[5,'A']]){
 assert.equal(g.grade(score).letter,letter);
 const html=g.matrixHTML(score,true);
 assert(html.includes('left:'+score/5*100+'%'));
 assert.equal((html.match(/anh-rating-segment /g)||[]).length,5);
 assert.equal((html.match(/data-grade=/g)||[]).length,5);
 assert(html.includes('aria-valuenow="'+score+'"'));
 assert(!html.includes('anh-band-track'));
}
const html=g.matrixHTML(3.28,true,true);
assert.equal((html.match(/width:50%/g)||[]).length,1);
assert.equal((html.match(/width:10%/g)||[]).length,3);
assert.equal((html.match(/width:20%/g)||[]).length,1);
assert(html.indexOf('data-grade="F"')<html.indexOf('data-grade="A"'));
assert(html.includes('合理买入'));
assert(!g.matrixHTML(2,false).includes('anh-rating-pin'));
console.log('Unified ratings: proportional widths, ascending grades, precise markers, boundary handling, Chinese and incomplete state passed');
