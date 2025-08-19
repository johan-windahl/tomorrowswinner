import { NextRequest } from 'next/server';
import { CompetitionClosingHandler } from '@/lib/api/competition-handler';

/**
 * Closes voting for crypto competitions
 * POST /api/competition/crypto/close
 */
export async function POST(req: Request | NextRequest) {
    const handler = new CompetitionClosingHandler('crypto');
    return handler.closeCompetitions(req);
}

export async function GET() {
    const handler = new CompetitionClosingHandler('crypto');
    return handler.handleGet();
}
