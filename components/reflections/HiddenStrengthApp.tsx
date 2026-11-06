'use client'

import { useEffect, useRef, useState } from 'react'
import { TASKS, PRED, BAND, ENJ, DRAIN, bandOf, cutoffs, gapSentence, buildSnapshot, taskById, shareText } from '@/lib/reflections/strength'
import './HiddenStrength.css'

type Task = typeof TASKS[number]
type Result = { id: string; score: number; max: number; band: number; pred: number; enjoy: number | null; drain: number | null; skipped?: boolean }
type Stage = 'intro' | 'predict' | 'play' | 'reflect' | 'reveal' | 'snapshot'

function Challenge({ task, onDone }: { task: Task; onDone: (score: number, max: number) => void }) {
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [studying, setStudying] = useState(true)
  const [recall, setRecall] = useState('')
  const [acknowledged, setAcknowledged] = useState(false)
  const answered = useRef(-1)
  function choose(correct: boolean, max: number) {
    if (answered.current === index) return
    answered.current = index
    const nextScore = score + (correct ? 1 : 0)
    if (index + 1 >= max) onDone(nextScore, max)
    else { setScore(nextScore); setIndex(index + 1) }
  }
  if (task.kind === 'recall') return <div className="hs-task">
    {studying ? <><h2>Take your time with these words</h2><div className="hs-words">{task.words!.map(word => <span key={word}>{word}</span>)}</div><button className="hs-primary" onClick={() => setStudying(false)}>Hide the words — I’m ready</button></> : <><h2>What stayed with you?</h2><label htmlFor="hs-recall">Type the words you remember. Separate them with spaces or commas.</label><textarea id="hs-recall" value={recall} onChange={e => setRecall(e.target.value)} rows={4} maxLength={1000} /><button className="hs-primary" onClick={() => { const words = new Set(recall.toLowerCase().split(/[^a-z]+/).filter(Boolean)); onDone(task.words!.filter(word => words.has(word)).length, task.words!.length) }}>Finish recall</button></>}
  </div>
  if (task.kind === 'adapt') {
    const switched = index >= task.switchAt!
    const color = task.sequence![index]
    const correctSide = switched ? (color === 'blue' ? 'right' : 'left') : (color === 'blue' ? 'left' : 'right')
    return <div className="hs-task">
      <p className="hs-eyebrow">Circle {index + 1} of {task.trials}</p>
      <div className="hs-rule"><strong>{switched ? 'New rule' : 'Current rule'}</strong><span>Blue → {switched ? 'right' : 'left'} · Yellow → {switched ? 'left' : 'right'}</span></div>
      {switched && !acknowledged ? <><h2>The rule has changed.</h2><p>The new rule stays visible. Take a moment before continuing.</p><button className="hs-primary" onClick={() => setAcknowledged(true)}>Got it — continue</button></> : <><div className={`hs-circle hs-circle--${color}`} role="img" aria-label={`${color} circle`} /><p>{color === 'blue' ? 'Blue' : 'Yellow'} circle</p><div className="hs-options hs-sides">{['left','right'].map(side => <button key={side} onClick={() => choose(side === correctSide, task.trials!)}>{side}</button>)}</div></>}
    </div>
  }
  const item = task.items![index]
  return <div className="hs-task">
    <p className="hs-eyebrow">Question {index + 1} of {task.items!.length}</p>
    {typeof item.q === 'string' ? <h2>{item.q}</h2> : <><h2>Exactly the same, or different?</h2><div className="hs-pair"><div><span>Original</span><strong>{item.q.a}</strong></div><div><span>Copy</span><strong>{item.q.b}</strong></div></div></>}
    <div className="hs-options">{item.options.map((option, i) => <button key={`${index}-${option}`} onClick={() => choose(i === item.answer, task.items!.length)}><span aria-hidden="true">{'ABCD'[i]}</span>{option}</button>)}</div>
  </div>
}

export default function HiddenStrengthApp() {
  const [stage, setStage] = useState<Stage>('intro')
  const [cur, setCur] = useState(0)
  const [pred, setPred] = useState<number | null>(null)
  const [enjoy, setEnjoy] = useState<number | null>(null)
  const [drain, setDrain] = useState<number | null>(null)
  const [pending, setPending] = useState<{ score: number; max: number } | null>(null)
  const [results, setResults] = useState<Result[]>([])
  const [status, setStatus] = useState('')
  const screen = useRef<HTMLElement>(null)
  const task = TASKS[cur]
  const snapshot = buildSnapshot(results)
  const completed = results.filter(r => !r.skipped)
  const current = results.find(r => r.id === task.id)
  useEffect(() => { screen.current?.focus({preventScroll: true}); window.scrollTo(0, 0) }, [stage, cur])
  function next() {
    setPred(null); setEnjoy(null); setDrain(null); setPending(null)
    if (cur === TASKS.length - 1) setStage('snapshot')
    else { setCur(cur + 1); setStage('predict') }
  }
  function skip() {
    setResults(previous => [...previous.filter(r => r.id !== task.id), { id:task.id, score:0, max:0, band:0, pred:pred ?? 0, enjoy:null, drain:null, skipped:true }])
    next()
  }
  function reveal() {
    if (!pending || pred === null) return
    setResults(previous => [...previous.filter(r => r.id !== task.id), { id:task.id, ...pending, band:bandOf(pending.score,pending.max), pred, enjoy, drain }])
    setStage('reveal')
  }
  function restart() { setStage('intro'); setCur(0); setPred(null); setEnjoy(null); setDrain(null); setPending(null); setResults([]); setStatus('') }
  async function share() {
    const text = `${shareText(results)}\nhttps://www.planetsorted.com/hidden-strength`
    try { if (navigator.share) await navigator.share({ title:'My SOR7ED snapshot', text }); else { await navigator.clipboard.writeText(text); setStatus('Copied. Paste it anywhere.') } }
    catch (error) { if (!(error instanceof Error && error.name === 'AbortError')) setStatus(text) }
  }
  return <div className="hidden-strength-app">
    <aside className="hs-rail" aria-label="Session progress"><p className="hs-eyebrow">SOR7ED · Reflection</p><h2>Hidden strength</h2><ol>{TASKS.map((t,i) => <li key={t.id} aria-current={stage !== 'intro' && i === cur ? 'step' : undefined}><span aria-hidden="true">{results.find(r => r.id === t.id) ? results.find(r => r.id === t.id)?.skipped ? '—' : '✓' : String(i+1).padStart(2,'0')}</span>{t.name}</li>)}</ol><p>Not a diagnosis. Not a score of your intelligence.</p></aside>
    <section className="hs-stage" ref={screen} tabIndex={-1} aria-label={stage === 'intro' ? 'Hidden strength introduction' : stage === 'snapshot' ? 'Your strength snapshot' : `${task.name}: ${stage}`}>
      <div className="hs-topline"><span>SOR7ED · Predict · Play · Notice</span><span>{stage === 'intro' ? 'Five challenges · No timer' : stage === 'snapshot' ? 'Your snapshot' : `Challenge ${cur+1} / ${TASKS.length}`}</span></div>
      {stage === 'intro' ? <>
        <p className="hs-eyebrow">A short reflection</p><h1>Which challenge brings out your <em>best?</em></h1>
        <p className="hs-lede">Predict how you’ll do, try five short challenges, then see what you got right, what you enjoyed, and what felt like hard work. The interesting part is where those three disagree.</p>
        <ol className="hs-index">{TASKS.map((t,i) => <li key={t.id}><span aria-hidden="true">{String(i+1).padStart(2,'0')}</span><div><h2>{t.name}</h2><p>{t.asks}</p></div></li>)}</ol>
        <p className="hs-eyebrow">About 6 minutes · Untimed · Nothing saved</p><p className="hs-note"><strong>No brain types. No leaderboard.</strong> Every line in your snapshot points back to an answer you gave. Any challenge can be skipped.</p>
        <button className="hs-primary" onClick={() => setStage('predict')}>Start the first challenge →</button>
      </> : stage === 'predict' ? <>
        <p className="hs-eyebrow">Read · Predict</p><h1>{task.name}</h1><p className="hs-lede">{task.intro}</p><h2>How do you expect this to go?</h2>
        <div className="hs-options">{PRED.map(p => <button key={p.v} aria-pressed={pred === p.v} onClick={() => setPred(p.v)}>{p.label}</button>)}</div>
        <p className="hs-fine">The bands describe only this small item set, not your ability compared with other people. Developing: below 50%; Solid: 50–74%; Strong: 75% or more.</p>
        <div className="hs-actions"><button className="hs-primary" disabled={pred === null} onClick={() => setStage('play')}>Try the challenge →</button><button className="hs-link" onClick={skip}>Skip this challenge</button></div>
      </> : stage === 'play' ? <><h1>{task.name}</h1><Challenge key={task.id} task={task} onDone={(score,max) => { setPending({score,max}); setStage('reflect') }} /><button className="hs-link" onClick={skip}>Skip this challenge</button></> : stage === 'reflect' ? <>
        <p className="hs-eyebrow">Reflect before the reveal</p><h1>How did that feel?</h1><p>Accuracy, enjoyment and effort are different things. Either rating can be left blank.</p>
        {([{title:'Enjoyment',value:enjoy,set:setEnjoy,labels:ENJ},{title:'Mental effort',value:drain,set:setDrain,labels:DRAIN}] as const).map(rating => <fieldset key={rating.title}><legend>{rating.title}</legend><div className="hs-ratings">{[1,2,3,4,5].map(n => <button key={n} aria-pressed={rating.value === n} onClick={() => rating.set(rating.value === n ? null : n)}>{n}<span>{rating.labels[n as 1|2|3|4|5]}</span></button>)}</div></fieldset>)}
        <button className="hs-primary" onClick={reveal}>Reveal this round →</button>
      </> : stage === 'reveal' && current ? <>
        <p className="hs-eyebrow">Your round · {task.name}</p><h1>{current.score} of {current.max}</h1><p className="hs-lede">{BAND[current.band]} on this set. {gapSentence(current)}</p>
        <div className="hs-evidence"><p>You predicted: <strong>{PRED[current.pred].label}</strong></p><p>Enjoyment: <strong>{current.enjoy ? ENJ[current.enjoy as 1|2|3|4|5] : 'not rated'}</strong></p><p>Mental effort: <strong>{current.drain ? DRAIN[current.drain as 1|2|3|4|5] : 'not rated'}</strong></p><p className="hs-fine">On these {current.max} items: Developing {cutoffs(current.max).dev}; Solid {cutoffs(current.max).solid}; Strong {cutoffs(current.max).strong}.</p></div>
        {task.items ? <details><summary>See the answers</summary>{task.items.map((item,i) => <p key={i}>{item.explain}</p>)}</details> : null}
        <div className="hs-actions"><button className="hs-primary" onClick={next}>{cur === TASKS.length-1 ? 'See my snapshot →' : 'Next challenge →'}</button><button className="hs-link" onClick={() => setStage('snapshot')}>Finish here</button></div>
      </> : stage === 'snapshot' ? <>
        <p className="hs-eyebrow">Your strength snapshot · {completed.length} of {TASKS.length} challenges</p><h1>Here’s what we <em>noticed.</em></h1>
        {completed.length < 2 ? <p className="hs-note">A snapshot needs at least two completed challenges. There isn’t enough evidence to draw one yet.</p> : <>
          <div className="hs-highlight"><p className="hs-eyebrow">Your session highlight</p><h2>{snapshot.hl ? taskById(snapshot.hl.id)!.label : 'No standout performance this time'}</h2><p>{snapshot.hl ? `${snapshot.hl.score} of ${snapshot.hl.max} correct in ${taskById(snapshot.hl.id)!.name.toLowerCase()} (Strong band). The label is playful. The numbers are the evidence.` : 'No round reached the Strong band, and that’s fine. Short rounds with a few items are noisy.'}</p></div>
          <div className="hs-finding"><h2>A challenge you enjoyed</h2><p>{snapshot.enjoyed.length ? `Your highest enjoyment rating went to ${snapshot.enjoyed.map((r: Result) => taskById(r.id)!.name.toLowerCase()).join(' and ')}.` : 'You didn’t rate enjoyment, so we won’t guess.'}</p></div>
          <div className="hs-finding"><h2>A result that may have surprised you</h2><p>{snapshot.hasSurprise ? `In ${taskById(snapshot.surprise!.id)!.name.toLowerCase()}: ${gapSentence(snapshot.surprise!)}` : 'Your expectations matched your results in every completed round. That’s a finding too.'}</p></div>
          {snapshot.contrast.length ? <div className="hs-finding"><h2>Skill and preference can differ</h2><p>You did strongly at {snapshot.contrast.map((r: Result) => taskById(r.id)!.name.toLowerCase()).join(' and ')}, but rated the experience as demanding or less enjoyable. Being good at something and liking it are separate things.</p></div> : null}
          {snapshot.focus ? <div className="hs-finding"><h2>One way to explore further</h2><p>{taskById(snapshot.focus.id)!.next}</p></div> : null}
          <h2>Your rounds</h2><ul className="hs-summary">{TASKS.map(t => { const r = results.find(x => x.id === t.id); return <li key={t.id}><strong>{t.name}</strong><span>{!r || r.skipped ? 'Not completed' : `${r.score}/${r.max} · predicted ${BAND[r.pred]} · result ${BAND[r.band]}`}</span></li> })}</ul>
          <button className="hs-primary" onClick={share}>Share my snapshot</button><p role="status" className="hs-share-status">{status}</p>
        </>}
        <button className="hs-link" onClick={restart}>Restart</button>
      </> : null}
      <p className="hs-disclaimer">One short session on a small set of items. Familiarity, distraction, language and accessibility all affect results. This is not a measure of intelligence or a diagnosis. The tasks have not been calibrated against a population. Retrying the same items measures practice, not an independent check. Answers stay in this page and are cleared on reload.</p>
    </section>
  </div>
}
