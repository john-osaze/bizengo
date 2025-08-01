import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import { useRole } from './RoleContextNavigation';

interface NavigationItem {
  label: string;
  path: string;
  icon: string;
  notifications?: number;
}

interface NotificationCounts {
  orders: number;
  products: number;
  dashboard: number;
}

const VendorSidebarNavigation: React.FC = () => {
	const [isCollapsed, setIsCollapsed] = useState < boolean > (false);
	const [isMobileOpen, setIsMobileOpen] = useState < boolean > (false);
	const [notifications, setNotifications] = useState < NotificationCounts > ({
		orders: 3,
		products: 0,
		dashboard: 1
	});

	const location = useLocation();
	const navigate = useNavigate();
	const { logout } = useRole();

	useEffect(() => {
		// Load sidebar state from localStorage
		const savedCollapsed = localStorage.getItem('sidebarCollapsed');
		if (savedCollapsed === 'true') {
			setIsCollapsed(true);
		}
	}, []);

	const toggleSidebar = (): void => {
		const newCollapsed = !isCollapsed;
		setIsCollapsed(newCollapsed);
		localStorage.setItem('sidebarCollapsed', newCollapsed.toString());
	};

	const toggleMobileSidebar = (): void => {
		setIsMobileOpen(!isMobileOpen);
	};

	const handleNavigation = (path: string): void => {
		navigate(path);
		setIsMobileOpen(false);
	};

	const handleLogout = (): void => {
		logout();
		navigate('/');
	};

	const navigationItems: NavigationItem[] = [
		{
			label: 'Dashboard',
			path: '/vendor-dashboard',
			icon: 'BarChart3',
			notifications: notifications.dashboard
		},
		{
			label: 'Product Management',
			path: '/product-management',
			icon: 'Package',
			notifications: notifications.products
		},
		{
			label: 'Order Management',
			path: '/order-management',
			icon: 'ShoppingCart',
			notifications: notifications.orders
		}
	];

	const isActive = (path: string): boolean => location.pathname === path;

	return (
		<>
			{/* Mobile Hamburger Button */}
			<button
				onClick={toggleMobileSidebar}
				className="lg:hidden fixed top-4 left-4 z-1300 p-2 rounded-md bg-card shadow-card"
			>
				<Icon name="Menu" size={24} />
			</button>

			{/* Mobile Overlay */}
			{isMobileOpen && (
				<div
					className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-1200"
					onClick={() => setIsMobileOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<div
				className={`
          fixed top-0 left-0 h-full bg-card border-r border-border z-1100 transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-16' : 'w-240'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
			>
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b border-border">
					{!isCollapsed && (
						<div className="flex items-center space-x-2">
							<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
								<Icon name="Store" size={20} color="white" />
							</div>
							<span className="font-semibold text-lg text-foreground">VendorHub Pro</span>
						</div>
					)}
					<button
						onClick={toggleSidebar}
						className="hidden lg:block p-1 rounded-md hover:bg-muted transition-smooth"
					>
						<Icon name={isCollapsed ? "ChevronRight" : "ChevronLeft"} size={20} />
					</button>
				</div>

				{/* Navigation Items */}
				<nav className="flex-1 p-4">
					<ul className="space-y-2">
						{navigationItems.map((item) => (
							<li key={item.path}>
								<button
									onClick={() => handleNavigation(item.path)}
									className={`
                    w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-smooth
                    ${isActive(item.path)
											? 'bg-primary text-primary-foreground'
											: 'text-muted-foreground hover:bg-muted hover:text-foreground'
										}
                  `}
								>
									<div className="relative">
										<Icon
											name={item.icon}
											size={20}
											color={isActive(item.path) ? 'white' : 'currentColor'}
										/>
										{item.notifications && item.notifications > 0 && (
											<span className="absolute -top-1 -right-1 w-4 h-4 bg-error text-error-foreground text-xs rounded-full flex items-center justify-center">
												{item.notifications}
											</span>
										)}
									</div>
									{!isCollapsed && (
										<span className="font-medium">{item.label}</span>
									)}
								</button>
							</li>
						))}
					</ul>
				</nav>

				{/* User Section */}
				<div className="p-4 border-t border-border">
					<div className="flex items-center space-x-3 mb-3">
						<div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
							<Icon name="User" size={16} />
						</div>
						{!isCollapsed && (
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium text-foreground truncate">John Vendor</p>
								<p className="text-xs text-muted-foreground truncate">john@vendor.com</p>
							</div>
						)}
					</div>

					{!isCollapsed && (
						<div className="space-y-1">
							<button
								onClick={() => handleNavigation('/vendor-settings')}
								className="w-full flex items-center space-x-2 px-2 py-1 text-sm text-muted-foreground hover:text-foreground transition-smooth"
							>
								<Icon name="Settings" size={16} />
								<span>Settings</span>
							</button>
							<button
								onClick={handleLogout}
								className="w-full flex items-center space-x-2 px-2 py-1 text-sm text-muted-foreground hover:text-foreground transition-smooth"
							>
								<Icon name="LogOut" size={16} />
								<span>Logout</span>
							</button>
						</div>
					)}
				</div>
			</div>
		</>
	);
};

export default VendorSidebarNavigation;