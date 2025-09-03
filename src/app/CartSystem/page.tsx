"use client";
import { useState, useEffect } from "react";

// Types
interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product: {
    id: number;
    product_name: string;
    product_price: number;
    images: string[];
    category: string;
  };
}

interface Notification {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

// Notification Component
const NotificationToast = ({
  notification,
  onClose,
}: {
  notification: Notification;
  onClose: (id: string) => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(notification.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [notification.id, onClose]);

  const bgColors = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-orange-50 border-orange-200 text-orange-800",
  };

  const icons = {
    success: "✓",
    error: "⚠",
    info: "ℹ",
  };

  return (
    <div
      className={`fixed top-20 right-4 z-50 p-4 rounded-lg border shadow-lg max-w-sm ${
        bgColors[notification.type]
      }`}
      style={{
        animation: "slideInFromRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-sm font-bold">
          {icons[notification.type]}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{notification.message}</p>
        </div>
        <button
          onClick={() => onClose(notification.id)}
          className="flex-shrink-0 w-6 h-6 rounded-full hover:bg-white hover:bg-opacity-20 flex items-center justify-center text-sm font-bold transition-all duration-200"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Main Cart Component
export default function JumiaCartSystem() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Get auth token from sessionStorage (matching your login component)
  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("RSToken") || "";
    }
    return "";
  };

  // Add notification
  const addNotification = (
    type: "success" | "error" | "info",
    message: string
  ) => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, type, message }]);
  };

  // Remove notification
  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // API call helper
  const apiCall = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken();

    if (!token) {
      throw new Error("No authentication token found. Please log in again.");
    }

    const headers = {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    };

    console.log("Making API call with token:", token.substring(0, 20) + "...");

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", response.status, errorText);
      throw new Error(
        `HTTP ${response.status}: ${errorText || "Request failed"}`
      );
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }
    return null;
  };

  // Fetch cart items
  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const data = await apiCall("https://server.bizengo.com/api/cart");

      console.log("Cart data received:", data);

      const mappedItems: CartItem[] = (data.cart_items || []).map(
        (item: any) => ({
          id: item.id,
          product_id: item.id,
          quantity: item.quantity,
          product: {
            id: item.id,
            product_name: item.title,
            product_price: item.price,
            images: item.product_images || [],
            category: item.category,
          },
        })
      );

      setCartItems(mappedItems);
      setTotalItems(mappedItems.reduce((sum, item) => sum + item.quantity, 0));
      setTotalPrice(
        mappedItems.reduce(
          (sum, item) => sum + item.quantity * item.product.product_price,
          0
        )
      );
    } catch (error: any) {
      console.error("Error fetching cart:", error);

      if (error.message.includes("No authentication token")) {
        addNotification("error", "Please log in to view your cart");
      } else if (error.message.includes("401")) {
        addNotification("error", "Session expired. Please log in again");
      } else {
        addNotification("error", "Failed to load cart items");
      }

      setCartItems([]);
      setTotalItems(0);
      setTotalPrice(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Update cart item quantity
  const updateCartItem = async (itemId: number, quantity: number) => {
    if (quantity < 1) {
      await deleteCartItem(itemId);
      return;
    }

    try {
      setIsLoading(true);
      await apiCall(`https://server.bizengo.com/api/cart/update/${itemId}`, {
        method: "PUT",
        body: JSON.stringify({ quantity }),
      });

      addNotification("success", "Cart updated successfully!");
      await fetchCart(); // Refresh cart
    } catch (error) {
      console.error("Error updating cart:", error);
      addNotification("error", "Failed to update cart item");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete cart item
  const deleteCartItem = async (itemId: number) => {
    try {
      setIsLoading(true);
      await apiCall(`https://server.bizengo.com/api/cart/delete/${itemId}`, {
        method: "DELETE",
      });

      addNotification("success", "Item removed from cart");
      await fetchCart(); // Refresh cart
    } catch (error) {
      console.error("Error deleting cart item:", error);
      addNotification("error", "Failed to remove item from cart");
    } finally {
      setIsLoading(false);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your entire cart?")) {
      return;
    }

    try {
      setIsLoading(true);
      await apiCall("https://server.bizengo.com/api/cart/clear", {
        method: "DELETE",
      });

      addNotification("success", "Cart cleared successfully!");
      setCartItems([]);
      setTotalItems(0);
      setTotalPrice(0);
    } catch (error) {
      console.error("Error clearing cart:", error);
      addNotification("error", "Failed to clear cart");
    } finally {
      setIsLoading(false);
    }
  };

  // Load cart on component mount
  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <style jsx>{`
        @keyframes slideInFromRight {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }

        .shimmer {
          background: linear-gradient(
            90deg,
            #f0f0f0 25%,
            #e0e0e0 50%,
            #f0f0f0 75%
          );
          background-size: 200px 100%;
          animation: shimmer 1.5s infinite;
        }
      `}</style>

      {/* Notifications */}
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Cart Items - Left Column */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Cart Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Shopping Cart ({totalItems})
                  </h2>
                  {cartItems.length > 0 && (
                    <button
                      onClick={clearCart}
                      disabled={isLoading}
                      className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>

              {/* Cart Items List */}
              {isLoading ? (
                <div className="p-6">
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg"
                      >
                        <div className="w-20 h-20 bg-gray-200 rounded-lg shimmer"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded shimmer"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3 shimmer"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/3 shimmer"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-8 w-24 bg-gray-200 rounded shimmer"></div>
                          <div className="h-6 w-16 bg-gray-200 rounded shimmer"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : cartItems.length === 0 ? (
                <div className="text-center py-16 px-8">
                  <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l-2.5 5m0 0h14m-12 0v6a2 2 0 002 2h8a2 2 0 002-2v-6"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Browse our categories and discover our best deals!
                  </p>
                  <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {cartItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-6 hover:bg-gray-50 transition-colors animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-start space-x-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24">
                          <img
                            src={
                              item.product.images[0] ||
                              "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop"
                            }
                            alt={item.product.product_name}
                            className="w-full h-full object-cover rounded-lg border border-gray-200"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-1 line-clamp-2">
                            {item.product.product_name}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500 mb-2">
                            {item.product.category}
                          </p>

                          {/* Price */}
                          <div className="flex items-center space-x-2 mb-3">
                            <span className="text-lg sm:text-xl font-bold text-orange-500">
                              ₦{item.product.product_price.toLocaleString()}
                            </span>
                          </div>

                          {/* Mobile Quantity & Remove */}
                          <div className="flex items-center justify-between sm:hidden">
                            <div className="flex items-center border border-gray-300 rounded">
                              <button
                                onClick={() =>
                                  updateCartItem(item.id, item.quantity - 1)
                                }
                                disabled={isLoading}
                                className="p-2 hover:bg-gray-100 disabled:opacity-50"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 12H4"
                                  />
                                </svg>
                              </button>
                              <span className="px-3 py-2 text-sm font-medium border-x border-gray-300 bg-white min-w-[3rem] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateCartItem(item.id, item.quantity + 1)
                                }
                                disabled={isLoading}
                                className="p-2 hover:bg-gray-100 disabled:opacity-50"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                  />
                                </svg>
                              </button>
                            </div>
                            <button
                              onClick={() => deleteCartItem(item.id)}
                              disabled={isLoading}
                              className="text-red-500 hover:text-red-700 p-2 disabled:opacity-50"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Desktop Quantity & Actions */}
                        <div className="hidden sm:flex flex-col items-end space-y-3">
                          <div className="flex items-center border border-gray-300 rounded">
                            <button
                              onClick={() =>
                                updateCartItem(item.id, item.quantity - 1)
                              }
                              disabled={isLoading}
                              className="p-2 hover:bg-gray-100 disabled:opacity-50"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M20 12H4"
                                />
                              </svg>
                            </button>
                            <span className="px-4 py-2 font-medium border-x border-gray-300 bg-white min-w-[4rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateCartItem(item.id, item.quantity + 1)
                              }
                              disabled={isLoading}
                              className="p-2 hover:bg-gray-100 disabled:opacity-50"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                            </button>
                          </div>

                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              ₦
                              {(
                                item.quantity * item.product.product_price
                              ).toLocaleString()}
                            </div>
                          </div>

                          <button
                            onClick={() => deleteCartItem(item.id)}
                            disabled={isLoading}
                            className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary - Right Column */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-6">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Summary
                </h2>

                {/* Summary Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">
                      Subtotal ({totalItems} items)
                    </span>
                    <span className="font-medium">
                      ₦{totalPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Shipping fee</span>
                    <span className="font-medium text-green-600">FREE</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-orange-500">
                        ₦{totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  disabled={isLoading || cartItems.length === 0}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors mb-3"
                >
                  CHECKOUT (₦{totalPrice.toLocaleString()})
                </button>

                {/* Secure Checkout Info */}
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                  <svg
                    className="w-4 h-4 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span>100% Secure and Encrypted Checkout</span>
                </div>
              </div>
            </div>

            {/* Return Policy */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <svg
                  className="w-5 h-5 text-orange-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Jumia Promise
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <svg
                    className="w-4 h-4 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    />
                  </svg>
                  Free return within 15 days
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-4 h-4 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    />
                  </svg>
                  Warranty available
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-4 h-4 text-green-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    />
                  </svg>
                  Support available 24/7
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Mobile Checkout Bar */}
        {cartItems.length > 0 && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-40">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-lg font-bold text-orange-500">
                  ₦{totalPrice.toLocaleString()}
                </p>
              </div>
              <button
                disabled={isLoading}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                CHECKOUT
              </button>
            </div>
          </div>
        )}

        {/* Mobile spacing for fixed bar */}
        {cartItems.length > 0 && <div className="lg:hidden h-20"></div>}
      </div>
    </div>
  );
}
