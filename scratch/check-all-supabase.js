const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data, error } = await supabase.from('protocols').select('slug, title, status');
  if (error) {
    console.error('Error:', error.message);
    return;
  }
  console.log(`Total rows in protocols table: ${data.length}`);
  const statusCounts = {};
  for (const row of data) {
    statusCounts[row.status] = (statusCounts[row.status] || 0) + 1;
  }
  console.log('Status counts:', statusCounts);
}

run().catch(console.error);
