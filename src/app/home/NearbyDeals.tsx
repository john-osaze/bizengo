import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import Image from '@/components/ui/AppImage';

// Updated interface to match API response
interface Product {
    id: number;
    product_name: string;
    product_price: number;
    description: string;
    category: string;
    images: string[];
    status: string;
    visibility: boolean;
    vendor: {
        business_name: string;
        email: string;
        id: number;
    };
}

interface ApiResponse {
    count: number;
    products: Product[];
}

interface NearbyDealsProps {
    onRefresh: () => Promise<void>;
}

const NearbyDeals: React.FC<NearbyDealsProps> = ({ onRefresh }) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Fetch products from API
    const fetchProducts = async () => {
        try {
            setError(null);
            const response = await fetch('https://rsc-kl61.onrender.com/api/marketplace/popular-products', {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ApiResponse = await response.json();
            setProducts(data.products);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch products');
        }
    };

    // Initial load
    useEffect(() => {
        fetchProducts();
    }, []);

    // Generate mock values for missing API data
    const generateDealData = (product: Product) => {
        // Generate consistent random values based on product ID
        const seed = product.id;
        const random = (min: number, max: number) => 
            Math.floor((Math.sin(seed * 9999) * 10000) % (max - min + 1)) + min;

        const discount = random(10, 35);
        const originalPrice = Math.round(product.product_price / (1 - discount / 100));
        
        return {
            originalPrice,
            discount,
            distance: `${(random(1, 20) / 10).toFixed(1)} miles`,
            rating: (random(40, 50) / 10),
            condition: ['New', 'Like New', 'Open Box'][random(0, 2)]
        };
    };

    const handleDealClick = (product: Product) => {
        router.push(`/product-detail?id=${product.id}`);
    };

    const handleRefresh = async () => {
        setIsLoading(true);
        try {
            await fetchProducts();
            await onRefresh();
        } catch (err) {
            console.error('Error during refresh:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-text-secondary mb-4">Failed to load products: {error}</p>
                <button
                    onClick={handleRefresh}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="hidden md:block absolute -top-12 right-12">
                <button
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-3 py-2 text-text-secondary hover:text-text-primary transition-colors duration-200"
                >
                    <Icon
                        name="RefreshCw"
                        size={16}
                        className={isLoading ? 'animate-spin' : ''}
                    />
                    <span className="text-sm">Refresh</span>
                </button>
            </div>

            <div className="overflow-x-auto scrollbar-hide">
                <div className="flex space-x-4 pb-4">
                    {isLoading && products.length === 0 ? (
                        // Loading skeleton
                        Array.from({ length: 4 }).map((_, index) => (
                            <div
                                key={index}
                                className="flex-shrink-0 w-72 bg-surface rounded-lg border border-border animate-pulse"
                            >
                                <div className="w-full h-48 bg-gray-300 rounded-t-lg"></div>
                                <div className="p-4">
                                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                                    <div className="h-6 bg-gray-300 rounded w-24 mb-2"></div>
                                    <div className="h-4 bg-gray-300 rounded w-32 mb-3"></div>
                                    <div className="h-8 bg-gray-300 rounded"></div>
                                </div>
                            </div>
                        ))
                    ) : products.length === 0 ? (
                        <div className="flex-shrink-0 w-72 text-center py-8 text-text-secondary">
                            No products available
                        </div>
                    ) : (
                        products.map((product) => {
                            const dealData = generateDealData(product);
                            
                            return (
                                <div
                                    key={product.id}
                                    onClick={() => handleDealClick(product)}
                                    className="flex-shrink-0 w-72 bg-surface rounded-lg border border-border hover:shadow-elevation-2 transition-all duration-200 cursor-pointer"
                                >
                                    <div className="relative overflow-hidden rounded-t-lg w-full h-48">
                                        <Image
                                            src={product.images[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                                            alt={product.product_name}
                                            fill={true}
                                            className="object-cover"
                                            sizes="288px"
                                        />
                                        <div className="absolute top-3 left-3 bg-accent text-black px-2 py-1 rounded-full text-xs font-medium">
                                            {dealData.discount}% OFF
                                        </div>
                                        <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                                            {dealData.distance}
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-base font-medium text-text-primary line-clamp-2 flex-1">
                                                {product.product_name}
                                            </h3>
                                            <button className="ml-2 p-1 rounded-full hover:bg-surface-secondary transition-colors duration-200">
                                                <Icon name="Heart" size={16} className="text-text-secondary" />
                                            </button>
                                        </div>

                                        <div className="flex items-center space-x-2 mb-2">
                                            <span className="text-lg font-semibold text-text-primary">
                                                ₦{product.product_price.toLocaleString()}
                                            </span>
                                            <span className="text-sm text-text-secondary line-through">
                                                ₦{dealData.originalPrice.toLocaleString()}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between text-sm text-text-secondary mb-3">
                                            <span className="bg-success-50 text-success px-2 py-1 rounded-full text-xs">
                                                {dealData.condition}
                                            </span>
                                            <div className="flex items-center space-x-1">
                                                <Icon name="Star" size={12} className="text-warning fill-current" />
                                                <span>{dealData.rating.toFixed(1)}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-text-secondary">
                                                {product.vendor.business_name}
                                            </span>
                                            <button className="bg-primary text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors duration-200">
                                                View Deal
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default NearbyDeals;