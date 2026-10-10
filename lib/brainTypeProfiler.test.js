import test from 'node:test'
import assert from 'node:assert/strict'
import { BRAIN_TYPES, DIMENSIONS, QUESTIONS, RECOMMENDED_TOOL_URLS, emptyBrainScores, getBrainType } from './brainTypeProfiler.ts'

test('each consistent answer pattern reaches its supplied profile and usable toolkit', () => {
  for (const dimension of DIMENSIONS) {
    const scores = emptyBrainScores()
    for (const question of QUESTIONS) {
      const answer = question.a.find(answer => answer.d === dimension)
      assert.ok(answer, `Missing ${dimension} answer`)
      scores[answer.d]++
    }
    assert.equal(getBrainType(scores), dimension)
    assert.equal(scores[dimension], 12)
    assert.equal(BRAIN_TYPES[dimension].tools.length, 2)
    for (const [name] of BRAIN_TYPES[dimension].tools) assert.match(RECOMMENDED_TOOL_URLS[name], /^\/embed\/[a-z-]+$/)
  }
})

test('mixed profiles use the handoff tie order without losing scores', () => {
  assert.equal(getBrainType({ spark: 3, sustain: 3, sort: 3, steady: 3 }), 'spark')
  assert.equal(getBrainType({ spark: 0, sustain: 4, sort: 4, steady: 4 }), 'sustain')
  assert.equal(getBrainType({ spark: 2, sustain: 2, sort: 4, steady: 4 }), 'sort')
  assert.equal(getBrainType({ spark: 1, sustain: 2, sort: 3, steady: 6 }), 'steady')
})
