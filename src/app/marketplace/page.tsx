'use client';

import React, { useState, useEffect, useCallback } from 'react';
// import { useSearchParams } from 'next/navigation';
import RoleContextNavigation, { RoleProvider } from '@/components/ui/RoleContextNavigation';
import Icon from '@/components/AppIcon';
import Button from '@/components/ui/new/Button';
import ProductGrid from './components/ProductGrid';
import FilterPanel from './components/FilterPanel';
import FilterChips from './components/FilterChips';
import SortDropdown from './components/SortDropdown';
import QuickViewModal from './components/QuickViewModal';

// Type definitions
interface Product {
	id: any;
	name: string;
	vendor: string;
	price: number;
	salePrice?: number;
	originalPrice?: any;
	rating: number;
	reviewCount: number;
	image: string;
	images?: string[];
	stock: number;
	category: string;
	isWishlisted?: boolean;
	description: string;
}

interface PriceRange {
	min: string;
	max: string;
}

interface AvailabilityFilters {
	inStock: boolean;
	onSale: boolean;
	freeShipping: boolean;
}

interface Filters {
	categories: string[];
	vendors: string[];
	priceRange: PriceRange;
	minRating: number;
	availability: AvailabilityFilters;
}

type SortOption = 'relevance' | 'price-low' | 'price-high' | 'rating' | 'newest' | 'popular';

type FilterType = 'category' | 'vendor' | 'priceRange' | 'rating' | 'availability';

interface VendorMap {
	[key: string]: string;
}

const MarketplaceBrowse: React.FC = () => {
	// const searchParams = useSearchParams()
	// const [searchParameters, setSearchParameters] = useSearchParams();
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [hasMore, setHasMore] = useState<boolean>(true);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(false);
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [isQuickViewOpen, setIsQuickViewOpen] = useState<boolean>(false);
	const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);

	const [filters, setFilters] = useState<Filters>({
		categories: [],
		vendors: [],
		priceRange: { min: '', max: '' },
		minRating: 0,
		availability: {
			inStock: false,
			onSale: false,
			freeShipping: false
		}
	});

	const [sortBy, setSortBy] = useState<SortOption>('relevance');
	const [searchQuery, setSearchQuery] = useState<string>('');

	// Mock product data
	const mockProducts: Product[] = [
		{
			id: 1,
			name: "Wireless Bluetooth Headphones",
			vendor: "TechStore Pro",
			price: 89.99,
			salePrice: 69.99,
			originalPrice: 89.99,
			rating: 4.5,
			reviewCount: 128,
			image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
			images: [
				"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
				"https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop"
			],
			stock: 15,
			category: 'electronics',
			isWishlisted: false,
			description: "Premium wireless headphones with active noise cancellation and 30-hour battery life."
		},
		{
			id: 2,
			name: "Organic Cotton T-Shirt",
			vendor: "Fashion Hub",
			price: 24.99,
			rating: 4.2,
			reviewCount: 89,
			image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
			stock: 32,
			category: 'clothing',
			isWishlisted: true,
			description: "Comfortable organic cotton t-shirt available in multiple colors and sizes."
		},
		{
			id: 3,
			name: "Smart Home Security Camera",
			vendor: "TechStore Pro",
			price: 149.99,
			salePrice: 119.99,
			originalPrice: 149.99,
			rating: 4.7,
			reviewCount: 203,
			image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
			stock: 8,
			category: 'electronics',
			isWishlisted: false,
			description: "Advanced security camera with 4K recording and smart motion detection."
		},
		{
			id: 4,
			name: "Ceramic Plant Pot Set",
			vendor: "Home Essentials",
			price: 34.99,
			rating: 4.3,
			reviewCount: 67,
			image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=400&fit=crop",
			stock: 25,
			category: 'home',
			isWishlisted: false,
			description: "Beautiful ceramic plant pots perfect for indoor gardening and home decoration."
		},
		{
			id: 5,
			name: "Programming Fundamentals Book",
			vendor: "BookWorm Corner",
			price: 39.99,
			rating: 4.6,
			reviewCount: 156,
			image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=400&fit=crop",
			stock: 42,
			category: 'books',
			isWishlisted: false,
			description: "Comprehensive guide to programming fundamentals for beginners and intermediate developers."
		},
		{
			id: 6,
			name: "Yoga Mat Premium",
			vendor: "Sports Gear Co",
			price: 49.99,
			salePrice: 39.99,
			originalPrice: 49.99,
			rating: 4.4,
			reviewCount: 94,
			image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop",
			stock: 18,
			category: 'sports',
			isWishlisted: true,
			description: "High-quality yoga mat with excellent grip and cushioning for all yoga practices."
		},
		{
			id: 7,
			name: "Natural Face Moisturizer",
			vendor: "Beauty World",
			price: 28.99,
			rating: 4.1,
			reviewCount: 73,
			image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop",
			stock: 0,
			category: 'beauty',
			isWishlisted: false,
			description: "Organic face moisturizer with natural ingredients for all skin types."
		},
		{
			id: 8,
			name: "Educational Building Blocks",
			vendor: "Toy Kingdom",
			price: 19.99,
			rating: 4.8,
			reviewCount: 112,
			image: "https://images.unsplash.com/photo-1558877385-8c3d7c2e7d4b?w=400&h=400&fit=crop",
			stock: 35,
			category: 'toys',
			isWishlisted: false,
			description: "Creative building blocks set that promotes learning and imagination in children."
		}
	];

	useEffect(() => {
		const handleResize = (): void => {
			setIsMobile(window.innerWidth < 768);
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	// useEffect(() => {
	// 	// const searchParams = useSearchParams()
	// 	// Initialize search query from URL params
	// 	const urlSearch = searchParams.get('search');
	// 	if (urlSearch) {
	// 		setSearchQuery(urlSearch);
	// 	}
	// }, [searchParams]);

	useEffect(() => {
		loadProducts(true);
	}, [filters, sortBy, searchQuery]);

	const loadProducts = useCallback(async (reset: boolean = false): Promise<void> => {
		setLoading(true);

		// Simulate API delay
		await new Promise(resolve => setTimeout(resolve, 800));

		let filteredProducts = [...mockProducts];

		// Apply search filter
		if (searchQuery) {
			filteredProducts = filteredProducts.filter(product =>
				product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				product.vendor.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}

		// Apply category filter
		if (filters.categories.length > 0) {
			filteredProducts = filteredProducts.filter(product =>
				filters.categories.includes(product.category)
			);
		}

		// Apply vendor filter
		if (filters.vendors.length > 0) {
			const vendorMap: VendorMap = {
				'techstore': 'TechStore Pro',
				'fashionhub': 'Fashion Hub',
				'homeessentials': 'Home Essentials',
				'bookworm': 'BookWorm Corner',
				'sportsgear': 'Sports Gear Co',
				'beautyworld': 'Beauty World'
			};

			const selectedVendorNames = filters.vendors.map(id => vendorMap[id]).filter(Boolean);
			filteredProducts = filteredProducts.filter(product =>
				selectedVendorNames.includes(product.vendor)
			);
		}

		// Apply price range filter
		if (filters.priceRange.min || filters.priceRange.max) {
			const min = parseFloat(filters.priceRange.min) || 0;
			const max = parseFloat(filters.priceRange.max) || Infinity;
			filteredProducts = filteredProducts.filter(product => {
				const price = product.salePrice || product.price;
				return price >= min && price <= max;
			});
		}

		// Apply rating filter
		if (filters.minRating > 0) {
			filteredProducts = filteredProducts.filter(product =>
				product.rating >= filters.minRating
			);
		}

		// Apply availability filters
		if (filters.availability.inStock) {
			filteredProducts = filteredProducts.filter(product => product.stock > 0);
		}

		if (filters.availability.onSale) {
			filteredProducts = filteredProducts.filter(product => product.salePrice);
		}

		// Apply sorting
		switch (sortBy) {
			case 'price-low':
				filteredProducts.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
				break;
			case 'price-high':
				filteredProducts.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
				break;
			case 'rating':
				filteredProducts.sort((a, b) => b.rating - a.rating);
				break;
			case 'newest':
				filteredProducts.sort((a, b) => b.id - a.id);
				break;
			case 'popular':
				filteredProducts.sort((a, b) => b.reviewCount - a.reviewCount);
				break;
			default:
				// relevance - keep original order
				break;
		}

		if (reset) {
			setProducts(filteredProducts);
			setCurrentPage(1);
			setHasMore(filteredProducts.length > 12);
		} else {
			setProducts(prev => [...prev, ...filteredProducts.slice(currentPage * 12, (currentPage + 1) * 12)]);
			setHasMore(filteredProducts.length > (currentPage + 1) * 12);
		}

		setLoading(false);
	}, [filters, sortBy, searchQuery, currentPage]);

	const handleLoadMore = useCallback(async (): Promise<void> => {
		setCurrentPage(prev => prev + 1);
		await loadProducts(false);
	}, [loadProducts]);

	const handleFiltersChange = (newFilters: Filters): void => {
		setFilters(newFilters);
		setCurrentPage(1);
	};

	const handleRemoveFilter = (type: FilterType, value: string): void => {
		const newFilters = { ...filters };

		switch (type) {
			case 'category':
				newFilters.categories = newFilters.categories.filter(id => id !== value);
				break;
			case 'vendor':
				newFilters.vendors = newFilters.vendors.filter(id => id !== value);
				break;
			case 'priceRange':
				newFilters.priceRange = { min: '', max: '' };
				break;
			case 'rating':
				newFilters.minRating = 0;
				break;
			case 'availability':
				newFilters.availability[value as keyof AvailabilityFilters] = false;
				break;
		}

		setFilters(newFilters);
	};

	const handleClearAllFilters = (): void => {
		const clearedFilters: Filters = {
			categories: [],
			vendors: [],
			priceRange: { min: '', max: '' },
			minRating: 0,
			availability: {
				inStock: false,
				onSale: false,
				freeShipping: false
			}
		};
		setFilters(clearedFilters);
	};

	const handleAddToWishlist = (productId: number | string, isWishlisted: boolean): void => {
		setProducts(prev => prev.map(product =>
			product.id === productId ? { ...product, isWishlisted } : product
		));
	};

	const handleQuickView = (product: Product | any): void => {
		setSelectedProduct(product);
		setIsQuickViewOpen(true);
	};

	const handleAddToCart = (product: Product): void => {
		// Simulate adding to cart
		console.log('Added to cart:', product);
		// You would typically dispatch to a cart context or state management here
	};

	const getActiveFiltersCount = (): number => {
		return filters.categories.length +
			filters.vendors.length +
			(filters.priceRange.min || filters.priceRange.max ? 1 : 0) +
			(filters.minRating > 0 ? 1 : 0) +
			Object.values(filters.availability).filter(Boolean).length;
	};

	return (
		<RoleProvider>
			<RoleContextNavigation>
				<div className="min-h-screen bg-background">
					<div className="flex h-screen pt-0 md:pt-0">
						{/* Desktop Filter Sidebar */}
						{!isMobile && (
							<FilterPanel
								isOpen={true}
								filters={filters}
								onFiltersChange={handleFiltersChange}
								isMobile={false}
							/>
						)}

						{/* Main Content */}
						<div className="flex-1 flex flex-col overflow-hidden">
							{/* Header Controls */}
							<div className="bg-card border-b border-border">
								{/* Search Results Info */}
								<div className="px-4 py-3 border-b border-border">
									<div className="flex items-center justify-between">
										<div className="flex items-center space-x-4">
											<h1 className="text-lg font-semibold text-foreground">
												{searchQuery ? `Search results for "${searchQuery}"` : 'All Products'}
											</h1>
											<span className="text-sm text-muted-foreground">
												{loading ? 'Loading...' : `${products.length} products found`}
											</span>
										</div>

										{/* Mobile Filter Button */}
										{isMobile && (
											<Button
												variant="outline"
												onClick={() => setIsFilterPanelOpen(true)}
												iconName="Filter"
												iconPosition="left"
											>
												Filter
												{getActiveFiltersCount() > 0 && (
													<span className="ml-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
														{getActiveFiltersCount()}
													</span>
												)}
											</Button>
										)}
									</div>
								</div>

								{/* Filter Chips */}
								<FilterChips
									activeFilters={filters}
									onRemoveFilter={handleRemoveFilter}
									onClearAll={handleClearAllFilters}
								/>

								{/* Sort Controls */}
								<div className="px-4 py-3 flex items-center justify-between">
									<div className="flex items-center space-x-4">
										<span className="text-sm text-muted-foreground">Sort by:</span>
										<SortDropdown
											currentSort={sortBy}
											onSortChange={setSortBy}
										/>
									</div>

									{/* View Toggle - Future Enhancement */}
									<div className="hidden md:flex items-center space-x-2">
										<button className="p-2 rounded-md bg-primary text-primary-foreground">
											<Icon name="Grid3X3" size={16} />
										</button>
										<button className="p-2 rounded-md hover:bg-muted transition-colors duration-200">
											<Icon name="List" size={16} />
										</button>
									</div>
								</div>
							</div>

							{/* Product Grid */}
							<div className="flex-1 overflow-y-auto">
								<ProductGrid
									products={products}
									loading={loading}
									hasMore={hasMore}
									onLoadMore={handleLoadMore}
									onAddToWishlist={handleAddToWishlist}
									onQuickView={handleQuickView}
									onAddToCart={handleAddToCart}
								/>
							</div>
						</div>
					</div>

					{/* Mobile Filter Panel */}
					{isMobile && (
						<FilterPanel
							isOpen={isFilterPanelOpen}
							onClose={() => setIsFilterPanelOpen(false)}
							filters={filters}
							onFiltersChange={handleFiltersChange}
							isMobile={true}
						/>
					)}

					{/* Quick View Modal */}
					<QuickViewModal
						product={selectedProduct}
						isOpen={isQuickViewOpen}
						onClose={() => setIsQuickViewOpen(false)}
						onAddToCart={handleAddToCart}
						onAddToWishlist={handleAddToWishlist}
					/>

					{/* Mobile Bottom Padding for Navigation */}
					<div className="h-16 md:hidden" />
				</div>
			</RoleContextNavigation>
		</RoleProvider>
	);
};

export default MarketplaceBrowse;