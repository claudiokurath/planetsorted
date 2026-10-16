import type { Metadata } from 'next'
import { TaskBreakdownWizardClient } from '@/components/TaskBreakdownWizardClient'

export const metadata: Metadata = {
  title: 'Task Breakdown Wizard — PLANET SOR7ED',
  description:
    'Turn a task you\'re avoiding into smaller steps. Your first action arrives in your WhatsApp.',
}

export default function TaskBreakdownWizardPage() {
  return <TaskBreakdownWizardClient />
}
