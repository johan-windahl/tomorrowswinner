import { POST } from '@/app/api/cron/score/route';

describe('api/cron/score', () => {
    it('responds 403 without secret', async () => {
        const req = new Request('http://localhost/api/cron/score', { method: 'POST' });
        const res = await POST(req);
        expect(res.status).toBe(403);
    });
});


