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
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  const icons = {
    success: "✓",
    error: "⚠",
    info: "ℹ",
  };

  return (
    <div
      className={`fixed top-20 right-4 z-50 p-4 rounded-xl border shadow-2xl max-w-sm backdrop-blur-sm ${
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

// Main Cart Page Component
export default function CartSystem() {
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
    <div className="min-h-screen w-[100%] bg-gradient-to-br from-slate-50 to-gray-100">
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

      {/* Rest of your component content remains the same */}
      {/* Notifications */}
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}
      <div
        className=" flex flex-col overflow-auto w-[100%] mb-[2rem]"
        style={{ maxHeight: "100vh" }}
      >
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l-2.5 5m0 0h14m-12 0v6a2 2 0 002 2h8a2 2 0 002-2v-6"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    Shopping Cart
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {totalItems} {totalItems === 1 ? "item" : "items"} in your
                    cart
                  </p>
                </div>
              </div>

              {/* Header Actions */}
              <div className="mt-4 sm:mt-0 flex space-x-3">
                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 flex items-center space-x-2"
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
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  <span className="hidden sm:inline">Continue Shopping</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-container  flex flex-col mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Cart Items - Left Column */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                {isLoading ? (
                  <div className="p-8">
                    <div className="space-y-6">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="flex items-center space-x-4 p-4 border border-gray-100 rounded-xl"
                        >
                          <div className="w-20 h-20 bg-gray-200 rounded-xl shimmer"></div>
                          <div className="flex-1 space-y-3">
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
                    <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6 shadow-inner">
                      <svg
                        className="w-16 h-16 text-gray-400"
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
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Your cart is empty
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Discover amazing products and add them to your cart
                    </p>
                    <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="p-6 sm:p-8">
                    <div className="space-y-6">
                      {cartItems.map((item, index) => (
                        <div
                          key={item.id}
                          className="group flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 p-6 border border-gray-100 rounded-2xl hover:shadow-lg hover:border-gray-200 transition-all duration-300 animate-fade-in"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          {/* Product Image */}
                          <div className="relative w-full sm:w-24 h-48 sm:h-24 flex-shrink-0">
                            <img
                              src={
                                item.product.images[0] ||
                                "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop"
                              }
                              alt={item.product.product_name}
                              className="w-full h-full object-cover rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300"
                            />
                            <div className="absolute top-2 left-2 bg-white bg-opacity-90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-medium text-gray-700 shadow-sm">
                              {item.product.category}
                            </div>
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 w-full sm:w-auto">
                            <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                              {item.product.product_name}
                            </h3>
                            <p className="text-gray-500 text-sm mb-3">
                              Category:{" "}
                              <span className="font-medium">
                                {item.product.category}
                              </span>
                            </p>
                            <div className="flex items-center space-x-4">
                              <p className="text-2xl font-bold text-blue-600">
                                ₦{item.product.product_price.toLocaleString()}
                              </p>
                              <div className="hidden sm:flex items-center space-x-1 text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                  <svg
                                    key={i}
                                    className="w-4 h-4 fill-current"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                                <span className="text-gray-500 text-sm ml-1">
                                  (4.8)
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 w-full sm:w-auto">
                            <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                              <button
                                onClick={() =>
                                  updateCartItem(item.id, item.quantity - 1)
                                }
                                disabled={isLoading}
                                className="p-3 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 text-gray-600 hover:text-red-500"
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

                              <span className="w-16 text-center font-semibold text-lg py-3 bg-white border-x border-gray-200">
                                {item.quantity}
                              </span>

                              <button
                                onClick={() =>
                                  updateCartItem(item.id, item.quantity + 1)
                                }
                                disabled={isLoading}
                                className="p-3 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 text-gray-600 hover:text-green-500"
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

                            {/* Item Total */}
                            <div className="text-center sm:text-right">
                              <p className="text-sm text-gray-500 mb-1">
                                Subtotal
                              </p>
                              <p className="font-bold text-xl text-gray-900">
                                ₦
                                {(
                                  item.quantity * item.product.product_price
                                ).toLocaleString()}
                              </p>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => deleteCartItem(item.id)}
                              disabled={isLoading}
                              className="p-3 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-all duration-200 disabled:opacity-50 group"
                            >
                              <svg
                                className="w-5 h-5 group-hover:scale-110 transition-transform duration-200"
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
                      ))}
                    </div>

                    {/* Clear Cart Button */}
                    {cartItems.length > 0 && (
                      <div className="mt-8 pt-6 border-t border-gray-100">
                        <button
                          onClick={clearCart}
                          disabled={isLoading}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          <span>Clear All Items</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary - Right Column */}
            <div className="lg:col-span-4 mt-8 lg:mt-0">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 sticky top-8">
                <div className="p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Order Summary</span>
                  </h2>

                  {/* Summary Details */}
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        Subtotal ({totalItems} items)
                      </span>
                      <span className="font-semibold">
                        ₦{totalPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-semibold text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-semibold">
                        ₦{Math.round(totalPrice * 0.075).toLocaleString()}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">
                          Total
                        </span>
                        <span className="text-2xl font-bold text-blue-600">
                          ₦{Math.round(totalPrice * 1.075).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Promo Code */}
                  <div className="mb-6">
                    <div className="flex flex-col lg:flex-row space-x-2">
                      <input
                        type="text"
                        placeholder="Enter promo code"
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-center mb-4"
                      />
                      <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium">
                        Apply
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      disabled={isLoading || cartItems.length === 0}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
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
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      <span>Secure Checkout</span>
                    </button>

                    <button
                      disabled={isLoading || cartItems.length === 0}
                      className="w-full border-2 border-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636L4.318 6.318z"
                        />
                      </svg>
                      <span>Save for Later</span>
                    </button>
                  </div>

                  {/* Security Features */}
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
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
                        <span>Secure Payment</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <svg
                          className="w-4 h-4 text-blue-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                          />
                        </svg>
                        <span>Protected Checkout</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <svg
                          className="w-4 h-4 text-purple-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>Fast Delivery</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mt-6 bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  <span>We Accept</span>
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl text-center border border-blue-200">
                    <div className="font-bold text-blue-800 text-sm">VISA</div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-red-100 p-3 rounded-xl text-center border border-orange-200">
                    <div className="font-bold text-red-800 text-sm">MASTER</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-100 p-3 rounded-xl text-center border border-purple-200">
                    <div className="font-bold text-purple-800 text-sm">
                      PAYPAL
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Action Bar */}
          {cartItems.length > 0 && (
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-600">
                    Total ({totalItems} items)
                  </p>
                  <p className="text-xl font-bold text-blue-600">
                    ₦{Math.round(totalPrice * 1.075).toLocaleString()}
                  </p>
                </div>
                <button
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span>Checkout</span>
                </button>
              </div>
            </div>
          )}

          {/* Mobile Spacing for Fixed Bar */}
          {cartItems.length > 0 && <div className="lg:hidden h-24"></div>}
        </div>
      </div>
    </div>
  );
}
