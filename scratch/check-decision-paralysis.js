import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8')
  for (const line of envConfig.split('\n')) {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      const key = match[1].trim()
      let value = match[2].trim().replace(/^["']|["']$/g, '')
      process.env[key] = process.env[key] || value
    }
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkDecisionParalysis() {
  const { data, error } = await supabase
    .from('protocols')
    .select('slug, title, category, keyword, problem, protocol, status')
    .or('slug.eq.decision-paralysis-solver,keyword.eq.CLARITY')

  if (error) {
    console.error('Error fetching decision-paralysis-solver:', error)
    return
  }

  console.log('QueryResult:', JSON.stringify(data, null, 2))
}

checkDecisionParalysis()
