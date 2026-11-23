import Link from 'next/link'
import { publicPageMetadata } from '@/lib/seo'
import { CollectionCatalog } from '@/components/CollectionCatalog'

export const metadata = publicPageMetadata({title:'Quizzes and tools',description:'Find the Brain Sorter, Hidden Strength, Self-Perception Gap, ADHD Money Reset and currently published SOR7ED tools in one place.',path:'/quizzes-and-tools'})

const reflections = [
  {href:'/brain-type',title:'Brain Sorter',description:'Twelve reflection questions about how you work, start and recover.'},
  {href:'/hidden-strength',title:'Hidden Strength',description:'Five short, untimed challenges. Predict, play and notice what works for you.'},
  {href:'/self-perception-gap',title:'Self-Perception Gap',description:'Compare what you expect with what happens across six short rounds.'},
  {href:'/adhd-money-reset',title:'ADHD Money Reset',description:'Bring income, bills and money leaks together into a practical plan.'},
]

export default function QuizzesAndToolsPage() {
  return <div className="mx-auto w-full max-w-7xl px-6 py-14 sm:py-20">
    <header className="mb-12 text-center"><p className="mb-4 text-sm uppercase tracking-widest text-[#FFBA2E]">SOR7ED · Find your starting point</p><h1 className="font-bebas text-5xl leading-tight sm:text-7xl">Quizzes and tools</h1><p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-neutral-300">Choose what helps today. These reflections are for exploring your own patterns, not diagnosis or assessment.</p></header>
    <section aria-labelledby="reflection-heading" className="mb-20"><h2 id="reflection-heading" className="mb-7 font-bebas text-3xl text-[#FFBA2E]">Start with a reflection</h2><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{reflections.map(item=><Link key={item.href} href={item.href} className="flex min-h-64 flex-col border border-[#FFBA2E]/40 bg-[#141414] p-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FFBA2E] hover:border-[#FFBA2E]"><h3 className="font-bebas text-3xl">{item.title}</h3><p className="mt-4 mb-6 text-base leading-relaxed text-neutral-300">{item.description}</p><span className="mt-auto text-[#FFBA2E]">Open {item.title} ↗</span></Link>)}</div></section>
    <CollectionCatalog type="Tool" heading="Published tools" description="Explore the current Toolbox. Open an explanation, then use the SOR7ED button for supported member resources." />
  </div>
}
