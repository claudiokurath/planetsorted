'use client'

import { useState } from 'react'
import { MR_CALC, sanitizeMoneyInputs } from '@/lib/reflections/money'
import { LandingPage, MoneyResetForm, ResultsDashboard, ExportPage } from './MoneyResetViews'
import './MoneyReset.css'

const KEY = 'sor7ed.money-reset.v1'
const views = ['landing', 'step-1', 'step-2', 'step-3', 'step-4', 'step-5', 'step-6', 'results', 'export']
function readSaved() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY))
    if (!value || !value.inputs || !views.includes(value.view)) return null
    const inputs = sanitizeMoneyInputs(value.inputs)
    return { inputs, view: value.view }
  } catch { return null }
}
export default function MoneyResetApp() {
  const [saved] = useState(readSaved)
  const [inputs, setInputs] = useState(saved?.inputs || MR_CALC.EMPTY_INPUTS)
  const [view, setViewState] = useState(saved?.view || 'landing')
  const [sample, setSample] = useState(false)
  const [storageAvailable, setStorageAvailable] = useState(true)
  function persist(nextInputs, nextView) {
    try { localStorage.setItem(KEY, JSON.stringify({inputs:nextInputs, view:nextView})); setStorageAvailable(true) } catch { setStorageAvailable(false) }
  }
  function updateInputs(next) { setInputs(next); if (!sample) persist(next,view) }
  function setView(next) { if (sample && (next.startsWith('step-') || next === 'landing')) setSample(false); setViewState(next); if (!sample || next.startsWith('step-') || next === 'landing') persist(inputs,next); window.scrollTo({ top: 0 }); }
  function start() { const fresh = { ...MR_CALC.EMPTY_INPUTS }; setInputs(fresh); setSample(false); setViewState('step-1'); persist(fresh,'step-1'); window.scrollTo(0,0) }
  function forget() {
    try { localStorage.removeItem(KEY) } catch {}
    setInputs({ ...MR_CALC.EMPTY_INPUTS }); setViewState('landing'); setSample(false)
  }
  const appInputs = sample ? MR_CALC.SAMPLE_STRETCHED : inputs
  return <div className="money-reset-app">
    <div className="money-privacy no-print">
      <span>{sample ? 'Example numbers — these are not your finances. Your saved answers have not been changed.' : storageAvailable ? 'Your answers stay in this browser. They are not sent to SOR7ED.' : 'Browser storage is unavailable. Your answers will be lost when you leave.'}</span>
      <button type="button" onClick={forget}>Clear my answers</button>
    </div>
    {sample ? <div className="money-sample-actions no-print"><button type="button" onClick={start}>Start with my own numbers</button><button type="button" onClick={() => { setSample(false); setView('landing') }}>Back to my reset</button></div> : null}
    {sample && view === 'export' ? <p className="money-example-print">EXAMPLE PLAN — demonstration numbers, not your finances.</p> : null}
    {view === 'landing' ? <LandingPage onStart={start} onLoadSample={() => { setSample(true); setViewState('results'); window.scrollTo(0,0) }} /> : view.startsWith('step-') ? <MoneyResetForm view={view} setView={setView} inputs={inputs} setInputs={updateInputs} onComplete={() => setView('results')} /> : view === 'export' ? <ExportPage inputs={appInputs} setView={setView} /> : <ResultsDashboard inputs={appInputs} setView={setView} planView="premium" setPlanView={() => {}} />}
  </div>
}
