/**
 * Test for tooltip component
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { Tooltip } from '@/components/ui/tooltip';

describe('Tooltip', () => {
    it('renders children without showing tooltip initially', () => {
        render(
            <Tooltip content="Test tooltip content">
                <button>Hover me</button>
            </Tooltip>
        );

        expect(screen.getByText('Hover me')).toBeInTheDocument();
        expect(screen.queryByText('Test tooltip content')).not.toBeInTheDocument();
    });

    it('shows tooltip on mouse enter', () => {
        render(
            <Tooltip content="Test tooltip content">
                <button>Hover me</button>
            </Tooltip>
        );

        fireEvent.mouseEnter(screen.getByText('Hover me'));
        expect(screen.getByText('Test tooltip content')).toBeInTheDocument();
    });

    it('hides tooltip on mouse leave', () => {
        render(
            <Tooltip content="Test tooltip content">
                <button>Hover me</button>
            </Tooltip>
        );

        fireEvent.mouseEnter(screen.getByText('Hover me'));
        expect(screen.getByText('Test tooltip content')).toBeInTheDocument();

        fireEvent.mouseLeave(screen.getByText('Hover me'));
        expect(screen.queryByText('Test tooltip content')).not.toBeInTheDocument();
    });

    it('shows tooltip on touch start', () => {
        render(
            <Tooltip content="Test tooltip content">
                <button>Touch me</button>
            </Tooltip>
        );

        fireEvent.touchStart(screen.getByText('Touch me'));
        expect(screen.getByText('Test tooltip content')).toBeInTheDocument();
    });

    it('has correct accessibility attributes', () => {
        render(
            <Tooltip content="Test tooltip content">
                <button>Hover me</button>
            </Tooltip>
        );

        fireEvent.mouseEnter(screen.getByText('Hover me'));
        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
    });
});
