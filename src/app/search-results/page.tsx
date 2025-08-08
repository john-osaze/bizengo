"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react'; // Import useMemo
import { useRouter, useSearchParams } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import FilterDrawer from '@/components/ui/FilterDrawer';
import ProductCard from './components/ProductCard';
import QuickFilters from './components/QuickFilters';
import SearchSuggestions from './components/SearchSuggestions';
import MapViewToggle from './components/MapViewToggle';

interface Product {
    id: number;
    name: string;
    price: number;
    originalPrice: number;
    image: string;
    seller: string;
    rating: number;
    reviewCount: number;
    distance: number;
    condition: string;
    category: string;
    isVerified: boolean;
    availability: string;
    location: string;
    postedDate: string;
}

interface Filter {
    type: string;
    label: string;
    value: any;
    id: string;
}

const SearchResults = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const [sortBy, setSortBy] = useState('relevance');
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    // `products` now holds the *original*, unfiltered list from the mock data or API
    const [products, setProducts] = useState<Product[]>([]);
    // `activeFilters` will store the filters currently applied by the user
    const [activeFilters, setActiveFilters] = useState<Filter[]>([]);

    const router = useRouter();
    const searchParams = useSearchParams();

    // Mock search results data - unchanged
    const mockProducts: Product[] = [
        {
            id: 1,
            name: "iPhone 14 Pro Max",
            price: 899,
            originalPrice: 1099,
            image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400",
            seller: "TechStore Downtown",
            rating: 4.8,
            reviewCount: 124,
            distance: 0.8,
            condition: "Like New",
            category: "Electronics",
            isVerified: true,
            availability: "In Stock",
            location: "Downtown District",
            postedDate: "2024-01-15"
        },
        {
            id: 2,
            name: "MacBook Air M2",
            price: 1199,
            originalPrice: 1299,
            image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400",
            seller: "Apple Authorized Reseller",
            rating: 4.9,
            reviewCount: 89,
            distance: 1.2,
            condition: "New",
            category: "Electronics",
            isVerified: true,
            availability: "In Stock",
            location: "Tech Plaza",
            postedDate: "2024-01-14"
        },
        {
            id: 3,
            name: "Nike Air Max 270",
            price: 89,
            originalPrice: 150,
            image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
            seller: "SportZone",
            rating: 4.6,
            reviewCount: 67,
            distance: 2.1,
            condition: "Good",
            category: "Clothing",
            isVerified: false,
            availability: "Limited Stock",
            location: "Mall Center",
            postedDate: "2024-01-13"
        },
        {
            id: 4,
            name: "Samsung 55\" 4K TV",
            price: 449,
            originalPrice: 699,
            image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400",
            seller: "Electronics Hub",
            rating: 4.7,
            reviewCount: 156,
            distance: 3.5,
            condition: "Like New",
            category: "Electronics",
            isVerified: true,
            availability: "In Stock",
            location: "Electronics District",
            postedDate: "2024-01-12"
        },
        {
            id: 5,
            name: "Vintage Leather Jacket",
            price: 125,
            originalPrice: 200,
            image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400",
            seller: "Vintage Finds",
            rating: 4.4,
            reviewCount: 34,
            distance: 1.8,
            condition: "Good",
            category: "Clothing",
            isVerified: false,
            availability: "In Stock",
            location: "Vintage Quarter",
            postedDate: "2024-01-11"
        },
        {
            id: 6,
            name: "Gaming Chair Pro",
            price: 299,
            originalPrice: 399,
            image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400",
            seller: "Gaming World",
            rating: 4.5,
            reviewCount: 78,
            distance: 4.2,
            condition: "New",
            category: "Home & Garden",
            isVerified: true,
            availability: "In Stock",
            location: "Gaming District",
            postedDate: "2024-01-10"
        }
    ];

    interface SortOption {
        value: string;
        label: string;
    }

    const sortOptions: SortOption[] = [
        { value: 'relevance', label: 'Most Relevant' },
        { value: 'price-low', label: 'Price: Low to High' },
        { value: 'price-high', label: 'Price: High to Low' },
        { value: 'distance', label: 'Nearest First' },
        { value: 'newest', label: 'Newest First' },
        { value: 'rating', label: 'Highest Rated' }
    ];

    const recentSearches: string[] = [
        "iPhone 14", "MacBook", "Gaming laptop", "Vintage clothes", "Home decor"
    ];

    const popularSearches: string[] = [
        "Electronics", "Furniture", "Clothing", "Books", "Sports equipment"
    ];

    // Effect to load initial products based on search params
    useEffect(() => {
        const query = searchParams.get('q') || '';
        const view = searchParams.get('view') || 'list';

        setSearchQuery(query);
        setViewMode(view as 'list' | 'map');

        // Simulate loading products
        setIsLoading(true);
        setTimeout(() => {
            // In a real app, you'd fetch data here based on 'query'
            setProducts(mockProducts); // Set the base list of products
            setIsLoading(false);
        }, 800);
    }, [searchParams]);

    // This useMemo hook calculates the products to be displayed
    // It re-runs ONLY when `products` (the original data), `activeFilters`, or `sortBy` changes.
    const displayProducts = useMemo(() => {
        let currentProducts = [...products]; // Start with a copy of the original list

        // 1. Apply Filtering based on activeFilters
        activeFilters.forEach(filter => {
            switch (filter.type) {
                case 'price':
                    currentProducts = currentProducts.filter(p => p.price <= filter.value);
                    break;
                case 'distance':
                    currentProducts = currentProducts.filter(p => p.distance <= filter.value);
                    break;
                case 'rating':
                    currentProducts = currentProducts.filter(p => p.rating >= filter.value);
                    break;
                case 'condition':
                    currentProducts = currentProducts.filter(p => p.condition === filter.value);
                    break;
                // Add more filter types as needed
            }
        });

        // 2. Apply Sorting based on sortBy
        switch (sortBy) {
            case 'price-low':
                currentProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                currentProducts.sort((a, b) => b.price - a.price);
                break;
            case 'distance':
                currentProducts.sort((a, b) => a.distance - b.distance);
                break;
            case 'newest':
                currentProducts.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
                break;
            case 'rating':
                currentProducts.sort((a, b) => b.rating - a.rating);
                break;
            default:
                // 'relevance' - maintain original filtered order or apply a default relevance sort if available
                break;
        }
        return currentProducts;
    }, [products, activeFilters, sortBy]); // Dependencies for recalculation

    const handleProductClick = (productId: number) => {
        router.push(`/product-detail?id=${productId}`);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setShowSuggestions(e.target.value.length > 0);
    };

    const handleSearchSubmit = (query: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('q', query);
        router.push(`/search-results?${params.toString()}`);
        setShowSuggestions(false);
    };

    // These functions now only update the `activeFilters` state.
    // `useMemo` will automatically react to these changes and re-calculate `displayProducts`.
    const handleQuickFilter = (filter: Omit<Filter, 'id'>) => {
        setActiveFilters(prev => [...prev, { ...filter, id: Date.now().toString() }]);
    };

    const clearAllFilters = () => {
        setActiveFilters([]);
    };

    const removeFilter = (filterToRemove: Filter) => {
        setActiveFilters(prev => prev.filter(f => f.id !== filterToRemove.id));
    };

    const handleViewModeChange = (newViewMode: 'list' | 'map') => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('view', newViewMode);
        router.push(`/search-results?${params.toString()}`);
    }

    if (viewMode === 'map') {
        return <MapViewToggle products={displayProducts} onBackToList={() => handleViewModeChange('list')} />;
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="fixed top-100 left-0 right-0 z-[250] bg-white border-b border-border">
                <div className="px-4 md:px-6 py-3">
                    <div className="flex items-center space-x-3">
                        <div className="flex-1 relative">
                            <Icon
                                name="Search"
                                size={18}
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
                            />
                            <input
                                type="text"
                                placeholder="Search products, stores..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onFocus={() => setShowSuggestions(searchQuery.length > 0)}
                                className="w-full pl-10 pr-4 py-2 bg-surface-secondary border border-border rounded-lg text-sm placeholder-text-secondary focus:outline-none focus:bg-surface focus:border-primary-500 focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-border-light transition-colors duration-200"
                                >
                                    <Icon name="X" size={14} className="text-text-secondary" />
                                </button>
                            )}
                        </div>

                        <button
                            onClick={() => setIsFilterOpen(true)}
                            className="p-2 rounded-lg border border-border hover:bg-surface-secondary transition-colors duration-200 relative"
                        >
                            <Icon name="SlidersHorizontal" size={20} className="text-text-primary" />
                            {activeFilters.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center">
                                    {activeFilters.length}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => handleViewModeChange('map')}
                            className="p-2 rounded-lg border border-border hover:bg-surface-secondary transition-colors duration-200"
                        >
                            <Icon name="Map" size={20} className="text-text-primary" />
                        </button>
                    </div>
                </div>
            </div>

            {showSuggestions && (
                <SearchSuggestions
                    query={searchQuery}
                    recentSearches={recentSearches}
                    popularSearches={popularSearches}
                    onSelectSuggestion={handleSearchSubmit}
                    onClose={() => setShowSuggestions(false)}
                />
            )}

            <div className="flex">
                {/* Desktop Sidebar Filters */}
                <div className="hidden lg:block w-80 border-r border-border bg-surface">
                    <div className="sticky top-32 h-[calc(100vh-8rem)] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-heading font-semibold text-text-primary">Filters</h3>
                                {activeFilters.length > 0 && (
                                    <button
                                        onClick={clearAllFilters}
                                        className="text-sm text-primary hover:text-primary-700 transition-colors duration-200"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>

                            <QuickFilters onApplyFilter={handleQuickFilter} />
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {/* Active Filters */}
                    {activeFilters.length > 0 && (
                        <div className="px-4 md:px-6 py-3 bg-surface-secondary border-b border-border">
                            <div className="flex items-center space-x-2 flex-wrap gap-2">
                                <span className="text-sm text-text-secondary">Active filters:</span>
                                {activeFilters.map((filter) => (
                                    <div
                                        key={filter.id}
                                        className="flex items-center space-x-1 bg-primary-50 text-primary px-3 py-1 rounded-full text-sm"
                                    >
                                        <span>{filter.label}</span>
                                        <button
                                            onClick={() => removeFilter(filter)}
                                            className="ml-1 hover:bg-primary-100 rounded-full p-0.5 transition-colors duration-200"
                                        >
                                            <Icon name="X" size={12} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={clearAllFilters}
                                    className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-200"
                                >
                                    Clear all
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Quick Filters - Mobile */}
                    <div className="lg:hidden px-4 py-3 border-b border-border bg-white">
                        <QuickFilters onApplyFilter={handleQuickFilter} />
                    </div>

                    {/* Sort and Results Count */}
                    <div className="px-4 md:px-6 py-4 border-b border-border bg-surface">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-text-secondary">
                                {/* Use displayProducts.length here */}
                                {isLoading ? 'Searching...' : `${displayProducts.length} results found`}
                                {searchQuery && (
                                    <span className="ml-1">for "{searchQuery}"</span>
                                )}
                            </div>

                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-text-secondary">Sort by:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="text-sm border border-border rounded-lg px-3 py-1 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                                >
                                    {sortOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="px-4 md:px-6 py-6">
                        {isLoading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {Array.from({ length: 10 }).map((_, index) => (
                                    <div key={index} className="animate-pulse">
                                        <div className="bg-surface-secondary rounded-lg aspect-square mb-3"></div>
                                        <div className="space-y-2">
                                            <div className="h-4 bg-surface-secondary rounded"></div>
                                            <div className="h-3 bg-surface-secondary rounded w-2/3"></div>
                                            <div className="h-3 bg-surface-secondary rounded w-1/2"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : displayProducts.length === 0 ? ( // Use displayProducts.length here
                            <div className="text-center py-16">
                                <div className="w-24 h-24 bg-surface-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Icon name="Search" size={48} className="text-text-secondary" />
                                </div>
                                <h3 className="text-xl font-heading font-semibold text-text-primary mb-2">
                                    No results found
                                </h3>
                                <p className="text-text-secondary mb-6">
                                    Try adjusting your search terms or filters
                                </p>
                                <button
                                    onClick={clearAllFilters}
                                    className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {displayProducts.map((product) => ( // Use displayProducts.map here
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onClick={() => handleProductClick(product.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Load More */}
                    {!isLoading && displayProducts.length > 0 && ( // Use displayProducts.length here
                        <div className="px-4 md:px-6 py-6 text-center">
                            <button className="bg-surface border border-border text-text-primary px-8 py-3 rounded-lg hover:bg-surface-secondary transition-colors duration-200">
                                Load More Results
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Filter Drawer */}
            <FilterDrawer
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
            />
        </div>
    );
};

const SearchResultsPage = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SearchResults />
        </Suspense>
    );
};


export default SearchResultsPage;