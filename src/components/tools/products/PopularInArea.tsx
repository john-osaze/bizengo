import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import Image from '@/components/ui/AppImage';

interface PopularItem {
    id: number;
    title: string;
    price: number;
    image: string;
    distance: string;
    seller: string;
    rating: number;
    reviews: number;
    popularity: number;
    category: string;
}

const PopularInArea: React.FC = () => {
    const router = useRouter();
    const [wishlist, setWishlist] = useState<Set<number>>(new Set());

    const popularItems: PopularItem[] = [
        {
            id: 1,
            title: "AirPods Pro 2nd Gen",
            price: 199,
            image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400",
            distance: "0.6 miles",
            seller: "Apple Store",
            rating: 4.9,
            reviews: 156,
            popularity: 95,
            category: "Electronics"
        },
        {
            id: 2,
            title: "Instant Pot Duo 7-in-1",
            price: 79,
            image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
            distance: "1.2 miles",
            seller: "Kitchen Essentials",
            rating: 4.7,
            reviews: 89,
            popularity: 88,
            category: "Home & Kitchen"
        },
        {
            id: 3,
            title: "Adidas Ultraboost 22",
            price: 139,
            image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
            distance: "0.9 miles",
            seller: "SportZone",
            rating: 4.6,
            reviews: 203,
            popularity: 92,
            category: "Sports"
        },
        {
            id: 4,
            title: "Kindle Paperwhite",
            price: 109,
            image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
            distance: "1.8 miles",
            seller: "BookWorld",
            rating: 4.8,
            reviews: 67,
            popularity: 85,
            category: "Books"
        },
        {
            id: 5,
            title: "Dyson V15 Detect",
            price: 649,
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
            distance: "2.1 miles",
            seller: "Home Appliances",
            rating: 4.5,
            reviews: 134,
            popularity: 90,
            category: "Home & Garden"
        },
        {
            id: 6,
            title: "Samsung 55\" 4K TV",
            price: 499,
            image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400",
            distance: "1.4 miles",
            seller: "Electronics Plus",
            rating: 4.4,
            reviews: 78,
            popularity: 87,
            category: "Electronics"
        },
        {
            id: 7,
            title: "Levi\'s 501 Original Jeans",
            price: 59,
            image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
            distance: "0.7 miles",
            seller: "Fashion Hub",
            rating: 4.3,
            reviews: 92,
            popularity: 83,
            category: "Clothing"
        },
        {
            id: 8,
            title: "KitchenAid Stand Mixer",
            price: 299,
            image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
            distance: "1.6 miles",
            seller: "Culinary Store",
            rating: 4.9,
            reviews: 145,
            popularity: 94,
            category: "Home & Kitchen"
        }
    ];

    const handleItemClick = (item: PopularItem) => {
        router.push(`/tools/find-products/product-details?id=${item.id}`);
    };

    const toggleWishlist = (e: React.MouseEvent, itemId: number) => {
        e.stopPropagation();
        setWishlist(prev => {
            const newWishlist = new Set(prev);
            if (newWishlist.has(itemId)) {
                newWishlist.delete(itemId);
            } else {
                newWishlist.add(itemId);
            }
            return newWishlist;
        });
    };

    const getPopularityColor = (popularity: number): string => {
        if (popularity >= 90) return 'text-success';
        if (popularity >= 80) return 'text-warning';
        return 'text-text-secondary';
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {popularItems.map((item) => (
                <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="bg-surface rounded-lg border border-border hover:shadow-elevation-2 transition-all duration-200 cursor-pointer"
                >
                    {/* Image */}
                    {/* Moved w-full h-32 md:h-40 here */}
                    <div className="relative overflow-hidden rounded-t-lg w-full h-32 md:h-40">
                        <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover" // Removed w-full h-32 md:h-40 from here
                            // Add sizes prop. This is crucial for responsive grids.
                            // Based on grid-cols-2/3/4:
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                        <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded-full text-xs font-medium">
                            #{item.popularity}% Popular
                        </div>
                        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                            {item.distance}
                        </div>
                        <button
                            onClick={(e) => toggleWishlist(e, item.id)}
                            className="absolute bottom-2 right-2 p-2 bg-white bg-opacity-90 rounded-full hover:bg-white transition-colors duration-200"
                        >
                            <Icon
                                name="Heart"
                                size={14}
                                className={wishlist.has(item.id) ? 'text-accent fill-current' : 'text-text-secondary'}
                            />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-3">
                        <div className="flex items-start justify-between mb-2">
                            <h3 className="text-sm font-medium text-text-primary line-clamp-2 flex-1">
                                {item.title}
                            </h3>
                        </div>

                        <div className="flex items-center justify-between mb-2">
                            <span className="text-base font-semibold text-text-primary">${item.price}</span>
                            <span className={`text-xs font-medium ${getPopularityColor(item.popularity)}`}>
                                🔥 Hot
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-text-secondary mb-2">
                            <div className="flex items-center space-x-1">
                                <Icon name="Star" size={10} className="text-warning fill-current" />
                                <span>{item.rating}</span>
                                <span>({item.reviews})</span>
                            </div>
                            <span className="bg-surface-secondary px-2 py-1 rounded-full">
                                {item.category}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-xs text-text-secondary">{item.seller}</span>
                            <button className="bg-primary text-white px-2 py-1 rounded text-xs font-medium hover:bg-primary-700 transition-colors duration-200">
                                Quick View
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PopularInArea;