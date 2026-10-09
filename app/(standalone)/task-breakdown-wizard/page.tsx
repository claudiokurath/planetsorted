import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Task Breakdown Wizard — Planet Sorted',
  description:
    'Turn a task you\'re avoiding into smaller steps. Your first action arrives in your WhatsApp.',
}

export default function TaskBreakdownWizardPage() {
  redirect('/tools/task-breakdown-wizard')
}
