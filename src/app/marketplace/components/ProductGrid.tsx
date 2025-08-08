import React from 'react';
import ProductCard from './ProductCard';
import Icon from '@/components/AppIcon';
import { useRouter } from 'next/navigation';



 const handleRefresh = () => {
	const router = useRouter();
    router.refresh();
  };
// --- START OF TYPESCRIPT CONVERSION ---

// Define the shape of a single product for this component

// export interface Product {
// 	id: number | string;
// 	name: string;
// 	image: string;
// 	price: number;
// 	salePrice?: number;
// 	originalPrice?: number;
// 	rating: number;
// 	reviewCount: number;
// 	isWishlisted?: boolean;
// }

interface Product {
	id: number;
	name: string;
	vendor: string;
	price: number;
	salePrice?: number;
	originalPrice?: number;
	rating: number;
	reviewCount: number;
	image: string;
	images?: string[];
	stock: number;
	category: string;
	isWishlisted?: boolean;
	description: string;
}

// Define the props for the ProductGrid component
interface ProductGridProps {
	products: Product[];
	loading: boolean;
	hasMore: boolean;
	onLoadMore?: () => Promise<void>;
	onAddToWishlist?: (productId: number | string, isWishlisted: boolean) => void;
	onQuickView?: (product: Product) => void;
	onAddToCart?: (product: Product) => void;
}

// --- END OF TYPESCRIPT CONVERSION ---

const ProductGrid: React.FC<ProductGridProps> = ({
	products,
	loading,
	hasMore,
	onLoadMore,
	onAddToWishlist,
	onQuickView,
	onAddToCart
}) => {
	const [isLoadingMore, setIsLoadingMore] = React.useState(false);

	const handleScroll = React.useCallback(() => {
		// Prevent multiple triggers
		if (loading || isLoadingMore || !hasMore || !onLoadMore) return;

		const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		const windowHeight = window.innerHeight;
		const documentHeight = document.documentElement.scrollHeight;

		// Load more when the user is 200px from the bottom
		if (scrollTop + windowHeight >= documentHeight - 200) {
			setIsLoadingMore(true);
			onLoadMore().finally(() => {
				setIsLoadingMore(false);
			});
		}
	}, [loading, isLoadingMore, hasMore, onLoadMore]);

	React.useEffect(() => {
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, [handleScroll]);

	const renderSkeletonCard = () => (
		<div className="bg-card rounded-lg border border-border shadow-card overflow-hidden animate-pulse">
			<div className="aspect-square bg-muted" />
			<div className="p-4 space-y-3">
				<div className="h-3 bg-muted rounded w-1/2" />
				<div className="h-4 bg-muted rounded w-3/4" />
				<div className="flex items-center space-x-1">
					<div className="h-3 bg-muted rounded w-16" />
					<div className="h-3 bg-muted rounded w-8" />
				</div>
				<div className="h-4 bg-muted rounded w-1/3" />
				<div className="h-8 bg-muted rounded" />
			</div>
		</div>
	);

	const renderEmptyState = () => (
		<div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
			<div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
				<Icon name="Search" size={32} className="text-muted-foreground" />
			</div>
			<h3 className="text-lg font-semibold text-foreground mb-2">No products found</h3>
			<p className="text-muted-foreground mb-4 max-w-md">
				We couldn't find any products matching your search criteria. Try adjusting your filters or search terms.
			</p>
			<button
				onClick={() => handleRefresh}
				className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200"
			>
				<Icon name="RotateCcw" size={16} />
				<span>Reset Filters</span>
			</button>
		</div>
	);

	return (
		<div className="flex-1">
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
				{loading && products.length === 0 && (
					<>
						{Array.from({ length: 12 }).map((_, index) => (
							<div key={`skeleton-${index}`}>
								{renderSkeletonCard()}
							</div>
						))}
					</>
				)}

				{products.map((product) => (
					<ProductCard
						key={product.id}
						product={product}
						onAddToWishlist={onAddToWishlist}
						onQuickView={onQuickView}
						onAddToCart={onAddToCart}
					/>
				))}

				{isLoadingMore && (
					<>
						{Array.from({ length: 4 }).map((_, index) => (
							<div key={`loading-more-${index}`}>
								{renderSkeletonCard()}
							</div>
						))}
					</>
				)}
			</div>

			{!loading && products.length === 0 && (
				<div className="grid grid-cols-1">
					{renderEmptyState()}
				</div>
			)}

			{!loading && !isLoadingMore && hasMore && products.length > 0 && (
				<div className="flex justify-center p-8">
					<button
						onClick={() => {
							if (!onLoadMore) return;
							setIsLoadingMore(true);
							onLoadMore().finally(() => {
								setIsLoadingMore(false);
							});
						}}
						className="flex items-center space-x-2 px-6 py-3 bg-card border border-border rounded-lg hover:bg-muted transition-colors duration-200"
					>
						<Icon name="ChevronDown" size={16} />
						<span className="font-medium">Load More Products</span>
					</button>
				</div>
			)}

			{!loading && !hasMore && products.length > 0 && (
				<div className="flex justify-center p-8">
					<div className="flex items-center space-x-2 text-muted-foreground">
						<Icon name="CheckCircle" size={16} />
						<span className="text-sm">You've seen all products</span>
					</div>
				</div>
			)}
		</div>
	);
};

export default ProductGrid;