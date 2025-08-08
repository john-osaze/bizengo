'use client'

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import Icon from '@/components/AppIcon';
import { Search, MapPin, ShoppingBag, Star, Filter, ChevronDown, Car, Wrench, GraduationCap, Users, Heart, Monitor, Home, Shirt, Package, Truck } from 'lucide-react';

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

interface Category {
    name: string;
    icon: React.ReactNode;
}

const Homepage: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [distance, setDistance] = useState<string>('2 km');
    const [sortBy, setSortBy] = useState<string>('Popularity');
    const [openOnly, setOpenOnly] = useState<boolean>(false);
    const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<string>('Popular Categories');
    const router = useRouter();

    const categories: Category[] = [
        { name: 'Food', icon: <Package className="w-5 h-5" /> },
        { name: 'Fashion', icon: <Shirt className="w-5 h-5" /> },
        { name: 'Home', icon: <Home className="w-5 h-5" /> },
        { name: 'Electronics', icon: <Monitor className="w-5 h-5" /> },
        { name: 'Beauty', icon: <Heart className="w-5 h-5" /> },
        { name: 'Maintenance', icon: <Wrench className="w-5 h-5" /> },
        { name: 'Transportation', icon: <Car className="w-5 h-5" /> },
        { name: 'Health', icon: <Heart className="w-5 h-5" /> },
        { name: 'Trainings', icon: <GraduationCap className="w-5 h-5" /> },
        { name: 'Local Artisans', icon: <Users className="w-5 h-5" /> }
    ];

    const storefronts: Storefront[] = [
        {
            id: 1,
            name: 'Green Leaf Market',
            description: 'Grocery store',
            distance: '1,2 km away',
            category: 'Food',
            image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=250&fit=crop',
            isOpen: true,
            isVerified: true
        },
        {
            id: 2,
            name: 'Trendy Threads',
            description: 'Clothing boutique',
            distance: '0,8 km away',
            category: 'Fashion',
            image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=250&fit=crop',
            isOpen: true,
            isVerified: true
        },
        {
            id: 3,
            name: 'Fix-It Fast',
            description: 'Repair service',
            distance: '3,1 km away',
            category: 'Maintenance',
            image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=400&h=250&fit=crop',
            isOpen: true,
            isVerified: true
        }
    ];

    const tabs = ['Popular Categories', 'Featured Storefronts', 'Shop by Distance', 'Service Tags', 'Buyer Intent'];

    const handleSearch = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search-results?q=${encodeURIComponent(searchQuery.trim())}`); // Use router.push
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 py-20">
                <div className="flex items-center justify-between">
                    <div className="max-w-md">
                        <h1 className="text-5xl font-bold text-white mb-6">
                            Buy. Sell.<br />Connect.
                        </h1>
                        <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                            Discover a smarter way to trade locally. Instantly connect with buyers and sellers near you in real-time—fast, simple, and reliable.
                        </p>
                        <div className="flex-1 max-w-md mb-6">
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
                        <div className="flex space-x-4">
                            <button onClick={() => router.push("/vendor/dashboard")}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                                Create Storefront
                            </button>
                            <button onClick={() => router.push("/marketplace")}
                                className="border border-white/30  text-white hover:bg-orange-500/20 hover:border-orange-500 px-6 py-3 rounded-lg font-semibold transition-colors">
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

            {/* Navigation Tabs */}
            <section className="bg-white/10 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex space-x-8 py-4">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`text-sm font-medium transition-colors border-b-2 pb-2 ${activeTab === tab
                                    ? 'text-white border-orange-400'
                                    : 'text-blue-200 border-transparent hover:text-white'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-4">
                        {categories.map((category) => (
                            <button
                                key={category.name}
                                className="flex flex-col items-center space-y-2 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow group"
                            >
                                <div className="text-gray-600 group-hover:text-orange-500 transition-colors">
                                    {category.icon}
                                </div>
                                <span className="text-xs text-gray-700 text-center font-medium">
                                    {category.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Storefronts Section */}
            <section className="bg-gray-50 py-12">
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
                    <div className="flex items-center space-x-4 mb-8 bg-white p-4 rounded-lg shadow-sm overflow-x-auto">
                        <div className="flex items-center space-x-2">
                            <label className="text-gray-700 font-medium text-sm">Category</label>
                            <div className="relative">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="appearance-none border border-gray-300 rounded px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="All">All</option>
                                    <option value="Food">Food</option>
                                    <option value="Fashion">Fashion</option>
                                    <option value="Maintenance">Maintenance</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <label className="text-gray-700 font-medium text-sm">Distance</label>
                            <div className="relative">
                                <select
                                    value={distance}
                                    onChange={(e) => setDistance(e.target.value)}
                                    className="appearance-none border border-gray-300 rounded px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="1 km">1 km</option>
                                    <option value="2 km">2 km</option>
                                    <option value="5 km">5 km</option>
                                    <option value="10 km">10 km</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            </div>
                        </div>

                        <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                </div>

                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={openOnly}
                                        onChange={(e) => setOpenOnly(e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`w-10 h-6 rounded-full transition-colors ${openOnly ? 'bg-blue-500' : 'bg-gray-300'}`}>
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${openOnly ? 'translate-x-5' : 'translate-x-1'} mt-1`}></div>
                                    </div>
                                </label>

                                <span className="text-gray-700">Open Now</span>
                            </div>

                            <div className="flex items-center space-x-2">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={verifiedOnly}
                                        onChange={(e) => setVerifiedOnly(e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`w-10 h-6 rounded-full transition-colors ${verifiedOnly ? 'bg-blue-500' : 'bg-gray-300'}`}>
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${verifiedOnly ? 'translate-x-5' : 'translate-x-1'} mt-1`}></div>
                                    </div>
                                </label>
                                <span className="text-gray-700">Verified Only</span>
                            </div>
                        </div>
                    </div>

                    {/* Storefront Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {storefronts.map((store) => (
                            <div key={store.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="h-48 relative overflow-hidden">
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
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{store.name}</h3>
                                    <p className="text-gray-600 text-sm mb-3">{store.description}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-1 text-gray-500">
                                            <MapPin className="w-4 h-4" />
                                            <span className="text-sm">{store.distance}</span>
                                        </div>
                                        <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                                            View Store
                                        </button>
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

export default Homepage;