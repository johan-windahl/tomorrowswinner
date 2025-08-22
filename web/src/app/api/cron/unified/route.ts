import { NextRequest } from 'next/server';
import { UnifiedCronHandler } from '@/lib/api/unified-cron-handler';

/**
 * Unified cron endpoint that handles all competition lifecycle operations
 * Runs every 10 minutes and determines which actions to perform based on time
 * POST /api/cron/unified
 */
export async function POST(req: Request | NextRequest) {
    console.log('POST /api/cron/unified');
    const handler = new UnifiedCronHandler();
    return handler.execute(req);
}

export async function GET() {
    return new Response('Use POST with x-cron-secret header', { status: 405 });
}
