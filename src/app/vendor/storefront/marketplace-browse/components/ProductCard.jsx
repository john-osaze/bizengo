import React, { useState } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const ProductCard = ({ product, onAddToWishlist, onQuickView, onAddToCart }) => {
  const [isWishlisted, setIsWishlisted] = useState(product.isWishlisted || false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    onAddToWishlist?.(product.id, !isWishlisted);
  };

  const handleQuickView = (e) => {
    e.stopPropagation();
    onQuickView?.(product);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    onAddToCart?.(product);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Icon key={i} name="Star" size={12} className="text-warning fill-current" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Icon key="half" name="Star" size={12} className="text-warning fill-current opacity-50" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Icon key={`empty-${i}`} name="Star" size={12} className="text-muted-foreground" />
      );
    }

    return stars;
  };

  return (
    <div className="group bg-card rounded-lg border border-border shadow-card hover:shadow-modal transition-all duration-300 ease-out overflow-hidden">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
            imageLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={() => setImageLoading(false)}
        />
        
        {/* Loading Skeleton */}
        {imageLoading && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-card hover:bg-white transition-all duration-200"
        >
          <Icon
            name="Heart"
            size={16}
            className={`transition-colors duration-200 ${
              isWishlisted ? 'text-error fill-current' : 'text-muted-foreground'
            }`}
          />
        </button>

        {/* Quick View Button - Desktop Only */}
        <button
          onClick={handleQuickView}
          className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all duration-300 opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center"
        >
          <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-card">
            <span className="text-sm font-medium text-foreground">Quick View</span>
          </div>
        </button>

        {/* Sale Badge */}
        {product.salePrice && (
          <div className="absolute top-2 left-2 bg-error text-error-foreground px-2 py-1 rounded-md text-xs font-medium">
            {Math.round(((product.originalPrice - product.salePrice) / product.originalPrice) * 100)}% OFF
          </div>
        )}

        {/* Stock Status */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-foreground">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Vendor Name */}
        <p className="text-xs text-muted-foreground mb-1 truncate">{product.vendor}</p>

        {/* Product Name */}
        <h3 className="font-medium text-foreground mb-2 line-clamp-2 text-sm leading-tight">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center space-x-1 mb-2">
          <div className="flex items-center space-x-0.5">
            {renderStars(product.rating)}
          </div>
          <span className="text-xs text-muted-foreground">
            ({product.reviewCount})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center space-x-2 mb-3">
          <span className="font-semibold text-foreground">
            ${product.salePrice || product.price}
          </span>
          {product.salePrice && (
            <span className="text-sm text-muted-foreground line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            product.stock === 0
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80'
          }`}
        >
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;