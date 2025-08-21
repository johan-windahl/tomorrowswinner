/**
 * Tooltip component for desktop hover and mobile touch
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout>();

    const calculatePosition = useCallback(() => {
        if (!triggerRef.current) return;

        const rect = triggerRef.current.getBoundingClientRect();
        const tooltipHeight = 100; // Increased for longer content
        const tooltipWidth = 280; // Increased for longer content

        let top = 0;
        let left = 0;

        switch (position) {
            case 'top':
                top = rect.top - tooltipHeight - 8;
                left = rect.left + rect.width / 2 - tooltipWidth / 2;
                break;
            case 'bottom':
                top = rect.bottom + 8;
                left = rect.left + rect.width / 2 - tooltipWidth / 2;
                break;
            case 'left':
                top = rect.top + rect.height / 2 - tooltipHeight / 2;
                left = rect.left - tooltipWidth - 8;
                break;
            case 'right':
                top = rect.top + rect.height / 2 - tooltipHeight / 2;
                left = rect.right + 8;
                break;
        }

        // Ensure tooltip stays within viewport bounds
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Adjust horizontal position if tooltip would overflow
        if (left < 8) left = 8;
        if (left + tooltipWidth > viewportWidth - 8) left = viewportWidth - tooltipWidth - 8;

        // Adjust vertical position if tooltip would overflow
        if (top < 8) {
            // If top position would overflow, try bottom instead
            top = rect.bottom + 8;
        }
        if (top + tooltipHeight > viewportHeight - 8) {
            // If bottom position would overflow, try top instead
            top = rect.top - tooltipHeight - 8;
        }

        setTooltipPosition({ top, left });
    }, [position]);

    useEffect(() => {
        if (isVisible) {
            // Clear any existing timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Calculate position immediately
            calculatePosition();

            // Recalculate position after a short delay to ensure stability
            timeoutRef.current = setTimeout(() => {
                calculatePosition();
            }, 10);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [isVisible, calculatePosition]);

    const handleMouseEnter = useCallback(() => {
        setIsVisible(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsVisible(false);
    }, []);

    const handleTouchStart = useCallback(() => {
        setIsVisible(true);
    }, []);

    const handleTouchEnd = useCallback(() => {
        setTimeout(() => setIsVisible(false), 2000);
    }, []);

    const tooltipContent = isVisible ? (
        <div
            className="fixed z-[9999] px-4 py-3 text-sm text-white bg-gray-800 rounded-lg shadow-xl border border-gray-600"
            style={{
                top: tooltipPosition.top,
                left: tooltipPosition.left,
                minWidth: '280px',
                maxWidth: '320px',
            }}
            role="tooltip"
        >
            <div className="text-center leading-relaxed">
                {content}
            </div>
            {/* Arrow */}
            <div
                className={`absolute w-3 h-3 bg-gray-800 border-gray-600 transform rotate-45 ${position === 'top' ? 'top-full left-1/2 -translate-x-1/2 border-t border-l' :
                    position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 border-b border-r' :
                        position === 'left' ? 'left-full top-1/2 -translate-y-1/2 border-l border-b' :
                            'right-full top-1/2 -translate-y-1/2 border-r border-t'
                    }`}
            />
        </div>
    ) : null;

    return (
        <>
            <div
                ref={triggerRef}
                className="relative inline-block"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {children}
            </div>
            {tooltipContent && createPortal(tooltipContent, document.body)}
        </>
    );
}
