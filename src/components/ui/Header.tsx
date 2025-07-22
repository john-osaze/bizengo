// components/Header.tsx
'use client'; // This component uses client-side hooks like useState, useRouter, usePathname

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // Next.js routing hooks
import Icon from './AppIcon'; // Adjust path as needed
import Link from 'next/link';

const Header: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
    const router = useRouter();
    const pathname = usePathname(); // Get current path from Next.js
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            // Assert event.target as a Node for the contains method
            const targetNode = event.target as Node;

            // Check if dropdownRef.current exists AND is an Element (which HTMLElement extends)
            // AND if the click target is not contained within the dropdown.
            if (
                dropdownRef.current &&
                dropdownRef.current instanceof Element && // Ensure it's an actual DOM Element
                !dropdownRef.current.contains(targetNode)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const getPageTitle = (): string => {
        switch (pathname) { // Use pathname
            case '/home-dashboard':
                return 'Discover';
            case '/map-view':
                return 'Map View';
            case '/search-results':
                return 'Search Results';
            case '/product-detail':
                return 'Product Details';
            case '/user-profile':
                return 'Profile';
            case '/create-listing':
                return 'Create Listing';
            default:
                return 'LocalMarket';
        }
    };

    const handleSearch = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/tools/find-products/search-results?q=${encodeURIComponent(searchQuery.trim())}`); // Use router.push
        }
    };

    const handleBackNavigation = (): void => {
        if (window.history.length > 1) {
            router.back(); // Use router.back()
        } else {
            router.push('/tools/find-products/'); // Use router.push
        }
    };

    const handleNavigation = (path: string) => {
        router.push(path);
        setIsOpen(false); // Close the menu after navigation
    };

    const showBackButton = pathname === '/product-detail' || pathname === '/create-listing';
    const showSearch = pathname !== '/create-listing';

    return (
        <header className="sticky top-0 z-[200] bg-surface border-b border-border">
            <div className="h-16 md:h-18 px-4 md:px-6 flex items-center justify-between">

                <div className="flex items-center space-x-4">
                    {showBackButton ? (
                        <button
                            onClick={handleBackNavigation}
                            className="p-2 -ml-2 rounded-lg hover:bg-surface-secondary transition-colors duration-200"
                            aria-label="Go back"
                        >
                            <Icon name="ArrowLeft" size={20} className="text-text-primary" />
                        </button>
                    ) : (
                        <Link href="/tools/find-products/" className="block"> {/* Add 'block' if you want the link to occupy the full width of its container */}
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                    <Icon name="MapPin" size={18} className="text-white" />
                                </div>
                                <h1 className="text-lg md:text-xl font-heading font-semibold text-text-primary">
                                    {getPageTitle()}
                                </h1>
                            </div>
                        </Link>
                    )}
                </div>

                {/* Center Section - Search */}
                {showSearch && (
                    <div className="flex-1 max-w-md mx-4">
                        <form onSubmit={handleSearch} className="relative">
                            <div className={`relative transition-all duration-200 ${isSearchFocused ? 'ring-2 ring-primary-500' : ''
                                }`}>
                                <Icon
                                    name="Search"
                                    size={18}
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
                                />
                                <input
                                    type="text"
                                    placeholder="Search products, stores..."
                                    value={searchQuery}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                                    onFocus={() => setIsSearchFocused(true)}
                                    onBlur={() => setIsSearchFocused(false)}
                                    className="w-full pl-10 pr-4 py-2 bg-surface-secondary border border-border rounded-lg text-sm placeholder-text-secondary focus:outline-none focus:bg-surface focus:border-primary-500 transition-all duration-200"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-border-light transition-colors duration-200"
                                    >
                                        <Icon name="X" size={14} className="text-text-secondary" />
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                )}

                {/* Right Section */}
                <div className="flex items-center space-x-2">
                    {pathname === '/search-results' && (
                        <button
                            onClick={() => router.push('/tools/find-products/search-results?view=filter')} // Use router.push
                            className="p-2 rounded-lg hover:bg-surface-secondary transition-colors duration-200"
                            aria-label="Open filters"
                        >
                            <Icon name="SlidersHorizontal" size={20} className="text-text-primary" />
                        </button>
                    )}

                    {pathname === '/tools/find-products/map-view' && (
                        <button
                            onClick={() => router.push('/tools/find-products/map-view?view=list')} // Use router.push
                            className="p-2 rounded-lg hover:bg-surface-secondary transition-colors duration-200"
                            aria-label="Toggle view"
                        >
                            <Icon name="List" size={20} className="text-text-primary" />
                        </button>
                    )}

                    <div className="flex items-center">

                        {/* Desktop View: Hidden below sm breakpoint, displayed as flex above */}
                        <div className="hidden sm:flex items-center gap-2">
                            <button
                                onClick={() => router.push('/tools')}
                                className="p-2 rounded-lg hover:bg-surface-secondary transition-colors duration-200 relative text-sm font-medium text-primary"
                                aria-label="All tools"
                            >
                                All tools
                            </button>
                            <button
                                onClick={() => router.push('/tools/find-products/user-profile')}
                                className="p-2 rounded-lg hover:bg-surface-secondary transition-colors duration-200 relative"
                                aria-label="User profile"
                            >
                                <Icon name="User" size={20} className="text-text-primary" />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-surface"></div>
                            </button>
                        </div>

                        {/* Mobile View: Hidden above sm breakpoint, displayed as block below */}
                        {/* The ref is attached to this container to detect clicks outside the entire mobile menu unit */}
                        <div className="relative block sm:hidden" ref={dropdownRef}>
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="p-2 rounded-lg hover:bg-surface-secondary transition-colors duration-200"
                                aria-label="Open menu"
                            >
                                <Icon name="MoreVertical" size={20} className="text-text-primary" />
                            </button>

                            {isOpen && (
                                <div className="absolute top-full right-0 mt-2 w-60 bg-white rounded-lg shadow-xl z-10 overflow-hidden border border-surface-border">
                                    <button
                                        onClick={() => handleNavigation('/tools')}
                                        className="block w-full text-left p-3 text-sm font-medium text-text-primary hover:bg-surface-secondary transition-colors duration-200"
                                        aria-label="All tools option"
                                    >
                                        All tools
                                    </button>
                                    <button
                                        onClick={() => handleNavigation('/tools/find-products/user-profile')}
                                        className=" w-full text-left p-3 text-sm font-medium text-text-primary hover:bg-surface-secondary transition-colors duration-200 flex items-center gap-2"
                                        aria-label="User profile option"
                                    >
                                        User profile
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;