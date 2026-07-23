import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// Parse .env.local
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

async function main() {
  const { data, error } = await supabase
    .from('protocols')
    .select('slug, title, category, status, keyword, problem, protocol')

  if (error) {
    console.error('Error fetching protocols:', error)
    return
  }

  console.log(`Found ${data?.length ?? 0} rows in protocols table:`)
  for (const row of data || []) {
    console.log('---')
    console.log(`Slug: ${row.slug}`)
    console.log(`Title: ${row.title}`)
    console.log(`Category: ${row.category}`)
    console.log(`Keyword: ${row.keyword}`)
    console.log(`Problem length: ${row.problem?.length ?? 0} chars`)
    console.log(`Protocol length: ${row.protocol?.length ?? 0} chars`)
  }
}

main()
