import fs from 'fs'
import path from 'path'

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

async function testCronRoute() {
  const { GET } = await import('../app/api/cron/sync-notion/route.js')
  const req = new Request('http://localhost:3000/api/cron/sync-notion', {
    headers: {
      authorization: `Bearer ${process.env.CRON_SECRET}`
    }
  })

  console.log('Executing app/api/cron/sync-notion/route.ts GET handler...')
  const res = await GET(req)
  const data = await res.json()
  console.log('Cron handler response:', res.status, data)
}

testCronRoute().catch(err => console.error('Cron test failed:', err))
