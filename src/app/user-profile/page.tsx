"use client";
import React, { useState, useEffect } from "react";
import Icon from "@/components/ui/AppIcon";
import Image from "@/components/ui/AppImage";
import MyListings from "./components/MyListings";
import PurchaseHistory from "./components/PurchaseHistory";
import SavedItems from "./components/SavedItems";
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

interface UserProfileData {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  location: string;
  joinDate: string;
  isVerified: {
    email: boolean;
    phone: boolean;
    identity: boolean;
  };
  stats: {
    itemsListed: number;
    purchasesMade: number;
    sellerRating: number;
    totalReviews: number;
  };
  bio: string;
}

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState<string>("history");
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Get JWT token from localStorage or wherever you store it
  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
      );
    }
    return null;
  };

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      if (!token) {
        setError("Authentication token not found");
        return;
      }

      const response = await fetch(
        "https://rsc-kl61.onrender.com/api/user/profile",
        {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Transform API data to match our component structure
      const transformedData: UserProfileData = {
        id: data.id || 1,
        name: data.name || "Unknown User",
        email: data.email || "",
        phone: data.phone || "",
        avatar:
          data.avatar ||
          "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        location: data.location || "Location not set",
        joinDate: data.created_at
          ? new Date(data.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
            })
          : "Recently joined",
        isVerified: {
          email: data.email_verified || false,
          phone: data.phone_verified || false,
          identity: data.kyc_status === "verified" || false,
        },
        stats: {
          itemsListed: data.stats?.itemsListed || 0,
          purchasesMade: data.stats?.purchasesMade || 0,
          sellerRating: data.stats?.sellerRating || 0,
          totalReviews: data.stats?.totalReviews || 0,
        },
        bio:
          data.bio ||
          `Passionate about sustainable living and finding great deals on quality items. I love connecting with my local community through buying and selling. Always happy to negotiate and provide detailed information about my listings!`,
      };

      setUserProfile(transformedData);
      setError(null);
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (updates: Partial<UserProfileData>) => {
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        "https://rsc-kl61.onrender.com/api/user/profile",
        {
          method: "PATCH",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: updates.email,
            name: updates.name,
            phone: updates.phone,
            bio: updates.bio,
            location: updates.location,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const updatedData = await response.json();

      // Refresh profile data after update
      await fetchUserProfile();
      return updatedData;
    } catch (err) {
      console.error("Error updating user profile:", err);
      throw err;
    }
  };

  // Check KYC status
  const checkKYCStatus = async () => {
    try {
      const token = getAuthToken();

      if (!token) return;

      const response = await fetch(
        "https://rsc-kl61.onrender.com/api/user/kyc-status",
        {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const kycData = await response.json();
        // Update the verification status based on KYC data
        if (userProfile) {
          setUserProfile((prev) =>
            prev
              ? {
                  ...prev,
                  isVerified: {
                    ...prev.isVerified,
                    identity: kycData.status === "verified",
                  },
                }
              : null
          );
        }
      }
    } catch (err) {
      console.error("Error checking KYC status:", err);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (userProfile) {
      checkKYCStatus();
    }
  }, [userProfile?.id]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !userProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-error-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="AlertCircle" size={24} className="text-error" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Failed to Load Profile
          </h2>
          <p className="text-text-secondary mb-4">
            {error || "Unknown error occurred"}
          </p>
          <button
            onClick={fetchUserProfile}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const tabs: Tab[] = [
    {
      id: "history",
      label: "Purchase History",
      icon: "ShoppingBag",
      count: userProfile.stats.purchasesMade,
    },
    { id: "saved", label: "Saved Items", icon: "Heart", count: 12 },
    { id: "settings", label: "Settings", icon: "Settings" },
  ];

  const quickActions: QuickAction[] = [
    {
      id: "list-item",
      label: "List New Item",
      icon: "Plus",
      color: "bg-primary text-white",
      action: () => router.push("/vendor/dashboard/"),
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
      case "history":
        return <PurchaseHistory />;
      case "saved":
        return <SavedItems />;
      case "settings":
        return (
          <Settings
            userProfile={userProfile}
            onUpdateProfile={updateUserProfile}
          />
        );
      default:
        return <PurchaseHistory />;
    }
  };

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
              <div className="flex items-center space-x-1 text-text-secondary text-sm">
                <Icon name="MapPin" size={14} />
                <span>{userProfile.location}</span>
              </div>
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
                <div className="flex items-center justify-center space-x-1 text-text-secondary mt-2">
                  <Icon name="MapPin" size={16} />
                  <span>{userProfile.location}</span>
                </div>
                <p className="text-text-tertiary text-sm mt-1">
                  Member since {userProfile.joinDate}
                </p>
              </div>

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
                    <button
                      onClick={() => setActiveTab("settings")}
                      className="text-xs text-primary hover:underline"
                    >
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
