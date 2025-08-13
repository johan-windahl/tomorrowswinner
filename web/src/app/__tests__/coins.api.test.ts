import { POST } from '@/app/api/cron/coins/route';

describe('api/cron/coins', () => {
    it('responds 403 without secret', async () => {
        const req = new Request('http://localhost/api/cron/coins', { method: 'POST' });
        const res = await POST(req);
        expect(res.status).toBe(403);
    });
});


