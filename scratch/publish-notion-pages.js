const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_SECRET });

async function run() {
  let cursor = undefined;
  let allResults = [];
  do {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_ARTICLES_DB_ID,
      start_cursor: cursor,
    });
    allResults = allResults.concat(response.results);
    cursor = response.next_cursor;
  } while (cursor);

  console.log(`Found ${allResults.length} pages in Notion articles DB. Updating Status to 'Published'...`);

  let updated = 0;
  for (const page of allResults) {
    const currentStatus = page.properties['Status']?.status?.name;
    if (currentStatus !== 'Published') {
      await notion.pages.update({
        page_id: page.id,
        properties: {
          Status: {
            status: { name: 'Published' }
          }
        }
      });
      updated++;
      if (updated % 10 === 0) {
        console.log(`Updated ${updated}/${allResults.length} pages...`);
      }
    }
  }

  console.log(`Finished updating ${updated} pages to Status: Published.`);
}

run().catch(console.error);
