"use client";
import React, { useState, useEffect } from "react";
import { ShoppingCart, Heart, MessageCircle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

// Mock Product type - replace with your actual type
interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
}

// ActionBar Demo Page Component (no props required)
export default function ActionBarDemoPage() {
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Mock product data - replace with actual data fetching
  const mockProduct: Product = {
    id: 1,
    name: "Premium Wireless Headphones",
    price: 299,
    image: "https://via.placeholder.com/400x300",
    description:
      "High-quality wireless headphones with noise cancellation and premium sound quality.",
  };

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setCartQuantity((prev) => prev + 1);
      console.log("Added to cart:", mockProduct.name);
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    setIsAddingToCart(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Proceeding to checkout:", mockProduct.name);
      // router.push('/checkout');
    } catch (error) {
      console.error("Error processing buy now:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = () => {
    setIsWishlisted((prev) => !prev);
    console.log(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* Product Content */}
      <div className="container mx-auto px-4 py-8 pb-32">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Product Image */}
          <div className="aspect-video bg-gray-100">
            <img
              src={mockProduct.image}
              alt={mockProduct.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Details */}
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {mockProduct.name}
            </h1>
            <p className="text-3xl font-bold text-blue-600 mb-4">
              ${mockProduct.price}
            </p>
            <p className="text-gray-600 leading-relaxed">
              {mockProduct.description}
            </p>

            {/* Additional Product Info */}
            <div className="mt-6 space-y-4">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Brand</span>
                <span className="font-medium">Premium Audio</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Warranty</span>
                <span className="font-medium">2 Years</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-green-600">
                  Free Delivery
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Instructions */}
        <div className="max-w-2xl mx-auto mt-8 p-6 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">ActionBar Demo</h3>
          <p className="text-blue-800 text-sm">
            This is a demo page showing the ActionBar component. The action bar
            is fixed at the bottom of the screen. Try the buttons to see the
            interactions in action.
          </p>
        </div>
      </div>

      {/* ActionBar - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
        <div className="container mx-auto">
          <div className="flex items-center space-x-3 max-w-2xl mx-auto">
            {/* Wishlist Button */}
            <button
              onClick={handleWishlistToggle}
              className={`p-3 rounded-lg border-2 transition-colors duration-200 ${
                isWishlisted
                  ? "border-red-500 bg-red-50 text-red-500"
                  : "border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500"
              }`}
            >
              <Heart
                className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`}
              />
            </button>

            {/* Contact Seller Button */}
            <button className="p-3 rounded-lg border-2 border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors duration-200">
              <MessageCircle className="w-5 h-5" />
            </button>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAddingToCart ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  <span>
                    Add to Cart {cartQuantity > 0 ? `(${cartQuantity})` : ""}
                  </span>
                </>
              )}
            </button>

            {/* Buy Now Button */}
            <button
              onClick={handleBuyNow}
              disabled={isAddingToCart}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAddingToCart ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                `Buy Now - $${mockProduct.price}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
