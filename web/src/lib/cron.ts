export type CronAuth = {
    ok: boolean;
    provided: string;
    source: 'header' | 'query' | 'body' | 'none';
};

export function readCronSecret(req: Request): CronAuth {
    const raw = process.env.CRON_SECRET ?? '';
    const expected = raw.replace(/^['"]|['"]$/g, '');

    const headerVal = req.headers.get('x-cron-secret');
    const queryVal = new URL(req.url).searchParams.get('secret');
    // Ignore body in auth helper to avoid async and any-types; header/query suffices for our use.
    const provided = headerVal ?? queryVal ?? '';

    // Be tolerant in dev: if expected contains '#', allow prefix before '#'
    const expectedDev = expected.includes('#') ? expected.split('#')[0] : expected;
    const ok = !!expected && (provided === expected || provided === expectedDev);
    const source = headerVal ? 'header' : queryVal ? 'query' : 'none';
    return { ok, provided, source };
}

export function jsonError(status: number, message: string, context?: Record<string, unknown>): Response {
    const payload = { ok: false, error: message, ...(context ? { context } : {}) };
    console.error('cron error', status, message, context ?? {});
    return new Response(JSON.stringify(payload), {
        status,
        headers: { 'content-type': 'application/json' },
    });
}

export function jsonAuthError(auth: CronAuth): Response {
    const payload = {
        ok: false,
        error: 'forbidden',
        context: {
            provided: auth.provided ? '***' : 'none',
            source: auth.source
        }
    };
    console.error('cron auth error', 403, 'forbidden', {
        provided: auth.provided ? '***' : 'none',
        source: auth.source
    });
    return new Response(JSON.stringify(payload), {
        status: 403,
        headers: { 'content-type': 'application/json' },
    });
}

export function jsonOk(data?: Record<string, unknown>): Response {
    const payload = { ok: true, ...(data ?? {}) };
    return new Response(JSON.stringify(payload), {
        status: 200,
        headers: { 'content-type': 'application/json' },
    });
}

export function todayInETISODate(): string {
    const now = new Date();
    const fmt = new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
    const parts = fmt.formatToParts(now);
    const y = parts.find((p) => p.type === 'year')?.value ?? '1970';
    const m = parts.find((p) => p.type === 'month')?.value ?? '01';
    const d = parts.find((p) => p.type === 'day')?.value ?? '01';
    return `${y}-${m}-${d}`;
}


