const { execSync } = require('child_process')

const envs = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://wyxvbzbqbznqjftbgcxc.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5eHZiemJxYnpucWpmdGJnY3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MTA5NzMsImV4cCI6MjA5NDA4Njk3M30.2mVqTfTfENipgAgvGWOPg2qPaZrZ4KdNoB6VckWgnG0',
  SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5eHZiemJxYnpucWpmdGJnY3hjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODUxMDk3MywiZXhwIjoyMDk0MDg2OTczfQ.pBAdqPOSv3Cqj4YG8W6Lv8Dv4J0xiM7zs2rvJnVV6Rg',
  NOTION_SECRET: 'ntn_M35904089089djnanbQ89SUYewrkrCkLh1bQKM6eZTnfGZ',
  NOTION_ARTICLES_DB_ID: 'db668e4687ed455498357b8d11d2c714',
  CRON_SECRET: 'test_cron_secret_123',
  NEXT_PUBLIC_SITE_URL: 'https://planetsorted.com',
  STRIPE_SECRET_KEY: 'sk_test_placeholder',
  STRIPE_WEBHOOK_SECRET: 'whsec_placeholder',
  STRIPE_PRICE_ID_PLUS_MONTHLY: 'price_1PlusMonthlyPlaceholder',
  NEXT_PUBLIC_WA_NUMBER: '447360277713',
  META_PHONE_NUMBER_ID: '1122994547560560',
  META_WHATSAPP_TOKEN: 'EAAVZAJjd1CZAcBRVIkKOZBH1RCN7MMNHZBDXYKBRvV5HB3ZC2vddzGXpPgFEoGcNUY47TBJlH7kXmN4r8ypqNZCeDOfynEdiZA71oPZA1zhisRn7Y9J5x1dTpen1UmXware0bfV2uzhDgZAkgsrwm4H2RvESLZCuR4iT3HsAQMfaIXtORsbwbaRrxfuj3ZB2uyePTZAbk5ZAFT94OHRZB6QKnJx9nskWv9BD8UOdPt0i9eSZBsc',
  WHATSAPP_VERIFY_TOKEN: 'sor7ed_meta_webhook_2026'
}

for (const [key, val] of Object.entries(envs)) {
  console.log(`Processing Vercel env variable: ${key}...`)
  try {
    execSync(`npx vercel env rm ${key} -y`, { stdio: 'ignore' })
  } catch (e) {}

  try {
    execSync(`printf "%s" "${val}" | npx vercel env add ${key} production,preview`, { stdio: 'inherit' })
    console.log(`Successfully added ${key}!`)
  } catch (err) {
    console.error(`Failed to add ${key}:`, err.message)
  }
}
console.log('Finished uploading all variables to the planetsorted Vercel project!')
