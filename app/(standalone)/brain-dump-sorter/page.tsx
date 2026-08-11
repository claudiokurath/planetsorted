import { BrainDumpSorterApp } from '@/components/BrainDumpSorterApp'
import { getStandaloneMetadata } from '@/lib/standaloneMetadata'
import { verifyStandaloneAccess } from '@/lib/standaloneGuard'

interface Props {
  searchParams?: Promise<{ access_token?: string }>
}

export async function generateMetadata() {
  return getStandaloneMetadata(
    'brain-dump-sorter',
    'Brain Dump Sorter',
    'NLP sorter: classify raw dumps into Task, Idea, and Emotion categories automatically.'
  )
}

export default async function BrainDumpSorterPage({ searchParams }: Props) {
  await verifyStandaloneAccess('brain-dump-sorter', searchParams)
  return <BrainDumpSorterApp />
}
