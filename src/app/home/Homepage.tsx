"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Image from "next/image";

import Icon from "@/components/AppIcon";
import {
  Search,
  MapPin,
  ShoppingBag,
  Star,
  Filter,
  ChevronDown,
  Car,
  Wrench,
  GraduationCap,
  Users,
  Heart,
  Monitor,
  Home,
  Shirt,
  Package,
  Truck,
} from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [distance, setDistance] = useState<string>("2 km");
  const [sortBy, setSortBy] = useState<string>("Popularity");
  const [openOnly, setOpenOnly] = useState<boolean>(false);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("Popular Categories");

  const router = useRouter();

  const [location, setLocation] = useState<string>("San Francisco, CA");
  const [category, setCategory] = useState<string>("Any Category");
  const [openNow, setOpenNow] = useState<boolean>(false);
  const [anyCategory, setAnyCategory] = useState<boolean>(false);
  const [userDistance, setUserDistance] = useState<boolean>(false);
  const [isVerifiedOnly, setIsVerifiedOnly] = useState<boolean>(true);

  const categories: Category[] = [
    { name: "Food", icon: <Package className="w-5 h-5" /> },
    { name: "Fashion", icon: <Shirt className="w-5 h-5" /> },
    { name: "Home", icon: <Home className="w-5 h-5" /> },
    { name: "Electronics", icon: <Monitor className="w-5 h-5" /> },
    { name: "Beauty", icon: <Heart className="w-5 h-5" /> },
    { name: "Maintenance", icon: <Wrench className="w-5 h-5" /> },
    { name: "Transportation", icon: <Car className="w-5 h-5" /> },
    { name: "Health", icon: <Heart className="w-5 h-5" /> },
    { name: "Trainings", icon: <GraduationCap className="w-5 h-5" /> },
    { name: "Local Artisans", icon: <Users className="w-5 h-5" /> },
  ];

  const storefronts: Storefront[] = [
    {
      id: 1,
      name: "Green Leaf Market",
      description: "Grocery store",
      distance: "1,2 km away",
      category: "Food",
      image:
        "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=250&fit=crop",
      isOpen: true,
      isVerified: true,
    },
    {
      id: 2,
      name: "Trendy Threads",
      description: "Clothing boutique",
      distance: "0,8 km away",
      category: "Fashion",
      image:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=250&fit=crop",
      isOpen: true,
      isVerified: true,
    },
    {
      id: 3,
      name: "Fix-It Fast",
      description: "Repair service",
      distance: "3,1 km away",
      category: "Maintenance",
      image:
        "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=400&h=250&fit=crop",
      isOpen: true,
      isVerified: true,
    },
  ];

  const tabs = [
    "Popular Categories",
    "Featured Storefronts",
    "Shop by Distance",
    "Service Tags",
    "Buyer Intent",
  ];

  const handleSearch = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        `/search-results?q=${encodeURIComponent(searchQuery.trim())}`
      ); // Use router.push
    }
  };

  return (
    <div className="min-h-screen bg-[#001d3b]">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-28">
        <div className="flex items-center justify-between">
          <div className="max-w-full md:max-w-2xl">
            <h1 className="text-5xl font-bold text-white mb-6">
              Buy. Sell.
              <br />
              Connect.
            </h1>
            <p className="text-blue-100 text-lg mb-8 text-wrap whitespace-normal">
              Discover a smarter way to trade locally. Instantly connect with
              buyers and sellers near you in real-time—fast, simple, and
              reliable.
            </p>
            <div className="hidden md:block hero-search-filters max-w-full">
              <div className="bg-white rounded-lg p-1 flex items-center mb-6 shadow-lg">
                <div className="flex items-center space-x-3 px-4 flex-1">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setLocation(e.target.value)
                    }
                    className="flex-1 outline-none text-gray-800"
                    placeholder="Enter location"
                  />
                </div>

                <div className="h-6 w-px bg-gray-300"></div>

                <div className="flex items-center space-x-3 px-4 flex-1">
                  <select
                    value={category}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setCategory(e.target.value)
                    }
                    className="flex-1 outline-none text-gray-800 bg-transparent appearance-none cursor-pointer"
                  >
                    <option value="Any Category">Any Category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Home & Garden">Home & Garden</option>
                    <option value="Services">Services</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-600 pointer-events-none" />
                </div>

                <div className="h-6 w-px bg-gray-300"></div>

                <button className="px-4 py-2 text-gray-600 hover:text-gray-800">
                  Advanced
                </button>

                <button className="bg-orange-500 text-white px-8 py-3 rounded-md hover:bg-orange-600 transition-colors font-medium">
                  Search
                </button>
              </div>

              {/* Filter Checkboxes */}
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center space-x-3 text-white cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={openNow}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setOpenNow(e.target.checked)
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded border-2 border-white flex items-center justify-center ${
                        openNow ? "bg-white" : "bg-transparent"
                      }`}
                    >
                      {openNow && (
                        <div className="w-2 h-2 bg-slate-800 rounded-sm"></div>
                      )}
                    </div>
                  </div>
                  <span>Open Now</span>
                </label>

                <label className="flex items-center space-x-3 text-white cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={anyCategory}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setAnyCategory(e.target.checked)
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded border-2 border-white flex items-center justify-center ${
                        anyCategory ? "bg-white" : "bg-transparent"
                      }`}
                    >
                      {anyCategory && (
                        <div className="w-2 h-2 bg-slate-800 rounded-sm"></div>
                      )}
                    </div>
                  </div>
                  <span>Any Category</span>
                </label>

                <label className="flex items-center space-x-3 text-white cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={userDistance}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setUserDistance(e.target.checked)
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded border-2 border-white flex items-center justify-center ${
                        userDistance ? "bg-white" : "bg-transparent"
                      }`}
                    >
                      {userDistance && (
                        <div className="w-2 h-2 bg-slate-800 rounded-sm"></div>
                      )}
                    </div>
                  </div>
                  <span>Any 20 km</span>
                </label>

                <label className="flex items-center space-x-3 text-white cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isVerifiedOnly}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setIsVerifiedOnly(e.target.checked)
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 rounded border-2 border-white flex items-center justify-center ${
                        isVerifiedOnly ? "bg-white" : "bg-transparent"
                      }`}
                    >
                      {isVerifiedOnly && (
                        <div className="w-3 h-2 border-l-2 border-b-2 border-slate-800 transform rotate-[-45deg] translate-y-[-1px]"></div>
                      )}
                    </div>
                  </div>
                  <span>Verified Only</span>
                </label>
              </div>
              {/* <div className="flex space-x-4 mt-10">
                                <button onClick={() => router.push("/vendor/dashboard")}
                                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                                    Create Storefront
                                </button>
                                <button onClick={() => router.push("/marketplace")}
                                    className="border border-white/30  text-white hover:bg-orange-500/20 hover:border-orange-500 px-6 py-3 rounded-lg font-semibold transition-colors">
                                    Explore Marketplace
                                </button>
                            </div> */}
            </div>

            <div className="flex-1 md:hidden max-w-md">
              <form onSubmit={handleSearch} className="relative">
                <div
                  className={`relative transition-all duration-200 ${
                    isSearchFocused ? "ring-2 ring-primary-500" : ""
                  }`}
                >
                  <Icon
                    name="Search"
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
                  />
                  <input
                    type="text"
                    placeholder="Search products, stores..."
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchQuery(e.target.value)
                    }
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="w-full pl-10 pr-4 py-2 bg-surface-secondary border border-border rounded-lg text-sm placeholder-text-secondary focus:outline-none focus:bg-surface focus:border-primary-500 transition-all duration-200"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-border-light transition-colors duration-200"
                    >
                      <Icon
                        name="X"
                        size={14}
                        className="text-text-secondary"
                      />
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Hero Illustration */}
          <div className="relative hidden md:block">
            <div className="w-80 h-80 relative">
              <Image
                src="/images/ChatGPT Image Aug 23, 2025, 03_23_55 PM.png"
                alt="Business illustration"
                width={320}
                height={320}
                className="rounded-xl object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="bg-orange-500 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8 py-4 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-[10px] sm:text-[12px] md:text-[14px] lg:text-[16px] font-medium transition-colors border-b-2 pb-2 ${
                  activeTab === tab
                    ? "text-white border-[#001d3b]"
                    : "text-white border-transparent hover:text-white"
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
              <label className="text-gray-700 font-medium text-sm">
                Category
              </label>
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
              <label className="text-gray-700 font-medium text-sm">
                Distance
              </label>
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
                  <div
                    className={`w-10 h-6 rounded-full transition-colors ${
                      openOnly ? "bg-blue-500" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
                        openOnly ? "translate-x-5" : "translate-x-1"
                      } mt-1`}
                    ></div>
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
                  <div
                    className={`w-10 h-6 rounded-full transition-colors ${
                      verifiedOnly ? "bg-blue-500" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
                        verifiedOnly ? "translate-x-5" : "translate-x-1"
                      } mt-1`}
                    ></div>
                  </div>
                </label>
                <span className="text-gray-700">Verified Only</span>
              </div>
            </div>
          </div>

          {/* Storefront Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {storefronts.map((store) => (
              <div
                key={store.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
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
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {store.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {store.description}
                  </p>
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
