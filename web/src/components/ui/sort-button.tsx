/**
 * Reusable sort button component with arrow indicators
 */

interface SortButtonProps {
    children: React.ReactNode;
    active: boolean;
    direction: 'asc' | 'desc';
    onClick: () => void;
    className?: string;
}

export function SortButton({
    children,
    active,
    direction,
    onClick,
    className = ""
}: SortButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center text-left font-medium text-gray-300 hover:text-gray-100 transition-colors ${className}`}
        >
            {children}
            <span className={`ml-1 text-[10px] transition-opacity ${active ? 'opacity-100' : 'opacity-30'}`}>
                {direction === 'asc' ? '▲' : '▼'}
            </span>
        </button>
    );
}
