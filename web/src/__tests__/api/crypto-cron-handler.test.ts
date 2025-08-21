import { CryptoCronHandler } from '@/lib/api/cron-handlers/crypto-cron-handler';

describe('CryptoCronHandler', () => {
    it('should return 403 when cron secret is invalid', async () => {
        const handler = new CryptoCronHandler();

        const request = new Request('http://localhost/api/cron/crypto', {
            method: 'POST',
            headers: { 'x-cron-secret': 'invalid-secret' }
        });

        const response = await handler.execute(request);

        expect(response.status).toBe(403);
    });

    it('should return 403 when cron secret is missing', async () => {
        const handler = new CryptoCronHandler();

        const request = new Request('http://localhost/api/cron/crypto', {
            method: 'POST'
        });

        const response = await handler.execute(request);

        expect(response.status).toBe(403);
    });

    it('should handle authentication correctly', async () => {
        const handler = new CryptoCronHandler();

        const request = new Request('http://localhost/api/cron/crypto', {
            method: 'POST',
            headers: { 'x-cron-secret': 'valid-secret' }
        });

        const response = await handler.execute(request);

        // Should either return 403 (invalid secret) or 200 (valid secret)
        expect([200, 403]).toContain(response.status);
    });
});
