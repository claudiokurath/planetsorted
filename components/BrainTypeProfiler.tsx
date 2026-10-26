'use client'

import { useEffect, useRef, useState } from 'react'
import { BRAIN_TYPES, DIMENSIONS, DIMENSION_LABELS, QUESTIONS, RECOMMENDED_TOOL_URLS, publishedRecommendations, emptyBrainScores, getBrainType } from '@/lib/brainTypeProfiler'
import type { BrainDimension, BrainScores } from '@/lib/brainTypeProfiler'
import './BrainTypeProfiler.css'

type ProfilerState = { screen: 'intro' | 'quiz' | 'result'; index: number; scores: BrainScores }

export function BrainTypeProfiler({ publishedToolSlugs, toolsAvailable }: { publishedToolSlugs: string[]; toolsAvailable: boolean }) {
  const [state, setState] = useState<ProfilerState>(() => ({ screen: 'intro', index: 0, scores: emptyBrainScores() }))
  const [copied, setCopied] = useState(false)
  const [animateBars, setAnimateBars] = useState(false)
  const screenRef = useRef<HTMLElement>(null)
  const moved = useRef(false)

  useEffect(() => {
    if (moved.current) {
      window.scrollTo(0, 0)
      screenRef.current?.focus({ preventScroll: true })
    }
    moved.current = true
  }, [state.screen, state.index])

  useEffect(() => {
    if (state.screen !== 'result') return
    const frame = requestAnimationFrame(() => setAnimateBars(true))
    return () => cancelAnimationFrame(frame)
  }, [state.screen])

  function begin() {
    setCopied(false)
    setAnimateBars(false)
    setState({ screen: 'quiz', index: 0, scores: emptyBrainScores() })
  }

  function answer(dimension: BrainDimension, questionIndex: number) {
    setState(previous => {
      if (previous.screen !== 'quiz' || previous.index !== questionIndex) return previous
      const scores = { ...previous.scores, [dimension]: previous.scores[dimension] + 1 }
      const index = previous.index + 1
      return { scores, index, screen: index < QUESTIONS.length ? 'quiz' : 'result' }
    })
  }

  const type = BRAIN_TYPES[getBrainType(state.scores)]
  const recommendations = publishedRecommendations(type, publishedToolSlugs)
  const maxScore = Math.max(...DIMENSIONS.map(dimension => state.scores[dimension])) || 1

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(`I'm ${type.name} — ${type.tag} (sor7ed brain type)`)
      setCopied(true)
    } catch {
      // Keep the original button label if the clipboard is unavailable.
    }
  }

  return (
    <div className="brain-type-profiler">
      <div className="wrap">
        <section ref={screenRef} tabIndex={-1} key={state.screen} className="screen active" aria-label={state.screen === 'intro' ? 'How your brain runs' : state.screen === 'quiz' ? `Question ${state.index + 1} of ${QUESTIONS.length}` : 'Your brain type result'}>
          {state.screen === 'intro' ? <>
            <p className="kicker">A 2-minute reflection tool</p>
            <h1 className="display">How your<br />brain runs</h1>
            <p className="lede">Twelve questions about how you actually work, start and recover — then a profile of what fuels you.</p>
            <hr className="rule" />
            <p className="meta">12 questions · about 2 minutes · nothing saved</p>
            <div className="row"><button className="btn" onClick={begin}>Begin</button></div>
            <p className="fineprint">A reflection tool, not a diagnosis. It describes patterns, not conditions, and it is not medical or psychological advice. If something here resonates, a qualified professional is the right next step.</p>
          </> : state.screen === 'quiz' ? <>
            <div className="prog">
              <span className="count">{String(state.index + 1).padStart(2, '0')} / {QUESTIONS.length}</span>
              <span className="track" role="progressbar" aria-label="Questions answered" aria-valuenow={state.index} aria-valuemin={0} aria-valuemax={QUESTIONS.length}><i style={{ width: `${Math.round(state.index / QUESTIONS.length * 100)}%` }} /></span>
            </div>
            <h2 className="q">{QUESTIONS[state.index].q}</h2>
            <div className="opts">{QUESTIONS[state.index].a.map((option, index) => <button className="opt" key={`${state.index}-${option.d}`} onClick={() => answer(option.d, state.index)}><span className="idx" aria-hidden="true">{'ABCD'[index]}</span><span>{option.t}</span></button>)}</div>
          </> : <>
            <p className="you">Your brain type</p>
            <h1 className="display">{type.name}</h1>
            <p className="identity">{type.tag} {type.identity}</p>
            <hr className="rule" />
            <p className="kicker">Your profile</p>
            <div className="profile">{DIMENSIONS.map(dimension => <div className="dim" key={dimension}><span className="lbl">{DIMENSION_LABELS[dimension]}</span><span className="bar" role="meter" aria-label={DIMENSION_LABELS[dimension]} aria-valuenow={state.scores[dimension]} aria-valuemin={0} aria-valuemax={QUESTIONS.length}><i style={{ width: animateBars ? `${Math.round(state.scores[dimension] / maxScore * 100)}%` : '0%' }} /></span></div>)}</div>
            <hr className="rule" />
            <div className="cols">
              <div><h3>What fuels you</h3><ul>{type.strengths.map(item => <li key={item}>{item}</li>)}</ul></div>
              <div><h3>Where it catches</h3><ul>{type.friction.map(item => <li key={item}>{item}</li>)}</ul></div>
            </div>
            <hr className="rule" />
            <p className="kicker">Your toolkit</p>
            {!recommendations.length ? <p className="fineprint">{toolsAvailable ? 'There isn’t a published tool for this profile yet. You can explore the current Toolbox below.' : 'Tool recommendations are unavailable right now. Please try the Toolbox again shortly.'}</p> : null}
            <div className="tools">{recommendations.map(([name, description]) => <a className="tool" key={name} href={RECOMMENDED_TOOL_URLS[name]}><div className="n">{name}</div><div className="d">{description}</div></a>)}</div>
            <hr className="rule" />
            <div className="share"><p className="brand">sor7ed · brain type</p><p className="big">{type.name}</p><p className="tag">{type.tag}</p></div>
            <div className="row"><button className="btn" onClick={begin}>Take it again</button><button className="btn ghost" onClick={copyResult}>{copied ? 'Copied' : 'Copy my result'}</button></div>
          </>}
        </section>
      </div>
    </div>
  )
}
