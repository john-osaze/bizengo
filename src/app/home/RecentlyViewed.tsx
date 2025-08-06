import React from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import Image from '@/components/ui/AppImage';

interface RecentItem {
    id: number;
    title: string;
    price: number;
    image: string;
    distance: string;
    seller: string;
    viewedAt: string;
    isAvailable: boolean;
}

const RecentlyViewed: React.FC = () => {
    const router = useRouter();

    const recentItems: RecentItem[] = [
        {
            id: 1,
            title: "Vintage Leather Jacket",
            price: 89,
            image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400",
            distance: "1.1 miles",
            seller: "Vintage Finds",
            viewedAt: "2 hours ago",
            isAvailable: true
        },
        {
            id: 2,
            title: "Coffee Table - Oak Wood",
            price: 150,
            image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
            distance: "0.8 miles",
            seller: "Home Decor Co",
            viewedAt: "5 hours ago",
            isAvailable: true
        },
        {
            id: 3,
            title: "Nintendo Switch OLED",
            price: 299,
            image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400",
            distance: "2.3 miles",
            seller: "GameHub",
            viewedAt: "1 day ago",
            isAvailable: false
        },
        {
            id: 4,
            title: "Yoga Mat Premium",
            price: 45,
            image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400",
            distance: "0.4 miles",
            seller: "FitLife Store",
            viewedAt: "1 day ago",
            isAvailable: true
        },
        {
            id: 5,
            title: "Wireless Earbuds Pro",
            price: 129,
            image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400",
            distance: "1.5 miles",
            seller: "AudioTech",
            viewedAt: "2 days ago",
            isAvailable: true
        },
        {
            id: 6,
            title: "Mountain Bike 21-Speed",
            price: 399,
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
            distance: "3.1 miles",
            seller: "Bike World",
            viewedAt: "3 days ago",
            isAvailable: true
        }
    ];

    const handleItemClick = (item: RecentItem) => {
        router.push(`/product-detail?id=${item.id}`);
    };

    const handleQuickAdd = (e: React.MouseEvent, item: RecentItem) => {
        e.stopPropagation();
        // Mock quick add functionality
        console.log('Quick add:', item.title);
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recentItems.map((item) => (
                <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`bg-surface rounded-lg border border-border hover:shadow-elevation-2 transition-all duration-200 cursor-pointer ${!item.isAvailable ? 'opacity-60' : ''
                        }`}
                >
                    {/* Image */}
                    <div className="relative overflow-hidden rounded-t-lg w-full h-32 md:h-40"> {/* <-- Moved sizing classes here */}
                        <Image
                            src={item.image}
                            fill
                            alt={item.title}
                            className="object-cover" // <-- Removed sizing classes from here
                            // Add sizes prop for proper image optimization based on your responsive grid/layout
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                            {item.distance}
                        </div>
                        {!item.isAvailable && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <span className="text-white text-sm font-medium">Sold</span>
                            </div>
                        )}
                    </div>
                    {/* Content */}
                    <div className="p-3">
                        <h3 className="text-sm font-medium text-text-primary line-clamp-2 mb-2">
                            {item.title}
                        </h3>

                        <div className="flex items-center justify-between mb-2">
                            <span className="text-base font-semibold text-text-primary">${item.price}</span>
                            {item.isAvailable && (
                                <button
                                    onClick={(e) => handleQuickAdd(e, item)}
                                    className="p-1 rounded-full hover:bg-surface-secondary transition-colors duration-200"
                                >
                                    <Icon name="Plus" size={14} className="text-primary" />
                                </button>
                            )}
                        </div>

                        <div className="text-xs text-text-secondary space-y-1">
                            <p>{item.seller}</p>
                            <p>Viewed {item.viewedAt}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RecentlyViewed;