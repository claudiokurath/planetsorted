const { execSync } = require('child_process')

const envs = {
  WHATSAPP_VERIFY_TOKEN: 'sor7ed_meta_webhook_2026',
  META_PHONE_NUMBER_ID: '1122994547560560',
  META_WHATSAPP_TOKEN: 'EAAVZAJjd1CZAcBRVIkKOZBH1RCN7MMNHZBDXYKBRvV5HB3ZC2vddzGXpPgFEoGcNUY47TBJlH7kXmN4r8ypqNZCeDOfynEdiZA71oPZA1zhisRn7Y9J5x1dTpen1UmXware0bfV2uzhDgZAkgsrwm4H2RvESLZCuR4iT3HsAQMfaIXtORsbwbaRrxfuj3ZB2uyePTZAbk5ZAFT94OHRZB6QKnJx9nskWv9BD8UOdPt0i9eSZBsc',
  STRIPE_PRICE_ID_PLUS_MONTHLY: 'price_1PlusMonthlyPlaceholder',
  NEXT_PUBLIC_WA_NUMBER: '447360277713'
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
console.log('Finished uploading all WhatsApp and Stripe variables to Vercel!')
