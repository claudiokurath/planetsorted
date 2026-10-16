export interface SortedBrainDump {
  tasks: string[]
  ideas: string[]
  emotions: string[]
}

export function classifyBrainDump(rawText: string): SortedBrainDump {
  const lines = rawText
    .split(/(?:[.!?…\n;]|\band\b)+/i)
    .map((line) => line.trim())
    .filter((line) => line.length > 2)

  const tasks: string[] = []
  const ideas: string[] = []
  const emotions: string[] = []
  const taskRegex = /\b(need to|must|call|email|send|buy|finish|do|book|clean|fix|schedule|update|create|submit|pay|invoice|write|pick up|draft)\b/i
  const ideaRegex = /\b(idea|what if|maybe|could|pitch|project|concept|feature|app|strategy|build|explore|design|plan|thought)\b/i
  const emotionRegex = /\b(feel|feeling|anxious|tired|overwhelmed|stressed|happy|worried|exhausted|frustrated|scared|hopeful|behind|sad|angry)\b/i

  for (const line of lines) {
    if (taskRegex.test(line)) tasks.push(line)
    else if (ideaRegex.test(line)) ideas.push(line)
    else if (emotionRegex.test(line)) emotions.push(line)
    else if (line.length < 35) tasks.push(line)
    else ideas.push(line)
  }

  return { tasks, ideas, emotions }
}
