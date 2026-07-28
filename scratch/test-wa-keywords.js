const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const TEST_KEYWORDS = [
  'TAX',
  'AUTOPILOT',
  'CLARITY',
  'DOPAMINE',
  'TRIAGE',
  'RSD',
  'SENSORY',
  'BURNOUT'
];

async function runTests() {
  console.log('--- Testing WhatsApp Keyword -> Supabase Protocol Matching ---');
  let passed = 0;
  for (const kw of TEST_KEYWORDS) {
    const { data: item, error } = await supabase
      .from('protocols')
      .select('slug, title, type, status')
      .eq('status', 'Published')
      .or(`keyword.ilike.${kw},slug.ilike.${kw.toLowerCase()}`)
      .maybeSingle();

    if (error) {
      console.error(`[FAIL] Keyword "${kw}": Database error -`, error.message);
    } else if (!item) {
      console.error(`[FAIL] Keyword "${kw}": No matching published protocol found in database!`);
    } else {
      console.log(`[PASS] Keyword "${kw.padEnd(10)}" -> Matched [${item.type}] "${item.title}" (${item.slug})`);
      passed++;
    }
  }
  console.log(`\nResults: ${passed}/${TEST_KEYWORDS.length} keywords matched successfully in Supabase!`);
}

runTests().catch(console.error);
