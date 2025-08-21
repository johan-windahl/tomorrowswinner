import { POST, GET } from '@/app/api/cron/unified/route';

describe('/api/cron/unified', () => {
    it('should return 405 for GET requests', async () => {
        const response = await GET();

        expect(response.status).toBe(405);
        expect(await response.text()).toBe('Use POST with x-cron-secret header');
    });

    it('should return 403 when cron secret is missing', async () => {
        const request = new Request('http://localhost/api/cron/unified', {
            method: 'POST'
        });

        const response = await POST(request);

        expect(response.status).toBe(403);
    });

    it('should return 403 when cron secret is invalid', async () => {
        const request = new Request('http://localhost/api/cron/unified', {
            method: 'POST',
            headers: { 'x-cron-secret': 'invalid-secret' }
        });

        const response = await POST(request);

        expect(response.status).toBe(403);
    });
});
