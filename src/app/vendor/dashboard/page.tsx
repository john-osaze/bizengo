"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
// import { Helmet } from 'react-helmet';
import VendorHeader from './components/VendorHeader';
import DashboardStats from './components/DashboardStats';
import QuickActions from './components/QuickActions';
import RecentOrders from './components/RecentOrders';
import ProductOverview from './components/ProductOverview';
import PerformanceChart from './components/PerformanceChart';
import NotificationPanel from './components/NotificationPanel';

// Remove local PerformanceData interface and import from types.ts
import { PerformanceData } from './PerformanceDataType';

interface VendorData {
  firstName: string;
  lastName: string;
  email: string;
  businessName: string;
  isVerified: boolean;
}

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  averageRating: number;
  monthlyGrowth: number;
  newCustomers: number;
  pendingOrders: number;
  lowStockItems: number;
}

interface Order {
  id: string;
  customerName: string;
  items: string[];
  total: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  orderDate: string;
  deliveryType: 'delivery' | 'pickup' | 'in-store';
}

interface Product {
  id: string;
  name: string;
  image: string;
  orders: number;
  revenue: number;
  rating: number;
}

interface Notification {
  id: string;
  type: 'order' | 'review' | 'inventory' | 'payment' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface DashboardData {
  stats: DashboardStats;
  recentOrders: Order[];
  topProducts: Product[];
  performanceData: PerformanceData[];
  notifications: Notification[];
}

const VendorDashboard: React.FC = () => {
  const router = useRouter();
  const [vendorData, setVendorData] = useState<VendorData | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if vendor is authenticated
    const isLoggedIn = localStorage.getItem('isVendorLoggedIn');
    if (!isLoggedIn) {
      router.push('../vendor-auth');
      return;
    }

    // Load vendor data
    const vendor = JSON.parse(localStorage.getItem('vendorAuth') || '{}');
    setVendorData(vendor);

    // Load dashboard data
    loadDashboardData();
  }, [router]);

  const loadDashboardData = async (): Promise<void> => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockDashboardData: DashboardData = {
        stats: {
          totalSales: 12450,
          totalOrders: 87,
          totalProducts: 23,
          averageRating: 4.6,
          monthlyGrowth: 15.2,
          newCustomers: 34,
          pendingOrders: 5,
          lowStockItems: 3
        },
        recentOrders: [
          {
            id: 'ORD-001',
            customerName: 'Sarah Johnson',
            items: ['Margherita Pizza', 'Caesar Salad'],
            total: 28.50,
            status: 'pending',
            orderDate: '2024-01-15T10:30:00Z',
            deliveryType: 'delivery'
          },
          {
            id: 'ORD-002',
            customerName: 'Mike Chen',
            items: ['Smartphone Case', 'Screen Protector'],
            total: 35.99,
            status: 'confirmed',
            orderDate: '2024-01-15T09:15:00Z',
            deliveryType: 'pickup'
          },
          {
            id: 'ORD-003',
            customerName: 'Emily Rodriguez',
            items: ['Hair Cut', 'Hair Color'],
            total: 85.00,
            status: 'completed',
            orderDate: '2024-01-14T14:20:00Z',
            deliveryType: 'in-store'
          }
        ],
        topProducts: [
          {
            id: 'P001',
            name: 'Margherita Pizza',
            image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100',
            orders: 45,
            revenue: 675.00,
            rating: 4.8
          },
          {
            id: 'P002',
            name: 'Smartphone Case',
            image: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=100',
            orders: 23,
            revenue: 459.00,
            rating: 4.5
          },
          {
            id: 'P003',
            name: 'Hair Styling Service',
            image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100',
            orders: 19,
            revenue: 950.00,
            rating: 4.9
          }
        ],
        performanceData: [
          { name: 'Jan', sales: 4000, orders: 24 },
          { name: 'Feb', sales: 3000, orders: 18 },
          { name: 'Mar', sales: 5000, orders: 32 },
          { name: 'Apr', sales: 4500, orders: 28 },
          { name: 'May', sales: 6000, orders: 40 },
          { name: 'Jun', sales: 5500, orders: 35 }
        ],
        notifications: [
          {
            id: 'N001',
            type: 'order',
            title: 'New Order Received',
            message: 'Order #ORD-001 from Sarah Johnson',
            timestamp: '2024-01-15T10:30:00Z',
            read: false
          },
          {
            id: 'N002',
            type: 'review',
            title: 'New Review',
            message: 'Mike Chen left a 5-star review',
            timestamp: '2024-01-15T09:00:00Z',
            read: false
          },
          {
            id: 'N003',
            type: 'inventory',
            title: 'Low Stock Alert',
            message: 'Pizza Dough is running low (3 items left)',
            timestamp: '2024-01-15T08:00:00Z',
            read: true
          }
        ]
      };

      setDashboardData(mockDashboardData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = (): void => {
    localStorage.removeItem('vendorAuth');
    localStorage.removeItem('isVendorLoggedIn');
    router.push('../vendor-auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!vendorData || !dashboardData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-primary text-lg mb-4">Failed to load dashboard</p>
          <button
            onClick={() => window.location.reload()}
            className="text-primary hover:underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* <Helmet>
        <title>Vendor Dashboard - {vendorData?.businessName || 'Business'}</title>
        <meta name="description" content="Manage your business, products, and orders" />
      </Helmet> */}

      <div className="min-h-screen bg-background">
        {/* Header */}
        <VendorHeader
          vendorData={vendorData}
          onLogout={handleLogout}
        />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="font-heading font-bold text-2xl text-text-primary mb-2">
              Welcome back, {vendorData?.firstName}! 👋
            </h1>
            <p className="text-text-muted">
              Here's what's happening with your business today
            </p>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Stats Cards */}
            <div className="lg:col-span-8">
              <DashboardStats stats={dashboardData.stats} />
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-4">
              <QuickActions />
            </div>

            {/* Performance Chart */}
            <div className="lg:col-span-8">
              <PerformanceChart data={dashboardData.performanceData} />
            </div>

            {/* Notifications */}
            <div className="lg:col-span-4">
              <NotificationPanel notifications={dashboardData.notifications} />
            </div>

            {/* Recent Orders */}
            <div className="lg:col-span-8">
              <RecentOrders orders={dashboardData.recentOrders} />
            </div>

            {/* Product Overview */}
            <div className="lg:col-span-4">
              <ProductOverview products={dashboardData.topProducts} />
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default VendorDashboard;