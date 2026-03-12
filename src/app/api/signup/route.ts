import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Initialize Notion Client (if you have the Secret)
const notion = new Client({ auth: process.env.NOTION_SECRET || 'placeholder_secret' });

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // Extract whatever fields your frontend or webhook sends here
        const { customerName, email, phoneNumber, creditsBalance } = body;

        if (!phoneNumber || !customerName) {
            return NextResponse.json({ error: 'Missing phoneNumber or customerName in body' }, { status: 400 });
        }

        // Rigidly format to E.164: remove all non-digits entirely, then ensure it starts with +
        const digitsOnly = phoneNumber.replace(/\D/g, '');
        if (digitsOnly.length < 10) {
            return NextResponse.json({ error: 'Phone number is too short for E.164 format' }, { status: 400 });
        }
        const whatsapp_e164 = `+${digitsOnly}`;

        // ==========================================
        // 1) CREATE NOTION CRM RECORD
        // ==========================================
        let notionRecordId = null;
        const crmDbId = process.env.NOTION_CRM_DB_ID;
        if (crmDbId) {
            // We use the Notion JS client to match proper field types
            const notionProperties: Record<string, any> = {
                'Customer Name': {
                    title: [
                        {
                            text: { content: customerName },
                        },
                    ],
                },
                'Phone Number': {
                    phone_number: whatsapp_e164,
                },
                'Status': {
                    select: { name: 'Trial' },
                },
                'Credits Balance': {
                    number: Number(creditsBalance) || 0,
                },
            };

            if (email) {
                notionProperties['Email'] = { email: email };
            }

            try {
                const response = await notion.pages.create({
                    parent: { database_id: crmDbId },
                    properties: notionProperties,
                });
                notionRecordId = response.id;
            } catch (notionErr) {
                console.error('Notion CRM record creation failed:', notionErr);
            }
        } else {
            console.warn('NOTION_CRM_DB_ID environment variable not set, skipping Notion CRM creation.');
        }

        // ==========================================
        // 2) UPSERT TO SUPABASE (User's provided code)
        // ==========================================

        // 1) Upsert user in Supabase
        const { data: userRow, error: userErr } = await supabaseAdmin
            .from('users')
            .upsert(
                {
                    whatsapp_e164,
                    email: email || null,
                    status: 'Trial',
                },
                { onConflict: 'whatsapp_e164' }
            )
            .select('id')
            .single()

        if (userErr) {
            console.error('Supabase user upsert failed:', userErr)
        } else {
            // 2) If credits > 0, insert ledger entry
            const initialCredits = Number(creditsBalance ?? 0)
            if (initialCredits > 0) {
                const { error: ledgerErr } = await supabaseAdmin
                    .from('credits_ledger')
                    .insert({
                        user_id: userRow.id,
                        delta: initialCredits,
                        reason: 'signup_free_credits',
                        source: 'website_signup',
                        // stripe_event_id conceptually null or not required for simple signup
                    })

                if (ledgerErr) console.error('Supabase credits_ledger insert failed:', ledgerErr)
            }
        }

        return NextResponse.json({
            success: true,
            message: 'User created in Notion CRM and Supabase',
            notionRecordId,
            supabaseUserId: userRow?.id
        }, { status: 200 });

    } catch (error: any) {
        console.error('Signup Route Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
