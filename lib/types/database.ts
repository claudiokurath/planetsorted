// lib/types/database.ts
// TypeScript types for the five core Supabase tables.
// Source of truth: docs/planet-sorted-master.md § Database Schema
// NOTE: `category` is the correct column name on protocols — never `branch`.
//
// NOTE: these are declared with `type`, not `interface`. An `interface` does not
// structurally satisfy `Record<string, unknown>` in a conditional-type check, which is
// how @supabase/postgrest-js verifies each table against its `GenericSchema` constraint.
// Using `interface` here silently fails that check and collapses every query result
// (on every table, in every file) to `never` with no compiler error pointing at this file.

export type Protocol = {
  id: string                  // uuid PK
  slug: string                // unique, URL-safe
  title: string                // article title
  category: string            // one of: Mind, Wealth, Body, Tech, Connection, Impression, Growth
  status: string               // 'Published' | 'Draft'
  summary: string              // short summary
  excerpt: string              // article intro
  problem: string              // article body (markdown)
  cta: string                  // call to action copy
  protocol: string             // actual protocol (WhatsApp delivery)
  keyword: string              // WhatsApp trigger keyword
  cover_image: string | null   // URL — Storage or external
  gamma_url?: string | null    // Published Gamma presentation URL for Sorted-button delivery
  audio_url?: string | null    // NotebookLM Audio Deep Dive URL
  audio?: string | null        // Alternate audio URL key
  read_time: string            // e.g. '3 min'
  meta_description: string     // SEO meta description
  seo_title: string            // SEO page title override
  updated_at: string           // timestamptz, set on upsert
  type?: string                // 'Article' | 'Tool'
}

// Mirrors the LIVE `public.users` table, not the schema table in the master doc —
// the two have diverged. Verified against the production schema.
// Note: `id` is the PK; `user_id` is a nullable, NON-UNIQUE FK to auth.users, so it
// cannot be used as an upsert `onConflict` target.
export type User = {
  id: string                        // uuid PK, default gen_random_uuid()
  email: string | null              // unique
  whatsapp_number: string           // NOT NULL, unique — E.164 format
  created_at: string | null         // timestamptz, default now()
  first_name: string | null
  user_id: string | null            // uuid FK → auth.users (nullable, not unique)
  whatsapp_onboarded: boolean | null       // default false
  whatsapp_onboarded_at: string | null     // timestamptz
  wa_verify_code: string | null
  whatsapp_verified: boolean        // NOT NULL, default false
  whatsapp_opted_out: boolean       // NOT NULL, default false — STOP unsubscribe flag
  weekly_opted_in: boolean          // NOT NULL, default false
  weekly_opted_in_at: string | null
  last_weekly_sent_at: string | null
  last_inbound_at: string | null
}

// Mirrors the LIVE `public.saved_items` table. The master doc describes a richer
// shape (type/source_id/description/og_image_url/target_url) that does not exist
// in the database — see the audit notes before relying on those fields.
export type SavedItem = {
  id: string                        // uuid PK
  user_id: string | null            // uuid FK → auth.users
  phone: string | null
  url: string                       // NOT NULL — the saved target link
  title: string | null
  category: string | null           // default 'General'
  saved_at: string | null           // timestamptz, default now()
}

export type CreditsLedgerEntry = {
  id: string          // uuid PK
  created_at: string  // timestamptz
  user_id: string     // uuid FK
  delta: number        // positive = grant, negative = deduction
  reason: string        // e.g. 'signup', 'run_command'
  source: string        // e.g. 'signup', 'whatsapp'
}

export type Entitlement = {
  id: string                          // uuid PK
  user_id: string                     // uuid FK
  plan: string                        // active tier
  stripe_customer_id: string | null   // set on checkout.session.completed
  stripe_subscription_id: string | null
  status: string                      // Stripe subscription status
  current_period_end: string | null   // timestamptz
}

export type ToolRequest = {
  id: string
  created_at: string
  user_id: string
  keyword: string
  input_text: string | null
  channel: string
  status: string
}

export type ToolRun = {
  id: string
  created_at: string
  tool_request_id: string
  tool_slug: string
  model: string
  output_text: string
  success: boolean
  latency_ms: number | null
}

/** Durable Stripe webhook idempotency store. Service-role only. */
export type StripeEvent = {
  event_id: string
  event_type: string
  status: 'processing' | 'done' | 'failed'
  error_detail: string | null
  received_at: string
  processed_at: string | null
}

/** Partner-widget lead capture (v1). Service-role only. */
export type PartnerLead = {
  id: string
  created_at: string
  partner_slug: string
  phone: string
  tool_slug: string | null
  source_host: string | null
  source_path: string | null
  user_agent: string | null
  ip_hash: string | null
  status: 'new' | 'contacted' | 'converted' | 'spam'
}

/** Ephemeral WhatsApp-first signup state (phone → awaiting first name). */
export type WhatsAppPendingSignup = {
  id: string
  phone: string
  created_at?: string | null
}

// Supabase Database generic type — used to type createClient<Database>()
// Every table needs a `Relationships` array and the schema needs `Views`/`Functions`
// (even if empty) — @supabase/postgrest-js's GenericSchema constraint requires them,
// and without them the client fails to resolve Schema at all.
export type Database = {
  public: {
    Tables: {
      protocols: {
        Row: Protocol
        Insert: Omit<Protocol, 'id'> & { id?: string }
        Update: Partial<Protocol>
        Relationships: []
      }
      users: {
        // Every column except `whatsapp_number` is nullable or has a DB default.
        Row: User
        Insert: Partial<User> & { whatsapp_number: string }
        Update: Partial<User>
        Relationships: []
      }
      saved_items: {
        // Every column except `url` is nullable or has a DB default.
        Row: SavedItem
        Insert: Partial<SavedItem> & { url: string }
        Update: Partial<SavedItem>
        Relationships: []
      }
      credits_ledger: {
        Row: CreditsLedgerEntry
        Insert: Omit<CreditsLedgerEntry, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<CreditsLedgerEntry>
        Relationships: []
      }
      entitlements: {
        Row: Entitlement
        Insert: Omit<Entitlement, 'id'> & { id?: string }
        Update: Partial<Entitlement>
        Relationships: []
      }
      tool_requests: {
        Row: ToolRequest
        Insert: Omit<ToolRequest, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<ToolRequest>
        Relationships: []
      }
      tool_runs: {
        Row: ToolRun
        Insert: Omit<ToolRun, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<ToolRun>
        Relationships: []
      }
      stripe_events: {
        Row: StripeEvent
        Insert: Pick<StripeEvent, 'event_id' | 'event_type'> &
          Partial<Omit<StripeEvent, 'event_id' | 'event_type'>>
        Update: Partial<StripeEvent>
        Relationships: []
      }
      partner_leads: {
        Row: PartnerLead
        Insert: Pick<PartnerLead, 'partner_slug' | 'phone'> &
          Partial<Omit<PartnerLead, 'partner_slug' | 'phone' | 'id' | 'created_at'>> & {
            id?: string
            created_at?: string
          }
        Update: Partial<PartnerLead>
        Relationships: []
      }
      whatsapp_pending_signups: {
        Row: WhatsAppPendingSignup
        Insert: Pick<WhatsAppPendingSignup, 'phone'> &
          Partial<Omit<WhatsAppPendingSignup, 'phone'>>
        Update: Partial<WhatsAppPendingSignup>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}
