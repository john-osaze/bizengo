
'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Icon, { LucideIconName } from './AppIcon';

interface NavigationItem {
    label: string;
    path: string;
    icon: LucideIconName;
    activeIcon: LucideIconName;
    tooltip: string;
}

const BottomTabNavigation: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();

    const navigationItems: NavigationItem[] = [
        {
            label: 'Home',
            path: '/tools/find-products/',
            icon: 'Home',
            activeIcon: 'Home',
            tooltip: 'Discover nearby products'
        },
        {
            label: 'Map',
            path: '/tools/find-products/map-view',
            icon: 'Map',
            activeIcon: 'Map',
            tooltip: 'Geographic product exploration'
        },
        {
            label: 'Search',
            path: '/tools/find-products/search-results',
            icon: 'Search',
            activeIcon: 'Search',
            tooltip: 'Query-driven discovery'
        },
        {
            label: 'Profile',
            path: '/tools/find-products/user-profile',
            icon: 'User',
            activeIcon: 'User',
            tooltip: 'Account management'
        }
    ];

    const handleTabPress = (path: string): void => {
        router.push(path);
    };

    const isActiveTab = (path: string): boolean => {
        return pathname === path;
    };

    return (
        <>
            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-100 bg-surface border-t border-border md:hidden">
                <div className="flex items-center justify-around px-4 py-2 safe-area-inset-bottom">
                    {navigationItems.map((item) => {
                        const isActive = isActiveTab(item.path);
                        return (
                            <button
                                key={item.path}
                                onClick={() => handleTabPress(item.path)}
                                className={`flex flex-col items-center justify-center min-h-[48px] px-3 py-2 rounded-lg transition-all duration-200 ${isActive
                                    ? 'text-primary bg-primary-50' : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
                                    }`}
                                aria-label={item.tooltip}
                                title={item.tooltip}
                            >
                                <Icon
                                    name={isActive ? item.activeIcon : item.icon}
                                    size={20}
                                    strokeWidth={isActive ? 2.5 : 2}
                                    className={`mb-1 transition-colors duration-200 ${isActive ? 'text-primary' : 'text-current'
                                        }`}
                                />
                                <span className={`text-xs font-caption transition-all duration-200 ${isActive ? 'font-medium text-primary' : 'text-current'
                                    }`}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* Desktop Top Navigation */}
            <nav className="hidden md:block fixed bottom-0 left-0 right-0 z-100 bg-surface border-t border-border w-full"> {/* Changed classes */}
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-center space-x-8 py-4">
                        {navigationItems.map((item) => {
                            const isActive = isActiveTab(item.path);
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => handleTabPress(item.path)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${isActive
                                        ? 'text-primary bg-primary-50 font-medium' : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
                                        }`}
                                    aria-label={item.tooltip}
                                    title={item.tooltip}
                                >
                                    <Icon
                                        name={isActive ? item.activeIcon : item.icon}
                                        size={18}
                                        strokeWidth={isActive ? 2.5 : 2}
                                        className={`transition-colors duration-200 ${isActive ? 'text-primary' : 'text-current'
                                            }`}
                                    />
                                    <span className={`text-sm font-caption transition-all duration-200 ${isActive ? 'font-medium text-primary' : 'text-current'
                                        }`}>
                                        {item.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </nav>
        </>
    );
};

export default BottomTabNavigation;