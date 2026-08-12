const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_SECRET });

async function run() {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_ARTICLES_DB_ID,
  });
  console.log(`Total results in articles DB: ${response.results.length}`);
  for (const page of response.results) {
    const title = page.properties['Title']?.title?.[0]?.plain_text || 'No Title';
    const slug = page.properties['Slug']?.rich_text?.[0]?.plain_text || 'No Slug';
    const status = page.properties['Status']?.status?.name || 'No Status';
    const published = page.properties['Published']?.checkbox;
    console.log(`- [${slug}] "${title}" | Status: ${status} | Published Checkbox: ${published} | ID: ${page.id}`);
  }
}

run().catch(console.error);
