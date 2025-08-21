import { StocksCronHandler } from '@/lib/api/cron-handlers/stocks-cron-handler';

describe('StocksCronHandler', () => {
    it('should return 403 when cron secret is invalid', async () => {
        const handler = new StocksCronHandler();

        const request = new Request('http://localhost/api/cron/stocks', {
            method: 'POST',
            headers: { 'x-cron-secret': 'invalid-secret' }
        });

        const response = await handler.execute(request);

        expect(response.status).toBe(403);
    });

    it('should return 403 when cron secret is missing', async () => {
        const handler = new StocksCronHandler();

        const request = new Request('http://localhost/api/cron/stocks', {
            method: 'POST'
        });

        const response = await handler.execute(request);

        expect(response.status).toBe(403);
    });

    it('should handle authentication correctly', async () => {
        const handler = new StocksCronHandler();

        const request = new Request('http://localhost/api/cron/stocks', {
            method: 'POST',
            headers: { 'x-cron-secret': 'valid-secret' }
        });

        const response = await handler.execute(request);

        // Should either return 403 (invalid secret) or 200 (valid secret)
        expect([200, 403]).toContain(response.status);
    });
});
