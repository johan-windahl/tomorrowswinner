import { NextRequest } from 'next/server';
import { CryptoCompetitionCreationHandler } from '@/lib/api/competition-handler';

/**
 * Creates a new crypto competition and fetches required data
 * POST /api/competition/crypto/new
 */
export async function POST(req: Request | NextRequest) {
    const handler = new CryptoCompetitionCreationHandler();
    return handler.createCompetition(req);
}

export async function GET() {
    const handler = new CryptoCompetitionCreationHandler();
    return handler.handleGet();
}
