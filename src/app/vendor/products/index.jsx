import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import VendorHeader from '../vendor-dashboard/components/VendorHeader';
import ProductGrid from './components/ProductGrid';
import ProductFilters from './components/ProductFilters';
import ProductStats from './components/ProductStats';
import AddProductModal from './components/AddProductModal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';

const VendorProducts = () => {
  const navigate = useNavigate();
  const [vendorData, setVendorData] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Mock products data
  const mockProducts = [
    {
      id: 'P001',
      name: 'Margherita Pizza',
      description: 'Classic pizza with fresh tomatoes, mozzarella, and basil',
      category: 'food',
      price: 15.99,
      images: [
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
        'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400'
      ],
      stock: 50,
      status: 'active',
      rating: 4.8,
      totalOrders: 45,
      totalRevenue: 719.55,
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
      tags: ['pizza', 'italian', 'vegetarian'],
      variants: [
        { name: 'Small', price: 12.99 },
        { name: 'Medium', price: 15.99 },
        { name: 'Large', price: 18.99 }
      ]
    },
    {
      id: 'P002',
      name: 'Smartphone Case',
      description: 'Premium protective case for iPhone 15 Pro with military-grade protection',
      category: 'electronics',
      price: 19.99,
      images: [
        'https://images.unsplash.com/photo-1601593346740-925612772716?w=400'
      ],
      stock: 25,
      status: 'active',
      rating: 4.5,
      totalOrders: 23,
      totalRevenue: 459.77,
      createdAt: '2024-01-08T00:00:00Z',
      updatedAt: '2024-01-14T00:00:00Z',
      tags: ['phone', 'case', 'protection'],
      variants: [
        { name: 'Clear', price: 19.99 },
        { name: 'Black', price: 19.99 },
        { name: 'Blue', price: 19.99 }
      ]
    },
    {
      id: 'P003',
      name: 'Hair Styling Service',
      description: 'Professional hair styling service including wash, cut, and styling',
      category: 'service',
      price: 50.00,
      images: [
        'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400'
      ],
      stock: null, // Services don't have stockstatus: 'active',rating: 4.9,totalOrders: 19,totalRevenue: 950.00,createdAt: '2024-01-05T00:00:00Z',updatedAt: '2024-01-12T00:00:00Z',
      tags: ['hair', 'styling', 'beauty'],
      duration: '60 minutes'
    },
    {
      id: 'P004',name: 'Organic Coffee Beans',description: 'Premium organic coffee beans from Colombia, medium roast',category: 'food',
      price: 24.99,
      images: [
        'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400'
      ],
      stock: 5, // Low stock
      status: 'active',rating: 4.7,totalOrders: 12,totalRevenue: 299.88,createdAt: '2024-01-01T00:00:00Z',updatedAt: '2024-01-10T00:00:00Z',
      tags: ['coffee', 'organic', 'beans'],
      weight: '500g'
    },
    {
      id: 'P005',name: 'Yoga Class',description: 'Beginner-friendly yoga class focusing on flexibility and mindfulness',category: 'service',
      price: 25.00,
      images: [
        'https://images.unsplash.com/photo-1506629905607-45cc9d5d112d?w=400'
      ],
      stock: null,
      status: 'draft',rating: 0,totalOrders: 0,totalRevenue: 0,createdAt: '2024-01-15T00:00:00Z',updatedAt: '2024-01-15T00:00:00Z',
      tags: ['yoga', 'fitness', 'wellness'],
      duration: '45 minutes'
    }
  ];

  useEffect(() => {
    // Check if vendor is authenticated
    const isLoggedIn = localStorage.getItem('isVendorLoggedIn');
    if (!isLoggedIn) {
      navigate('/vendor-auth');
      return;
    }

    // Load vendor data
    const vendor = JSON.parse(localStorage.getItem('vendorAuth') || '{}');
    setVendorData(vendor);

    // Load products
    loadProducts();
  }, [navigate]);

  useEffect(() => {
    // Filter and sort products
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.price - b.price;
        case 'stock':
          return (b.stock || 0) - (a.stock || 0);
        case 'orders':
          return b.totalOrders - a.totalOrders;
        case 'revenue':
          return b.totalRevenue - a.totalRevenue;
        case 'rating':
          return b.rating - a.rating;
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategory, sortBy]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProducts(mockProducts);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductAction = async (action, productId) => {
    switch (action) {
      case 'edit':
        navigate(`/vendor-products/${productId}/edit`);
        break;
      case 'duplicate':
        // Duplicate product logic
        break;
      case 'delete':
        if (window.confirm('Are you sure you want to delete this product?')) {
          setProducts(prev => prev.filter(p => p.id !== productId));
        }
        break;
      case 'toggle-status':
        setProducts(prev => prev.map(p => 
          p.id === productId 
            ? { ...p, status: p.status === 'active' ? 'draft' : 'active' }
            : p
        ));
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('vendorAuth');
    localStorage.removeItem('isVendorLoggedIn');
    navigate('/vendor-auth');
  };

  const getProductStats = () => {
    const active = products.filter(p => p.status === 'active').length;
    const draft = products.filter(p => p.status === 'draft').length;
    const lowStock = products.filter(p => p.stock !== null && p.stock <= 10).length;
    const totalRevenue = products.reduce((sum, p) => sum + p.totalRevenue, 0);
    
    return { active, draft, lowStock, totalRevenue };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <VendorHeader vendorData={vendorData} onLogout={handleLogout} />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-muted">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Products - {vendorData?.businessName || 'Business'}</title>
        <meta name="description" content="Manage your products and services" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <VendorHeader vendorData={vendorData} onLogout={handleLogout} />

        <main className="max-w-7xl mx-auto px-4 py-6">
          {/* Page Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="font-heading font-bold text-2xl text-text-primary mb-2">
                Products & Services
              </h1>
              <p className="text-text-muted">
                Manage your product catalog and services
              </p>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <Icon name="Filter" size={16} className="mr-2" />
                Filters
              </Button>
              
              <Button
                variant="primary"
                onClick={() => setShowAddModal(true)}
              >
                <Icon name="Plus" size={16} className="mr-2" />
                Add Product
              </Button>
            </div>
          </div>

          {/* Stats */}
          <ProductStats stats={getProductStats()} />

          {/* Search and Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon="Search"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
                <option value="stock">Sort by Stock</option>
                <option value="orders">Sort by Orders</option>
                <option value="revenue">Sort by Revenue</option>
                <option value="rating">Sort by Rating</option>
                <option value="created">Sort by Date Created</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-surface rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ?'bg-card text-text-primary shadow-sm' :'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  <Icon name="Grid3X3" size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ?'bg-card text-text-primary shadow-sm' :'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  <Icon name="List" size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Filters Sidebar */}
            <div className={`lg:col-span-3 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <ProductFilters
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                products={products}
              />
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-9">
              <ProductGrid
                products={filteredProducts}
                viewMode={viewMode}
                onProductAction={handleProductAction}
                loading={loading}
              />
            </div>
          </div>
        </main>

        {/* Add Product Modal */}
        {showAddModal && (
          <AddProductModal
            onClose={() => setShowAddModal(false)}
            onProductAdded={(newProduct) => {
              setProducts(prev => [...prev, newProduct]);
              setShowAddModal(false);
            }}
          />
        )}
      </div>
    </>
  );
};

export default VendorProducts;