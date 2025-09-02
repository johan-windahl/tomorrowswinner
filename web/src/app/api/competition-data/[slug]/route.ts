/**
 * Simplified competition data enrichment endpoint
 * GET /api/competition-data/[slug]
 */

import { CompetitionEnrichmentService } from '@/lib/services/competition-enrichment';
import { jsonError, jsonOk } from '@/lib/cron';

export async function GET(req: Request) {
    const { pathname } = new URL(req.url);
    const match = pathname.match(/\/api\/competition-data\/([^/]+)/);
    const slug = match?.[1];

    if (!slug) {
        return jsonError(400, 'invalid path, slug missing');
    }

    try {
        const service = new CompetitionEnrichmentService();
        const result = await service.enrichCompetition(slug);
        return jsonOk(result as unknown as Record<string, unknown>);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'unknown error';

        if (message.includes('not found')) {
            return jsonError(404, 'competition not found', { slug });
        }

        return jsonError(500, 'enrichment failed', { message });
    }
}
