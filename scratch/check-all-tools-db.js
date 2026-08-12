const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase
    .from('protocols')
    .select('slug, title, type, status, category, keyword, read_time')
    .eq('type', 'Tool');
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log(`Found ${data.length} tools in Supabase:`);
    data.forEach(t => console.log(`- [${t.type}] ${t.slug.padEnd(28)} | ${t.title} (${t.keyword})`));
  }
}
run();
