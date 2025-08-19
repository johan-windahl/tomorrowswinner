import { NextRequest } from 'next/server';
import { CompetitionClosingHandler } from '@/lib/api/competition-handler';

/**
 * Closes voting for stocks competitions
 * POST /api/competition/stocks/close
 */
export async function POST(req: Request | NextRequest) {
    const handler = new CompetitionClosingHandler('finance');
    return handler.closeCompetitions(req);
}

export async function GET() {
    const handler = new CompetitionClosingHandler('finance');
    return handler.handleGet();
}
