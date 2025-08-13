import { POST } from '@/app/api/cron/generate/route';

describe('api/cron/generate', () => {
    it('responds 403 without secret', async () => {
        const req = new Request('http://localhost/api/cron/generate', { method: 'POST' });
        const res = await POST(req);
        expect(res.status).toBe(403);
    });
});


