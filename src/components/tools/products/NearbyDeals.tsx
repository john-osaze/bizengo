import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import Image from '@/components/ui/AppImage';

interface Deal {
    id: number;
    title: string;
    price: number;
    originalPrice: number;
    image: string;
    distance: string;
    seller: string;
    rating: number;
    discount: number;
    condition: string;
}

interface NearbyDealsProps {
    onRefresh: () => Promise<void>;
}

const NearbyDeals: React.FC<NearbyDealsProps> = ({ onRefresh }) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const deals: Deal[] = [
        {
            id: 1,
            title: "iPhone 14 Pro Max",
            price: 899,
            originalPrice: 1099,
            image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400",
            distance: "0.3 miles",
            seller: "TechStore Plus",
            rating: 4.8,
            discount: 18,
            condition: "Like New"
        },
        {
            id: 2,
            title: "Gaming Chair RGB",
            price: 199,
            originalPrice: 299,
            image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
            distance: "0.7 miles",
            seller: "GameZone",
            rating: 4.6,
            discount: 33,
            condition: "New"
        },
        {
            id: 3,
            title: "MacBook Air M2",
            price: 999,
            originalPrice: 1199,
            image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
            distance: "1.2 miles",
            seller: "Apple Certified",
            rating: 4.9,
            discount: 17,
            condition: "Open Box"
        },
        {
            id: 4,
            title: "Sony WH-1000XM5",
            price: 299,
            originalPrice: 399,
            image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400",
            distance: "0.5 miles",
            seller: "AudioWorld",
            rating: 4.7,
            discount: 25,
            condition: "New"
        }
    ];

    const handleDealClick = (deal: Deal) => {
        router.push(`/tools/find-products/product-details?id=${deal.id}`);
    };

    const handleRefresh = async () => {
        setIsLoading(true);
        await onRefresh();
        setIsLoading(false);
    };

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
                    {deals.map((deal) => (
                        <div
                            key={deal.id}
                            onClick={() => handleDealClick(deal)}
                            className="flex-shrink-0 w-72 bg-surface rounded-lg border border-border hover:shadow-elevation-2 transition-all duration-200 cursor-pointer"
                        >

                            <div className="relative overflow-hidden rounded-t-lg w-full h-48">
                                <Image
                                    src={deal.image}
                                    alt={deal.title}
                                    fill={true}
                                    className="object-cover"
                                    sizes="288px"
                                />
                                <div className="absolute top-3 left-3 bg-accent text-white px-2 py-1 rounded-full text-xs font-medium">
                                    {deal.discount}% OFF
                                </div>
                                <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                                    {deal.distance}
                                </div>
                            </div>


                            <div className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-base font-medium text-text-primary line-clamp-2 flex-1">
                                        {deal.title}
                                    </h3>
                                    <button className="ml-2 p-1 rounded-full hover:bg-surface-secondary transition-colors duration-200">
                                        <Icon name="Heart" size={16} className="text-text-secondary" />
                                    </button>
                                </div>

                                <div className="flex items-center space-x-2 mb-2">
                                    <span className="text-lg font-semibold text-text-primary">${deal.price}</span>
                                    <span className="text-sm text-text-secondary line-through">${deal.originalPrice}</span>
                                </div>

                                <div className="flex items-center justify-between text-sm text-text-secondary mb-3">
                                    <span className="bg-success-50 text-success px-2 py-1 rounded-full text-xs">
                                        {deal.condition}
                                    </span>
                                    <div className="flex items-center space-x-1">
                                        <Icon name="Star" size={12} className="text-warning fill-current" />
                                        <span>{deal.rating}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-text-secondary">{deal.seller}</span>
                                    <button className="bg-primary text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors duration-200">
                                        View Deal
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NearbyDeals;