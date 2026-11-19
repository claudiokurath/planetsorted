import { redirect } from 'next/navigation'

// Membership belongs to the separate Button service. Existing data is retained.
export default function Page() {
  redirect('https://www.sor7ed.com/account')
}
