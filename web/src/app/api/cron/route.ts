/**
 * Simplified unified cron endpoint
 * POST /api/cron
 */

import { NextRequest } from 'next/server';
import { CronService } from '@/lib/services/cron-service';
import { jsonError, jsonOk, readCronSecret } from '@/lib/cron';

export async function POST(req: Request | NextRequest) {
    // Authentication
    const auth = readCronSecret(req);
    if (!auth.ok) {
        return jsonError(403, 'forbidden', auth);
    }

    try {
        const cronService = new CronService();
        const results = await cronService.executeScheduledActions(req);

        return jsonOk({
            timestamp: new Date().toISOString(),
            actionsExecuted: results.length,
            results
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'unknown error';
        return jsonError(500, 'cron execution failed', { message });
    }
}

export async function GET() {
    return new Response('Use POST with x-cron-secret header', { status: 405 });
}
