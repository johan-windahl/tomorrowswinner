/**
 * Centralized icon components
 * Consistent SVG icons used throughout the application
 */

import { type ComponentProps } from 'react';

type IconProps = ComponentProps<'svg'> & {
    size?: number;
};

export function ChartBarIcon({ size = 24, className = "", ...props }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            {...props}
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    );
}

export function CurrencyDollarIcon({ size = 24, className = "", ...props }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            {...props}
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
    );
}

export function ClockIcon({ size = 24, className = "", ...props }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            {...props}
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}

export function ArrowRightIcon({ size = 24, className = "", ...props }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            {...props}
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
    );
}

export function ArrowLeftIcon({ size = 24, className = "", ...props }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            {...props}
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
    );
}

export function SearchIcon({ size = 24, className = "", ...props }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            {...props}
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    );
}

export function ExternalLinkIcon({ size = 24, className = "", ...props }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            {...props}
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
    );
}

export function CheckCircleIcon({ size = 24, className = "", ...props }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            {...props}
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}

export function ExclamationTriangleIcon({ size = 24, className = "", ...props }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            {...props}
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.168 13.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
    );
}

export function SunIcon({ size = 24, className = "", ...props }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            {...props}
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    );
}

export function CalendarIcon({ size = 24, className = "", ...props }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            {...props}
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    );
}

export function StarIcon({ size = 24, className = "", ...props }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            {...props}
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
    );
}

export function BoltIcon({ size = 24, className = "", ...props }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            {...props}
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    );
}
