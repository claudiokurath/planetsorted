import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Initialize Notion Client (if you have the Secret)
const notion = new Client({ auth: process.env.NOTION_SECRET || 'placeholder_secret' });

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // Extract whatever fields your frontend or webhook sends here
        const { phoneNumber, email, name, status, creditsBalance } = body;

        if (!phoneNumber) {
            return NextResponse.json({ error: 'Missing phoneNumber in body' }, { status: 400 });
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
        const crmDbId = process.env.NOTION_CRM_DB_ID || '29e2bff4d39e4bbe90ef0f72d310256b';
        if (crmDbId) {
            try {
                const response = await notion.pages.create({
                    parent: { database_id: crmDbId },
                    properties: {
                        'Customer Name': {
                            title: [
                                {
                                    text: {
                                        content: name || phoneNumber,
                                    },
                                },
                            ],
                        },
                        // Uncomment these if your Notion DB has identical properties:
                        // 'Email': { email: email || null },
                        // 'Status': { select: { name: status || 'Trial' } }
                    },
                });
                notionRecordId = response.id;
            } catch (notionErr) {
                console.error('Notion CRM record creation failed:', notionErr);
                // Optionally throw if Notion is critical to your flow
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
                    status: status || 'Trial',
                },
                { onConflict: 'whatsapp_e164' }
            )
            .select('id')
            .single()

        if (userErr) {
            console.error('Supabase user upsert failed:', userErr)
            // Don’t fail signup if logging fails (optional but recommended)
        } else {
            // 2) Optional: credits grant ledger entry (if you give free credits on signup)
            const initialCredits = Number(creditsBalance ?? 0)
            if (initialCredits > 0) {
                const { error: ledgerErr } = await supabaseAdmin
                    .from('credits_ledger')
                    .insert({
                        user_id: userRow.id,
                        delta: initialCredits,
                        reason: 'signup_free_credits',
                        source: 'website_signup',
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
