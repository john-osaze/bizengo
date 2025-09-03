import React, { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  ShoppingBag,
  Users,
  Package,
  Star,
  Filter,
  ChevronDown,
  AlertCircle,
  Loader,
} from "lucide-react";

interface Vendor {
  business_name: string;
  email: string;
  firstname: string;
  id: number;
  lastname: string;
  phone: string;
  profile_pic: string | null;
}

interface Storefront {
  id: number;
  business_name: string;
  description: string;
  established_at: string;
  business_banner: string | null;
  ratings: number;
  vendor: Vendor | null;
}

interface APIResponse {
  count: number;
  storefronts: Storefront[];
}

const LandingPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [distance, setDistance] = useState<string>("2 km");
  const [openOnly, setOpenOnly] = useState<boolean>(false);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [storefronts, setStorefronts] = useState<Storefront[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Fetch storefronts from API
  useEffect(() => {
    const fetchStorefronts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          "https://server.bizengo.com/api/admin/storefronts",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch storefronts: ${response.status}`);
        }

        const data: APIResponse = await response.json();
        setStorefronts(data.storefronts);
      } catch (err: any) {
        setError(err.message || "Failed to load storefronts");
        console.error("Error fetching storefronts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStorefronts();
  }, []);

  // Helper function to format establishment date
  const formatEstablishedDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 1) return "Established today";
      if (diffDays <= 7) return `Established ${diffDays} days ago`;
      if (diffDays <= 30)
        return `Established ${Math.ceil(diffDays / 7)} weeks ago`;
      if (diffDays <= 365)
        return `Established ${Math.ceil(diffDays / 30)} months ago`;
      return `Established ${Math.ceil(diffDays / 365)} years ago`;
    } catch {
      return "Recently established";
    }
  };

  // Generate fallback image based on business name
  const getFallbackImage = (businessName: string): string => {
    const colors = ["blue", "green", "purple", "orange", "red", "teal"];
    const colorIndex = businessName.length % colors.length;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      businessName
    )}&background=${colors[colorIndex]}&color=fff&size=300`;
  };

  // Filter storefronts based on search and filters
  const filteredStorefronts = storefronts.filter((store) => {
    // Search filter
    if (
      searchTerm &&
      !store.business_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !store.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Category filter (you might want to add a category field to your API)
    // For now, we'll skip category filtering since it's not in the API response

    // Verified only filter (stores with vendor info are considered "verified")
    if (verifiedOnly && !store.vendor) return false;

    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-32">
        <div className="flex items-center justify-between">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold text-white mb-6">
              Buy. Sell.
              <br />
              Connect.
            </h1>
            <p className="text-blue-100 text-lg mb-8 leading-relaxed">
              Discover a smarter way to trade locally. Instantly connect with
              buyers and sellers near you in real-time—fast, simple, and
              reliable.
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
            <div className="w-96 h-80 relative">
              {/* Background City Silhouette */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute bottom-0 left-0 w-8 h-20 bg-blue-700"></div>
                <div className="absolute bottom-0 left-10 w-12 h-32 bg-blue-700"></div>
                <div className="absolute bottom-0 left-24 w-10 h-24 bg-blue-700"></div>
                <div className="absolute bottom-0 right-20 w-14 h-28 bg-blue-700"></div>
                <div className="absolute bottom-0 right-4 w-8 h-16 bg-blue-700"></div>
              </div>

              {/* Delivery Person */}
              <div className="absolute bottom-16 left-8 w-16 h-20">
                <div className="w-8 h-10 bg-orange-400 rounded-t-full mx-auto mb-2"></div>
                <div className="w-12 h-8 bg-orange-400 rounded mx-auto"></div>
              </div>

              {/* Rating Badge */}
              <div className="absolute top-8 left-16 bg-white rounded-lg p-2 shadow-lg flex items-center space-x-1">
                <Star className="w-4 h-4 text-orange-400 fill-current" />
                <Star className="w-4 h-4 text-orange-400 fill-current" />
                <Star className="w-4 h-4 text-orange-400 fill-current" />
              </div>

              {/* Store Front */}
              <div className="absolute bottom-12 right-16 bg-white rounded-lg shadow-xl w-24 h-16 overflow-hidden">
                <div className="bg-orange-500 w-full h-3"></div>
                <div className="p-1">
                  <div className="flex space-x-1">
                    <div className="bg-blue-200 w-4 h-6 rounded"></div>
                    <div className="bg-orange-200 w-4 h-6 rounded"></div>
                    <div className="bg-green-200 w-4 h-6 rounded"></div>
                  </div>
                </div>
              </div>

              {/* Rating Pop-up */}
              <div className="absolute top-16 right-8 bg-white rounded-lg p-2 shadow-lg">
                <div className="flex">
                  <Star className="w-3 h-3 text-orange-400 fill-current" />
                  <Star className="w-3 h-3 text-orange-400 fill-current" />
                </div>
              </div>

              {/* Chat Bubble */}
              <div className="absolute top-4 right-4 bg-white rounded-lg p-2 shadow-lg">
                <MapPin className="w-4 h-4 text-orange-500" />
              </div>

              {/* Another Person */}
              <div className="absolute bottom-16 right-8 w-12 h-16">
                <div className="w-6 h-8 bg-blue-600 rounded-t-full mx-auto mb-1"></div>
                <div className="w-8 h-6 bg-blue-600 rounded mx-auto"></div>
              </div>

              {/* Delivery Vehicle */}
              <div className="absolute bottom-8 left-24">
                <div className="w-8 h-4 bg-orange-500 rounded"></div>
                <div className="flex space-x-2 mt-1">
                  <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                </div>
              </div>
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
              {!loading && ` (${filteredStorefronts.length} storefronts found)`}
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search storefronts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-6">
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

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                />
                <span className="text-gray-700 text-sm">Verified Only</span>
              </label>

              <button
                onClick={() => {
                  setSearchTerm("");
                  setVerifiedOnly(false);
                  setDistance("2 km");
                }}
                className="text-orange-500 text-sm hover:text-orange-600 font-medium"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
                <p className="text-gray-600">Loading storefronts...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <h3 className="text-red-800 font-medium">
                  Failed to load storefronts
                </h3>
              </div>
              <p className="text-red-700 mt-2">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* No Results */}
          {!loading && !error && filteredStorefronts.length === 0 && (
            <div className="text-center py-16">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No storefronts found
              </h3>
              <p className="text-gray-600">
                {searchTerm || verifiedOnly
                  ? "Try adjusting your search or filters."
                  : "Be the first to create a storefront in your area!"}
              </p>
            </div>
          )}

          {/* Storefront Grid */}
          {!loading && !error && filteredStorefronts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {filteredStorefronts.map((store) => (
                <div
                  key={store.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 relative overflow-hidden">
                    <img
                      src={
                        store.business_banner ||
                        getFallbackImage(store.business_name)
                      }
                      alt={store.business_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getFallbackImage(
                          store.business_name
                        );
                      }}
                    />
                    {store.vendor && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                        <span>Verified</span>
                      </div>
                    )}
                    {store.ratings > 0 && (
                      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-gray-800 px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                        <Star className="w-3 h-3 text-orange-400 fill-current" />
                        <span>{store.ratings.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {store.business_name}
                    </h3>
                    <p className="text-gray-600 mb-3 min-h-[2.5rem]">
                      {store.description || "No description available"}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-gray-500">
                        {formatEstablishedDate(store.established_at)}
                      </div>
                      {store.vendor && (
                        <div className="text-green-600 font-medium flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Active</span>
                        </div>
                      )}
                    </div>
                    {store.vendor && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {store.vendor.firstname.charAt(0)}
                          </div>
                          <span className="text-sm text-gray-700">
                            {store.vendor.firstname} {store.vendor.lastname}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
