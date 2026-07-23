import fs from 'fs'
import path from 'path'

const envPath = path.join(process.cwd(), '.env.production')
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8')
  console.log('.env.production downloaded keys:')
  for (const line of content.split('\n')) {
    if (line.startsWith('#') || !line.trim()) continue
    const key = line.split('=')[0]
    const val = line.substring(key.length + 1).trim().replace(/^["']|["']$/g, '')
    // Print masked value for security, showing length and first/last chars
    const masked = val.length > 8 ? `${val.substring(0, 4)}...${val.substring(val.length - 4)} (${val.length} chars)` : val
    console.log(`- ${key}: ${masked}`)
  }
} else {
  console.log('.env.production not found')
}
