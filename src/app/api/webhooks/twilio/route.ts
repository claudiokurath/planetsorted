import { NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

// Initialize Notion Client
const notion = new Client({ auth: process.env.NOTION_SECRET || process.env.NOTION_API_KEY || '' });

export async function POST(request: Request) {
    try {
        // Twilio sends data as application/x-www-form-urlencoded
        const formData = await request.formData();
        const from = formData.get('From') as string || ''; // e.g. "whatsapp:+447360277713"
        const messageBody = formData.get('Body') as string || '';
        
        const trigger = messageBody.trim().toUpperCase();
        const senderNumber = from.replace('whatsapp:', ''); // Normalize to +44... for Notion lookups
        
        console.log(`[TWILIO WEBHOOK] Received message from ${senderNumber}: ${trigger}`);

        // Define Twilio sender function
        const sendTwilioMessage = async (to: string, text: string) => {
            const accountSid = process.env.TWILIO_ACCOUNT_SID;
            const authToken = process.env.TWILIO_AUTH_TOKEN;
            const fromNumber = process.env.TWILIO_PHONE_NUMBER || 'whatsapp:+447360277713'; // fallback to user's registered number

            if (!accountSid || !authToken) {
                console.error('[TWILIO WEBHOOK] Missing Twilio credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)');
                return;
            }

            const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
            const encodedData = new URLSearchParams();
            encodedData.append('To', to);
            encodedData.append('From', fromNumber);
            encodedData.append('Body', text);

            try {
                const res = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: encodedData
                });
                
                if (!res.ok) {
                    const errText = await res.text();
                    console.error('[TWILIO WEBHOOK] Failed to send message:', errText);
                } else {
                    console.log(`[TWILIO WEBHOOK] Successfully replied to ${to}`);
                }
            } catch (err) {
                console.error('[TWILIO WEBHOOK] Twilio API call error:', err);
            }
        };

        // If no Notion setup, we can't process further
        if (!process.env.NOTION_SECRET && !process.env.NOTION_API_KEY) {
            console.warn('[TWILIO WEBHOOK] No Notion credentials configured, skipping DB checks');
            return new NextResponse(`<Response></Response>`, { status: 200, headers: { 'Content-Type': 'text/xml' } });
        }

        // Helper to format Notion text for WhatsApp (strips IFrames and extracts their URLs so it's clickable)
        const formatTemplateForWhatsApp = (rawText: string) => {
            // Notion plain_text might include the raw HTML of the iframe. 
            // We want to replace it with just the click-able URL link.
            const iframeRegex = /<iframe[^>]*src=["']([^"']+)["'][^>]*>.*?<\/iframe>/gi;
            return rawText.replace(iframeRegex, (match, srcUrl) => {
                return `Here is your tool link:\n${srcUrl}`;
            }).trim();
        };

        // 1) Verify User Signup in CRM
        const crmDbId = process.env.NOTION_CRM_DB_ID || '2e90d6014acc80c0b603ffa9e74f7f7d';
        const userQuery = await notion.databases.query({
            database_id: crmDbId,
            filter: {
                property: 'Phone Number',
                phone_number: { equals: senderNumber }
            }
        });

        if (userQuery.results.length === 0) {
            console.log(`[TWILIO WEBHOOK] User ${senderNumber} not found in CRM. Rejected.`);
            await sendTwilioMessage(from, "Please sign up first to access the SOR7ED network. Visit https://sor7ed.com/signup to initiate connection.");
            return new NextResponse(`<Response></Response>`, { status: 200, headers: { 'Content-Type': 'text/xml' } });
        }

        // 2) Check for matching Tool Protocol
        const toolsDbId = process.env.NOTION_TOOLS_DB_ID || '08ac767d313845ca91886ce45c379b99';
        const toolQuery = await notion.databases.query({
            database_id: toolsDbId.replace(/-/g, ''), // safe format
            filter: {
                property: 'WhatsApp Trigger',
                rich_text: { equals: trigger }
            }
        });

        if (toolQuery.results.length > 0) {
            const toolPage = toolQuery.results[0] as any;
            let templateText = toolPage.properties?.Template?.rich_text?.map((t: any) => t.plain_text).join('') || 'Tool details omitted. Access error.';
            templateText = formatTemplateForWhatsApp(templateText);
            await sendTwilioMessage(from, templateText);
            return new NextResponse(`<Response></Response>`, { status: 200, headers: { 'Content-Type': 'text/xml' } });
        }

        // 3) Check for matching Blog / Transmission
        const blogDbId = process.env.NOTION_ARTICLES_DB_ID || 'db668e4687ed455498357b8d11d2c714';
        const blogQuery = await notion.databases.query({
            database_id: blogDbId.replace(/-/g, ''), // safe format
            filter: {
                property: 'WhatsApp Trigger',
                rich_text: { equals: trigger }
            }
        });

        if (blogQuery.results.length > 0) {
            const blogPage = blogQuery.results[0] as any;
            let templateText = blogPage.properties?.Template?.rich_text?.map((t: any) => t.plain_text).join('') || 'Transmission extracted.';
            templateText = formatTemplateForWhatsApp(templateText);
            const slug = blogPage.properties?.Slug?.rich_text?.map((t: any) => t.plain_text).join('') || '';
            const message = `${templateText}\n\nFull transmission: https://sor7ed.com/blog/${slug}`;
            
            await sendTwilioMessage(from, message);
            return new NextResponse(`<Response></Response>`, { status: 200, headers: { 'Content-Type': 'text/xml' } });
        }

        // 4) Unknown Keyword Fallback
        await sendTwilioMessage(from, `SOR7ED System: "${trigger}" unknown. Valid protocols include INITIALIZE, MELTDOWN, AUDIT.\n\nReply MENU for directory.`);
        
        // Twilio requires us to return a 200 OK empty TwiML or valid response to close the loop
        return new NextResponse(`<Response></Response>`, {
            status: 200,
            headers: { 'Content-Type': 'text/xml' }
        });

    } catch (error: any) {
        console.error('[TWILIO WEBHOOK] Execution Error:', error);
        return new NextResponse(`<Response></Response>`, { status: 500, headers: { 'Content-Type': 'text/xml' } });
    }
}
