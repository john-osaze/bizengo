'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RoleProvider } from '@/components/ui/RoleContextNavigation';
import RoleContextNavigation from '@/components/ui/RoleContextNavigation';
import Icon from '@/components/AppIcon';
import Button from '@/components/ui/new/Button';
import CategoryTree from './components/CategoryTree';
import ProductToolbar from './components/ProductToolbar';
import ProductTable from './components/ProductTable';
import ProductGrid from './components/ProductGrid';
import AddProductModal from './components/AddProductModal';
import StockAlerts from './components/StockAlerts';
import VendorHeader from '../dashboard/components/VendorHeader';

// --- START OF TYPESCRIPT CONVERSION ---

// Define specific string literal types for controlled vocabularies
type ProductStatus = 'active' | 'draft' | 'inactive' | 'out-of-stock';
type ViewMode = 'table' | 'grid';
type BulkAction = 'activate' | 'deactivate' | 'duplicate' | 'delete' | 'export';

// The single source of truth for a product's data structure
// This interface should be shared or imported by child components like ProductTable, ProductGrid, etc.
export interface Product {
	id: number;
	name: string;
	image: string;
	images?: { id: number; url: string; alt: string }[];
	category: string;
	sku: string;
	price: number;
	comparePrice?: number;
	cost?: number;
	stock: number;
	lowStockThreshold?: number;
	status: ProductStatus;
	createdAt: string; // ISO Date string
	views: number;
	description?: string;
	barcode?: string;
	weight?: number;
	dimensions?: { length?: number; width?: number; height?: number };
	seoTitle?: string;
	seoDescription?: string;
	tags?: string[];
}

// Data type from the AddProductModal form. This should ideally be imported from the modal's file.
// It uses strings for numeric inputs, which is typical for HTML forms.
interface ProductFormData {
	name: string;
	description: string;
	category: string;
	price: string;
	comparePrice: string;
	cost: string;
	sku: string;
	barcode: string;
	stock: string;
	lowStockThreshold: string;
	weight: string;
	dimensions: { length: string; width: string; height: string };
	status: ProductStatus;
	visibility: 'visible' | 'hidden';
	seoTitle: string;
	seoDescription: string;
	tags: string[];
	images: { id: number; url: string; alt: string; file: File }[];
}

interface VendorData {
	firstName: string;
	lastName: string;
	email: string;
	businessName: string;
	isVerified: boolean;
}

// type Product = {
// 	id: number;
// 	name: string;
// 	image: string;
// 	category: string;
// 	sku: string;
// 	price: number;
// 	stock: number;
// 	status: 'active' | 'out-of-stock' | 'draft';
// 	createdAt: string;
// 	views: number;
// };

const ProductManagement: React.FC = () => {
	const router = useRouter();
	const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
	const [searchQuery, setSearchQuery] = useState<string>('');
	const [showAddModal, setShowAddModal] = useState<boolean>(false);
	const [showStockAlerts, setShowStockAlerts] = useState<boolean>(false);
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);
	const [products, setProducts] = useState<Product[]>([]);
	const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

	const [vendorData, setVendorData] = useState<VendorData | null>(null);

	const mockProducts: Product[] = [
		{
			id: 1,
			name: "iPhone 15 Pro Max",
			image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400",
			category: "Electronics",
			sku: "IPH15PM-256",
			price: 1199.99,
			stock: 25,
			status: "active",
			createdAt: "2025-01-15T10:30:00Z",
			views: 1250
		},
		{
			id: 2,
			name: "MacBook Pro 16-inch",
			image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
			category: "Electronics",
			sku: "MBP16-M3-512",
			price: 2499.99,
			stock: 8,
			status: "active",
			createdAt: "2025-01-10T14:20:00Z",
			views: 890
		},
		{
			id: 3,
			name: "Nike Air Max 270",
			image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
			category: "Footwear",
			sku: "NAM270-BLK-42",
			price: 149.99,
			stock: 0,
			status: "out-of-stock",
			createdAt: "2025-01-08T09:15:00Z",
			views: 567
		},
		{
			id: 4,
			name: "Samsung Galaxy S24 Ultra",
			image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400",
			category: "Electronics",
			sku: "SGS24U-512-TIT",
			price: 1299.99,
			stock: 15,
			status: "active",
			createdAt: "2025-01-05T16:45:00Z",
			views: 723
		},
		{
			id: 5,
			name: "Adidas Ultraboost 22",
			image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400",
			category: "Footwear",
			sku: "AUB22-WHT-43",
			price: 179.99,
			stock: 32,
			status: "active",
			createdAt: "2025-01-03T11:30:00Z",
			views: 445
		},
		{
			id: 6,
			name: "Sony WH-1000XM5",
			image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400",
			category: "Electronics",
			sku: "SWH1000XM5-BLK",
			price: 399.99,
			stock: 18,
			status: "active",
			createdAt: "2025-01-01T08:00:00Z",
			views: 612
		},
		{
			id: 7,
			name: "Levi\'s 501 Original Jeans",
			image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
			category: "Clothing",
			sku: "LV501-IND-32",
			price: 89.99,
			stock: 45,
			status: "active",
			createdAt: "2024-12-28T13:20:00Z",
			views: 334
		},
		{
			id: 8,
			name: "The Great Gatsby Book",
			image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
			category: "Books",
			sku: "TGG-HC-EN",
			price: 12.99,
			stock: 67,
			status: "active",
			createdAt: "2024-12-25T10:15:00Z",
			views: 189
		},
		{
			id: 9,
			name: "Wooden Coffee Table",
			image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
			category: "Furniture",
			sku: "WCT-OAK-120",
			price: 299.99,
			stock: 5,
			status: "draft",
			createdAt: "2024-12-20T15:45:00Z",
			views: 78
		},
		{
			id: 10,
			name: "Yoga Mat Premium",
			image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400",
			category: "Sports",
			sku: "YMP-PUR-6MM",
			price: 49.99,
			stock: 28,
			status: "active",
			createdAt: "2024-12-18T12:30:00Z",
			views: 256
		}
	];

	useEffect(() => {
		setProducts(mockProducts);
	}, []);

	useEffect(() => {
		let filtered = [...products];

		if (selectedCategory) {
			filtered = filtered.filter(product => product.category.toLowerCase() === selectedCategory.toLowerCase());
		}

		if (searchQuery) {
			const lowercasedQuery = searchQuery.toLowerCase();
			filtered = filtered.filter(product =>
				product.name.toLowerCase().includes(lowercasedQuery) ||
				product.sku.toLowerCase().includes(lowercasedQuery)
			);
		}

		setFilteredProducts(filtered);
	}, [products, selectedCategory, searchQuery]);

	const handleCategorySelect = (category: string | null): void => {
		setSelectedCategory(category);
	};

	const handleProductSelect = (productId: number | any, isSelected: boolean): void => {
		setSelectedProducts(prev => isSelected ? [...prev, productId] : prev.filter(id => id !== productId));
	};

	const handleSelectAll = (isSelected: boolean): void => {
		setSelectedProducts(isSelected ? filteredProducts.map(p => p.id) : []);
	};

	const handleBulkAction = (action: BulkAction, productIds: number[]): void => {
		console.log(`Performing ${action} on products:`, productIds);
		setSelectedProducts([]);
	};

	const handleAddProduct = (): void => {
		setEditingProduct(null);
		setShowAddModal(true);
	};

	const handleEditProduct = (productId: number | string): void => {
		const product = products.find(p => p.id === productId);
		if (product) {
			setEditingProduct(product);
			setShowAddModal(true);
		}
	};

	const handleDuplicateProduct = (productId: number | string): void => {
		const product = products.find(p => p.id === productId);
		if (product) {
			const duplicatedProduct: Product = {
				...product,
				id: Date.now(),
				name: `${product.name} (Copy)`,
				sku: `${product.sku}-COPY`,
				createdAt: new Date().toISOString()
			};
			setProducts(prev => [duplicatedProduct, ...prev]);
		}
	};

	const handleDeleteProduct = (productId: number | string): void => {
		if (window.confirm('Are you sure you want to delete this product?')) {
			setProducts(prev => prev.filter(p => p.id !== productId));
			setSelectedProducts(prev => prev.filter(id => id !== productId));
		}
	};

	const handleQuickEdit = (productId: number | string, field: keyof Product | string, value: string | number): void => {
		setProducts(prev => prev.map(product => {
			if (product.id === productId) {
				const isNumericField = ['price', 'stock', 'views', 'comparePrice', 'cost', 'weight'].includes(field);
				const finalValue = isNumericField ? parseFloat(String(value)) : value;
				return { ...product, [field]: finalValue };
			}
			return product;
		}));
	};

	const handleSaveProduct = (formData: ProductFormData): void => {
		const productFromForm: Omit<Product, 'id' | 'createdAt' | 'views'> = {
			name: formData.name,
			description: formData.description,
			category: formData.category,
			price: parseFloat(formData.price) || 0,
			comparePrice: parseFloat(formData.comparePrice) || undefined,
			cost: parseFloat(formData.cost) || undefined,
			sku: formData.sku,
			barcode: formData.barcode,
			stock: parseInt(formData.stock, 10) || 0,
			lowStockThreshold: parseInt(formData.lowStockThreshold, 10) || 10,
			weight: parseFloat(formData.weight) || undefined,
			dimensions: {
				length: parseFloat(formData.dimensions.length) || undefined,
				width: parseFloat(formData.dimensions.width) || undefined,
				height: parseFloat(formData.dimensions.height) || undefined,
			},
			status: formData.status,
			seoTitle: formData.seoTitle,
			seoDescription: formData.seoDescription,
			tags: formData.tags,
			image: formData.images[0]?.url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
			images: formData.images.map(img => ({ id: img.id, url: img.url, alt: img.alt })),
		};

		if (editingProduct) {
			setProducts(prev => prev.map(p =>
				p.id === editingProduct.id
					? { ...p, ...productFromForm } // Update existing product
					: p
			));
		} else {
			const newProduct: Product = {
				...productFromForm,
				id: Date.now(), // Use a more robust unique ID in a real app
				createdAt: new Date().toISOString(),
				views: 0,
			};
			setProducts(prev => [newProduct, ...prev]);
		}

		setShowAddModal(false);
		setEditingProduct(null);
	};

	const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 10).length;
	const outOfStockCount = products.filter(p => p.stock === 0).length;
	const activeProductsCount = products.filter(p => p.status === 'active').length;

	const handleLogout = (): void => {
		localStorage.removeItem('vendorAuth');
		localStorage.removeItem('isVendorLoggedIn');
		router.push('../vendor-auth');
	};

	return (
		<>
			<VendorHeader
				onLogout={handleLogout}
			/>

			<RoleProvider>
				<RoleContextNavigation>
					<div className="min-h-screen bg-background">
						<div className="max-w-7xl mx-auto p-6">
							{/* Header */}
							<div className="flex items-center justify-between mb-8">
								<div>
									<h1 className="text-3xl font-bold text-foreground">Product Management</h1>
									<p className="text-muted-foreground mt-1">
										Manage your product catalog and inventory
									</p>
								</div>

								<div className="flex items-center space-x-3">
									{(lowStockCount > 0 || outOfStockCount > 0) && (
										<Button
											variant="outline"
											onClick={() => setShowStockAlerts(true)}
											iconName="AlertTriangle"
											iconPosition="left"
										>
											Stock Alerts ({lowStockCount + outOfStockCount})
										</Button>
									)}
									<Button variant="outline" iconName="Download" iconPosition="left">
										Export
									</Button>
								</div>
							</div>

							{/* Stats Cards */}
							<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
								<div className="bg-card border border-border rounded-lg p-6">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm text-muted-foreground">Total Products</p>
											<p className="text-2xl font-bold text-foreground">{products.length}</p>
										</div>
										<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
											<Icon name="Package" size={24} className="text-primary" />
										</div>
									</div>
								</div>
								<div className="bg-card border border-border rounded-lg p-6">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm text-muted-foreground">Active Products</p>
											<p className="text-2xl font-bold text-foreground">{activeProductsCount}</p>
										</div>
										<div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
											<Icon name="CheckCircle" size={24} className="text-success" />
										</div>
									</div>
								</div>
								<div className="bg-card border border-border rounded-lg p-6">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm text-muted-foreground">Low Stock</p>
											<p className="text-2xl font-bold text-warning">{lowStockCount}</p>
										</div>
										<div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
											<Icon name="AlertTriangle" size={24} className="text-warning" />
										</div>
									</div>
								</div>
								<div className="bg-card border border-border rounded-lg p-6">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm text-muted-foreground">Out of Stock</p>
											<p className="text-2xl font-bold text-error">{outOfStockCount}</p>
										</div>
										<div className="w-12 h-12 bg-error/10 rounded-lg flex items-center justify-center">
											<Icon name="AlertCircle" size={24} className="text-error" />
										</div>
									</div>
								</div>
							</div>

							{/* Main Content */}
							<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
								<div className="lg:col-span-3">
									<CategoryTree
										onCategorySelect={handleCategorySelect}
										selectedCategory={selectedCategory}
									/>
								</div>

								<div className="lg:col-span-9">
									<ProductToolbar
										onAddProduct={handleAddProduct}
										onBulkAction={handleBulkAction}
										onViewToggle={setViewMode}
										viewMode={viewMode}
										selectedProducts={selectedProducts}
										searchQuery={searchQuery}
										onSearchChange={setSearchQuery}
									/>

									{viewMode === 'table' ? (
										<ProductTable
											products={filteredProducts}
											selectedProducts={selectedProducts}
											onProductSelect={handleProductSelect}
											onSelectAll={handleSelectAll}
											onEditProduct={handleEditProduct}
											onDuplicateProduct={handleDuplicateProduct}
											onDeleteProduct={handleDeleteProduct}
											onQuickEdit={handleQuickEdit}
										/>
									) : (
										<ProductGrid
											products={filteredProducts}
											selectedProducts={selectedProducts}
											onProductSelect={handleProductSelect}
											onEditProduct={handleEditProduct}
											onDuplicateProduct={handleDuplicateProduct}
											onDeleteProduct={handleDeleteProduct}
										/>
									)}
								</div>
							</div>
						</div>

						{/* Modals */}
						{showAddModal && (
							<AddProductModal
								isOpen={showAddModal}
								onClose={() => {
									setShowAddModal(false);
									setEditingProduct(null);
								}}
								onSave={handleSaveProduct}
								editingProduct={editingProduct}
							/>
						)}

						{showStockAlerts && (
							<StockAlerts
								onClose={() => setShowStockAlerts(false)}
							/>
						)}
					</div>
				</RoleContextNavigation>
			</RoleProvider>
		</>
	);
};

export default ProductManagement;
