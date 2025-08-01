'use client';

import React, { useState, useEffect } from 'react';
// import { useRole } from '@/components/ui/RoleContextNavigation';
import { useRouter } from 'next/navigation';
import VendorHeader from '../dashboard/components/VendorHeader';
import OrderFilters from './components/OrderFilters';
import OrderStatistics from './components/OrderStatistics';
import BulkActionsToolbar from './components/BulkActionsToolbar';
import OrderTable from './components/OrderTable';
import OrderDetailModal from './components/OrderDetailModal';
import RecentActivityFeed from './components/RecentActivityFeed';
import QuickActions from './components/QuickActions';

// Type definitions
interface Customer {
	name: string;
	email: string;
	phone?: string;
}

interface ProductOrderItem {
	id: number;
	name: string;
	image: string;
	quantity: number;
	price: number;
}

// interface ShippingAddress {
// 	name: string;
// 	street: string;
// 	city: string;
// 	state: string;
// 	zipCode: string;
// 	country: string;
// 	phone: string;
// }

interface ShippingAddress {
	name: string;
	street: string;
	city: string;
	state: string;
	zipCode: string;
	country: string;
	phone?: string;
}

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

interface ProductOrder {
	id: string;
	orderNumber: string;
	customer: Customer;
	items: ProductOrderItem[] | any[];
	subtotal: number;
	shipping: number;
	tax: number;
	total: number;
	status: OrderStatus;
	createdAt: Date;
	shippingAddress: ShippingAddress;
	customerNotes?: string | null;
	trackingNumber?: string | null;
}

interface DateRange {
	from: string;
	to: string;
}

interface AmountRange {
	min: string;
	max: string;
}

type SortOption = 'newest' | 'oldest' | 'amount_high' | 'amount_low' | string;

interface Filters {
	search: string;
	status: string;
	sort: SortOption;
	dateRange: DateRange;
	amountRange: AmountRange;
}

interface Statistics {
	totalOrders: number;
	ordersChange: number;
	pendingOrders: number;
	pendingChange: number;
	revenueToday: number;
	revenueChange: number;
	avgOrderValue: number;
	avgOrderChange: number;
}

type ActivityType = 'order_placed' | 'status_updated' | 'payment_received' | 'message_received';

interface Activity {
	id: number;
	type: ActivityType;
	title: string;
	description: string;
	orderNumber: string;
	status?: OrderStatus;
	timestamp: string;
}

type ExportFormat = 'csv' | 'xlsx' | 'pdf';

interface VendorData {
	businessName?: string;
	[key: string]: any;
}

const OrderManagement: React.FC = () => {
	// const { userRole } = useRole();
	const router = useRouter();
	const [vendorData, setVendorData] = useState<VendorData | null>(null);
	const [orders, setOrders] = useState<ProductOrder[]>([]);
	const [filteredOrders, setFilteredOrders] = useState<ProductOrder[]>([]);
	const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
	const [selectedOrder, setSelectedOrder] = useState<ProductOrder | null>(null);
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [filters, setFilters] = useState<Filters>({
		search: '',
		status: 'all',
		sort: 'newest',
		dateRange: {
			from: '',
			to: ''
		},
		amountRange: {
			min: '',
			max: ''
		}
	});

	// Mock data
	const mockOrders: ProductOrder[] = [
		{
			id: 'ORD-001',
			orderNumber: 'ORD-2024-001',
			customer: {
				name: 'Sarah Johnson',
				email: 'sarah.johnson@email.com',
				phone: '+1 (555) 123-4567'
			},
			items: [
				{
					id: 1,
					name: 'Wireless Bluetooth Headphones',
					image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
					quantity: 1,
					price: 79.99
				},
				{
					id: 2,
					name: 'Phone Case - Clear',
					image: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=400',
					quantity: 2,
					price: 15.99
				}
			],
			subtotal: 111.97,
			shipping: 9.99,
			tax: 9.76,
			total: 131.72,
			status: 'pending',
			createdAt: new Date('2024-07-27T10:30:00'),
			shippingAddress: {
				name: 'Sarah Johnson',
				street: '123 Main Street, Apt 4B',
				city: 'New York',
				state: 'NY',
				zipCode: '10001',
				country: 'United States',
				phone: '+1 (555) 123-4567'
			},
			customerNotes: 'Please leave package at front door if no one is home.',
			trackingNumber: 'TRK123456789'
		},
		{
			id: 'ORD-002',
			orderNumber: 'ORD-2024-002',
			customer: {
				name: 'Michael Chen',
				email: 'michael.chen@email.com',
				phone: '+1 (555) 987-6543'
			},
			items: [
				{
					id: 3,
					name: 'Smart Watch Series 8',
					image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
					quantity: 1,
					price: 299.99
				}
			],
			subtotal: 299.99,
			shipping: 0.00,
			tax: 24.00,
			total: 323.99,
			status: 'processing',
			createdAt: new Date('2024-07-26T14:15:00'),
			shippingAddress: {
				name: 'Michael Chen',
				street: '456 Oak Avenue',
				city: 'Los Angeles',
				state: 'CA',
				zipCode: '90210',
				country: 'United States',
				phone: '+1 (555) 987-6543'
			},
			customerNotes: null,
			trackingNumber: null
		},
		{
			id: 'ORD-003',
			orderNumber: 'ORD-2024-003',
			customer: {
				name: 'Emily Rodriguez',
				email: 'emily.rodriguez@email.com',
				phone: '+1 (555) 456-7890'
			},
			items: [
				{
					id: 4,
					name: 'Laptop Stand - Adjustable',
					image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
					quantity: 1,
					price: 45.99
				},
				{
					id: 5,
					name: 'Wireless Mouse',
					image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
					quantity: 1,
					price: 29.99
				}
			],
			subtotal: 75.98,
			shipping: 7.99,
			tax: 6.72,
			total: 90.69,
			status: 'shipped',
			createdAt: new Date('2024-07-25T09:45:00'),
			shippingAddress: {
				name: 'Emily Rodriguez',
				street: '789 Pine Street',
				city: 'Chicago',
				state: 'IL',
				zipCode: '60601',
				country: 'United States',
				phone: '+1 (555) 456-7890'
			},
			customerNotes: 'Business address - please deliver during business hours (9 AM - 5 PM).',
			trackingNumber: 'TRK987654321'
		},
		{
			id: 'ORD-004',
			orderNumber: 'ORD-2024-004',
			customer: {
				name: 'David Thompson',
				email: 'david.thompson@email.com',
				phone: '+1 (555) 321-0987'
			},
			items: [
				{
					id: 6,
					name: 'Gaming Keyboard - RGB',
					image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400',
					quantity: 1,
					price: 89.99
				}
			],
			subtotal: 89.99,
			shipping: 12.99,
			tax: 8.24,
			total: 111.22,
			status: 'delivered',
			createdAt: new Date('2024-07-24T16:20:00'),
			shippingAddress: {
				name: 'David Thompson',
				street: '321 Elm Drive',
				city: 'Austin',
				state: 'TX',
				zipCode: '73301',
				country: 'United States',
				phone: '+1 (555) 321-0987'
			},
			customerNotes: null,
			trackingNumber: 'TRK456789123'
		},
		{
			id: 'ORD-005',
			orderNumber: 'ORD-2024-005',
			customer: {
				name: 'Lisa Wang',
				email: 'lisa.wang@email.com',
				phone: '+1 (555) 654-3210'
			},
			items: [
				{
					id: 7,
					name: 'Desk Organizer Set',
					image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400',
					quantity: 1,
					price: 34.99
				},
				{
					id: 8,
					name: 'LED Desk Lamp',
					image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
					quantity: 1,
					price: 59.99
				}
			],
			subtotal: 94.98,
			shipping: 8.99,
			tax: 8.32,
			total: 112.29,
			status: 'cancelled',
			createdAt: new Date('2024-07-23T11:10:00'),
			shippingAddress: {
				name: 'Lisa Wang',
				street: '654 Maple Lane',
				city: 'Seattle',
				state: 'WA',
				zipCode: '98101',
				country: 'United States',
				phone: '+1 (555) 654-3210'
			},
			customerNotes: 'Cancel this order - found better deal elsewhere.',
			trackingNumber: null
		}
	];

	const mockStatistics: Statistics = {
		totalOrders: 1247,
		ordersChange: 12.5,
		pendingOrders: 23,
		pendingChange: -5.2,
		revenueToday: 2847.50,
		revenueChange: 18.3,
		avgOrderValue: 87.45,
		avgOrderChange: 3.7
	};

	const mockActivities: Activity[] = [
		{
			id: 1,
			type: 'order_placed',
			title: 'New Order Received',
			description: 'Sarah Johnson placed a new order',
			orderNumber: 'ORD-2024-001',
			status: 'pending',
			timestamp: `${new Date(Date.now() - 300000)}`
		},
		{
			id: 2,
			type: 'status_updated',
			title: 'Order Status Updated',
			description: 'Order status changed to processing',
			orderNumber: 'ORD-2024-002',
			status: 'processing',
			timestamp: `${new Date(Date.now() - 900000)}`
		},
		{
			id: 3,
			type: 'payment_received',
			title: 'Payment Confirmed',
			description: 'Payment of $323.99 received',
			orderNumber: 'ORD-2024-002',
			timestamp: `${new Date(Date.now() - 1800000)}`
		},
		{
			id: 4,
			type: 'message_received',
			title: 'Customer Message',
			description: 'Emily Rodriguez sent a message about delivery',
			orderNumber: 'ORD-2024-003',
			timestamp: `${new Date(Date.now() - 3600000)}`
		}
	];

	useEffect(() => {
		setOrders(mockOrders);
		setFilteredOrders(mockOrders);
	}, []);

	useEffect(() => {
		let filtered = [...orders];

		// Search filter
		if (filters.search) {
			filtered = filtered.filter(order =>
				order.orderNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
				order.customer.name.toLowerCase().includes(filters.search.toLowerCase()) ||
				order.customer.email.toLowerCase().includes(filters.search.toLowerCase())
			);
		}

		// Status filter
		if (filters.status && filters.status !== 'all') {
			filtered = filtered.filter(order => order.status === filters.status);
		}

		// Date range filter
		if (filters.dateRange.from) {
			filtered = filtered.filter(order =>
				new Date(order.createdAt) >= new Date(filters.dateRange.from)
			);
		}
		if (filters.dateRange.to) {
			filtered = filtered.filter(order =>
				new Date(order.createdAt) <= new Date(filters.dateRange.to)
			);
		}

		// Amount range filter
		if (filters.amountRange.min) {
			filtered = filtered.filter(order => order.total >= parseFloat(filters.amountRange.min));
		}
		if (filters.amountRange.max) {
			filtered = filtered.filter(order => order.total <= parseFloat(filters.amountRange.max));
		}

		// Sort
		filtered.sort((a, b) => {
			switch (filters.sort) {
				case 'oldest':
					return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
				case 'amount_high':
					return b.total - a.total;
				case 'amount_low':
					return a.total - b.total;
				case 'newest':
				default:
					return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
			}
		});

		setFilteredOrders(filtered);
	}, [orders, filters]);

	const handleFiltersChange = (newFilters: Filters): void => {
		setFilters(newFilters);
	};

	const handleClearFilters = (): void => {
		setFilters({
			search: '',
			status: 'all',
			sort: 'newest',
			dateRange: { from: '', to: '' },
			amountRange: { min: '', max: '' }
		});
	};

	const handleOrderSelect = (orderId: string, isSelected: boolean): void => {
		if (isSelected) {
			setSelectedOrders([...selectedOrders, orderId]);
		} else {
			setSelectedOrders(selectedOrders.filter(id => id !== orderId));
		}
	};

	const handleSelectAll = (isSelected: boolean): void => {
		if (isSelected) {
			setSelectedOrders(filteredOrders.map(order => order.id));
		} else {
			setSelectedOrders([]);
		}
	};

	const handleStatusUpdate = (orderId: string, newStatus: OrderStatus): void => {
		setOrders(orders.map(order =>
			order.id === orderId ? { ...order, status: newStatus } : order
		));
	};

	const handleBulkStatusUpdate = (newStatus: OrderStatus): void => {
		setOrders(orders.map(order =>
			selectedOrders.includes(order.id) ? { ...order, status: newStatus } : order
		));
		setSelectedOrders([]);
	};

	const handleBulkExport = (format: ExportFormat): void => {
		console.log(`Exporting ${selectedOrders.length} orders as ${format}`);
		// Implementation would handle actual export
	};

	const handleViewOrder = (order: ProductOrder): void => {
		setSelectedOrder(order);
		setIsModalOpen(true);
	};

	const handleSendMessage = (orderId: string, message: string): void => {
		console.log(`Sending message to order ${orderId}: ${message}`);
		// Implementation would handle sending message
	};

	const handleQuickAction = (actionId: string): void => {
		console.log(`Quick action: ${actionId}`);
		// Implementation would handle quick actions
	};

	const handleLogout = (): void => {
		localStorage.removeItem('vendorAuth');
		localStorage.removeItem('isVendorLoggedIn');
		router.push('../vendor-auth');
	};

	// if (userRole !== 'vendor') {
	// 	return (
	// 		<div className="min-h-screen bg-background flex items-center justify-center">
	// 			<div className="text-center">
	// 				<h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
	// 				<p className="text-muted-foreground">This page is only accessible to vendors.</p>
	// 			</div>
	// 		</div>
	// 	);
	// }

	return (
		<div className="min-h-screen bg-background">
			<VendorHeader
				onLogout={handleLogout}
				vendorData={vendorData || { businessName: 'Demo Business' }}
			/>

			<div className="max-w-[85vw] mx-auto p-6">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-foreground mb-2">Order Management</h1>
					<p className="text-muted-foreground">
						Track, process, and fulfill customer orders efficiently
					</p>
				</div>

				{/* Statistics */}
				<OrderStatistics statistics={mockStatistics} />

				{/* Filters */}
				<OrderFilters
					filters={filters}
					onFiltersChange={handleFiltersChange}
					onClearFilters={handleClearFilters}
				/>

				{/* Bulk Actions */}
				<BulkActionsToolbar
					selectedCount={selectedOrders.length}
					onBulkStatusUpdate={handleBulkStatusUpdate}
					onBulkExport={handleBulkExport}
					onClearSelection={() => setSelectedOrders([])}
				/>

				<div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
					{/* Main Content */}
					<div className="xl:col-span-3">
						<OrderTable
							orders={filteredOrders}
							selectedOrders={selectedOrders}
							onOrderSelect={handleOrderSelect}
							onSelectAll={handleSelectAll}
							onStatusUpdate={handleStatusUpdate}
							onViewOrder={handleViewOrder}
						/>
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						<QuickActions onAction={handleQuickAction} />
						<RecentActivityFeed activities={mockActivities} />
					</div>
				</div>

				{/* Order Detail Modal */}
				<OrderDetailModal
					order={selectedOrder}
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					onStatusUpdate={handleStatusUpdate}
					onSendMessage={handleSendMessage}
				/>
			</div>
		</div>
	);
};

export default OrderManagement;