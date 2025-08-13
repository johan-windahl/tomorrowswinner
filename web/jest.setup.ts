import '@testing-library/jest-dom';
import 'whatwg-fetch';

// Mock next/image for Jest to avoid optimization warnings
jest.mock('next/image', () => ({
    __esModule: true, default: (props: any) => {
        // eslint-disable-next-line jsx-a11y/alt-text, react/jsx-props-no-spreading
        return require('react').createElement('img', props);
    }
}));

// Polyfill Response.json for Jest/jsdom
// @ts-ignore
if (typeof Response !== 'undefined' && typeof (Response as any).json !== 'function') {
    // @ts-ignore
    (Response as any).json = (body: unknown, init?: ResponseInit) => {
        const payload = typeof body === 'string' ? body : JSON.stringify(body);
        const headers = new Headers(init?.headers ?? {});
        if (!headers.has('content-type')) headers.set('content-type', 'application/json');
        return new Response(payload, { ...init, headers });
    };
}

// Provide dummy env vars for Supabase client in tests
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test_anon_key';

