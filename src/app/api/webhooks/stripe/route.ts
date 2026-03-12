import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
// import { Client } from '@notionhq/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
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
            const customerEmail =
                (session as Stripe.Checkout.Session).customer_details?.email ||
                (session as Stripe.Invoice).customer_email;
            const customerPhone = (session as Stripe.Checkout.Session).customer_details?.phone;

            // Determine credits granted (defaulting to 1 if not explicitly passed in metadata)
            // Pass { metadata: { granted_credits: '5' } } in Stripe product or checkout session
            const deltaCredits = Number(session.metadata?.granted_credits || 1);

            // 1) Find the user in Supabase by email or phone
            let userQuery = supabaseAdmin.from('users').select('id, email, whatsapp_e164');

            if (customerEmail) {
                userQuery = userQuery.eq('email', customerEmail);
            } else if (customerPhone) {
                userQuery = userQuery.eq('whatsapp_e164', customerPhone);
            } else {
                throw new Error('No email or phone attached to Stripe event.');
            }

            const { data: users, error: userErr } = await userQuery;

            if (userErr || !users || users.length === 0) {
                console.warn(`Webhook: User not found for email (${customerEmail}) / phone (${customerPhone}). Need manual reconciliation.`);
                return NextResponse.json({ received: true, note: 'User not found in Supabase' }, { status: 200 });
            }

            const userId = users[0].id;

            // 2) Insert row to credits_ledger
            const { error: ledgerErr } = await supabaseAdmin
                .from('credits_ledger')
                .insert({
                    user_id: userId,
                    delta: deltaCredits,
                    reason: event.type, // 'checkout.session.completed' or 'invoice.paid'
                    source: 'stripe_webhook',
                });

            if (ledgerErr) {
                console.error('Supabase credits_ledger insert failed:', ledgerErr);
                throw ledgerErr;
            }

            console.log(`Successfully granted ${deltaCredits} credits to user ${userId}`);

            // 3) OPTIONAL: Mirror to Notion if you want to keep Notion updated for manual viewing
            /*
            if (process.env.NOTION_CRM_DB_ID) {
               // Requires creating a separate script that searches the CRM by email/phone 
               // and updates the "Credits" property. 
            }
            */
        }

        return NextResponse.json({ received: true }, { status: 200 });

    } catch (err: any) {
        console.error('Webhook processing failed:', err);
        return NextResponse.json({ error: 'Webhook handler failed.' }, { status: 500 });
    }
}
