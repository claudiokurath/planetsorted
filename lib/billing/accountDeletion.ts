import type Stripe from 'stripe'
import type { Entitlement } from '@/lib/types/database'

type BillingReference = Pick<
  Entitlement,
  'status' | 'stripe_customer_id' | 'stripe_subscription_id'
>
type SubscriptionState = Pick<Stripe.Subscription, 'id' | 'customer' | 'status'>
type SubscriptionClient = {
  subscriptions: {
    retrieve(id: string): Promise<SubscriptionState>
    cancel(id: string, params: Stripe.SubscriptionCancelParams): Promise<SubscriptionState>
  }
}

export class AccountDeletionBillingError extends Error {
  constructor() {
    super('We could not confirm that your subscription has ended. Your account has not been deleted. Please try again or contact hello@planetsorted.com.')
  }
}

function hasEnded(subscription: SubscriptionState): boolean {
  return subscription.status === 'canceled' || subscription.status === 'incomplete_expired'
}

function belongsToReference(subscription: SubscriptionState, reference: BillingReference): boolean {
  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer?.id
  return subscription.id === reference.stripe_subscription_id &&
    customerId === reference.stripe_customer_id
}

/** Called only by an authenticated, explicitly requested account deletion. */
export async function cancelAccountSubscriptions(
  client: SubscriptionClient,
  references: BillingReference[]
): Promise<void> {
  // Do not trust local terminal status when a billing link is incomplete.
  // Retain the record so support can resolve it before anything is erased.
  const customers = new Map<string, string>()
  for (const reference of references) {
    const subscriptionId = reference.stripe_subscription_id
    if (!subscriptionId) {
      throw new AccountDeletionBillingError()
    }
    const customerId = reference.stripe_customer_id
    if (!customerId || (customers.has(subscriptionId) && customers.get(subscriptionId) !== customerId)) {
      throw new AccountDeletionBillingError()
    }
    customers.set(subscriptionId, customerId)
  }

  const checked = new Set<string>()
  for (const reference of references) {
    const subscriptionId = reference.stripe_subscription_id
    if (!subscriptionId || checked.has(subscriptionId)) continue

    try {
      // Local webhook state can be stale. Always verify the linked subscription,
      // including rows locally marked canceled and subscriptions ending later.
      const subscription = await client.subscriptions.retrieve(subscriptionId)
      if (!belongsToReference(subscription, reference)) throw new AccountDeletionBillingError()

      if (!hasEnded(subscription)) {
        try {
          const canceled = await client.subscriptions.cancel(subscriptionId, {
            invoice_now: false,
            prorate: false,
          })
          if (!belongsToReference(canceled, reference) || canceled.status !== 'canceled') {
            throw new AccountDeletionBillingError()
          }
        } catch {
          // Another deletion or a response lost after cancellation may have
          // already succeeded. A fresh terminal state makes retries harmless.
          const latest = await client.subscriptions.retrieve(subscriptionId)
          if (!belongsToReference(latest, reference) || !hasEnded(latest)) {
            throw new AccountDeletionBillingError()
          }
        }
      }
      checked.add(subscriptionId)
    } catch {
      throw new AccountDeletionBillingError()
    }
  }
}
