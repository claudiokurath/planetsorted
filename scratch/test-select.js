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

async function testSelect() {
  const { data, error } = await supabase
    .from('protocols')
    .select('title, summary, category, cover_image, problem, keyword, read_time, cta, excerpt, audio_url, slug')
    .limit(1)

  if (error) {
    console.error('Select error with audio_url:', error)
  } else {
    console.log('Select with audio_url SUCCESS:', data)
  }

  const { data: data2, error: error2 } = await supabase
    .from('protocols')
    .select('audio')
    .limit(1)

  if (error2) {
    console.log('Column "audio" check result:', error2.message)
  } else {
    console.log('Column "audio" exists:', data2)
  }
}

testSelect()
