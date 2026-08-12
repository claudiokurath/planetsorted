const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_SECRET });
const DB_ID = process.env.NOTION_ARTICLES_DB_ID;

async function run() {
  console.log('--- 1. Checking and Updating Database Schema ---');
  const db = await notion.databases.retrieve({ database_id: DB_ID });
  
  if (!('Type' in db.properties)) {
    console.log("Property 'Type' not found in database. Creating Select property 'Type'...");
    await notion.databases.update({
      database_id: DB_ID,
      properties: {
        'Type': {
          select: {
            options: [
              { name: 'Article', color: 'blue' },
              { name: 'Tool', color: 'green' }
            ]
          }
        }
      }
    });
    console.log("Successfully created 'Type' property!");
  } else {
    console.log("'Type' property already exists in database schema.");
  }

  console.log('\n--- 2. Checking if ADHD Tax Calculator page exists ---');
  let cursor = undefined;
  let existingPage = null;
  do {
    const res = await notion.databases.query({
      database_id: DB_ID,
      start_cursor: cursor,
    });
    for (const p of res.results) {
      const slug = p.properties['Slug']?.rich_text?.[0]?.plain_text ?? '';
      if (slug === 'adhd-tax-calculator') {
        existingPage = p;
        break;
      }
    }
    if (existingPage) break;
    cursor = res.next_cursor;
  } while (cursor);

  const pageProperties = {
    'Title': { title: [{ text: { content: 'ADHD Tax Calculator' } }] },
    'Slug': { rich_text: [{ text: { content: 'adhd-tax-calculator' } }] },
    'Type': { select: { name: 'Tool' } },
    'Status': { status: { name: 'Published' } },
    'WhatsApp Trigger': { rich_text: [{ text: { content: 'TAX' } }] },
    'Read Time': { rich_text: [{ text: { content: '3m' } }] },
    'Summary': { rich_text: [{ text: { content: 'Calculate your estimated ADHD tax leak and get a plan to stop it.' } }] },
    'Excerpt': { rich_text: [{ text: { content: 'Calculate subscription leaks, late fees, and impulse buying overhead in 3 minutes.' } }] },
    'Category': { select: { name: 'Wealth' } }
  };

  if (existingPage) {
    console.log(`Found existing page (${existingPage.id}). Updating properties...`);
    await notion.pages.update({
      page_id: existingPage.id,
      properties: pageProperties
    });
    console.log('Successfully updated existing ADHD Tax Calculator page in Notion!');
  } else {
    console.log('Page not found. Creating new ADHD Tax Calculator page in Notion...');
    const newPage = await notion.pages.create({
      parent: { database_id: DB_ID },
      properties: pageProperties
    });
    console.log(`Successfully created new ADHD Tax Calculator page (ID: ${newPage.id}) in Notion!`);
  }
}

run().catch(err => {
  console.error('Error during Notion setup:', err.body || err.message || err);
});
