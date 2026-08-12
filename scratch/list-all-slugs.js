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

async function listAllSlugs() {
  const { data } = await supabase
    .from('protocols')
    .select('slug, title, category, keyword, status, protocol')
    .eq('status', 'Published')

  console.log(`Found ${data?.length ?? 0} published protocols in Supabase:`)
  for (const row of data || []) {
    console.log(`- Slug: "${row.slug}" | Category: "${row.category}" | Keyword: "${row.keyword}" | ProtocolLen: ${row.protocol?.length ?? 0}`)
  }
}

listAllSlugs()
