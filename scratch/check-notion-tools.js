const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_SECRET });

const TOOL_SLUGS = [
  'adhd-tax-calculator',
  'financial-autopilot',
  'decision-paralysis-solver',
  'dopamine-menu-generator',
  'task-triage',
  'rsd-response-scripts',
  'sensory-audit',
  'burnout-assessment',
];

async function run() {
  console.log('--- Checking Notion Database Schema ---');
  const db = await notion.databases.retrieve({
    database_id: process.env.NOTION_ARTICLES_DB_ID,
  });

  const hasTypeProp = 'Type' in db.properties;
  console.log(`Property 'Type' exists in schema: ${hasTypeProp}`);
  if (hasTypeProp) {
    console.log('Type property details:', JSON.stringify(db.properties['Type'], null, 2));
  }

  console.log('\n--- Checking for existing tool pages in Notion (across all statuses) ---');
  let cursor = undefined;
  let allPages = [];
  do {
    const res = await notion.databases.query({
      database_id: process.env.NOTION_ARTICLES_DB_ID,
      start_cursor: cursor,
    });
    allPages = allPages.concat(res.results);
    cursor = res.next_cursor;
  } while (cursor);

  console.log(`Total pages in database: ${allPages.length}`);

  let foundTools = 0;
  for (const p of allPages) {
    const props = p.properties;
    const slug = props['Slug']?.rich_text?.[0]?.plain_text ?? '';
    const title = props['Title']?.title?.[0]?.plain_text ?? '(no title)';
    const status = props['Status']?.status?.name ?? '(no status)';
    const type = props['Type']?.select?.name ?? '(no Type set)';

    if (TOOL_SLUGS.includes(slug)) {
      foundTools++;
      console.log(`[TOOL FOUND] Slug: ${slug.padEnd(25)} | Title: ${title} | Status: ${status} | Type: ${type}`);
    }
  }

  if (foundTools === 0) {
    console.log('None of the 8 tool slugs were found in the Notion database. They need to be created as pages.');
  } else {
    console.log(`Found ${foundTools} of 8 tool pages in Notion.`);
  }
}

run().catch(console.error);
