import test from 'node:test'
import assert from 'node:assert/strict'
import {bandOf,cutoffs,buildSnapshot,shareText,TASKS} from './strength.js'
import {signedOf,gapOf,normGapOf,adjustmentOf,revealSentence} from './perception.js'
import {MR_CALC as money,sanitizeMoneyInputs} from './money.js'

const result = (id,score,max,extra={}) => ({id,score,max,band:bandOf(score,max),pred:1,enjoy:null,drain:null,...extra})

test('strength thresholds use each task’s own denominator and never fabricate a highlight',()=>{
 assert.equal(bandOf(2,4),1);assert.equal(bandOf(3,4),2);assert.equal(bandOf(4,6),1);assert.equal(bandOf(5,6),2)
 assert.deepEqual(cutoffs(3),{dev:'0–1',solid:'2',strong:'3'})
 const s=buildSnapshot([result('pattern',2,4),result('recall',3,6),result('plan',0,0,{skipped:true})])
 assert.equal(s.hl,null);assert.equal(s.anyStrong,false);assert.equal(s.done.length,2)
 assert.doesNotMatch(shareText(s.done),/most enjoyed|highlight:/i)
})
test('strength highlight uses rated enjoyment and prediction gap rather than raw scores',()=>{
 const s=buildSnapshot([result('pattern',3,4,{pred:0,enjoy:5,drain:5}),result('adapt',8,8,{enjoy:2,drain:1}),result('recall',6,6,{enjoy:5,pred:2})])
 assert.equal(s.hl.id,'pattern');assert.equal(s.surprise.id,'pattern');assert.equal(s.enjoyed.length,2)
 assert.deepEqual(s.contrast.map(r=>r.id),['pattern','adapt'])
})
test('every authored multiple-choice answer is within its option set',()=>{
 for(const task of TASKS) for(const item of task.items||[]) assert.ok(Number.isInteger(item.answer)&&item.answer>=0&&item.answer<item.options.length)
})
test('perception keeps signed surprise separate from absolute calibration and independent round adjustments',()=>{
 const first={task:'memory',round:1,prediction:2,result:6}
 const second={task:'memory',round:2,prediction:5,result:6}
 assert.equal(signedOf(first),4);assert.equal(gapOf(first),4);assert.equal(normGapOf(first),.5)
 assert.deepEqual(adjustmentOf([first,second],'memory'),{value:3,g1:4,g2:1,exactBoth:false})
 assert.match(revealSentence(second).head,/Close/)
 assert.equal(adjustmentOf([first],'memory'),null)
})
test('money uses monthly income consistently and never funds optional buckets from a shortfall',()=>{
 const i={...money.EMPTY_INPUTS,monthlyIncomeAfterTax:1000,rentMortgage:600,minMonthlyDebtPayments:100}
 let s=money.buildSnapshot(i)
 assert.equal(s.surplusOrShortfall,300)
 assert.equal(money.buildPaydaySplit(i,s).reduce((sum,b)=>sum+b.amount,0),1000)
 const short={...i,rentMortgage:1200};s=money.buildSnapshot(short)
 assert.equal(s.surplusOrShortfall,-300)
 assert.ok(money.buildPaydaySplit(short,s).slice(2).every(b=>b.amount===0))
 assert.equal(money.monthlyIncome({...i,incomeFrequency:'weekly',monthlyIncomeAfterTax:100}),433)
 const empty=money.buildSnapshot(money.EMPTY_INPUTS)
 assert.ok(Number.isFinite(money.calculateMoneyPressure(money.EMPTY_INPUTS,empty).score))
})

test('saved money answers preserve irregular income and clamp malformed browser values',()=>{
 const inputs=sanitizeMoneyInputs({incomeFrequency:'irregular',monthlyIncomeAfterTax:2000,minMonthlyIncomeIfIrregular:900,daysBeforePaydayRunOut:7,stressLevel:999,rentMortgage:-30});
 assert.equal(inputs.minMonthlyIncomeIfIrregular,900);assert.equal(money.monthlyIncome(inputs),900);
 assert.equal(inputs.daysBeforePaydayRunOut,7);assert.equal(inputs.stressLevel,10);assert.equal(inputs.rentMortgage,0);
 assert.equal(sanitizeMoneyInputs(null).paydayDate,25);
});
