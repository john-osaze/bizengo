'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import Icon from '@/components/AppIcon';

interface VendorData {
	businessName?: string;
	firstName?: string;
	lastName?: string;
	email?: string;
	isVerified?: boolean;
}

interface VendorHeaderProps {
	vendorData?: VendorData;
	onLogout: () => void;
}

const navigationItems = [
	{ label: 'Dashboard', path: '../dashboard', icon: 'LayoutDashboard' },
	{ label: 'Products', path: '../products', icon: 'Package' },
	{ label: 'Orders', path: '../orders', icon: 'ShoppingCart' },
	{ label: 'Storefront', path: '../storefront', icon: 'Store' },
	{ label: 'Analytics', path: '../analytics', icon: 'BarChart3' },
	{ label: 'Settings', path: '../settings', icon: 'Settings' }
];

const VendorHeader: React.FC<VendorHeaderProps> = ({ vendorData, onLogout }) => {
	const router = useRouter();
	const [showUserMenu, setShowUserMenu] = useState(false);

	const handleNavigation = (path: string) => {
		router.push(path);
	};

	const [pathname, setPathname] = useState<string>('');

	useEffect(() => {
		setPathname(window.location.pathname);
	}, []);

	return (
		<header className="bg-card border-b border-border sticky top-0 z-header">
			<div className="max-w-[85vw] mx-auto px-4">
				<div className="flex items-center justify-between h-16">
					{/* Logo & Business Name */}
					<div className="flex items-center space-x-4">
						<div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
							<Icon name="Store" size={24} color="white" />
						</div>
						<div>
							<h1 className="font-heading font-semibold text-lg text-text-primary">
								{vendorData?.businessName}
							</h1>
							<p className="text-sm text-text-muted">
								Vendor Dashboard
							</p>
						</div>
					</div>

					{/* Desktop Navigation */}
					<nav className="hidden lg:flex items-center space-x-1">
						{navigationItems.map((item) => (
							<button
								key={item.path}
								onClick={() => handleNavigation(item.path)}
								className={`
                  flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium
                  transition-colors duration-200
                  ${pathname === item.path
										? 'bg-primary text-primary-foreground'
										: 'text-text-secondary hover:text-text-primary hover:bg-surface'
									}
                `}
							>
								<Icon name={item.icon as any} size={16} />
								<span>{item.label}</span>
							</button>
						))}
					</nav>

					{/* User Menu */}
					<div className="relative">
						<button
							onClick={() => setShowUserMenu(!showUserMenu)}
							className="flex items-center space-x-3 p-2 rounded-lg hover:bg-surface transition-colors"
						>
							<div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
								<span className="text-white font-medium text-sm">
									{vendorData?.firstName?.charAt(0) || 'V'}
								</span>
							</div>
							<div className="hidden sm:block text-left">
								<p className="text-sm font-medium text-text-primary">
									{vendorData?.firstName} {vendorData?.lastName}
								</p>
								<p className="text-xs text-text-muted">
									{vendorData?.email}
								</p>
							</div>
							<Icon
								name="ChevronDown"
								size={16}
								className={`text-text-muted transition-transform ${showUserMenu ? 'rotate-180' : ''
									}`}
							/>
						</button>

						{/* Dropdown Menu */}
						{showUserMenu && (
							<div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-lg shadow-elevated z-50">
								<div className="p-4 border-b border-border">
									<p className="font-medium text-text-primary">
										{vendorData?.firstName} {vendorData?.lastName}
									</p>
									<p className="text-sm text-text-muted">
										{vendorData?.email}
									</p>
									<div className="flex items-center mt-2">
										<div className={`w-2 h-2 rounded-full mr-2 ${vendorData?.isVerified ? 'bg-success' : 'bg-warning'
											}`}></div>
										<span className="text-xs text-text-muted">
											{vendorData?.isVerified ? 'Verified' : 'Pending Verification'}
										</span>
									</div>
								</div>

								<div className="p-2">
									<button
										onClick={() => {
											handleNavigation('../profile');
											setShowUserMenu(false);
										}}
										className="w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg hover:bg-surface transition-colors"
									>
										<Icon name="User" size={16} className="text-text-muted" />
										<span className="text-sm text-text-secondary">Profile</span>
									</button>

									<button
										onClick={() => {
											handleNavigation('../settings');
											setShowUserMenu(false);
										}}
										className="w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg hover:bg-surface transition-colors"
									>
										<Icon name="Settings" size={16} className="text-text-muted" />
										<span className="text-sm text-text-secondary">Settings</span>
									</button>

									<button
										onClick={() => {
											router.push('/');
											setShowUserMenu(false);
										}}
										className="w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg hover:bg-surface transition-colors"
									>
										<Icon name="ExternalLink" size={16} className="text-text-muted" />
										<span className="text-sm text-text-secondary">View Customer App</span>
									</button>

									<hr className="my-2 border-border" />

									<button
										onClick={() => {
											onLogout();
											setShowUserMenu(false);
										}}
										className="w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg hover:bg-error-50 text-error transition-colors"
									>
										<Icon name="LogOut" size={16} />
										<span className="text-sm">Sign Out</span>
									</button>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Mobile Navigation */}
				<div className="lg:hidden border-t border-border py-2">
					<div className="flex items-center space-x-1 overflow-x-auto">
						{navigationItems.map((item) => (
							<button
								key={item.path}
								onClick={() => handleNavigation(item.path)}
								className={`
                  flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap
                  transition-colors duration-200
                  ${pathname === item.path
										? 'bg-primary text-primary-foreground'
										: 'text-text-secondary hover:text-text-primary hover:bg-surface'
									}
                `}
							>
								<Icon name={item.icon as any} size={16} />
								<span>{item.label}</span>
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Click outside to close menu */}
			{showUserMenu && (
				<div
					className="fixed inset-0 z-40"
					onClick={() => setShowUserMenu(false)}
				></div>
			)}
		</header>
	);
};

export default VendorHeader;