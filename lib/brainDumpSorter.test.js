import test from 'node:test'
import assert from 'node:assert/strict'
import { classifyBrainDump } from './brainDumpSorter.ts'

test('keeps an emotion separate from the idea before a question or exclamation', () => {
  assert.deepEqual(
    classifyBrainDump('Need to email the invoice. What if I make a checklist? Feeling stressed today! Maybe explore a new routine; Feeling hopeful'),
    {
      tasks: ['Need to email the invoice'],
      ideas: ['What if I make a checklist', 'Maybe explore a new routine'],
      emotions: ['Feeling stressed today', 'Feeling hopeful'],
    }
  )
})
