/**
 * Reusable page header component
 * Consistent hero sections with breadcrumbs and stats
 */

import Link from 'next/link';
import { ArrowLeftIcon, ArrowRightIcon } from '../ui/icons';

interface BreadcrumbItem {
    label: string;
    href?: string;
    active?: boolean;
}

interface StatItem {
    icon: React.ReactNode;
    value: string;
    label: string;
    color?: string;
}

interface PageHeaderProps {
    title: string | React.ReactNode;
    description?: string;
    breadcrumbs?: BreadcrumbItem[];
    stats?: StatItem[];
    children?: React.ReactNode;
    className?: string;
}

export function PageHeader({
    title,
    description,
    breadcrumbs,
    stats,
    children,
    className = ""
}: PageHeaderProps) {
    return (
        <section className={`relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 lg:py-16 ${className}`}>
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            <div className="container relative">
                <div className="text-center">
                    {/* Breadcrumbs */}
                    {breadcrumbs && breadcrumbs.length > 0 && (
                        <div className="flex items-center justify-center gap-4 mb-8">
                            {breadcrumbs.map((item, index) => (
                                <div key={index} className="flex items-center gap-4">
                                    {item.href && !item.active ? (
                                        <Link
                                            href={item.href}
                                            className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-2 transition-colors"
                                        >
                                            {index === 0 && <ArrowLeftIcon size={20} />}
                                            {item.label}
                                        </Link>
                                    ) : (
                                        <span className={`font-medium ${item.active ? 'text-gray-300' : 'text-gray-400'}`}>
                                            {item.label}
                                        </span>
                                    )}
                                    {index < breadcrumbs.length - 1 && (
                                        <span className="text-gray-600">|</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Title */}
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-gray-100">
                        {typeof title === 'string' ? (
                            <span className="gradient-text">{title}</span>
                        ) : (
                            title
                        )}
                    </h1>

                    {/* Description */}
                    {description && (
                        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-6">
                            {description}
                        </p>
                    )}

                    {/* Stats */}
                    {stats && stats.length > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-6 text-sm">
                            {stats.map((stat, index) => (
                                <div key={index} className="flex items-center gap-2 text-gray-400">
                                    <div className={`w-8 h-8 ${stat.color || 'bg-blue-900'} rounded-lg flex items-center justify-center`}>
                                        {stat.icon}
                                    </div>
                                    <span className="text-lg font-medium text-gray-300">{stat.value} {stat.label}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Custom children (like search bars, etc.) */}
                    {children && (
                        <div className="mt-8">
                            {children}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
