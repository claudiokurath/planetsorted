-- Add webhook sync status tracking columns to protocols table
-- Enables observability and deletion detection

ALTER TABLE protocols 
ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'synced' 
  CHECK (sync_status IN ('synced', 'pending', 'failed', 'archived'));

ALTER TABLE protocols 
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE protocols 
ADD COLUMN IF NOT EXISTS sync_error TEXT DEFAULT NULL;

-- Store Notion page ID for accurate deletion detection
ALTER TABLE protocols 
ADD COLUMN IF NOT EXISTS notion_page_id TEXT UNIQUE DEFAULT NULL;

-- Index for query performance
CREATE INDEX IF NOT EXISTS idx_protocols_sync_status ON protocols(sync_status);
CREATE INDEX IF NOT EXISTS idx_protocols_last_synced_at ON protocols(last_synced_at DESC);
CREATE INDEX IF NOT EXISTS idx_protocols_notion_page_id ON protocols(notion_page_id);

-- Audit: Log all sync operations
CREATE TABLE IF NOT EXISTS notion_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  database_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'success', 'failed', 'skipped')),
  error_message TEXT DEFAULT NULL,
  attempt INT DEFAULT 1,
  source_type TEXT NOT NULL CHECK (source_type IN ('Article', 'Tool')),
  slug TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for querying webhook events
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON notion_webhook_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON notion_webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_slug ON notion_webhook_events(slug);
