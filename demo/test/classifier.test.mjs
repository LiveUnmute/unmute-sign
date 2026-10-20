import { classifyFrame, fingerPattern } from '../js/classifier.js';

function hand(ext, thumbY = -0.30) {
  const lm = Array.from({length:21}, () => ({x:0,y:0,z:0}));
  lm[0]={x:0,y:0,z:0};
  const base={index:5,middle:9,ring:13,pinky:17};
  const off={index:-0.12,middle:-0.04,ring:0.04,pinky:0.12};
  for(const [n,s] of Object.entries(base)){const o=off[n];
    lm[s]={x:o,y:-0.22};lm[s+1]={x:o,y:-0.40};lm[s+2]={x:o,y:-0.54};
    lm[s+3]= ext[n]?{x:o,y:-0.68}:{x:o*0.5,y:-0.18};}
  lm[1]={x:-0.10,y:-0.08};lm[2]={x:-0.18,y:-0.14};lm[3]={x:-0.22,y:thumbY*0.8};
  lm[4]= ext.thumb?{x:-0.26,y:thumbY}:{x:0,y:-0.20};
  return lm;
}

const NUM = ['1','2','3','4','5'];
const YN  = ['yes','no','not_sure'];
let pass = 0, fail = 0;
const check = (name, lm, allowed, expectTop) => {
  const r = classifyFrame(lm, allowed);
  const got = r[0]?.concept ?? null;
  const ok = got === expectTop;
  ok ? pass++ : fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name.padEnd(34)} expected=${String(expectTop).padEnd(8)} got=${String(got).padEnd(8)} ${r.slice(0,3).map(x=>x.concept+'@'+x.score.toFixed(2)).join(', ')}`);
};

check('ASL 1', hand({thumb:0,index:1,middle:0,ring:0,pinky:0}), NUM, '1');
check('ASL 2', hand({thumb:0,index:1,middle:1,ring:0,pinky:0}), NUM, '2');
check('ASL 3', hand({thumb:1,index:1,middle:1,ring:0,pinky:0}), NUM, '3');
check('ASL 4', hand({thumb:0,index:1,middle:1,ring:1,pinky:1}), NUM, '4');
check('ASL 5', hand({thumb:1,index:1,middle:1,ring:1,pinky:1}), NUM, '5');
check('thumb UP  -> yes', hand({thumb:1,index:0,middle:0,ring:0,pinky:0}, -0.34), YN, 'yes');
check('thumb DOWN -> no', hand({thumb:1,index:0,middle:0,ring:0,pinky:0}, +0.34), YN, 'no');
check('open palm -> not_sure', hand({thumb:1,index:1,middle:1,ring:1,pinky:1}), YN, 'not_sure');

// out-of-vocabulary must return nothing
const wrong = classifyFrame(hand({thumb:0,index:1,middle:0,ring:0,pinky:0}), YN);
console.log(`${wrong.length === 0 ? 'PASS' : 'FAIL'}  numeral shown to yes/no question  -> ${wrong.length === 0 ? 'correctly rejected' : 'LEAKED ' + JSON.stringify(wrong)}`);
wrong.length === 0 ? pass++ : fail++;

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
