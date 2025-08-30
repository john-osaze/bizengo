"use client";

import React, { useState, useEffect, useCallback } from "react";
// import { useSearchParams } from 'next/navigation';
import RoleContextNavigation, {
  RoleProvider,
} from "@/components/ui/RoleContextNavigation";
import Icon from "@/components/AppIcon";
import Button from "@/components/ui/new/Button";
import ProductGrid from "./components/ProductGrid";
import FilterPanel from "./components/FilterPanel";
import FilterChips from "./components/FilterChips";
import SortDropdown from "./components/SortDropdown";
import QuickViewModal from "./components/QuickViewModal";
import { useRouter } from "next/navigation";

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

type SortOption =
  | "relevance"
  | "price-low"
  | "price-high"
  | "rating"
  | "newest"
  | "popular"
  | "category";

type FilterType =
  | "category"
  | "vendor"
  | "priceRange"
  | "rating"
  | "availability";

// API Response interfaces based on your provided structure
interface ApiVendor {
  business_name: string;
  email: string;
  id: number;
}

interface ApiProduct {
  category: string;
  description: string;
  id: number;
  images: string[];
  product_name: string;
  product_price: number;
  status: string;
  vendor: ApiVendor;
  visibility: boolean;
}

interface ApiResponse {
  count: number;
  products: ApiProduct[];
}

const MarketplaceBrowse: React.FC = () => {
  // const searchParams = useSearchParams()
  // const [searchParameters, setSearchParameters] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]); // Store all fetched products
  const [loading, setLoading] = useState<boolean>(true);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const mobileWidth = window.innerWidth < 768;
    setIsMobile(mobileWidth);
  }, []);

  const [filters, setFilters] = useState<Filters>({
    categories: [],
    vendors: [],
    priceRange: { min: "", max: "" },
    minRating: 0,
    availability: {
      inStock: false,
      onSale: false,
      freeShipping: false,
    },
  });

  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const router = useRouter();

  // API URL
  const API_URL = "https://server.bizengo.com/api/marketplace/popular-products";

  // Function to transform API response to our Product interface
  const transformApiProduct = (apiProduct: ApiProduct): Product => {
    return {
      id: apiProduct.id,
      name: apiProduct.product_name,
      vendor: apiProduct.vendor.business_name,
      price: apiProduct.product_price / 100, // Convert from cents to dollars if needed, adjust as necessary
      salePrice: undefined, // Not provided in API, could add logic later
      originalPrice: apiProduct.product_price / 100,
      rating: 4.5, // Default rating since not provided in API
      reviewCount: Math.floor(Math.random() * 200) + 10, // Random review count since not provided
      image: apiProduct.images[0] || "https://via.placeholder.com/400x400",
      images: apiProduct.images,
      stock: apiProduct.status === "active" && apiProduct.visibility ? 10 : 0, // Default stock logic
      category: apiProduct.category.toLowerCase(),
      isWishlisted: false,
      description: apiProduct.description,
    };
  };

  // Fetch products from API
  const fetchProductsFromAPI = async (): Promise<Product[]> => {
    try {
      setFetchError(null);

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      // Transform API products to our Product interface
      const transformedProducts = data.products
        .filter((product) => product.status === "active" && product.visibility) // Only active and visible products
        .map(transformApiProduct);

      return transformedProducts;
    } catch (error) {
      console.error("Error fetching products:", error);
      setFetchError("Failed to load products. Please try again later.");
      return [];
    }
  };

  useEffect(() => {
    const handleResize = (): void => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [router]);

  // Initial load of products from API
  useEffect(() => {
    const initializeProducts = async () => {
      setLoading(true);
      const fetchedProducts = await fetchProductsFromAPI();
      setAllProducts(fetchedProducts);
      setLoading(false);
    };

    initializeProducts();
  }, []);

  // Filter and sort products when filters/search/sort changes
  useEffect(() => {
    loadProducts(true);
  }, [filters, sortBy, searchQuery, allProducts]);

  const loadProducts = useCallback(
    async (reset: boolean = false): Promise<void> => {
      if (allProducts.length === 0 && !loading) return;

      setLoading(reset);

      // Start with all fetched products
      let filteredProducts = [...allProducts];

      // Apply search filter
      if (searchQuery) {
        filteredProducts = filteredProducts.filter(
          (product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
        );
      }

      // Apply category filter
      if (filters.categories.length > 0) {
        filteredProducts = filteredProducts.filter((product) =>
          filters.categories.includes(product.category)
        );
      }

      // Apply vendor filter
      if (filters.vendors.length > 0) {
        filteredProducts = filteredProducts.filter((product) =>
          filters.vendors.includes(
            product.vendor.toLowerCase().replace(/\s+/g, "")
          )
        );
      }

      // Apply price range filter
      if (filters.priceRange.min || filters.priceRange.max) {
        const min = parseFloat(filters.priceRange.min) || 0;
        const max = parseFloat(filters.priceRange.max) || Infinity;
        filteredProducts = filteredProducts.filter((product) => {
          const price = product.salePrice || product.price;
          return price >= min && price <= max;
        });
      }

      // Apply rating filter
      if (filters.minRating > 0) {
        filteredProducts = filteredProducts.filter(
          (product) => product.rating >= filters.minRating
        );
      }

      // Apply availability filters
      if (filters.availability.inStock) {
        filteredProducts = filteredProducts.filter(
          (product) => product.stock > 0
        );
      }

      if (filters.availability.onSale) {
        filteredProducts = filteredProducts.filter(
          (product) => product.salePrice
        );
      }

      // Apply sorting
      switch (sortBy) {
        case "price-low":
          filteredProducts.sort(
            (a, b) => (a.salePrice || a.price) - (b.salePrice || b.price)
          );
          break;
        case "price-high":
          filteredProducts.sort(
            (a, b) => (b.salePrice || b.price) - (a.salePrice || a.price)
          );
          break;
        case "rating":
          filteredProducts.sort((a, b) => b.rating - a.rating);
          break;
        case "newest":
          filteredProducts.sort((a, b) => b.id - a.id);
          break;
        case "popular":
          filteredProducts.sort((a, b) => b.reviewCount - a.reviewCount);
          break;
        case "category":
          filteredProducts.sort((a, b) => a.category.localeCompare(b.category));
          break;
        default:
          // relevance - keep original order
          break;
      }

      const itemsPerPage = 12;
      if (reset) {
        setProducts(filteredProducts.slice(0, itemsPerPage));
        setCurrentPage(1);
        setHasMore(filteredProducts.length > itemsPerPage);
      } else {
        const startIndex = currentPage * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setProducts((prev) => [
          ...prev,
          ...filteredProducts.slice(startIndex, endIndex),
        ]);
        setHasMore(filteredProducts.length > endIndex);
      }

      setLoading(false);
    },
    [filters, sortBy, searchQuery, currentPage, allProducts, loading]
  );

  const handleLoadMore = useCallback(async (): Promise<void> => {
    if (!loading && hasMore) {
      setCurrentPage((prev) => prev + 1);
      await loadProducts(false);
    }
  }, [loadProducts, loading, hasMore]);

  const handleFiltersChange = (newFilters: Filters): void => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleRemoveFilter = (type: FilterType, value: string): void => {
    const newFilters = { ...filters };

    switch (type) {
      case "category":
        newFilters.categories = newFilters.categories.filter(
          (id) => id !== value
        );
        break;
      case "vendor":
        newFilters.vendors = newFilters.vendors.filter((id) => id !== value);
        break;
      case "priceRange":
        newFilters.priceRange = { min: "", max: "" };
        break;
      case "rating":
        newFilters.minRating = 0;
        break;
      case "availability":
        newFilters.availability[value as keyof AvailabilityFilters] = false;
        break;
    }

    setFilters(newFilters);
  };

  const handleClearAllFilters = (): void => {
    const clearedFilters: Filters = {
      categories: [],
      vendors: [],
      priceRange: { min: "", max: "" },
      minRating: 0,
      availability: {
        inStock: false,
        onSale: false,
        freeShipping: false,
      },
    };
    setFilters(clearedFilters);
  };

  const handleAddToWishlist = (
    productId: number | string,
    isWishlisted: boolean
  ): void => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId ? { ...product, isWishlisted } : product
      )
    );
  };

  const handleQuickView = (product: Product | any): void => {
    setSelectedProduct(product);
    setIsQuickViewOpen(true);
  };

  const handleAddToCart = (product: Product): void => {
    // Simulate adding to cart
    console.log("Added to cart:", product);
    // You would typically dispatch to a cart context or state management here
  };

  const getActiveFiltersCount = (): number => {
    return (
      filters.categories.length +
      filters.vendors.length +
      (filters.priceRange.min || filters.priceRange.max ? 1 : 0) +
      (filters.minRating > 0 ? 1 : 0) +
      Object.values(filters.availability).filter(Boolean).length
    );
  };

  // Refresh products function for manual refresh
  const handleRefreshProducts = async (): Promise<void> => {
    setLoading(true);
    const fetchedProducts = await fetchProductsFromAPI();
    setAllProducts(fetchedProducts);
    setCurrentPage(1);
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
                        {searchQuery
                          ? `Search results for "${searchQuery}"`
                          : "All Products"}
                      </h1>
                      <span className="text-sm text-muted-foreground">
                        {loading
                          ? "Loading..."
                          : `${products.length} products found`}
                      </span>
                      {fetchError && (
                        <span className="text-sm text-destructive">
                          {fetchError}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Refresh Button */}
                      <Button
                        variant="outline"
                        onClick={handleRefreshProducts}
                        iconName="RefreshCw"
                        iconPosition="left"
                        size="sm"
                      >
                        Refresh
                      </Button>

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
                    <span className="text-sm text-muted-foreground">
                      Sort by:
                    </span>
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
