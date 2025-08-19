/**
 * Reusable error state components
 * Consistent error displays and empty states
 */

import { ExclamationTriangleIcon, SearchIcon, ClockIcon } from './icons';

interface ErrorStateProps {
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
    icon?: 'error' | 'search' | 'clock';
}

export function ErrorState({
    title,
    message,
    actionLabel = "Try Again",
    onAction,
    icon = 'error'
}: ErrorStateProps) {
    const iconComponents = {
        error: <ExclamationTriangleIcon size={32} className="text-red-400" />,
        search: <SearchIcon size={40} className="text-gray-400" />,
        clock: <ClockIcon size={40} className="text-gray-400" />,
    };

    const iconBgColors = {
        error: 'bg-red-900',
        search: 'bg-gray-700',
        clock: 'bg-gray-700',
    };

    return (
        <div className="text-center py-16">
            <div className={`w-16 h-16 ${iconBgColors[icon]} rounded-full flex items-center justify-center mx-auto mb-4`}>
                {iconComponents[icon]}
            </div>
            <h3 className="text-lg font-semibold text-gray-100 mb-2">{title}</h3>
            <p className="text-gray-400 mb-4">{message}</p>
            {onAction && (
                <button
                    onClick={onAction}
                    className="btn btn-primary"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}

interface EmptyStateProps {
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
    icon?: React.ReactNode;
}

export function EmptyState({
    title,
    message,
    actionLabel,
    onAction,
    icon
}: EmptyStateProps) {
    return (
        <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                {icon || <SearchIcon size={40} className="text-gray-400" />}
            </div>
            <h3 className="text-xl font-semibold text-gray-100 mb-3">{title}</h3>
            <p className="text-gray-400 mb-6">{message}</p>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium rounded-lg transition-colors duration-200"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}

interface MessageBannerProps {
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    onDismiss?: () => void;
}

export function MessageBanner({ message, type = 'info', onDismiss }: MessageBannerProps) {
    const typeStyles = {
        success: "bg-green-900/50 border-green-600 text-green-200",
        error: "bg-red-900/50 border-red-600 text-red-200",
        warning: "bg-yellow-900/50 border-yellow-600 text-yellow-200",
        info: "bg-blue-900/50 border-blue-600 text-blue-200",
    };

    const icons = {
        success: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        error: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.168 13.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
        ),
        warning: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.168 13.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
        ),
        info: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    };

    return (
        <div className={`max-w-md mx-auto p-4 rounded-lg border ${typeStyles[type]}`}>
            <div className="flex items-center gap-2">
                {icons[type]}
                <span className="font-medium">{message}</span>
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="ml-auto text-current hover:opacity-70 transition-opacity"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}
