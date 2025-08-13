import { render } from '@testing-library/react';
import React from 'react';
jest.mock('next/navigation', () => ({ useParams: () => ({ slug: 'sp500-best-tomorrow' }) }));
jest.mock('swr', () => ({ __esModule: true, default: () => ({ data: { ok: true, items: [] }, isLoading: false }) }));
import Page from '@/app/competitions/[slug]/page';

// Smoke test: can render component (hooks will no-op without router context in this smoke)
describe('Competition detail page', () => {
    it('renders without crashing', async () => {
        render(<Page />);
    });
});


