import React, { useState, ChangeEvent, FormEvent, DragEvent} from 'react';
import Icon from '@/components/AppIcon';
import Image from '@/components/ui/AppImage';
import Button from '@/components/ui/new/Button';
import Input from '@/components/ui/new/Input';
import Select from '@/components/ui/new/NewSelect';

// Type definitions
interface ProductDimensions {
    length: string;
    width: string;
    height: string;
}

interface ProductImage {
    id: number;
    file: File;
    url: string;
    alt: string;
}

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
    dimensions: ProductDimensions;
    status: 'active' | 'draft' | 'inactive';
    visibility: 'visible' | 'hidden';
    seoTitle: string;
    seoDescription: string;
    tags: string[];
    images: ProductImage[];
}

interface EditingProduct {
    name?: string;
    description?: string;
    category?: string;
    price?: string;
    comparePrice?: string;
    cost?: string;
    sku?: string;
    barcode?: string;
    stock?: string;
    lowStockThreshold?: string;
    weight?: string;
    dimensions?: ProductDimensions;
    status?: 'active' | 'draft' | 'inactive';
    visibility?: 'visible' | 'hidden';
    seoTitle?: string;
    seoDescription?: string;
    tags?: string[];
    images?: ProductImage[];
}

interface SelectOption {
    value: string;
    label: string;
}

interface Tab {
    id: string;
    label: string;
    icon: string;
}

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (formData: ProductFormData) => void;
    editingProduct?: EditingProduct | null | any;
}

const AddProductModal: React.FC<AddProductModalProps> = ({
    isOpen,
    onClose,
    onSave,
    editingProduct = null
}) => {
    const [activeTab, setActiveTab] = useState<string>('basic');
    const [formData, setFormData] = useState<ProductFormData>({
        name: editingProduct?.name || '',
        description: editingProduct?.description || '',
        category: editingProduct?.category || '',
        price: editingProduct?.price || '',
        comparePrice: editingProduct?.comparePrice || '',
        cost: editingProduct?.cost || '',
        sku: editingProduct?.sku || '',
        barcode: editingProduct?.barcode || '',
        stock: editingProduct?.stock || '',
        lowStockThreshold: editingProduct?.lowStockThreshold || '10',
        weight: editingProduct?.weight || '',
        dimensions: editingProduct?.dimensions || { length: '', width: '', height: '' },
        status: editingProduct?.status || 'draft',
        visibility: editingProduct?.visibility || 'visible',
        seoTitle: editingProduct?.seoTitle || '',
        seoDescription: editingProduct?.seoDescription || '',
        tags: editingProduct?.tags || [],
        images: editingProduct?.images || []
    });

    const [dragActive, setDragActive] = useState<boolean>(false);

    const categoryOptions: SelectOption[] = [
        { value: 'electronics', label: 'Electronics' },
        { value: 'clothing', label: 'Clothing' },
        { value: 'home', label: 'Home & Garden' },
        { value: 'books', label: 'Books' },
        { value: 'sports', label: 'Sports & Outdoors' }
    ];

    const statusOptions: SelectOption[] = [
        { value: 'active', label: 'Active' },
        { value: 'draft', label: 'Draft' },
        { value: 'inactive', label: 'Inactive' }
    ];

    const visibilityOptions: SelectOption[] = [
        { value: 'visible', label: 'Visible' },
        { value: 'hidden', label: 'Hidden' }
    ];

    const tabs: Tab[] = [
        { id: 'basic', label: 'Basic Info', icon: 'Info' },
        { id: 'images', label: 'Images', icon: 'Image' },
        { id: 'pricing', label: 'Pricing', icon: 'DollarSign' },
        { id: 'inventory', label: 'Inventory', icon: 'Package' },
        { id: 'seo', label: 'SEO', icon: 'Search' }
    ];

    const handleInputChange = (field: keyof ProductFormData, value: string): void => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleDimensionChange = (dimension: keyof ProductDimensions, value: string): void => {
        setFormData(prev => ({
            ...prev,
            dimensions: {
                ...prev.dimensions,
                [dimension]: value
            }
        }));
    };

    const handleImageUpload = (files: FileList | null): void => {
        if (!files) return;

        const newImages: ProductImage[] = Array.from(files).map(file => ({
            id: Date.now() + Math.random(),
            file,
            url: URL.createObjectURL(file),
            alt: file.name
        }));

        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...newImages]
        }));
    };

    const removeImage = (imageId: number): void => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter(img => img.id !== imageId)
        }));
    };

    const handleDrag = (e: DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleImageUpload(e.dataTransfer.files);
        }
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1300 p-4">
            <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[75vh] overflow-y-scroll">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-xl font-semibold text-foreground">
                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-md transition-smooth"
                    >
                        <Icon name="X" size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-border">
                    <div className="flex overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 transition-smooth ${activeTab === tab.id
                                        ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <Icon name={tab.icon} size={16} />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto p-6">
                        {activeTab === 'basic' && (
                            <div className="space-y-6">
                                <Input
                                    label="Product Name"
                                    type="text"
                                    value={formData.name}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('name', e.target.value)}
                                    placeholder="Enter product name"
                                    required
                                />

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                                        placeholder="Enter product description"
                                        rows={4}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>

                                <Select
                                    label="Category"
                                    options={categoryOptions}
                                    value={formData.category}
                                    onChange={(value: string) => handleInputChange('category', value)}
                                    placeholder="Select category"
                                    required
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <Select
                                        label="Status"
                                        options={statusOptions}
                                        value={formData.status}
                                        onChange={(value: string) => handleInputChange('status', value as ProductFormData['status'])}
                                    />

                                    <Select
                                        label="Visibility"
                                        options={visibilityOptions}
                                        value={formData.visibility}
                                        onChange={(value: string) => handleInputChange('visibility', value as ProductFormData['visibility'])}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'images' && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Product Images
                                    </label>
                                    <div
                                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-smooth ${dragActive ? 'border-primary bg-primary/5' : 'border-border'
                                            }`}
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                    >
                                        <Icon name="Upload" size={48} className="text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground mb-2">
                                            Drag and drop images here, or click to select
                                        </p>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleImageUpload(e.target.files)}
                                            className="hidden"
                                            id="image-upload"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => document.getElementById('image-upload')?.click()}
                                        >
                                            Choose Files
                                        </Button>
                                    </div>
                                </div>

                                {formData.images.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {formData.images.map((image, index) => (
                                            <div key={image.id} className="relative group">
                                                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                                                    <Image
                                                        src={image.url}
                                                        alt={image.alt}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(image.id)}
                                                    className="absolute top-2 right-2 p-1 bg-error text-error-foreground rounded-full opacity-0 group-hover:opacity-100 transition-smooth"
                                                >
                                                    <Icon name="X" size={14} />
                                                </button>
                                                {index === 0 && (
                                                    <span className="absolute bottom-2 left-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded">
                                                        Main
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'pricing' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input
                                        label="Price"
                                        type="number"
                                        value={formData.price}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('price', e.target.value)}
                                        placeholder="0.00"
                                        step="0.01"
                                        required
                                    />

                                    <Input
                                        label="Compare at Price"
                                        type="number"
                                        value={formData.comparePrice}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('comparePrice', e.target.value)}
                                        placeholder="0.00"
                                        step="0.01"
                                        description="Show a higher price for comparison"
                                    />

                                    <Input
                                        label="Cost per Item"
                                        type="number"
                                        value={formData.cost}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('cost', e.target.value)}
                                        placeholder="0.00"
                                        step="0.01"
                                        description="For profit calculations"
                                    />
                                </div>

                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <h4 className="font-medium text-foreground mb-2">Profit Calculation</h4>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Price:</span>
                                            <span className="text-foreground">${formData.price || '0.00'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Cost:</span>
                                            <span className="text-foreground">-${formData.cost || '0.00'}</span>
                                        </div>
                                        <div className="flex justify-between border-t border-border pt-1">
                                            <span className="font-medium text-foreground">Profit:</span>
                                            <span className="font-medium text-success">
                                                ${((parseFloat(formData.price) || 0) - (parseFloat(formData.cost) || 0)).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'inventory' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="SKU"
                                        type="text"
                                        value={formData.sku}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('sku', e.target.value)}
                                        placeholder="Enter SKU"
                                    />

                                    <Input
                                        label="Barcode"
                                        type="text"
                                        value={formData.barcode}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('barcode', e.target.value)}
                                        placeholder="Enter barcode"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Stock Quantity"
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('stock', e.target.value)}
                                        placeholder="0"
                                        min="0"
                                        required
                                    />

                                    <Input
                                        label="Low Stock Threshold"
                                        type="number"
                                        value={formData.lowStockThreshold}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('lowStockThreshold', e.target.value)}
                                        placeholder="10"
                                        min="0"
                                        description="Alert when stock falls below this number"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-medium text-foreground">Shipping Information</h4>

                                    <Input
                                        label="Weight (kg)"
                                        type="number"
                                        value={formData.weight}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('weight', e.target.value)}
                                        placeholder="0.0"
                                        step="0.1"
                                    />

                                    <div className="grid grid-cols-3 gap-4">
                                        <Input
                                            label="Length (cm)"
                                            type="number"
                                            value={formData.dimensions.length}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleDimensionChange('length', e.target.value)}
                                            placeholder="0"
                                        />

                                        <Input
                                            label="Width (cm)"
                                            type="number"
                                            value={formData.dimensions.width}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleDimensionChange('width', e.target.value)}
                                            placeholder="0"
                                        />

                                        <Input
                                            label="Height (cm)"
                                            type="number"
                                            value={formData.dimensions.height}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => handleDimensionChange('height', e.target.value)}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'seo' && (
                            <div className="space-y-6">
                                <Input
                                    label="SEO Title"
                                    type="text"
                                    value={formData.seoTitle}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange('seoTitle', e.target.value)}
                                    placeholder="Enter SEO title"
                                    description="Recommended: 50-60 characters"
                                />

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        SEO Description
                                    </label>
                                    <textarea
                                        value={formData.seoDescription}
                                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange('seoDescription', e.target.value)}
                                        placeholder="Enter SEO description"
                                        rows={3}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Recommended: 150-160 characters
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Product Tags
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="Enter tags separated by commas"
                                        description="Help customers find your product"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end space-x-3 p-6 border-t border-border">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="default">
                            {editingProduct ? 'Update Product' : 'Save Product'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProductModal;