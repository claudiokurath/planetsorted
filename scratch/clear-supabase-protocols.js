const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  console.log('Checking published protocols in Supabase...');
  const { data: published, error: fetchError } = await supabase
    .from('protocols')
    .select('slug, title, status')
    .eq('status', 'Published');

  if (fetchError) {
    console.error('Error fetching protocols:', fetchError.message);
    return;
  }

  console.log(`Found ${published.length} published articles in Supabase.`);
  if (published.length === 0) {
    console.log('No published articles found. Nothing to update.');
    return;
  }

  console.log('Updating status to Draft to match Notion...');
  const { data: updated, error: updateError } = await supabase
    .from('protocols')
    .update({ status: 'Draft', updated_at: new Date().toISOString() })
    .eq('status', 'Published')
    .select('slug');

  if (updateError) {
    console.error('Error updating protocols:', updateError.message);
    return;
  }

  console.log(`Successfully updated ${updated.length} articles to Draft status in Supabase.`);
}

run().catch(console.error);
