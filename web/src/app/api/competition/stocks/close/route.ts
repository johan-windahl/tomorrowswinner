import { NextRequest } from 'next/server';
import { jsonError, jsonOk, readCronSecret } from '@/lib/cron';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getCompetitionConfig } from '@/lib/competitions';

/**
 * Closes voting for stocks competitions
 * POST /api/competition/stocks/close
 */
export async function POST(req: Request | NextRequest) {
    const auth = readCronSecret(req);
    if (!auth.ok) return jsonError(403, 'forbidden', auth);
    if (!supabaseAdmin) return jsonError(500, 'admin not configured');

    const config = getCompetitionConfig('stocks');
    if (!config) return jsonError(500, 'stocks competition config not found');

    try {
        const now = new Date();

        // Find stocks competitions that should be closed (deadline has passed)
        const { data: competitions, error: compErr } = await supabaseAdmin
            .from('competitions')
            .select('id, slug, deadline_at, title')
            .eq('category', config.category)
            .lt('deadline_at', now.toISOString())
            .is('closed_at', null); // Not already closed

        if (compErr) return jsonError(500, 'failed to fetch competitions', { code: compErr.code, message: compErr.message });

        const closedCompetitions = [];

        for (const comp of competitions ?? []) {
            // Mark competition as closed
            const { error: updateErr } = await supabaseAdmin
                .from('competitions')
                .update({ closed_at: now.toISOString() })
                .eq('id', comp.id);

            if (updateErr) {
                console.error(`Failed to close competition ${comp.slug}:`, updateErr.message);
                continue;
            }

            // Get voting statistics
            const { data: stats } = await supabaseAdmin
                .from('guesses')
                .select('id')
                .eq('competition_id', comp.id);

            closedCompetitions.push({
                id: comp.id,
                slug: comp.slug,
                title: comp.title,
                deadline: comp.deadline_at,
                totalVotes: stats?.length ?? 0,
                closedAt: now.toISOString(),
            });
        }

        return jsonOk({
            closed: closedCompetitions.length,
            competitions: closedCompetitions,
            timestamp: now.toISOString(),
        });

    } catch (error) {
        const message = error instanceof Error ? error.message : 'unknown error';
        return jsonError(500, 'stocks competition close failed', { message });
    }
}

export async function GET() {
    return new Response('Use POST with x-cron-secret header', { status: 405 });
}
