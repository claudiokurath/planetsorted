import { publicPageMetadata } from '@/lib/seo'
import { MoneyResetExperience } from '@/components/reflections/ReflectionApps'

export const metadata = publicPageMetadata({title:'ADHD Money Reset',description:'Organise your income, bills and money leaks, then build a practical plan. Your answers stay in your browser. Not financial advice.',path:'/adhd-money-reset'})
export default function Page() { return <MoneyResetExperience /> }
