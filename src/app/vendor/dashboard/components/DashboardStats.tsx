import React from 'react';
import Icon from '@/components/AppIcon';

interface DashboardStatsData {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  averageRating: number;
  monthlyGrowth: number;
  newCustomers: number;
  pendingOrders: number;
  lowStockItems: number;
}

interface DashboardStatsProps {
  stats: DashboardStatsData;
}

interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'warning' | 'neutral';
  icon: string;
  iconColor: string;
  iconBg: string;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  const statCards: StatCard[] = [
    {
      title: 'Total Sales',
      value: `$${stats?.totalSales?.toLocaleString() || '0'}`,
      change: `+${stats?.monthlyGrowth || 0}%`,
      changeType: 'positive',
      icon: 'DollarSign',
      iconColor: 'text-success',
      iconBg: 'bg-success-50'
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders?.toString() || '0',
      change: `+${stats?.newCustomers || 0} new`,
      changeType: 'positive',
      icon: 'ShoppingCart',
      iconColor: 'text-primary',
      iconBg: 'bg-primary-50'
    },
    {
      title: 'Products Listed',
      value: stats?.totalProducts?.toString() || '0',
      change: `${stats?.lowStockItems || 0} low stock`,
      changeType: stats?.lowStockItems > 0 ? 'warning' : 'neutral',
      icon: 'Package',
      iconColor: 'text-success',
      iconBg: 'bg-accent-50'
    },
    {
      title: 'Average Rating',
      value: stats?.averageRating?.toFixed(1) || '0.0',
      change: 'Based on reviews',
      changeType: 'neutral',
      icon: 'Star',
      iconColor: 'text-warning',
      iconBg: 'bg-warning-50'
    }
  ];

  const getChangeColorClass = (type: StatCard['changeType']): string => {
    switch (type) {
      case 'positive':
        return 'text-success';
      case 'negative':
        return 'text-error';
      case 'warning':
        return 'text-warning';
      default:
        return 'text-text-muted';
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h2 className="font-heading font-semibold text-lg text-text-primary mb-6">
        Business Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-lg ${card.iconBg} flex items-center justify-center`}>
              <Icon name={card.icon} size={24} className={card.iconColor} />
            </div>

            <div className="flex-1">
              <p className="text-sm text-text-muted font-medium">
                {card.title}
              </p>
              <p className="text-2xl font-bold text-text-primary">
                {card.value}
              </p>
              <p className={`text-sm ${getChangeColorClass(card.changeType)}`}>
                {card.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 pt-6 border-t border-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">
              {stats?.pendingOrders || 0}
            </p>
            <p className="text-sm text-text-muted">
              Pending Orders
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-success">
              {stats?.newCustomers || 0}
            </p>
            <p className="text-sm text-text-muted">
              New Customers
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-success">
              {stats?.totalProducts || 0}
            </p>
            <p className="text-sm text-text-muted">
              Active Products
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-warning">
              {stats?.lowStockItems || 0}
            </p>
            <p className="text-sm text-text-muted">
              Low Stock Items
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;