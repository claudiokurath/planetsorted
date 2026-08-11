import { BrainDumpSorterApp } from '@/components/BrainDumpSorterApp'
import { getStandaloneMetadata } from '@/lib/standaloneMetadata'

export async function generateMetadata() {
  return getStandaloneMetadata(
    'brain-dump-sorter',
    'Brain Dump Sorter',
    'NLP sorter: classify raw dumps into Task, Idea, and Emotion categories automatically.'
  )
}

export default function BrainDumpSorterPage() {
  return <BrainDumpSorterApp />
}
