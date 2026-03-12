import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
// import { Client } from '@notionhq/client';

const stripe = new Stripe((process.env.STRIPE_RESTRICTED_KEY || process.env.STRIPE_SECRET_KEY) as string, {
    apiVersion: '2025-02-24.acacia', // Update to recent version
});

// If Notion mirror is needed in future
// const notion = new Client({ auth: process.env.NOTION_SECRET });

export async function POST(req: Request) {
    const payload = await req.text();
    const signature = req.headers.get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            payload,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET as string
        );
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: err.message }, { status: 400 });
    }

    try {
        if (event.type === 'checkout.session.completed' || event.type === 'invoice.paid') {
            const session = event.data.object as Stripe.Checkout.Session | Stripe.Invoice;

            // Attempt to extract identifying information
            const metadata = (session.metadata as Record<string, string>) || {};
            const deltaCredits = Number(metadata.granted_credits);

            if (isNaN(deltaCredits) || deltaCredits <= 0) {
                throw new Error('missing or strictly positive metadata.granted_credits');
            }

            const customerPhone = (session as Stripe.Checkout.Session).customer_details?.phone;
            const customerEmail =
                (session as Stripe.Checkout.Session).customer_details?.email ||
                (session as Stripe.Invoice).customer_email;

            // 1) Find the user in Supabase by phone OR email
            let userQuery = supabaseAdmin.from('users').select('id, email, whatsapp_e164');
            
            if (customerPhone) {
                // Preformat for our DB
                const digitsOnly = customerPhone.replace(/\D/g, '');
                const formattedPhone = `+${digitsOnly}`;
                userQuery = userQuery.eq('whatsapp_e164', formattedPhone);
            } else if (customerEmail) {
                userQuery = userQuery.eq('email', customerEmail);
            } else {
                throw new Error('No email or phone attached to Stripe event.');
            }

            const { data: users, error: userErr } = await userQuery;

            if (userErr || !users || users.length === 0) {
                console.warn(`Webhook: User not found for phone (${customerPhone}) or email (${customerEmail}).`);
                return NextResponse.json({ received: true, note: 'User not found in Supabase' }, { status: 200 });
            }

            const userId = users[0].id;

            // 2) Insert row to credits_ledger
            const { error: ledgerErr } = await supabaseAdmin
                .from('credits_ledger')
                .insert({
                    user_id: userId,
                    delta: deltaCredits,
                    reason: 'stripe_payment',
                    source: event.type,
                    stripe_event_id: event.id
                });

            if (ledgerErr) {
                // Handle idempotency nicely: if unique constraint on stripe_event_id is violated, it's safe to ignore
                if (ledgerErr.code === '23505') {
                    console.warn(`Credits already applied for event ${event.id}`);
                    return NextResponse.json({ received: true, note: 'Already processed' }, { status: 200 });
                }
                
                console.error('Supabase credits_ledger insert failed:', ledgerErr);
                throw ledgerErr;
            }

            console.log(`Successfully granted ${deltaCredits} credits to user ${userId}`);
        }

        return NextResponse.json({ received: true }, { status: 200 });

    } catch (err: any) {
        console.error('Webhook processing failed:', err);
        return NextResponse.json({ error: 'Webhook handler failed.' }, { status: 500 });
    }
}
