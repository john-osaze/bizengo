"use client";
import React, { useEffect, useState } from "react";
import Icon from "@/components/ui/AppIcon";
import Image from "@/components/ui/AppImage";
import MyListings from "./components/MyListings";
import Settings from "./components/Settings";
import { useRouter } from "next/navigation";
import { LucideIconName } from "@/components/ui/AppIcon";

interface Tab {
  id: string;
  label: string;
  icon: LucideIconName;
  count?: number;
}

interface QuickAction {
  id: string;
  label: string;
  icon: LucideIconName;
  color: string;
  action?: () => void;
  badge?: number;
}

interface VendorData {
  business_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  isVerified?: boolean;
  phone?: string;
}

interface VendorProps {
  onLogout: () => void;
  vendorData?: VendorData;
}

interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  country?: string;
  fullAddress?: string;
}

interface LocationError {
  code: number;
  message: string;
}

// Custom hook for auto location
const useAutoLocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<LocationError | null>(null);

  // Function to get readable address from coordinates
  const getAddressFromCoordinates = async (
    lat: number,
    lon: number
  ): Promise<string> => {
    try {
      // Using OpenStreetMap Nominatim API (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
      );
      const data = await response.json();

      const address = data.address;
      const city = address.city || address.town || address.village || "";
      const state = address.state || address.region || "";
      const country = address.country || "";

      return `${city}${state ? ", " + state : ""}${
        country ? ", " + country : ""
      }`;
    } catch (err) {
      console.error("Error getting address:", err);
      return `${lat.toFixed(4)}, ${lon.toFixed(4)}`; // Fallback to coordinates
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError({
        code: 0,
        message: "Geolocation is not supported by this browser",
      });
      return;
    }

    setLoading(true);
    setError(null);

    const options = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 300000, // 5 minutes cache
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Get readable address
          const fullAddress = await getAddressFromCoordinates(
            latitude,
            longitude
          );
          const addressParts = fullAddress.split(", ");

          const locationData: LocationData = {
            latitude,
            longitude,
            city: addressParts[0] || "",
            state: addressParts[1] || "",
            country: addressParts[2] || "",
            fullAddress,
          };

          setLocation(locationData);

          // Store in localStorage for future use
          localStorage.setItem("userLocation", JSON.stringify(locationData));
        } catch (err) {
          // Even if address lookup fails, we have coordinates
          const locationData: LocationData = {
            latitude,
            longitude,
            fullAddress: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          };
          setLocation(locationData);
        }

        setLoading(false);
      },
      (err) => {
        setError({
          code: err.code,
          message: getErrorMessage(err.code),
        });
        setLoading(false);
      },
      options
    );
  };

  const getErrorMessage = (code: number): string => {
    switch (code) {
      case 1:
        return "Location access denied by user";
      case 2:
        return "Location information is unavailable";
      case 3:
        return "Location request timed out";
      default:
        return "An unknown error occurred";
    }
  };

  const clearLocation = () => {
    setLocation(null);
    setError(null);
    localStorage.removeItem("userLocation");
  };

  // Load from localStorage on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem("userLocation");
    if (savedLocation) {
      try {
        setLocation(JSON.parse(savedLocation));
      } catch (err) {
        console.error("Error parsing saved location:", err);
        localStorage.removeItem("userLocation");
      }
    }
  }, []);

  return {
    location,
    loading,
    error,
    getCurrentLocation,
    clearLocation,
  };
};

const UserProfile: React.FC<VendorProps> = ({
  onLogout,
  vendorData: propVendorData,
}) => {
  const [activeTab, setActiveTab] = useState<string>("listings");
  const [pathname, setPathname] = useState<string>("");

  // Fixed: Initialize state with propVendorData
  const [vendorData, setVendorData] = useState<VendorData | null>(
    propVendorData || null
  );

  // Add auto location hook
  const {
    location,
    loading: locationLoading,
    error: locationError,
    getCurrentLocation,
    clearLocation,
  } = useAutoLocation();

  const router = useRouter();

  useEffect(() => {
    setPathname(window.location.pathname);

    // Only fetch if no vendor data was passed as prop
    if (!propVendorData) {
      const fetchProfile = async () => {
        try {
          const res = await fetch(
            "https://rsc-kl61.onrender.com/api/user/profile",
            {
              headers: {
                accept: "application/json",
                Authorization: `Bearer ${localStorage.getItem("vendorToken")}`,
              },
            }
          );

          if (!res.ok) throw new Error("Failed to fetch profile");

          const data = await res.json();
          setVendorData(data);
        } catch (err) {
          console.error("Error fetching vendor profile:", err);
        }
      };

      fetchProfile();
    }
  }, [propVendorData]);

  // Auto-get location on component mount
  useEffect(() => {
    if (!location && !locationLoading && !locationError) {
      getCurrentLocation();
    }
  }, [location, locationLoading, locationError]);

  // Mock user profile data (you can replace this with actual vendorData when available)
  const userProfile = {
    id: 1,
    name:
      vendorData?.business_name ||
      `${vendorData?.first_name || "Sarah"} ${
        vendorData?.last_name || "Johnson"
      }`,
    email: vendorData?.email || "sarah.johnson@email.com",
    phone: vendorData?.phone || "+1 (555) 123-4567",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    // Use auto location or fallback
    location: location?.fullAddress || "San Francisco, CA",
    joinDate: "March 2023",
    isVerified: {
      email: vendorData?.isVerified || true,
      phone: true,
      identity: false,
    },
    stats: {
      itemsListed: 24,
      purchasesMade: 18,
      sellerRating: 4.8,
      totalReviews: 32,
    },
    bio: `Passionate about sustainable living and finding great deals on quality items. I love connecting with my local community through buying and selling. Always happy to negotiate and provide detailed information about my listings!`,
  };

  const tabs: Tab[] = [
    {
      id: "listings",
      label: "My Listings",
      icon: "Package",
      count: userProfile.stats.itemsListed,
    },
    { id: "settings", label: "Settings", icon: "Settings" },
  ];

  const quickActions: QuickAction[] = [
    {
      id: "list-item",
      label: "List New Item",
      icon: "Plus",
      color: "bg-primary text-white",
      action: () => router.push("/create-listing"),
    },
    {
      id: "messages",
      label: "Messages",
      icon: "MessageCircle",
      color: "bg-secondary text-white",
      badge: 3,
    },
    {
      id: "account-settings",
      label: "Account Settings",
      icon: "User",
      color: "bg-surface border border-border text-text-primary",
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "listings":
        return <MyListings />;
      case "settings":
        return <Settings userProfile={userProfile} />;
      default:
        return <MyListings />;
    }
  };

  // Location display component
  const LocationDisplay = ({ className = "" }: { className?: string }) => (
    <div
      className={`flex items-center space-x-1 text-text-secondary text-sm ${className}`}
    >
      <Icon name="MapPin" size={14} />
      <span>
        {locationLoading
          ? "Getting location..."
          : locationError
          ? "Location unavailable"
          : userProfile.location}
      </span>
      {!locationLoading && (
        <button
          onClick={getCurrentLocation}
          className="text-xs text-primary hover:underline ml-1"
          title="Update location"
        >
          📍
        </button>
      )}
      {location && (
        <button
          onClick={clearLocation}
          className="text-xs text-gray-400 hover:text-red-500 ml-1"
          title="Clear location"
        >
          ✕
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="bg-surface border-b border-border px-4 py-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative w-16 h-16">
              <Image
                src={userProfile.avatar}
                alt={userProfile.name}
                fill
                className="rounded-full object-cover"
                sizes="64px"
              />
              {userProfile.isVerified.email && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Icon name="Check" size={12} className="text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-heading font-semibold text-text-primary">
                {userProfile.name}
              </h1>
              <LocationDisplay />
              <p className="text-text-tertiary text-xs mt-1">
                Member since {userProfile.joinDate}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-text-primary">
                {userProfile.stats.itemsListed}
              </div>
              <div className="text-xs text-text-secondary">Listed</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-text-primary">
                {userProfile.stats.purchasesMade}
              </div>
              <div className="text-xs text-text-secondary">Purchased</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                <Icon
                  name="Star"
                  size={14}
                  className="text-warning fill-current"
                />
                <span className="text-lg font-semibold text-text-primary">
                  {userProfile.stats.sellerRating}
                </span>
              </div>
              <div className="text-xs text-text-secondary">
                ({userProfile.stats.totalReviews} reviews)
              </div>
            </div>
          </div>

          {/* Location Error Display */}
          {locationError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" size={16} className="text-red-500" />
                <span className="text-sm text-red-700">
                  {locationError.message}
                </span>
                <button
                  onClick={getCurrentLocation}
                  className="text-xs text-red-600 hover:underline ml-auto"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={action.action}
                className={`relative p-3 rounded-lg transition-colors duration-200 ${action.color} hover:opacity-90`}
              >
                <Icon name={action.icon} size={18} className="mx-auto mb-1" />
                <span className="text-xs font-medium block">
                  {action.label}
                </span>
                {action.badge && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center">
                    {action.badge}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-surface border-b border-border">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors duration-200 ${
                  activeTab === tab.id
                    ? "border-primary text-primary bg-primary-50"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                <Icon name={tab.icon} size={16} />
                <span className="text-sm font-medium">{tab.label}</span>
                {tab.count && (
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      activeTab === tab.id
                        ? "bg-primary text-white"
                        : "bg-surface-secondary text-text-secondary"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4">{renderTabContent()}</div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Left Sidebar - Profile Info */}
          <div className="col-span-4">
            <div className="bg-surface rounded-lg border border-border p-6 mb-6">
              <div className="text-center mb-6">
                <div className="relative w-24 h-24 rounded-full overflow-hidden mx-auto">
                  <Image
                    fill
                    src={userProfile.avatar}
                    alt={userProfile.name}
                    className="object-cover"
                    sizes="96px"
                  />
                  {userProfile.isVerified.email && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Icon name="Check" size={12} className="text-white" />
                    </div>
                  )}
                </div>
                <h1 className="text-2xl font-heading font-semibold text-text-primary mt-4">
                  {userProfile.name}
                </h1>
                <LocationDisplay className="justify-center mt-2" />
                <p className="text-text-tertiary text-sm mt-1">
                  Member since {userProfile.joinDate}
                </p>
              </div>

              {/* Location Error Display */}
              {locationError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Icon
                      name="AlertCircle"
                      size={16}
                      className="text-red-500"
                    />
                    <span className="text-sm text-red-700">
                      {locationError.message}
                    </span>
                  </div>
                  <button
                    onClick={getCurrentLocation}
                    className="text-xs text-red-600 hover:underline mt-2"
                  >
                    Try again
                  </button>
                </div>
              )}

              {/* Verification Badges */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon
                      name="Mail"
                      size={16}
                      className="text-text-secondary"
                    />
                    <span className="text-sm text-text-secondary">Email</span>
                  </div>
                  {userProfile.isVerified.email ? (
                    <div className="flex items-center space-x-1 text-success">
                      <Icon name="Check" size={14} />
                      <span className="text-xs">Verified</span>
                    </div>
                  ) : (
                    <span className="text-xs text-text-tertiary">
                      Not verified
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon
                      name="Phone"
                      size={16}
                      className="text-text-secondary"
                    />
                    <span className="text-sm text-text-secondary">Phone</span>
                  </div>
                  {userProfile.isVerified.phone ? (
                    <div className="flex items-center space-x-1 text-success">
                      <Icon name="Check" size={14} />
                      <span className="text-xs">Verified</span>
                    </div>
                  ) : (
                    <span className="text-xs text-text-tertiary">
                      Not verified
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon
                      name="Shield"
                      size={16}
                      className="text-text-secondary"
                    />
                    <span className="text-sm text-text-secondary">
                      Identity
                    </span>
                  </div>
                  {userProfile.isVerified.identity ? (
                    <div className="flex items-center space-x-1 text-success">
                      <Icon name="Check" size={14} />
                      <span className="text-xs">Verified</span>
                    </div>
                  ) : (
                    <button className="text-xs text-primary hover:underline">
                      Verify now
                    </button>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-text-primary mb-2">
                  About
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {userProfile.bio}
                </p>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={action.action}
                    className={`relative w-full flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${action.color} hover:opacity-90`}
                  >
                    <Icon name={action.icon} size={18} />
                    <span className="font-medium">{action.label}</span>
                    {action.badge && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center">
                        {action.badge}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-surface rounded-lg border border-border p-6">
              <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
                Activity Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon name="Package" size={16} className="text-primary" />
                    <span className="text-sm text-text-secondary">
                      Items Listed
                    </span>
                  </div>
                  <span className="font-semibold text-text-primary">
                    {userProfile.stats.itemsListed}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon
                      name="ShoppingBag"
                      size={16}
                      className="text-secondary"
                    />
                    <span className="text-sm text-text-secondary">
                      Purchases Made
                    </span>
                  </div>
                  <span className="font-semibold text-text-primary">
                    {userProfile.stats.purchasesMade}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon name="Star" size={16} className="text-warning" />
                    <span className="text-sm text-text-secondary">
                      Seller Rating
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="font-semibold text-text-primary">
                      {userProfile.stats.sellerRating}
                    </span>
                    <span className="text-xs text-text-tertiary">
                      ({userProfile.stats.totalReviews})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="col-span-8">
            {/* Tab Navigation */}
            <div className="bg-surface rounded-lg border border-border mb-6">
              <div className="flex border-b border-border">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-colors duration-200 ${
                      activeTab === tab.id
                        ? "border-primary text-primary bg-primary-50"
                        : "border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
                    }`}
                  >
                    <Icon name={tab.icon} size={18} />
                    <span className="font-medium">{tab.label}</span>
                    {tab.count && (
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          activeTab === tab.id
                            ? "bg-primary text-white"
                            : "bg-surface-secondary text-text-secondary"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6">{renderTabContent()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
