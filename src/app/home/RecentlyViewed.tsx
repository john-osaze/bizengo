import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/AppIcon";
import Image from "@/components/ui/AppImage";

interface RecentItem {
  id: number;
  title: string;
  price: number;
  image: string;
  distance: string;
  seller: string;
  viewedAt: string;
  isAvailable: boolean;
  category?: string;
  description?: string;
}

const RecentlyViewed: React.FC = () => {
  const router = useRouter();
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Get recently viewed items from localStorage or session storage
  const getRecentlyViewedItems = (): RecentItem[] => {
    try {
      // In a real app, you would get this from localStorage, session storage,
      // or a user's viewing history from an API
      const stored = localStorage.getItem("recentlyViewed");
      if (stored) {
        return JSON.parse(stored);
      }
      return [];
    } catch (error) {
      console.error("Error loading recently viewed items:", error);
      return [];
    }
  };

  // Add item to recently viewed (this would typically be called from product detail pages)
  const addToRecentlyViewed = (item: Omit<RecentItem, "viewedAt">) => {
    try {
      const currentItems = getRecentlyViewedItems();

      // Remove item if it already exists (to avoid duplicates)
      const filteredItems = currentItems.filter(
        (existingItem) => existingItem.id !== item.id
      );

      // Add new item at the beginning with current timestamp
      const newItem: RecentItem = {
        ...item,
        viewedAt: new Date().toISOString(),
      };

      // Keep only the last 20 items
      const updatedItems = [newItem, ...filteredItems].slice(0, 20);

      localStorage.setItem("recentlyViewed", JSON.stringify(updatedItems));
      setRecentItems(updatedItems);
    } catch (error) {
      console.error("Error saving recently viewed item:", error);
    }
  };

  // Format the viewed time to be more readable
  const formatViewedAt = (isoString: string): string => {
    const now = new Date();
    const viewedDate = new Date(isoString);
    const diffInMilliseconds = now.getTime() - viewedDate.getTime();
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    } else {
      return viewedDate.toLocaleDateString();
    }
  };

  // Clear recently viewed items
  const clearRecentlyViewed = () => {
    try {
      localStorage.removeItem("recentlyViewed");
      setRecentItems([]);
    } catch (error) {
      console.error("Error clearing recently viewed items:", error);
    }
  };

  // Load recently viewed items on component mount
  useEffect(() => {
    setLoading(true);

    // Simulate loading delay (you can remove this in production)
    setTimeout(() => {
      const items = getRecentlyViewedItems();
      setRecentItems(items);
      setLoading(false);
    }, 500);
  }, []);

  const handleItemClick = (item: RecentItem) => {
    router.push(`/product-detail?id=${item.id}`);
  };

  const handleQuickAdd = (e: React.MouseEvent, item: RecentItem) => {
    e.stopPropagation();
    // Mock quick add functionality
    console.log("Quick add:", item.title);
    // In a real app, you would add this to cart or wishlist
  };

  const handleRemoveItem = (e: React.MouseEvent, itemId: number) => {
    e.stopPropagation();
    try {
      const updatedItems = recentItems.filter((item) => item.id !== itemId);
      localStorage.setItem("recentlyViewed", JSON.stringify(updatedItems));
      setRecentItems(updatedItems);
    } catch (error) {
      console.error("Error removing item from recently viewed:", error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">
            Recently Viewed
          </h2>
          <div className="animate-pulse bg-surface-secondary w-8 h-8 rounded"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="bg-surface rounded-lg border border-border animate-pulse"
            >
              <div className="w-full h-32 md:h-40 bg-surface-secondary rounded-t-lg"></div>
              <div className="p-3 space-y-2">
                <div className="h-4 bg-surface-secondary rounded w-3/4"></div>
                <div className="h-4 bg-surface-secondary rounded w-1/2"></div>
                <div className="h-3 bg-surface-secondary rounded w-full"></div>
                <div className="h-3 bg-surface-secondary rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state - no recently viewed items
  if (recentItems.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">
            Recently Viewed
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <Icon
              name="Clock"
              size={48}
              className="text-text-secondary mx-auto mb-4"
            />
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No Recently Viewed Items
            </h3>
            <p className="text-text-secondary mb-4 max-w-md">
              Start browsing products to see your recently viewed items here.
              They'll help you quickly find products you've looked at before.
            </p>
            <button
              onClick={() => router.push("/marketplace")}
              className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200"
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Items grid
  return (
    <div>
      {/* Header with clear button */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">
            Recently Viewed
          </h2>
          <p className="text-sm text-text-secondary">
            {recentItems.length} item{recentItems.length > 1 ? "s" : ""}
          </p>
        </div>
        {recentItems.length > 0 && (
          <button
            onClick={clearRecentlyViewed}
            className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors duration-200"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {recentItems.map((item) => (
          <div
            key={item.id}
            onClick={() => handleItemClick(item)}
            className={`bg-surface rounded-lg border border-border hover:shadow-elevation-2 transition-all duration-200 cursor-pointer relative ${
              !item.isAvailable ? "opacity-60" : ""
            }`}
          >
            {/* Remove button */}
            <button
              onClick={(e) => handleRemoveItem(e, item.id)}
              className="absolute top-2 left-2 z-10 p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-opacity duration-200"
              title="Remove from recently viewed"
            >
              <Icon name="X" size={12} />
            </button>

            {/* Image */}
            <div className="relative overflow-hidden rounded-t-lg w-full h-32 md:h-40">
              <Image
                src={item.image}
                fill
                alt={item.title}
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                onError={(e) => {
                  // Fallback image on error
                  const target = e.target as HTMLImageElement;
                  target.src =
                    "https://via.placeholder.com/400x400?text=Product+Image";
                }}
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
                <span className="text-base font-semibold text-text-primary">
                  ${item.price}
                </span>
                {item.isAvailable && (
                  <button
                    onClick={(e) => handleQuickAdd(e, item)}
                    className="p-1 rounded-full hover:bg-surface-secondary transition-colors duration-200"
                    title="Quick add to cart"
                  >
                    <Icon name="Plus" size={14} className="text-primary" />
                  </button>
                )}
              </div>

              <div className="text-xs text-text-secondary space-y-1">
                <p className="truncate" title={item.seller}>
                  {item.seller}
                </p>
                <p>Viewed {formatViewedAt(item.viewedAt)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Export helper function to add items to recently viewed from other components
export const addToRecentlyViewed = (item: Omit<RecentItem, "viewedAt">) => {
  try {
    const stored = localStorage.getItem("recentlyViewed");
    const currentItems: RecentItem[] = stored ? JSON.parse(stored) : [];

    // Remove item if it already exists
    const filteredItems = currentItems.filter(
      (existingItem) => existingItem.id !== item.id
    );

    // Add new item at the beginning
    const newItem: RecentItem = {
      ...item,
      viewedAt: new Date().toISOString(),
    };

    // Keep only the last 20 items
    const updatedItems = [newItem, ...filteredItems].slice(0, 20);

    localStorage.setItem("recentlyViewed", JSON.stringify(updatedItems));
  } catch (error) {
    console.error("Error saving recently viewed item:", error);
  }
};

export default RecentlyViewed;
