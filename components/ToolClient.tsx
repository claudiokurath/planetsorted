import { GammaReader } from '@/components/GammaReader'
import { INTERACTIVE_TOOL_ROUTES } from '@/lib/standaloneRoutes'
import type { Protocol } from '@/lib/types/database'

export function ToolClient({ toolData }: { toolData: Protocol }) {
  return <GammaReader title={toolData.title} source={toolData.gamma_url} collection="tool" launch={INTERACTIVE_TOOL_ROUTES[toolData.slug]} />
}
