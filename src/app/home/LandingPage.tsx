import React, { useState } from 'react';
import { Search, MapPin, ShoppingBag, Users, Package } from 'lucide-react';

interface Storefront {
    id: number;
    name: string;
    description: string;
    distance: string;
    category: string;
    image: string;
    isOpen: boolean;
    isVerified: boolean;
}

const LandingPage: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [distance, setDistance] = useState<string>('2 km');
    const [openOnly, setOpenOnly] = useState<boolean>(true);
    const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);

    const storefronts: Storefront[] = [
        {
            id: 1,
            name: 'Green Grove',
            description: 'Plant nursery. Florinn store.',
            distance: '1,2 km away',
            category: 'Garden & Plants',
            image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop',
            isOpen: true,
            isVerified: true
        },
        {
            id: 2,
            name: 'Tech Haven',
            description: 'Electronics exdcstore.',
            distance: '1,8 km away',
            category: 'Electronics',
            image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=200&fit=crop',
            isOpen: true,
            isVerified: true
        },
        {
            id: 3,
            name: 'Trendy Threads',
            description: 'Clothing store.',
            distance: '2,5 km away',
            category: 'Fashion',
            image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop',
            isOpen: true,
            isVerified: true
        },
        {
            id: 4,
            name: 'Bloom Boutique',
            description: 'Flower shop. Flower shop.',
            distance: '2,5 km away',
            category: 'Flowers',
            image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=200&fit=crop',
            isOpen: true,
            isVerified: true
        }
    ];

    const filteredStorefronts = storefronts.filter(store => {
        if (selectedCategory !== 'All' && store.category !== selectedCategory) return false;
        if (openOnly && !store.isOpen) return false;
        if (verifiedOnly && !store.isVerified) return false;
        return true;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 py-32">
                <div className="flex items-center justify-between">
                    <div className="max-w-md">
                        <h1 className="text-5xl font-bold text-white mb-6">
                            Buy. Sell.<br />Connect.
                        </h1>
                        <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                            Discover a smarter way to trade locally.
                            Instantly connect with buyers and
                            sellers near you in real-time—fast,
                            simple, and reliable.
                        </p>
                        <div className="flex space-x-4">
                            <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                                Create Storefront
                            </button>
                            <button className="border border-white/30 text-white hover:bg-white/10 px-6 py-3 rounded-lg font-semibold transition-colors">
                                Explore Marketplace
                            </button>
                        </div>
                    </div>

                    {/* Hero Illustration */}
                    <div className="relative">
                        <div className="w-80 h-80 relative">
                            {/* Location Pin */}
                            <div className="absolute top-8 right-12 bg-orange-500 rounded-full p-3 shadow-lg">
                                <ShoppingBag className="w-6 h-6 text-white" />
                            </div>

                            {/* Store Front */}
                            <div className="absolute bottom-16 right-8 bg-white rounded-lg p-4 shadow-xl w-32 h-24">
                                <div className="bg-orange-500 w-full h-2 rounded-t-lg mb-2"></div>
                                <div className="flex space-x-1">
                                    <div className="bg-blue-200 w-8 h-8 rounded"></div>
                                    <div className="bg-orange-200 w-8 h-8 rounded"></div>
                                </div>
                            </div>

                            {/* People */}
                            <div className="absolute bottom-8 left-8">
                                <div className="flex space-x-4">
                                    <div className="w-12 h-16 bg-orange-400 rounded-t-full"></div>
                                    <div className="w-12 h-16 bg-blue-600 rounded-t-full"></div>
                                </div>
                            </div>

                            {/* Floating Elements */}
                            <div className="absolute top-4 left-4 w-4 h-4 bg-orange-400 rounded"></div>
                            <div className="absolute top-12 right-4 w-3 h-3 bg-orange-300 rounded"></div>
                            <div className="absolute bottom-4 right-20 w-6 h-6 bg-orange-500 rounded"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Storefronts Section */}
            <section className="bg-gray-50 min-h-screen py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            Explore Nearby Storefronts
                        </h2>
                        <p className="text-gray-600">
                            Find the best local services and products from verified sellers.
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="flex items-center space-x-6 mb-8 bg-white p-4 rounded-lg shadow-sm">
                        <div className="flex items-center space-x-2">
                            <label className="text-gray-700 font-medium">Category</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="All">All</option>
                                <option value="Garden & Plants">Garden & Plants</option>
                                <option value="Electronics">Electronics</option>
                                <option value="Fashion">Fashion</option>
                                <option value="Flowers">Flowers</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <label className="text-gray-700 font-medium">Distance</label>
                            <select
                                value={distance}
                                onChange={(e) => setDistance(e.target.value)}
                                className="border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="1 km">1 km</option>
                                <option value="2 km">2 km</option>
                                <option value="5 km">5 km</option>
                                <option value="10 km">10 km</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                <span className="text-gray-700">Open Now</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={openOnly}
                                    onChange={(e) => setOpenOnly(e.target.checked)}
                                    className="sr-only"
                                />
                                <div className={`w-10 h-6 rounded-full transition-colors ${openOnly ? 'bg-orange-500' : 'bg-gray-300'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${openOnly ? 'translate-x-5' : 'translate-x-1'} mt-1`}></div>
                                </div>
                            </label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <span className="text-gray-700">Verified Only</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={verifiedOnly}
                                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                                    className="sr-only"
                                />
                                <div className={`w-10 h-6 rounded-full transition-colors ${verifiedOnly ? 'bg-orange-500' : 'bg-gray-300'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${verifiedOnly ? 'translate-x-5' : 'translate-x-1'} mt-1`}></div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Storefront Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                        {filteredStorefronts.map((store) => (
                            <div key={store.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 relative overflow-hidden">
                                    <img
                                        src={store.image}
                                        alt={store.name}
                                        className="w-full h-full object-cover"
                                    />
                                    {store.isVerified && (
                                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                                            Verified
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{store.name}</h3>
                                    <p className="text-gray-600 mb-3">{store.description}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-1 text-gray-500">
                                            <MapPin className="w-4 h-4" />
                                            <span className="text-sm">{store.distance}</span>
                                        </div>
                                        {store.isOpen && (
                                            <div className="flex items-center space-x-1 text-green-600">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <span className="text-sm">Open Now</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;