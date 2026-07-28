const { Client } = require('@notionhq/client');
const { createClient } = require('@supabase/supabase-js');

const notion = new Client({ auth: process.env.NOTION_SECRET });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function getText(prop) {
  if (!prop) return '';
  if (prop.type === 'title') return prop.title?.[0]?.plain_text ?? '';
  if (prop.type === 'rich_text') return prop.rich_text?.[0]?.plain_text ?? '';
  return '';
}

async function run() {
  console.log('--- 1. Querying Notion for Published Items ---');
  const response = await notion.databases.query({
    database_id: process.env.NOTION_ARTICLES_DB_ID,
    filter: { property: 'Status', status: { equals: 'Published' } },
  });
  console.log(`Found ${response.results.length} published items in Notion.`);

  for (const page of response.results) {
    const props = page.properties;
    const slug = getText(props['Slug']);
    const title = getText(props['Title']);
    const type = props['Type']?.select?.name ?? 'Article';
    const status = props['Status']?.status?.name ?? '';

    console.log(`Syncing item -> Slug: ${slug} | Title: ${title} | Type: ${type} | Status: ${status}`);

    const row = {
      slug,
      title,
      type,
      category: props['Category']?.select?.name ?? '',
      status,
      summary: getText(props['Summary']),
      excerpt: getText(props['Excerpt']),
      protocol: getText(props['Protocol']),
      keyword: getText(props['WhatsApp Trigger']),
      read_time: getText(props['Read Time']),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('protocols').upsert(row, { onConflict: 'slug' });
    if (error) {
      console.error(`Error upserting ${slug}:`, error.message);
    } else {
      console.log(`Successfully upserted ${slug} into Supabase!`);
    }
  }

  console.log('\n--- 2. Verifying in Supabase ---');
  const { data, error } = await supabase
    .from('protocols')
    .select('slug, title, type, status, category, keyword, read_time')
    .eq('slug', 'adhd-tax-calculator');

  if (error) {
    console.error('Error querying Supabase:', error.message);
  } else {
    console.log('Supabase row for adhd-tax-calculator:', JSON.stringify(data, null, 2));
  }
}

run().catch(console.error);
