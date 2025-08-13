import { render, screen } from '@testing-library/react';
import React from 'react';
jest.mock('swr', () => ({ __esModule: true, default: () => ({ data: [], isLoading: false }) }));
// Importera direkt efter att ha satt ts-jest jsx=react-jsx
import Page from '@/app/competitions/page';

describe('Competitions page', () => {
    it('renders heading', () => {
        render(<Page />);
        expect(screen.getByText(/Competitions/i)).toBeInTheDocument();
    });
});


