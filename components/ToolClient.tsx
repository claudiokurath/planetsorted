import { GammaReader } from '@/components/GammaReader'
import type { Protocol } from '@/lib/types/database'

export function ToolClient({ toolData }: { toolData: Protocol }) {
  return <GammaReader title={toolData.title} source={toolData.gamma_url} collection="tool" />
}
