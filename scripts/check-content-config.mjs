// Read-only content preflight. Only statuses and database/source IDs are logged;
// credentials, page bodies and customer data never enter build output.
const auth = process.env.NOTION_SECRET
if (!auth) {
  console.log('[Content configuration] No Notion credential in this environment; check skipped.')
} else {
  async function probe(path, version, body) {
    try {
      const response = await fetch(`https://api.notion.com/v1/${path}`, {
        method: body ? 'POST' : 'GET',
        headers: { Authorization: `Bearer ${auth}`, 'Notion-Version': version, 'Content-Type': 'application/json' },
        ...(body ? { body: JSON.stringify(body) } : {}),
        signal: AbortSignal.timeout(12000),
      })
      const data = await response.json()
      return { status: response.status, code: data.code, data }
    } catch { return { status: 0, code: 'request_failed' } }
  }
  for (const [name, id] of [['Blog', process.env.NOTION_BLOG_DB_ID || process.env.NOTION_ARTICLES_DB_ID], ['Tools', process.env.NOTION_TOOLS_DB_ID]]) {
    if (!id) { console.warn(`[Content configuration] ${name}: database ID is missing.`); continue }
    const legacy = await probe(`databases/${encodeURIComponent(id)}/query`, '2022-06-28', { page_size: 1, filter: { property: 'Status', status: { equals: 'Published' } } })
    console.log('[Content configuration]', JSON.stringify({ source: name, legacyQueryStatus: legacy.status, code: legacy.code }))
    const modern = await probe(`databases/${encodeURIComponent(id)}`, '2025-09-03')
    const sources = modern.data?.data_sources?.map(({ id, name }) => ({ id, name }))
    console.log('[Content configuration]', JSON.stringify({ source: name, modernDatabaseStatus: modern.status, code: modern.code, dataSources: sources }))
  }
}
