import { GET } from '@/app/api/health/route';

describe('api/health', () => {
    it('responds ok', async () => {
        // Call handler directly
        const res = await GET();
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.ok).toBe(true);
    });
});


