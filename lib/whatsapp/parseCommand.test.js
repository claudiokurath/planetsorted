import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { parseCommand, TOOL_KEYWORDS } from './parseCommand.ts'

describe('parseCommand', () => {
  it('recognises bare tool keywords', () => {
    assert.deepEqual(parseCommand('TAX'), { verb: 'TOOL', arg: 'TAX' })
    assert.deepEqual(parseCommand('burnout'), { verb: 'TOOL', arg: 'BURNOUT' })
  })

  it('recognises RUN <tool>', () => {
    assert.deepEqual(parseCommand('RUN TAX'), { verb: 'TOOL', arg: 'TAX' })
  })

  it('recognises system commands', () => {
    for (const cmd of ['LOGIN', 'STOP', 'START', 'STOPWEEKLY', 'STARTWEEKLY', 'HELP', 'MENU', 'LIBRARY']) {
      assert.equal(parseCommand(cmd).verb, cmd)
    }
  })

  it('recognises SAVE with arg', () => {
    assert.deepEqual(parseCommand('SAVE tax'), { verb: 'SAVE', arg: 'tax' })
    assert.deepEqual(parseCommand('SAVE https://example.com/x'), {
      verb: 'SAVE',
      arg: 'https://example.com/x',
    })
  })

  it('falls back to ARTICLE_KEYWORD', () => {
    const r = parseCommand('some-random-slug')
    assert.equal(r.verb, 'ARTICLE_KEYWORD')
    assert.equal(r.arg, 'some-random-slug')
  })

  it('exposes the expected tool keyword set', () => {
    for (const k of ['TAX', 'AUTOPILOT', 'CLARITY', 'DOPAMINE', 'TRIAGE', 'RSD', 'SENSORY', 'BURNOUT']) {
      assert.ok(TOOL_KEYWORDS.has(k), k)
    }
  })
})
