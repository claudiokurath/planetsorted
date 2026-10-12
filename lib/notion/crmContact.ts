export interface CrmContact {
  userId: string
  firstName: string
  email: string | null
  whatsappNumber: string | null
  signedUp: string
  confirmed: boolean
  whatsappVerified: boolean
  optedOut: boolean
  source: 'Website' | 'Phone'
}

export function toCrmContact(user: {
  id: string; email?: string; created_at: string; email_confirmed_at?: string;
  app_metadata?: Record<string, unknown>; user_metadata?: Record<string, unknown>
}, profile?: {
  first_name?: string | null; whatsapp_number?: string | null;
  whatsapp_verified?: boolean; whatsapp_opted_out?: boolean
} | null): CrmContact {
  const synthetic = Boolean(user.email?.endsWith('@users.planetsorted.com'))
  const rawPhone = profile?.whatsapp_number || user.app_metadata?.pending_whatsapp_number
  const phone = typeof rawPhone === 'string' ? rawPhone.replace(/\D/g, '') : ''
  return {
    userId: user.id,
    firstName: String(profile?.first_name || user.user_metadata?.first_name || user.user_metadata?.full_name || ''),
    email: synthetic ? null : user.email || null,
    whatsappNumber: /^\d{10,15}$/.test(phone) ? `+${phone}` : null,
    signedUp: new Date(user.created_at).toISOString(),
    confirmed: Boolean(user.email_confirmed_at),
    whatsappVerified: Boolean(profile?.whatsapp_verified),
    optedOut: Boolean(profile?.whatsapp_opted_out),
    source: synthetic ? 'Phone' : 'Website',
  }
}

export function newCrmStatus(contact: CrmContact): string {
  return contact.optedOut ? 'Unsubscribed' : contact.confirmed ? 'Active' : 'Pending'
}
