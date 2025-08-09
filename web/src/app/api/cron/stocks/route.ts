import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
    const secret = process.env.CRON_SECRET;
    const provided = req.headers.get('x-cron-secret');
    if (!secret || provided !== secret) return new Response('forbidden', { status: 403 });
    if (!supabaseAdmin) return new Response('admin not configured', { status: 500 });

    // TODO: Implement S&P 500 constituents and EOD from Stooq
    return Response.json({ ok: true, note: 'stocks cron stub' });
}


