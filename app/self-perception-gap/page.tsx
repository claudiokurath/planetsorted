import { publicPageMetadata } from '@/lib/seo'
import { SelfPerceptionExperience } from '@/components/reflections/ReflectionApps'

export const metadata = publicPageMetadata({title:'The Self-Perception Gap',description:'Predict, play and compare your expectations with six short rounds. A personal reflection on this session, not a measure of intelligence.',path:'/self-perception-gap'})
export default function Page() { return <SelfPerceptionExperience /> }
