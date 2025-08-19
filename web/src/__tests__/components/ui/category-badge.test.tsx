/**
 * Tests for CategoryBadge component
 */

import { render, screen } from '@testing-library/react';
import { CategoryBadge } from '@/components/ui/category-badge';

describe('CategoryBadge', () => {
    it('renders finance category correctly', () => {
        render(<CategoryBadge category="finance" />);

        expect(screen.getByText('Stocks')).toBeInTheDocument();
    });

    it('renders crypto category correctly', () => {
        render(<CategoryBadge category="crypto" />);

        expect(screen.getByText('Crypto')).toBeInTheDocument();
    });

    it('applies size classes correctly', () => {
        const { container } = render(<CategoryBadge category="finance" size="lg" />);

        const badge = container.querySelector('.px-4.py-2.text-base');
        expect(badge).toBeInTheDocument();
    });

    it('applies custom className', () => {
        const { container } = render(<CategoryBadge category="finance" className="custom-class" />);

        const badge = container.querySelector('.custom-class');
        expect(badge).toBeInTheDocument();
    });
});
