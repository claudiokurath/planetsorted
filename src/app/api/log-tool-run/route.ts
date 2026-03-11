import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { whatsapp_e164, keyword, input_text, output_text, success = true, latency_ms } = body;

        if (!whatsapp_e164 || !keyword) {
            return NextResponse.json({ error: 'Missing whatsapp_e164 or keyword' }, { status: 400 });
        }

        // 1) Upsert user
        const { data: user, error: userErr } = await supabaseAdmin
            .from('users')
            .upsert({ whatsapp_e164 }, { onConflict: 'whatsapp_e164' })
            .select('id')
            .single();

        if (userErr) {
            return NextResponse.json({ error: userErr.message }, { status: 500 });
        }

        // 2) Create request
        const { data: reqRow, error: reqErr } = await supabaseAdmin
            .from('tool_requests')
            .insert({
                user_id: user.id,
                keyword,
                input_text,
                channel: 'whatsapp',
                status: 'received'
            })
            .select('id')
            .single();

        if (reqErr) {
            return NextResponse.json({ error: reqErr.message }, { status: 500 });
        }

        // 3) Create run
        const { error: runErr } = await supabaseAdmin
            .from('tool_runs')
            .insert({
                tool_request_id: reqRow.id,
                output_text,
                success,
                latency_ms
            });

        if (runErr) {
            return NextResponse.json({ error: runErr.message }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Unknown error occurred' }, { status: 500 });
    }
}
