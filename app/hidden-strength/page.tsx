import { publicPageMetadata } from '@/lib/seo'
import HiddenStrengthApp from '@/components/reflections/HiddenStrengthApp'

export const metadata = publicPageMetadata({title:'Hidden Strength: five short challenges',description:'Predict, try five untimed challenges and reflect on enjoyment and effort. A playful snapshot, not a test of intelligence. Nothing is saved.',path:'/hidden-strength'})
export default function Page() { return <HiddenStrengthApp /> }
