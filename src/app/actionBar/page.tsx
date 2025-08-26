"use client";
// ActionBar.tsx
import React from "react";
import { ShoppingCart, Heart, MessageCircle } from "lucide-react";
import { Product } from "@/types/types"; // ✅ import shared Product

interface ActionBarProps {
  product: Product;
  cartQuantity: number;
  onAddToCart: () => Promise<void>;
  onBuyNow: () => Promise<void>;
  onWishlistToggle: () => void;
  isWishlisted: boolean;
  isAddingToCart?: boolean; // Optional, defaults to false
}

const ActionBar: React.FC<ActionBarProps> = ({
  product,
  cartQuantity,
  onAddToCart,
  onBuyNow,
  onWishlistToggle,
  isWishlisted,
  isAddingToCart = false,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
      <div className="flex items-center space-x-3">
        {/* Wishlist Button */}
        <button
          onClick={onWishlistToggle}
          className={`p-3 rounded-lg border-2 transition-colors duration-200 ${
            isWishlisted
              ? "border-red-500 bg-red-50 text-red-500"
              : "border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500"
          }`}
        >
          <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
        </button>

        {/* Contact Seller Button */}
        <button className="p-3 rounded-lg border-2 border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors duration-200">
          <MessageCircle className="w-5 h-5" />
        </button>

        {/* Add to Cart Button */}
        <button
          onClick={onAddToCart}
          disabled={isAddingToCart}
          className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAddingToCart ? (
            <>
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
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
          onClick={onBuyNow}
          disabled={isAddingToCart}
          className="flex-1 py-3 px-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAddingToCart ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </div>
          ) : (
            `Buy Now - $${product.price}`
          )}
        </button>
      </div>
    </div>
  );
};

export default ActionBar;
