const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_SECRET });
const DB_ID = process.env.NOTION_ARTICLES_DB_ID;

const REMAINING_TOOLS = [
  {
    slug: 'financial-autopilot',
    title: 'Financial Autopilot',
    category: 'Wealth',
    keyword: 'AUTOPILOT',
    time: '5 min setup',
    summary: 'Set up your finances to run on autopilot in 15 minutes.',
    excerpt: 'Build a friction-free bill and savings automation system in 5 minutes.',
  },
  {
    slug: 'decision-paralysis-solver',
    title: 'Decision Paralysis Solver',
    category: 'Mind',
    keyword: 'CLARITY',
    time: '2 min run',
    summary: 'Get unstuck in 5 minutes: decision + guardrails + next step.',
    excerpt: 'Get unstuck on a heavy decision in under 5 minutes.',
  },
  {
    slug: 'dopamine-menu-generator',
    title: 'Dopamine Menu Generator',
    category: 'Mind',
    keyword: 'DOPAMINE',
    time: '4 min builder',
    summary: 'Customized brain reset menu (starters, mains, sides, desserts).',
    excerpt: 'Build a custom dopamine menu to stimulate your brain without digital drain.',
  },
  {
    slug: 'task-triage',
    title: 'Task Triage & Matrix',
    category: 'Growth',
    keyword: 'TRIAGE',
    time: '3 min run',
    summary: 'Convert chaotic task dumps into single next-step priorities.',
    excerpt: 'Convert a chaotic task dump into a single prioritized next action.',
  },
  {
    slug: 'rsd-response-scripts',
    title: 'RSD Response Scripts',
    category: 'Connection',
    keyword: 'RSD',
    time: 'Instant',
    summary: 'Instant boundary templates for sensitive situations.',
    excerpt: 'Copy-paste response scripts for dealing with Rejection Sensitive Dysphoria.',
  },
  {
    slug: 'sensory-audit',
    title: 'Sensory Audit & Reset',
    category: 'Body',
    keyword: 'SENSORY',
    time: '4 min audit',
    summary: 'Identify environmental noise, light, and sensory drains.',
    excerpt: 'Audit your environment for hidden sensory drains and reset your nervous system.',
  },
  {
    slug: 'burnout-assessment',
    title: 'Burnout Assessment & Recovery',
    category: 'Mind',
    keyword: 'BURNOUT',
    time: '5 min protocol',
    summary: 'Evaluate burnout stage & get non-shame restoration steps.',
    excerpt: 'Assess your neurodivergent burnout level and get tailored recovery steps.',
  }
];

async function run() {
  console.log('--- Checking for existing pages in Notion ---');
  let cursor = undefined;
  let allPages = [];
  do {
    const res = await notion.databases.query({
      database_id: DB_ID,
      start_cursor: cursor,
    });
    allPages = allPages.concat(res.results);
    cursor = res.next_cursor;
  } while (cursor);

  for (const tool of REMAINING_TOOLS) {
    const existing = allPages.find(p => (p.properties['Slug']?.rich_text?.[0]?.plain_text ?? '') === tool.slug);
    
    const pageProperties = {
      'Title': { title: [{ text: { content: tool.title } }] },
      'Slug': { rich_text: [{ text: { content: tool.slug } }] },
      'Type': { select: { name: 'Tool' } },
      'Status': { status: { name: 'Published' } },
      'WhatsApp Trigger': { rich_text: [{ text: { content: tool.keyword } }] },
      'Read Time': { rich_text: [{ text: { content: tool.time } }] },
      'Summary': { rich_text: [{ text: { content: tool.summary } }] },
      'Excerpt': { rich_text: [{ text: { content: tool.excerpt } }] },
      'Category': { select: { name: tool.category } }
    };

    if (existing) {
      console.log(`[UPDATE] Existing page found for ${tool.slug}. Updating...`);
      await notion.pages.update({
        page_id: existing.id,
        properties: pageProperties
      });
      console.log(`Successfully updated ${tool.slug} in Notion.`);
    } else {
      console.log(`[CREATE] Creating new page for ${tool.slug}...`);
      await notion.pages.create({
        parent: { database_id: DB_ID },
        properties: pageProperties
      });
      console.log(`Successfully created ${tool.slug} in Notion.`);
    }
  }
}

run().catch(err => {
  console.error('Error in Notion Step 2 setup:', err.body || err.message || err);
});
