import { createServerClient } from '@/lib/supabase/server'
import { syncUserToCrm } from '@/lib/notion/syncUserToCrm'

export async function createWhatsAppUser(phone: string, firstName: string) {
  const supabase = createServerClient()
  const syntheticEmail = `${phone}@users.planetsorted.com`

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: syntheticEmail,
    email_confirm: true,
    user_metadata: { first_name: firstName },
  })
  if (authError || !authData.user) throw authError ?? new Error('WhatsApp user creation failed')

  // Note: the `on_user_created_grant_credits` DB trigger grants the 5 signup
  // credits automatically on insert below — do not also insert into credits_ledger here.
  const { error: userError } = await supabase.from('users').insert({
    user_id: authData.user.id,
    first_name: firstName,
    email: syntheticEmail,
    whatsapp_number: phone,
    whatsapp_verified: true,
    weekly_opted_in: false,
    whatsapp_opted_out: false,
  })
  if (userError) throw userError

  // Best-effort — a Notion hiccup should never block a WhatsApp signup.
  try {
    await syncUserToCrm({ firstName, email: syntheticEmail, whatsappNumber: phone, source: 'Phone' })
  } catch (err) {
    console.error('[Notion CRM sync error]', err)
  }

  return authData.user
}
