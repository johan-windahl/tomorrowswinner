import { POST } from '@/app/api/cron/stocks/route';

describe('api/cron/stocks', () => {
    it('responds 403 without secret', async () => {
        const req = new Request('http://localhost/api/cron/stocks', { method: 'POST' });
        const res = await POST(req);
        expect(res.status).toBe(403);
    });
});


