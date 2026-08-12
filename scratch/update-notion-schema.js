import fs from 'fs'
import path from 'path'
import { Client } from '@notionhq/client'

// Load .env.local
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

const notion = new Client({ auth: process.env.NOTION_SECRET })
const databaseId = process.env.NOTION_ARTICLES_DB_ID || 'db668e4687ed455498357b8d11d2c714'

async function updateDatabaseSchema() {
  console.log('Fetching database schema for ID:', databaseId)
  const db = await notion.databases.retrieve({ database_id: databaseId })
  
  console.log('Current database properties:', Object.keys(db.properties))
  
  // Check if Category 1 exists
  if (db.properties['Category 1']) {
    console.log('Found "Category 1" property. Renaming to "Category" and updating select options...')
    
    const response = await notion.databases.update({
      database_id: databaseId,
      properties: {
        'Category 1': {
          name: 'Category',
          select: {
            options: [
              { name: 'Mind', color: 'blue' },
              { name: 'Wealth', color: 'orange' },
              { name: 'Body', color: 'green' },
              { name: 'Tech', color: 'yellow' },
              { name: 'Connection', color: 'purple' },
              { name: 'Impression', color: 'pink' },
              { name: 'Growth', color: 'red' },
            ]
          }
        }
      }
    })
    console.log('Database updated successfully! New property name:', Object.keys(response.properties).find(k => k.includes('Category')))
  } else if (db.properties['Category']) {
    console.log('Found "Category" property. Updating select options to standard taxonomy...')
    const response = await notion.databases.update({
      database_id: databaseId,
      properties: {
        'Category': {
          select: {
            options: [
              { name: 'Mind', color: 'blue' },
              { name: 'Wealth', color: 'orange' },
              { name: 'Body', color: 'green' },
              { name: 'Tech', color: 'yellow' },
              { name: 'Connection', color: 'purple' },
              { name: 'Impression', color: 'pink' },
              { name: 'Growth', color: 'red' },
            ]
          }
        }
      }
    })
    console.log('Database updated successfully!')
  } else {
    console.log('Neither Category 1 nor Category property found in properties:', Object.keys(db.properties))
  }
}

updateDatabaseSchema().catch(err => {
  console.error('Error updating Notion database:', err)
})
