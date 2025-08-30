"use client";
import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";

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
const NotificationToast: React.FC<{
  notification: Notification;
  onClose: (id: string) => void;
}> = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(notification.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [notification.id, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <AlertCircle className="w-5 h-5 text-blue-500" />,
  };

  const bgColors = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    info: "bg-blue-50 border-blue-200",
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg border ${
        bgColors[notification.type]
      } shadow-lg max-w-sm animate-in slide-in-from-right duration-300`}
    >
      <div className="flex items-start space-x-3">
        {icons[notification.type]}
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">
            {notification.message}
          </p>
        </div>
        <button
          onClick={() => onClose(notification.id)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Main Cart Page Component (no props required)
export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem("RSToken") || "";
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
    const headers = {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
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
    } catch (error) {
      console.error("Error fetching cart:", error);
      addNotification("error", "Failed to load cart items");
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
      {/* Notifications */}
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}

      {/* Main Cart Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
              <ShoppingBag className="w-8 h-8" />
              <span>Shopping Cart ({totalItems} items)</span>
            </h1>
          </div>

          {/* Cart Content */}
          <div className="bg-white rounded-lg shadow-sm">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Your cart is empty</p>
                <p className="text-sm">Add some items to get started!</p>
              </div>
            ) : (
              <div className="p-6">
                {/* Cart Items */}
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                    >
                      <img
                        src={
                          item.product.images[0] ||
                          "https://via.placeholder.com/80"
                        }
                        alt={item.product.product_name}
                        className="w-20 h-20 object-cover rounded"
                      />

                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {item.product.product_name}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Category: {item.product.category}
                        </p>
                        <p className="text-blue-600 font-bold text-lg">
                          ₦{item.product.product_price.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() =>
                            updateCartItem(item.id, item.quantity - 1)
                          }
                          disabled={isLoading}
                          className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50"
                        >
                          <Minus className="w-4 h-4" />
                        </button>

                        <span className="w-12 text-center font-semibold text-lg">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            updateCartItem(item.id, item.quantity + 1)
                          }
                          disabled={isLoading}
                          className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => deleteCartItem(item.id)}
                          disabled={isLoading}
                          className="p-2 hover:bg-red-100 text-red-500 rounded-full ml-4 disabled:opacity-50"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-lg">
                          ₦{(item.quantity * item.product.product_price).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cart Summary */}
                <div className="border-t pt-6">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-2xl font-bold">Total:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ₦{totalPrice.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={clearCart}
                      disabled={isLoading}
                      className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      Clear Cart
                    </button>

                    <button
                      disabled={isLoading}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
                    >
                      Proceed to Checkout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}