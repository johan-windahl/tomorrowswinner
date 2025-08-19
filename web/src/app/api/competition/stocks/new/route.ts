import { NextRequest } from 'next/server';
import { StocksCompetitionCreationHandler } from '@/lib/api/competition-handler';

/**
 * Creates a new stocks competition and fetches required data
 * POST /api/competition/stocks/new
 */
export async function POST(req: Request | NextRequest) {
    const handler = new StocksCompetitionCreationHandler();
    return handler.createCompetition(req);
}

export async function GET() {
    const handler = new StocksCompetitionCreationHandler();
    return handler.handleGet();
}
